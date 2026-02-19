package com.wifi.pager

import android.content.Context
import android.util.Log
import com.google.gson.Gson
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

/**
 * ApiClient - Handles HTTP communication with WiFi Pager server
 * 
 * Features:
 * - Uses OkHttp for reliable HTTP client
 * - Configures connection/read/write timeouts
 * - Sends JSON payload with call data
 * - Handles network errors gracefully
 * - Non-blocking callbacks for response handling
 */
class ApiClient(private val context: Context) {

    companion object {
        private const val TAG = "PagerApiClient"
        private const val CONNECTION_TIMEOUT = 10L
        private const val READ_TIMEOUT = 10L
        private const val WRITE_TIMEOUT = 10L
    }

    private val gson = Gson()
    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(CONNECTION_TIMEOUT, TimeUnit.SECONDS)
        .readTimeout(READ_TIMEOUT, TimeUnit.SECONDS)
        .writeTimeout(WRITE_TIMEOUT, TimeUnit.SECONDS)
        .build()

    /**
     * Send incoming call data to server
     * 
     * @param url Server endpoint URL
     * @param callData Call information to send
     * @param callback Callback with success/error result
     */
    fun sendIncomingCall(
        url: String,
        callData: CallData,
        callback: (success: Boolean, error: String?) -> Unit
    ) {
        try {
            // Convert call data to JSON
            val jsonString = gson.toJson(callData)
            Log.d(TAG, "Sending JSON: $jsonString to $url")

            // Create request body
            val requestBody = jsonString.toRequestBody("application/json".toMediaType())

            // Build POST request
            val request = Request.Builder()
                .url(url)
                .post(requestBody)
                .addHeader("Content-Type", "application/json")
                .build()

            // Execute request asynchronously
            httpClient.newCall(request).enqueue(object : okhttp3.Callback {
                override fun onFailure(call: okhttp3.Call, e: java.io.IOException) {
                    Log.e(TAG, "Network error: ${e.message}", e)
                    callback(false, e.message)
                }

                override fun onResponse(call: okhttp3.Call, response: okhttp3.Response) {
                    val isSuccess = response.isSuccessful
                    Log.d(TAG, "Server response: ${response.code}")
                    
                    response.body?.close()
                    
                    if (isSuccess) {
                        callback(true, null)
                    } else {
                        callback(false, "HTTP ${response.code}")
                    }
                }
            })

        } catch (e: Exception) {
            Log.e(TAG, "Error creating request: ${e.message}", e)
            callback(false, e.message)
        }
    }
}
