package com.wifi.pager

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

/**
 * BootReceiver - Starts WiFi Pager service on device boot
 * 
 * Ensures the call detection service restarts automatically
 * if device is rebooted
 */
class BootReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "PagerBootReceiver"
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null) return

        if (intent?.action == Intent.ACTION_BOOT_COMPLETED) {
            Log.d(TAG, "Device boot detected, starting CallForegroundService")

            val serviceIntent = Intent(context, CallForegroundService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
        }
    }
}
