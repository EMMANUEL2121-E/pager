package com.wifi.pager

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.telephony.TelephonyManager
import android.util.Log

/**
 * CallReceiver - BroadcastReceiver for phone state changes
 * 
 * Intercepts:
 * - ACTION_PHONE_STATE_CHANGED broadcasts
 * - Extracts incoming phone number
 * - Delegates processing to CallForegroundService
 * 
 * Note: This receiver requires READ_PHONE_STATE permission
 */
class CallReceiver : BroadcastReceiver() {
    
    companion object {
        private const val TAG = "PagerCallReceiver"
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) return

        log(TAG, "BroadcastReceiver.onReceive called")
        
        // Check for ACTION_PHONE_STATE_CHANGED
        if (intent.action == TelephonyManager.ACTION_PHONE_STATE_CHANGED) {
            val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
            val incomingNumber = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER) ?: ""

            log(TAG, "Phone state: $state, Number: $incomingNumber")

            // Process only on ringing state
            if (state == TelephonyManager.EXTRA_STATE_RINGING && incomingNumber.isNotEmpty()) {
                log(TAG, "Incoming call detected from: $incomingNumber")
                
                // Send to service for processing
                val serviceIntent = Intent(context, CallForegroundService::class.java).apply {
                    action = CallForegroundService.ACTION_INCOMING_CALL
                    putExtra(CallForegroundService.EXTRA_PHONE_NUMBER, incomingNumber)
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            }
        }
    }

    private fun log(tag: String, message: String) {
        Log.d(tag, message)
    }
}
