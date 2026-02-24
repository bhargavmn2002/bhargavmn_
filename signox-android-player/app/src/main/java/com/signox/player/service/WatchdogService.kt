package com.signox.player.service

import android.app.ActivityManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import com.signox.player.MainActivity

class WatchdogService : Service() {
    
    private val handler = Handler(Looper.getMainLooper())
    private var watchdogRunnable: Runnable? = null
    private lateinit var prefs: SharedPreferences
    
    companion object {
        private const val TAG = "WatchdogService"
        private const val CHECK_INTERVAL = 30000L // 30 seconds
        private const val PREFS_NAME = "watchdog_prefs"
        private const val KEY_USER_EXITED = "user_exited"
        
        fun setUserExited(context: Context, exited: Boolean) {
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putBoolean(KEY_USER_EXITED, exited)
                .apply()
        }
    }
    
    override fun onCreate() {
        super.onCreate()
        prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }
    
    override fun onBind(intent: Intent?): IBinder? = null
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "Watchdog service started")
        
        // Check if user intentionally exited
        if (prefs.getBoolean(KEY_USER_EXITED, false)) {
            Log.d(TAG, "User exited app - stopping watchdog")
            stopSelf()
            return START_NOT_STICKY
        }
        
        startWatchdog()
        return START_STICKY // Restart if killed
    }
    
    private fun startWatchdog() {
        watchdogRunnable = object : Runnable {
            override fun run() {
                // Check if user exited before restarting
                if (prefs.getBoolean(KEY_USER_EXITED, false)) {
                    Log.d(TAG, "User exited - stopping watchdog")
                    stopSelf()
                    return
                }
                
                checkAndRestartApp()
                handler.postDelayed(this, CHECK_INTERVAL)
            }
        }
        handler.post(watchdogRunnable!!)
    }
    
    private fun checkAndRestartApp() {
        // Check if MainActivity is running
        if (!isAppInForeground()) {
            Log.d(TAG, "App not in foreground - restarting")
            try {
                val intent = Intent(this, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or 
                            Intent.FLAG_ACTIVITY_CLEAR_TOP or
                            Intent.FLAG_ACTIVITY_SINGLE_TOP
                    putExtra("watchdog_restart", true)
                }
                startActivity(intent)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to restart app", e)
            }
        }
    }
    
    private fun isAppInForeground(): Boolean {
        val activityManager = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val runningProcesses = activityManager.runningAppProcesses ?: return false
        
        return runningProcesses.any { 
            it.processName == packageName && 
            it.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND 
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        watchdogRunnable?.let { handler.removeCallbacks(it) }
        Log.d(TAG, "Watchdog service destroyed")
        
        // Only restart if user didn't intentionally exit
        if (!prefs.getBoolean(KEY_USER_EXITED, false)) {
            val intent = Intent(this, WatchdogService::class.java)
            startService(intent)
        }
    }
}