package com.wifi.pager

import android.content.Context
import android.provider.ContactsContract
import android.util.Log

/**
 * ContactResolver - Resolves contact names from phone numbers
 * 
 * Uses Android ContentProvider to query contacts database
 * Falls back to phone number if contact not found
 */
object ContactResolver {

    private const val TAG = "PagerContactResolver"

    /**
     * Resolve contact name from phone number
     * 
     * @return Contact display name, or null if not found
     */
    fun resolveContactName(context: Context, phoneNumber: String): String? {
        return try {
            val uri = ContactsContract.PhoneLookup.CONTENT_FILTER_URI.buildUpon()
                .appendPath(phoneNumber)
                .build()

            val projection = arrayOf(ContactsContract.PhoneLookup.DISPLAY_NAME)

            context.contentResolver.query(uri, projection, null, null, null)?.use { cursor ->
                if (cursor.moveToFirst()) {
                    val nameIndex = cursor.getColumnIndex(ContactsContract.PhoneLookup.DISPLAY_NAME)
                    val displayName = cursor.getString(nameIndex)
                    Log.d(TAG, "Contact found: $displayName for $phoneNumber")
                    displayName
                } else {
                    Log.d(TAG, "No contact found for: $phoneNumber")
                    null
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error resolving contact: ${e.message}", e)
            null
        }
    }
}
