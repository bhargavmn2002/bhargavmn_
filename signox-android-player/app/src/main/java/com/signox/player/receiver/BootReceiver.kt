package com.signox.player.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.signox.player.MainActivity

class BootReceiver : BroadcastReceiver() {
    
    companion object {
        private const val TAG = "BootReceiver"
    }
    
    override fun onReceive(context: Context, intent: Intent) {
        Log.d(TAG, "Boot completed, starting SignoX Player")
        
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_LOCKED_BOOT_COMPLETED,
            Intent.ACTION_MY_PACKAGE_REPLACED,
            Intent.ACTION_PACKAGE_REPLACED -> {
                startApp(context)
            }
        }
    }
    
    private fun startApp(context: Context) {
        try {
            // Start the watchdog service first
            val watchdogIntent = Intent(context, com.signox.player.service.WatchdogService::class.java)
            context.startService(watchdogIntent)
            
            // Then start the main activity
            val intent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or 
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP
                putExtra("auto_started", true)
            }
            context.startActivity(intent)
            Log.d(TAG, "SignoX Player and watchdog started successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start SignoX Player", e)
        }
    }
}