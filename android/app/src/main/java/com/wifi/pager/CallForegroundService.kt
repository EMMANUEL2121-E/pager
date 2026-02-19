package com.wifi.pager

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.IBinder
import android.telephony.TelephonyManager
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * CallForegroundService - Foreground service that monitors incoming calls
 * 
 * Responsibilities:
 * - Maintains a foreground notification (required for Android 8.0+)
 * - Registers BroadcastReceiver for phone state changes
 * - Captures incoming call details
 * - Resolves contact name from phone number
 * - Sends JSON payload to WiFi Pager server via HTTP POST
 * 
 * Battery Optimization Notes:
 * - Uses foreground service to prevent system killing
 * - Registers receiver dynamically to reduce battery drain
 * - All network operations are asynchronous (non-blocking)
 * - Consider: Add battery saver mode detection and throttling
 */
class CallForegroundService : Service() {

    companion object {
        private const val TAG = "PagerCallService"
        private const val CHANNEL_ID = "wifi_pager_channel"
        private const val NOTIFICATION_ID = 1001
        const val ACTION_INCOMING_CALL = "com.wifi.pager.INCOMING_CALL"
        const val EXTRA_PHONE_NUMBER = "phone_number"

        // Server configuration - Updated for local network
        private const val SERVER_URL = "http://192.168.1.6:3000/incoming-call"
    }

    private lateinit var callReceiver: CallReceiver
    private lateinit var apiClient: ApiClient
    private val serviceScope = CoroutineScope(Dispatchers.IO)

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Service onCreate")

        // Initialize API client
        apiClient = ApiClient(this)

        // Create notification channel (required for Android 8.0+)
        createNotificationChannel()

        // Register broadcast receiver for phone state changes
        callReceiver = CallReceiver()
        val intentFilter = IntentFilter(TelephonyManager.ACTION_PHONE_STATE_CHANGED)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(callReceiver, intentFilter, Context.RECEIVER_EXPORTED)
        } else {
            registerReceiver(callReceiver, intentFilter)
        }

        // Start as foreground service
        val notification = buildNotification()
        startForeground(NOTIFICATION_ID, notification)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "Service onStartCommand")

        if (intent?.action == ACTION_INCOMING_CALL) {
            val phoneNumber = intent.getStringExtra(EXTRA_PHONE_NUMBER) ?: ""
            if (phoneNumber.isNotEmpty()) {
                Log.d(TAG, "Processing incoming call: $phoneNumber")
                processIncomingCall(phoneNumber)
            }
        }

        // Restart service if killed by system
        return START_STICKY
    }

    /**
     * Process incoming call and send to server
     */
    private fun processIncomingCall(phoneNumber: String) {
        serviceScope.launch {
            try {
                // Get contact name
                val contactName = getContactName(phoneNumber)

                // Create JSON payload
                val callData = CallData(
                    number = phoneNumber,
                    name = contactName,
                    timestamp = getCurrentTimestamp()
                )

                Log.d(TAG, "Sending call data: $callData")

                // Send to server
                apiClient.sendIncomingCall(SERVER_URL, callData) { success, error ->
                    if (success) {
                        Log.d(TAG, "Successfully sent call alert to server")
                    } else {
                        Log.e(TAG, "Failed to send call alert: $error")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error processing call: ${e.message}", e)
            }
        }
    }

    /**
     * Get contact name for phone number
     * Returns phone number if contact not found
     */
    private fun getContactName(phoneNumber: String): String {
        return try {
            val contactName = ContactResolver.resolveContactName(this, phoneNumber)
            contactName ?: phoneNumber
        } catch (e: Exception) {
            Log.e(TAG, "Error resolving contact: ${e.message}")
            phoneNumber
        }
    }

    /**
     * Get current timestamp in ISO 8601 format
     */
    private fun getCurrentTimestamp(): String {
        return SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
            timeZone = java.util.TimeZone.getTimeZone("UTC")
        }.format(Date())
    }

    /**
     * Create notification for foreground service
     */
    private fun buildNotification(): Notification {
        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
        } else {
            Notification.Builder(this)
        }

        return builder
            .setContentTitle("WiFi Pager Active")
            .setContentText("Monitoring for incoming calls")
            .setSmallIcon(R.drawable.ic_notification)
            .setPriority(Notification.PRIORITY_LOW)
            .build()
    }

    /**
     * Create notification channel (required for Android 8.0+)
     */
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "WiFi Pager Service",
                NotificationManager.IMPORTANCE_LOW
            )
            channel.description = "Notification for WiFi Pager call monitoring service"
            
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "Service onDestroy")
        unregisterReceiver(callReceiver)
    }

    override fun onBind(intent: Intent?): IBinder? = null
}

/**
 * Data class for call information
 */
data class CallData(
    val number: String,
    val name: String,
    val timestamp: String
)
