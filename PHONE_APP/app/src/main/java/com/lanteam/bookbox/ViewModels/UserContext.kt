package com.lanteam.bookbox.ViewModels

import android.app.Application
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

    private var userId: String? = null

    var activeBook: Book? =null

    var userState by mutableStateOf(User())
        private set


    private var packetBoxess by mutableStateOf(listOf<PacketBox>())
        private set

    private var bookss by mutableStateOf(listOf<Book>())
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
            Log.e("API", "Exception: ${e.message}")
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

    // performAuth now uses fetch() instead of makePostRequest()
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

                    var booksRecieved = (0 until result.length()).map { i ->

                        val item = result.getJSONObject(i)
                        Book(
                            id = item.getString("_id"),
                            title = item.getString("title"),
                            imageUrl = BASE_URL+ item.getString("path"),
                            author = item.getString("author"),
                            summary = item.getString("glossary"),
                            genre = item.getString("genre"),
                            status = item.getString("status"),
                            weight =item.getInt("weight"),
                            packetBoxId = if (item.has("packetBox")) item.getString("packetBox") else null
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
                _errorEvent.tryEmit("Failed to fetch boxes")
            }
        }
    }
}
