# 🚀 Quick Start - Offline Caching

## One-Command Build & Test
```bash
cd signox-android-player
./build-and-test-caching.sh
```

---

## Manual Steps

### 1. Build & Install
```bash
cd signox-android-player
./gradlew clean assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### 2. Start Backend
```bash
cd backend
npm start
# Should run on http://192.168.1.232:5000
```

### 3. Test Offline Playback

#### First Play (Online)
1. Connect device to WiFi
2. Open player app
3. Play a video
4. Watch it complete

#### Second Play (Offline)
1. Turn OFF WiFi
2. Play same video
3. Should work perfectly!

---

## Monitor Logs
```bash
# All logs
adb logcat | grep PlaylistPlayer

# Cache stats only
adb logcat | grep "CACHE STATISTICS"

# Video info only
adb logcat | grep "VIDEO PLAYBACK INFO"
```

---

## What to Look For

### ✅ Good Signs
```
✅ Using originalUrl (MP4) for reliable caching
Cache status: ✓ Cached (45 MB)
Video ready to play
```

### ⚠️ Warnings
```
⚠️ Using HLS without originalUrl
Cache status: ☁ Not cached
```

### ❌ Problems
```
❌ IMAGE LOAD FAILED
Connection refused
Network error
```

---

## Quick Checks

### Is Backend Running?
```bash
curl http://192.168.1.232:5000/api/health
# Should return: {"status":"ok"}
```

### Is Device Connected?
```bash
adb devices
# Should show your device
```

### Check Cache Size
```bash
adb shell du -sh /data/data/com.signox.player/cache/exoplayer/
```

### Clear Cache
```bash
adb shell rm -rf /data/data/com.signox.player/cache/exoplayer/
```

---

## Troubleshooting

### Video Won't Play Offline
→ Play it once with internet first

### "Connection Refused"
→ Check backend is running
→ Check device on same WiFi

### "Using HLS without originalUrl"
→ Re-upload video via dashboard

### Cache Not Growing
→ Check device storage
→ Verify videos play completely

---

## Key Files

- **Implementation**: `OFFLINE_CACHING_IMPLEMENTATION.md`
- **Complete Guide**: `OFFLINE_CACHING_COMPLETE.md`
- **URL Setup**: `URL_UPDATE_SUMMARY.md`
- **Analysis**: `OFFLINE_CACHING_ANALYSIS.md`

---

## Architecture

```
┌─────────────────────────┐
│   Android Player        │
│                         │
│  ┌──────────────────┐  │
│  │ ExoPlayer Cache  │  │
│  │     (2GB)        │  │
│  │   Automatic      │  │
│  └──────────────────┘  │
│           ↓             │
│   Prefer originalUrl    │
│   (MP4 over HLS)        │
└─────────────────────────┘
           ↓
┌─────────────────────────┐
│   Backend Server        │
│  192.168.1.232:5000     │
│                         │
│  • HLS: /uploads/hls/   │
│  • MP4: /uploads/file-  │
└─────────────────────────┘
```

---

## Success Criteria

✅ Videos play offline after first view
✅ Cache statistics show in logs
✅ "Cached" status appears
✅ Instant playback for cached videos
✅ No errors in logs

---

**That's it! Simple, reliable offline caching.** 🎉
