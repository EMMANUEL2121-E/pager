package com.wifi.pager

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

/**
 * MainActivity - Entry point for WiFi Pager Android App
 * 
 * Responsibilities:
 * - Request runtime permissions (READ_PHONE_STATE, READ_CALL_LOG, INTERNET)
 * - Start foreground service for call detection
 * - Display app status to user
 * 
 * Permission Strategy:
 * - Requests permissions at runtime (required for Android 6.0+)
 * - Validates permission grants before starting service
 * - Graceful fallback if permissions denied
 */
class MainActivity : AppCompatActivity() {
    
    companion object {
        private const val TAG = "PagerMainActivity"
        private const val PERMISSION_REQUEST_CODE = 100
        
        private val REQUIRED_PERMISSIONS = arrayOf(
            Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.READ_CALL_LOG,
            Manifest.permission.INTERNET
        )
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        Log.d(TAG, "MainActivity created")
        
        // Check and request permissions
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!hasAllPermissions()) {
                ActivityCompat.requestPermissions(
                    this,
                    REQUIRED_PERMISSIONS,
                    PERMISSION_REQUEST_CODE
                )
            } else {
                startPagerService()
            }
        } else {
            startPagerService()
        }
    }

    /**
     * Check if all required permissions are granted
     */
    private fun hasAllPermissions(): Boolean {
        return REQUIRED_PERMISSIONS.all {
            ContextCompat.checkSelfPermission(this, it) == PackageManager.PERMISSION_GRANTED
        }
    }

    /**
     * Start the foreground call tracking service
     */
    private fun startPagerService() {
        Log.d(TAG, "Starting CallForegroundService")
        val intent = Intent(this, CallForegroundService::class.java)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
    }

    /**
     * Handle permission request results
     */
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        
        when (requestCode) {
            PERMISSION_REQUEST_CODE -> {
                if (grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                    Log.d(TAG, "All permissions granted")
                    startPagerService()
                } else {
                    Log.e(TAG, "Required permissions denied")
                }
            }
        }
    }
}
