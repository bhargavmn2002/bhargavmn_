# Backend URL Update Summary

## ✅ Changes Completed

All applications have been updated to connect to your local backend server at `http://192.168.1.232:5000`

### 1. Android Player App
**File**: `signox-android-player/app/src/main/java/com/signox/player/data/api/ApiClient.kt`
- **Changed**: `FIXED_BASE_URL` from `https://signoxcms.com/api` to `http://192.168.1.232:5000/api`
- **Impact**: Player app will now connect to local backend for all API calls

### 2. Android Dashboard App
**File**: `signox-dashboard-app/app/build.gradle.kts`
- **Changed**: `API_BASE_URL` from `https://192.168.1.232:5443/api/` to `http://192.168.1.232:5000/api/`
- **Impact**: Dashboard app will connect to local backend

**File**: `signox-dashboard-app/app/src/main/java/com/signox/dashboard/ui/playlist/PlaylistPreviewFragment.kt`
- **Changed**: Base URL from `http://192.168.1.231:5000` to `http://192.168.1.232:5000`
- **Impact**: Media preview will load from correct server

### 3. Frontend (Next.js)
**File**: `frontend/.env`
- **Already Configured**: `NEXT_PUBLIC_API_URL=http://192.168.1.232:5000/api`
- **Status**: ✅ No changes needed

### 4. Backend
**File**: `backend/.env`
- **Current**: `PORT=5000`, `HOST=0.0.0.0`
- **Status**: ✅ Configured correctly
- **Note**: CORS includes `http://192.168.1.232:3000` for frontend

---

## 🔧 Next Steps to Test

### 1. Rebuild Android Apps
Both Android apps need to be rebuilt for the URL changes to take effect:

```bash
# Android Player
cd signox-android-player
./gradlew clean assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk

# Android Dashboard
cd signox-dashboard-app
./gradlew clean assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### 2. Verify Backend is Running
```bash
cd backend
npm start

# Should see:
# Server running on http://0.0.0.0:5000
```

### 3. Test Connectivity

#### From Android Player:
1. Install updated APK
2. Open app
3. Check logs: `adb logcat | grep ApiClient`
4. Should see: "Connecting to: http://192.168.1.232:5000/api"

#### From Android Dashboard:
1. Install updated APK
2. Try to login
3. Check if API calls succeed

#### From Frontend:
1. Open browser: `http://192.168.1.232:3000`
2. Try to login
3. Check browser console for API calls

---

## 🌐 Network Requirements

### Ensure All Devices Are on Same Network
- **Backend Server**: 192.168.1.232 (your computer)
- **Android Devices**: Must be on same WiFi network
- **Frontend Browser**: Can be on same computer or same network

### Firewall Settings
Make sure port 5000 is open on your computer:

**Linux**:
```bash
sudo ufw allow 5000/tcp
```

**Windows**:
- Windows Defender Firewall → Advanced Settings
- Inbound Rules → New Rule → Port 5000 → Allow

### Test Backend Accessibility
From Android device or another computer on same network:
```bash
curl http://192.168.1.232:5000/api/health
```

Should return: `{"status":"ok"}`

---

## 📱 URL Configuration Summary

| Component | URL | Status |
|-----------|-----|--------|
| Backend API | `http://192.168.1.232:5000/api` | ✅ Running |
| Frontend Web | `http://192.168.1.232:3000` | ✅ Configured |
| Android Player | `http://192.168.1.232:5000/api` | ✅ Updated |
| Android Dashboard | `http://192.168.1.232:5000/api` | ✅ Updated |
| Media Files | `http://192.168.1.232:5000/uploads/` | ✅ Auto-configured |

---

## ⚠️ Important Notes

### 1. HTTP vs HTTPS
- Changed from HTTPS to HTTP for local development
- This is fine for local network testing
- For production, use HTTPS with valid SSL certificate

### 2. IP Address Changes
If your computer's IP address changes (common with DHCP):
- Update all URLs to new IP address
- Or set a static IP for your computer
- Or use hostname instead of IP (if mDNS/Bonjour is available)

### 3. Mobile Data vs WiFi
- Android devices MUST be on WiFi (same network as backend)
- Mobile data will NOT work with local IP address
- For mobile data access, you need:
  - Public IP address or domain name
  - Port forwarding on router
  - HTTPS with valid certificate

---

## 🐛 Troubleshooting

### Android App Can't Connect
1. **Check WiFi**: Ensure device is on same network
2. **Check Backend**: `curl http://192.168.1.232:5000/api/health`
3. **Check Logs**: `adb logcat | grep -E "ApiClient|Retrofit|OkHttp"`
4. **Check Firewall**: Port 5000 must be open

### "Network Security Policy" Error
If you see SSL/TLS errors on Android:
- HTTP is allowed in debug builds
- Check `AndroidManifest.xml` has `android:usesCleartextTraffic="true"`

### "Connection Refused"
- Backend is not running
- Wrong IP address
- Firewall blocking port 5000

### "Timeout"
- Device not on same network
- Backend not accessible from network
- Router blocking local network traffic

---

## 🎯 Ready for Offline Caching Implementation

Now that all apps are pointing to the local backend, we can proceed with:

1. ✅ Testing current offline caching behavior
2. ✅ Implementing recommended fixes from `OFFLINE_CACHING_ANALYSIS.md`
3. ✅ Verifying offline playback works properly

The local backend setup is ideal for testing because:
- Fast network speeds for testing downloads
- Easy to monitor backend logs
- Can simulate network disconnection easily
- No internet bandwidth usage

---

## 📝 Quick Reference

### Start Backend
```bash
cd backend
npm start
```

### Build & Install Player
```bash
cd signox-android-player
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### Build & Install Dashboard
```bash
cd signox-dashboard-app
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### View Player Logs
```bash
adb logcat | grep -E "PlaylistPlayer|ApiClient|OfflineMedia"
```

### Test API
```bash
curl http://192.168.1.232:5000/api/health
```

---

All URLs have been updated successfully! Ready to proceed with offline caching implementation. 🚀
