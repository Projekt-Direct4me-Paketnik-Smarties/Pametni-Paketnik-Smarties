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
import com.lanteam.bookbox.model.Borrow
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
enum class BoxAction { BORROW, RETURN, DONATE, REPOSSESS }

// Add to UserContext

private val BASE_URL = "http://10.18.190.87:5000"
//private val BASE_URL = "http://192.168.1.18:5000"
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


    var packetBoxess by mutableStateOf(listOf<PacketBox>())
        private set

    var bookss by mutableStateOf<List<Book>>(emptyList())
        private set

    var borrowHistory by mutableStateOf<List<Borrow>>(emptyList())
        private set

    var loggedIn by mutableStateOf<Boolean>(false)


    var activeBoxId:String?=null
    fun getBooks():List<Book>{
        if(bookss.isEmpty()){
            fetchBooks()
        }
        return  bookss
    }
    fun getMyBooks():List<Book>{
        return getBooks().filter { it.owner == userId }
    }

    fun getDonateBooks():List<Book>{
        return getMyBooks().filter { it.status=="owned" }
    }
    fun getReposesBooks():List<Book>{
        return getMyBooks().filter { it.status=="available" && !it.packetBoxId.isNullOrBlank() && it.packetBoxId==activeBoxId }
    }
    fun getReturnBooks():List<Book>{
        //here call a fetch to get all the users borrows
        return getBooks().filter { it.status == "borrowed" && !it.currentBorrower.isNullOrBlank() && it.currentBorrower==userId}
    }

    fun getBorrowBooks():List<Book>{
        return getBooks().filter {it.status=="available" && !it.packetBoxId.isNullOrBlank() && it.packetBoxId==activeBoxId}
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
    fun JSONObject.optStringOrNull(key: String): String? {
        val value = optString(key, null)
        return if (value == null || value == "null") null else value
    }
    private suspend fun playOpenBoxAudio(boxId: Int): Boolean {
        // TODO: uncomment when hardware available
//    return withContext(Dispatchers.IO) {
//        try {
//            val client = OkHttpClient()
//            val json = JSONObject().apply {
//                put("boxId", boxId)
//                put("qrCodeInfo", "String")
//                put("tokenFormat", 5)
//                put("addAccessLog", true)
//            }
//            val body = json.toString().toRequestBody("application/json".toMediaType())
//            val request = Request.Builder()
//                .url("https://api-d4me-stage.direct4.me/sandbox/v1/Access/openbox")
//                .addHeader("Authorization", "Bearer 9ea96945-3a37-4638-a5d4-22e89fbc998f")
//                .post(body)
//                .build()
//            val response = client.newCall(request).execute()
//            if (!response.isSuccessful) return@withContext false
//            val responseText = response.body?.string() ?: return@withContext false
//            val audioBase64 = JSONObject(responseText).getString("data")
//            val audioBytes = Base64.decode(audioBase64, Base64.DEFAULT)
//            val audioFile = File(application.cacheDir, "openbox_audio.mp3")
//            audioFile.writeBytes(audioBytes)
//            withContext(Dispatchers.Main) {
//                MediaPlayer().apply {
//                    setDataSource(audioFile.absolutePath)
//                    prepare()
//                    start()
//                    setOnCompletionListener { it.release() }
//                }
//            }
//            true
//        } catch (e: Exception) {
//            false
//        }
//    }
        return true // stub — always succeeds for now
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
                        getUserProfile({})

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
                            bookIds = (0 until books.length()).map { books.getString(it) }, // for now maybe backend can send the entire list already
                            packetBoxId = if(item.has("packetBoxId") && item.getString("packetBoxId")!="") item.getString("packetBoxId") else ""
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
                            currentBorrower= item.optStringOrNull("currentBorrower"),
                            packetBoxId = item.optStringOrNull("packetBox")
                        )
                    }
                    if(userLocation!=null && packetBoxess.isNotEmpty()){
                        for(book in booksRecieved){
                            val box = packetBoxess.find { it.packetBoxId == book.packetBoxId }
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

    fun performBoxAction(
        action: BoxAction,
        bookIds: List<String>,
        onResult: (String) -> Unit
    ) {
        scope.launch {
            try {
                // Step 1: play audio to physically open box
                val opened = playOpenBoxAudio(activeBoxId!!.toInt())
                if (!opened) {
                    onResult("Failed to open box")
                    return@launch
                }

                val endpoint = when (action) {
                    BoxAction.BORROW     -> "/borrow/borrow"
                    BoxAction.RETURN     -> "/borrow/return"
                    BoxAction.DONATE     -> "/borrow/donate"
                    BoxAction.REPOSSESS  -> "/borrow/reposes"
                }

                val body = JSONObject().apply {
                    put("packetBox", activeBoxId!!)
                    put("books", org.json.JSONArray(bookIds))
                }

                val response = fetch(endpoint, method = "POST", body = body)

                if (response.code in 200..299) {
                    fetchBooks()
                    _navEvent.tryEmit(AppScreen.Map)
                } else {
                    onResult("Error ${response.code}: ${response.body}")
                }
            } catch (e: Exception) {
                _errorEvent.tryEmit("Error: ${e.message}")
            }
        }
    }
    fun fetchBorrows(){
        scope.launch {
            try {
                val response = fetch("/borrow", method = "GET")

                if (response.code in 200..299) {
                    val result = JSONArray(response.body)
                    borrowHistory = (0 until result.length()).map { i ->
                        val item = result.getJSONObject(i)
                        val booksArray = item.getJSONArray("books")

                        Borrow(
                            packetBox = item.optString("packetBox", ""),
                            date = item.getString("date"),
                            action = item.getString("action"),
                            books = (0 until booksArray.length()).map { j ->
                                val book = booksArray.getJSONObject(j)
                                Book(
                                    id = book.getString("_id"),
                                    title = book.getString("title"),
                                    author = book.getString("author"),
                                    summary = book.optString("glossary", ""),
                                    imageUrl = book.optString("path", ""),
                                    genre = book.optString("genre", ""),
                                    status = book.optString("status", "available"),
                                    weight = book.optInt("weight", 5),
                                    packetBoxId = book.optStringOrNull("packetBox"),
                                    owner = book.optString("owner", ""),
                                    currentBorrower = book.optStringOrNull("currentBorrower")
                                )
                            }
                        )
                    }.sortedByDescending { it.date }
                } else {
                    _errorEvent.tryEmit("Failed to fetch borrow history: ${response.code}")
                }
            } catch (e: Exception) {
                Log.e("API", "Exception: ${e.message}")
                _errorEvent.tryEmit("Failed to fetch borrow history")
            }
        }
    }
    fun scanImageLogin(imageBytes: ByteArray, onResult: (Boolean) -> Unit) {
        scope.launch {
            try {
                Log.i("API", "Image Login sent")
                val response = uploadImage(
                    path = "/users/image-login",
                    imageBytes = imageBytes
                )
                if (response.code in 200..299) {
                    val json = JSONObject(response.body)
                    val accessToken = json.getString("accessToken")
                    val refreshToken = json.getString("refreshToken")
                    val userJson = json.getJSONObject("user")
                    saveUserData(
                        accessToken = accessToken,
                        refreshToken = refreshToken,
                        id = userJson.getString("id")
                    )
                    userId=userJson.getString("id")
                    loggedIn = true
                    getUserProfile({})
                    _navEvent.tryEmit(AppScreen.Map)
                    onResult(true)
                } else {
                    Log.i("API", "Image Login unsucsessfull")
                    onResult(false) // no match, keep scanning
                }
            } catch (e: Exception) {
                onResult(false)
            }
        }
    }

}
