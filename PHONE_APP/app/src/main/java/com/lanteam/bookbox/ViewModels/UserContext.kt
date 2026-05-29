package com.lanteam.bookbox.ViewModels

import android.app.Application
import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import com.lanteam.bookbox.AppScreen
import com.lanteam.bookbox.model.Book
import com.lanteam.bookbox.model.Location
import com.lanteam.bookbox.model.PacketBox
import com.lanteam.bookbox.model.User
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.withContext
import kotlinx.coroutines.launch
import org.json.JSONArray
import kotlin.Exception
import kotlin.collections.listOf

data class NetworkResponse(val code: Int, val body: String)

private val BASE_URL = "http://192.168.1.18:5000"
//private val BASE_URL = "http://192.168.0.14:5000"


private val USER_ID_KEY = "userId"
private val SECURE_PREFS_NAME = "SecurePhotoMapPrefs"
private val ACCESS_TOKEN_KEY = "accessToken"
private val REFRESH_TOKEN_KEY = "refreshToken"


class UserContext(application: Application) : AndroidViewModel(application) {
    private val context = getApplication<Application>()
    private val scope = viewModelScope;
    private var connectionJob: Job? = null
    private val _navEvent = MutableSharedFlow<AppScreen>(extraBufferCapacity = 1)
    val navEvent: SharedFlow<AppScreen> = _navEvent
    private val _errorEvent = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val errorEvent: SharedFlow<String> = _errorEvent

    var userLocation : Location?= null;

    var userId: String? = null

    var activeBook: Book? =null

    var userState by mutableStateOf(User())
        private set


    private var packetBoxess by mutableStateOf(listOf<PacketBox>())
        private set

    private var bookss by mutableStateOf<List<Book>>(emptyList())
        private set

    var loggedIn by mutableStateOf<Boolean>(false)


    fun getPacketBoxes():List<PacketBox>{
        if(packetBoxess.isEmpty())
            fetchPacketBoxes()
        return packetBoxess
    }
    fun getBooks():List<Book>{
        if(bookss.isEmpty()){
            fetchBooks()
        }
        return  bookss
    }
    fun getMyBooks():List<Book>{
        return getBooks().filter { it.owner == userId }
    }



    init {
        val prefs = getEncryptedPrefs()
        prefs.getString(ACCESS_TOKEN_KEY, null)?.let {
            loggedIn = true
            userId = prefs.getString(USER_ID_KEY, "") ?: ""
        }
    }

    private fun getEncryptedPrefs() = EncryptedSharedPreferences.create(
        SECURE_PREFS_NAME,
        MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC),
        context,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveUserData(accessToken: String, refreshToken: String, id: String? = null) {
        getEncryptedPrefs().edit().apply {
            putString(ACCESS_TOKEN_KEY, accessToken)
            putString(REFRESH_TOKEN_KEY, refreshToken)
            if (id != null) {
                putString(USER_ID_KEY, id)
            }
            apply()
        }
    }

    fun clearTokens() {
        getEncryptedPrefs().edit().apply {
            remove(ACCESS_TOKEN_KEY)
            remove(REFRESH_TOKEN_KEY)
            remove(USER_ID_KEY)
            apply()
        }
    }

    fun getAccessToken(): String? {
        return getEncryptedPrefs().getString(ACCESS_TOKEN_KEY, null)
    }

    fun getRefreshToken(): String? {
        return getEncryptedPrefs().getString(REFRESH_TOKEN_KEY, null)
    }


    private suspend fun refreshAccessToken(): String? {
        val refreshToken = getRefreshToken() ?: return null
        val body = JSONObject().put("refreshToken", refreshToken)
        val response = rawRequest("/users/refresh", "POST", body, token = null)

        return if (response.code in 200..299) {
            val json = JSONObject(response.body)
            val newToken = json.getString("accessToken")
            saveUserData(newToken, refreshToken)
            newToken
        } else {
            clearTokens()
            null
        }
    }

    suspend fun fetch(
        path: String,
        method: String = "GET",
        body: JSONObject? = null,
        headers: Map<String, String> = emptyMap()
    ): NetworkResponse {
        var token = getAccessToken()
        var response = rawRequest(path, method, body, token, headers)

        if (response.code == -1) {
            _errorEvent.tryEmit("No connection to server")
            return response
        }
        if (response.code == 401) {
            token = refreshAccessToken()
            if (token != null) response = rawRequest(path, method, body, token, headers)
        }
        try {
            val json = JSONObject(response.body)
            Log.i("API", "response code: ${response.code}, message: ${json}")
        }
        catch(e:Exception){
            Log.e("API", "Fetch Exception: ${e.message}")
        }
        return response
    }

    // All HTTP machinery is private — nobody outside needs to see it
    private suspend fun rawRequest(
        path: String,
        method: String,
        body: JSONObject?,
        token: String?,
        extraHeaders: Map<String, String> = emptyMap()
    ): NetworkResponse = withContext(Dispatchers.IO) {
        try {
            val url = URL("$BASE_URL$path")
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = method
            connection.setRequestProperty("Content-Type", "application/json")
            connection.setRequestProperty("Accept", "application/json")
            if (token != null) connection.setRequestProperty("Authorization", "Bearer $token")
            extraHeaders.forEach { (k, v) -> connection.setRequestProperty(k, v) }
            connection.connectTimeout = 5000
            connection.readTimeout = 5000

            if (body != null) {
                connection.doOutput = true
                OutputStreamWriter(connection.outputStream).use { it.write(body.toString()) }
            }

            val code = connection.responseCode
            val text = if (code in 200..299)
                connection.inputStream.bufferedReader().readText()
            else
                connection.errorStream?.bufferedReader()?.readText() ?: "No error body"

            NetworkResponse(code, text)
        } catch (e: Exception) {
            NetworkResponse(-1, e.message ?: "Unknown error")
        }
    }


    suspend fun uploadImage(
        path: String,
        method: String = "POST",
        imageBytes: ByteArray,
        mimeType: String = "image/jpeg",
        fields: Map<String, String> = emptyMap(), // 👈
        extraHeaders: Map<String, String> = emptyMap()
    ): NetworkResponse {
        var token = getAccessToken()
        var response = rawMultipartRequest(path, method, imageBytes, mimeType, token, fields, extraHeaders)

        if (response.code == 401) {
            token = refreshAccessToken()
            if (token != null) response = rawMultipartRequest(path, method, imageBytes, mimeType, token, fields, extraHeaders)
        }

        return response
    }

    private suspend fun rawMultipartRequest(
        path: String,
        method: String,
        imageBytes: ByteArray,
        mimeType: String,
        token: String?,
        fields: Map<String, String> = emptyMap(), // 👈 text fields alongside the image
        extraHeaders: Map<String, String> = emptyMap()
    ): NetworkResponse = withContext(Dispatchers.IO) {
        try {
            val boundary = "Boundary-${System.currentTimeMillis()}"
            val url = URL("$BASE_URL$path")
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = method
            connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")
            if (token != null) connection.setRequestProperty("Authorization", "Bearer $token")
            extraHeaders.forEach { (k, v) -> connection.setRequestProperty(k, v) }
            connection.doOutput = true
            connection.connectTimeout = 5000
            connection.readTimeout = 5000

            connection.outputStream.use { output ->
                // Write text fields first
                fields.forEach { (key, value) ->
                    output.write("--$boundary\r\nContent-Disposition: form-data; name=\"$key\"\r\n\r\n$value\r\n".toByteArray())
                }

                // Write image field named "image" to match multer's upload.single('image')
                output.write("--$boundary\r\nContent-Disposition: form-data; name=\"image\"; filename=\"upload\"\r\nContent-Type: $mimeType\r\n\r\n".toByteArray())
                output.write(imageBytes)
                output.write("\r\n--$boundary--\r\n".toByteArray())
            }

            val code = connection.responseCode
            val text = if (code in 200..299)
                connection.inputStream.bufferedReader().readText()
            else
                connection.errorStream?.bufferedReader()?.readText() ?: "No error body"

            NetworkResponse(code, text)
        } catch (e: Exception) {
            NetworkResponse(-1, e.message ?: "Unknown error")
        }
    }
    fun Uri.toByteArray(context: Context): ByteArray {
        return context.contentResolver.openInputStream(this)?.use { it.readBytes() } ?: byteArrayOf()
    }

    fun performAuth(
        type: String,
        user: String,
        mail: String = "",
        pass: String,
        onResult: (String) -> Unit
    ) {
        val jsonBody = JSONObject().apply {
            put("username", user)
            put("email", mail)
            put("password", pass)
        }

        connectionJob = scope.launch {
            val response = fetch("/users/$type", method = "POST", body = jsonBody)

            if (response.code in 200..299) {
                if (type == "login") {
                    try {
                        val json = JSONObject(response.body)
                        val userJson = json.getJSONObject("user")
                        saveUserData(
                            json.getString("accessToken"),
                            json.getString("refreshToken"),
                            userJson.getString("id")
                        )
                        loggedIn = true
                        userId = userJson.getString("id")

                        _navEvent.tryEmit(AppScreen.Profile)
                    } catch (e: Exception) {
                        onResult("Error parsing response: ${e.message}")
                    }
                } else {
                    _navEvent.tryEmit(AppScreen.LogIn)
                }
            } else {
                onResult("Error ${response.code}: ${response.body}")
            }
        }
    }

    fun logout() {
        scope.launch {
            fetch(
                "/users/logout",
                method = "POST",
                body = JSONObject().put("refreshToken", getRefreshToken())
            )

            clearTokens()
            loggedIn = false
            userId = null
            _navEvent.tryEmit(AppScreen.LogIn)
        }
    }

    fun getUserProfile(onResult: (String) -> Unit) {
        onResult("Loading ...") // maybe play a gif?
        scope.launch {
            val response = fetch(
                "/users/${userId}",
                method = "GET"
            )
            try {
                if (response.code in 200..299) {
                    val result = JSONObject(response.body)
                    userState =(
                        User(
                            username = result.getString("username"),
                            email = result.getString("email"),
                            booksBorrowed = result.getInt("booksBorrowed"),
                            currentlyBorrowed = result.getInt("currentlyBorrowed"),
                        )
                    )
                    onResult("")
                }
            } catch (e: Exception) {
                onResult("Error parsing response: ${e.message}")
            }
        }
    }

    fun updateProfile(
        username: String,
        mail: String,
        pass: String,
        onResult: (String) -> Unit
    ) {
        val jsonBody = JSONObject().apply {
            put("username", username)
            put("email", mail)
            if(pass.isNotBlank()){
                put("password", pass)
            }
        }
        connectionJob = scope.launch {
            val response = fetch(
                "/users/${userId}", method = "PUT", body = jsonBody
            )
            if (response.code in 200..299) {
                userState=userState.copy(username=username, email=mail)
                _navEvent.tryEmit(AppScreen.Profile)
            } else {
                onResult("Error ${response.code}: ${response.body}")
            }
        }
    }

    fun fetchPacketBoxes(){
        scope.launch {
            try {
                val response = fetch("/box", method = "GET")

                if (response.code in 200..299) {
                    val result = JSONArray(response.body)
                    Log.i("API", "result: $result")

                    val boxes = (0 until result.length()).map { i ->
                        val item = result.getJSONObject(i)
                        val location = item.getJSONObject("location")
                        val coordinates = location.getJSONArray("coordinates")
                        val books = item.getJSONArray("books")

                        PacketBox(
                            id = item.getString("_id"),
                            name = item.getString("name"),
                            location= Location(coordinates.getDouble(1), coordinates.getDouble(0)),
                            bookIds = (0 until books.length()).map { books.getString(it) } // for now maybe backend can send the entire list already
                        )
                    }
                    packetBoxess = boxes
                } else {
                    Log.e("API", "Error ${response.code}: ${response.body}")
                    _errorEvent.tryEmit("Failed to fetch boxes: ${response.code}")
                }
            } catch (e: Exception) {
                Log.e("API", "Exception: ${e.message}")
                _errorEvent.tryEmit("Failed to fetch boxes")
            }
        }
    }

    fun fetchBooks(){
        scope.launch {
            try {
                val response = fetch("/books", method = "GET")

                if (response.code in 200..299) {
                    val result = JSONArray(response.body)
                    Log.i("API", "result: $result")

                    val booksRecieved = (0 until result.length()).map { i ->

                        val item = result.getJSONObject(i)
                        Book(
                            id = item.getString("_id"),
                            title = item.getString("title"),
                            imageUrl = BASE_URL+ item.getString("path"),
                            author = if(item.has("author")) item.getString("author") else "",
                            summary = if(item.has("glossary")) item.getString("glossary") else "",
                            genre = if(item.has("genre")) item.getString("genre") else "",
                            status = item.getString("status"),
                            weight =item.getInt("weight"),
                            owner=item.getString("owner"),
                            packetBoxId = if (item.has("packetBox") && item.getString("packetBox")!="null") item.getString("packetBox") else null
                        )
                    }
                    if(userLocation!=null && packetBoxess.isNotEmpty()){
                        for(book in booksRecieved){
                            val box = packetBoxess.find { it.id == book.packetBoxId }
                            box?.let { book.distance= Location.getDistanceBetweenLoations(userLocation!!, it.location) }
                        }
                    }
                    bookss = booksRecieved

                } else {
                    Log.e("API", "Error ${response.code}: ${response.body}")
                    _errorEvent.tryEmit("Failed to fetch books: ${response.code}")
                }
            } catch (e: Exception) {
                Log.e("API", "Exception: ${e.message}")
                _errorEvent.tryEmit("Failed to fetch books")
            }
        }
    }
    fun addBook(
        title: String,
        author: String,
        genre: String,
        glossary: String = "",
        weight: String = "",
        imageUri: Uri?,
        onResult: (String) -> Unit
    ) {
        scope.launch {
            try {
                val response = if (imageUri != null) {
                    // Has image — send as multipart
                    val bytes = imageUri.toByteArray(context)
                    uploadImage(
                        path = "/books",
                        imageBytes = bytes,
                        fields = buildMap {
                            put("title", title)
                            put("author", author)
                            put("genre", genre)
                            if (glossary.isNotBlank()) put("glossary", glossary)
                            if (weight.isNotBlank()) put("weight", weight)
                        }
                    )
                } else {
                    // No image — send as regular JSON
                    fetch(
                        path = "/books",
                        method = "POST",
                        body = JSONObject().apply {
                            put("title", title)
                            put("author", author)
                            put("genre", genre)
                            if (glossary.isNotBlank()) put("glossary", glossary)
                            if (weight.isNotBlank()) put("weight", weight)
                        }
                    )
                }

                if (response.code in 200..299) {
                    fetchBooks()
                    _navEvent.tryEmit(AppScreen.MyBooks)
                } else {
                    onResult("Error ${response.code}: ${response.body}")
                }
            } catch (e: Exception) {
                onResult("Error: ${e.message}")
            }
        }
    }
    fun removeBook(){
        scope.launch {
            val response = fetch(
                "/books/${activeBook!!.id}",
                method = "DELETE"
            )

            if (response.code in 200..299) {
                fetchBooks()
                _navEvent.tryEmit(AppScreen.MyBooks)
            }
            else{
                _errorEvent.tryEmit("Something went wrong.  ${response.code}")
            }
        }

    }

}
