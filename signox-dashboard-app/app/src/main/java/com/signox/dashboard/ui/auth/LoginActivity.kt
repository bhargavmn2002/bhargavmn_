package com.signox.dashboard.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.signox.dashboard.R
import com.signox.dashboard.data.api.NetworkResult
import com.signox.dashboard.data.local.ServerConfigManager
import com.signox.dashboard.data.model.UserRole
import com.signox.dashboard.databinding.ActivityLoginBinding
import com.signox.dashboard.ui.main.MainActivity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class LoginActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityLoginBinding
    private val viewModel: LoginViewModel by viewModels()
    
    @Inject
    lateinit var serverConfigManager: ServerConfigManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        setupUI()
        observeViewModel()
        loadCurrentServerUrl()
    }
    
    private fun setupUI() {
        binding.btnLogin.setOnClickListener {
            val email = binding.etEmail.text.toString().trim()
            val password = binding.etPassword.text.toString()
            viewModel.login(email, password)
        }
        
        binding.btnServerConfig.setOnClickListener {
            showServerConfigDialog()
        }
    }
    
    private fun loadCurrentServerUrl() {
        lifecycleScope.launch {
            val serverUrl = serverConfigManager.getServerUrlSync()
            binding.tvCurrentServer.text = "Server: $serverUrl"
        }
    }
    
    private fun showServerConfigDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_server_config, null)
        val etServerUrl = dialogView.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.etServerUrl)
        
        val dialog = AlertDialog.Builder(this)
            .setView(dialogView)
            .setCancelable(true)
            .create()
        
        // Load current server URL before showing dialog
        lifecycleScope.launch {
            val currentUrl = serverConfigManager.getServerUrlSync()
            etServerUrl.setText(currentUrl)
            
            // Show dialog after loading the URL
            dialog.show()
        }
        
        dialogView.findViewById<com.google.android.material.button.MaterialButton>(R.id.btnCancel).setOnClickListener {
            dialog.dismiss()
        }
        
        dialogView.findViewById<com.google.android.material.button.MaterialButton>(R.id.btnSave).setOnClickListener {
            val newUrl = etServerUrl.text.toString().trim()
            
            if (newUrl.isEmpty()) {
                Toast.makeText(this, "Please enter a server URL", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
                Toast.makeText(this, "URL must start with http:// or https://", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            lifecycleScope.launch {
                serverConfigManager.saveServerUrl(newUrl)
                binding.tvCurrentServer.text = "Server: $newUrl"
                dialog.dismiss()
                
                // Show dialog to restart app
                AlertDialog.Builder(this@LoginActivity)
                    .setTitle("Restart Required")
                    .setMessage("The server URL has been updated. The app will now restart to apply the changes.")
                    .setCancelable(false)
                    .setPositiveButton("Restart") { _, _ ->
                        restartApp()
                    }
                    .show()
            }
        }
        
        dialog.show()
    }
    
    private fun restartApp() {
        // Clear all activities and restart
        val intent = packageManager.getLaunchIntentForPackage(packageName)
        intent?.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
        startActivity(intent)
        
        // Kill the current process to ensure clean restart
        android.os.Process.killProcess(android.os.Process.myPid())
    }
    
    private fun observeViewModel() {
        viewModel.loginState.observe(this) { result ->
            when (result) {
                is NetworkResult.Loading -> {
                    showLoading(true)
                }
                is NetworkResult.Success -> {
                    showLoading(false)
                    // Navigation handled by navigationEvent
                }
                is NetworkResult.Error -> {
                    showLoading(false)
                    showError(result.message ?: "Login failed")
                }
            }
        }
        
        viewModel.navigationEvent.observe(this) { roleData ->
            roleData?.let {
                navigateToDashboard(it.first, it.second)
                viewModel.resetNavigationEvent()
            }
        }
    }
    
    private fun navigateToDashboard(role: UserRole, staffRole: String? = null) {
        val intent = Intent(this, MainActivity::class.java).apply {
            putExtra(MainActivity.EXTRA_USER_ROLE, role.name)
            staffRole?.let { putExtra(MainActivity.EXTRA_STAFF_ROLE, it) }
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        startActivity(intent)
        finish()
    }
    
    private fun showLoading(isLoading: Boolean) {
        binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        binding.btnLogin.isEnabled = !isLoading
        binding.etEmail.isEnabled = !isLoading
        binding.etPassword.isEnabled = !isLoading
    }
    
    private fun showError(message: String) {
        binding.tvError.text = message
        binding.tvError.visibility = View.VISIBLE
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }
}
