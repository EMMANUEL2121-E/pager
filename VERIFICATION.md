# 🔍 WiFi PAGER – INSTALLATION CHECKLIST & VERIFICATION

Complete verification guide for ensuring all components are properly installed and configured.

---

## ✅ PRE-INSTALLATION CHECKLIST

### Requirements
- [ ] Node.js 14+ installed (`node --version` returns 14.x or higher)
- [ ] npm 6+ installed (`npm --version` returns 6.x or higher)
- [ ] Android device with Android 8.0+ (API level 26+)
- [ ] Android Studio installed
- [ ] Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- [ ] WiFi router available
- [ ] All devices can connect to same WiFi network
- [ ] USB cable for Android device
- [ ] System administrator access (may need for firewall)

### Network
- [ ] WiFi network name noted
- [ ] WiFi password ready
- [ ] Server machine IP address identified
- [ ] No port conflicts (ports 3000, 8000 available)

---

## 🖥️ SERVER SETUP VERIFICATION

### Step 1: Node.js Installation
```bash
# Verify Node.js
node --version
# Expected output: v14.x.x or higher

# Verify npm
npm --version
# Expected output: 6.x.x or higher
```

**Checklist:**
- [ ] Node.js version 14 or higher
- [ ] npm version 6 or higher
- [ ] Both commands accessible from terminal

### Step 2: Server Dependencies
```bash
cd pager/server

# Install dependencies
npm install

# Verify installation
npm list
```

**Expected packages:**
- [ ] express (4.x.x)
- [ ] socket.io (4.x.x)
- [ ] cors (2.x.x)
- [ ] body-parser (1.x.x)

### Step 3: Start Server
```bash
# Start server
npm start

# Expected output:
# ╔════════════════════════════════════════════╗
# ║     📟 WiFi PAGER SERVER STARTED 📟        ║
# ╠════════════════════════════════════════════╣
# ║ Server: http://0.0.0.0:3000                ║
# ║ REST API: POST /incoming-call              ║
# ║ WebSocket: ws://localhost:3000             ║
# ╠════════════════════════════════════════════╣
# ║ Waiting for Android app & web pager...     ║
# ╚════════════════════════════════════════════╝
```

**Verification:**
- [ ] Server starts without errors
- [ ] Listening on port 3000
- [ ] No module not found errors
- [ ] No permission denied errors

### Step 4: Test Server Connectivity
```bash
# From another terminal/device
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"...","uptime":...,"clients":0,"connectedDevices":[]}
```

**Checklist:**
- [ ] HTTP request succeeds (status 200)
- [ ] Returns valid JSON
- [ ] `"status": "ok"` in response
- [ ] `"clients": 0` (no connections yet)

---

## 📱 ANDROID APP SETUP VERIFICATION

### Step 1: Android Studio Setup
```
Steps:
1. Open Android Studio
2. File → Open → Navigate to pager/android/
3. Wait for Gradle sync (may take 2-3 minutes)
```

**Verification:**
- [ ] Gradle sync completes successfully
- [ ] No "Project setup incomplete" errors
- [ ] Files load without errors
- [ ] Build files show no red underlines

### Step 2: Find Server IP Address
```bash
# Windows (Command Prompt)
ipconfig
# Look for: IPv4 Address . . . . . . . . . . : xxx.xxx.xxx.xxx

# macOS/Linux (Terminal)
ifconfig
# Look for: inet xxx.xxx.xxx.xxx
```

**Store this IP:**
- [ ] Server IP address noted (e.g., 192.168.1.100)
- [ ] Confirmed not 127.0.0.1
- [ ] Starts with 192.168.x.x or 10.x.x.x

### Step 3: Update Server URL
```
File: pager/android/app/src/main/java/com/wifi/pager/CallForegroundService.kt
Line: 53
Find: private const val SERVER_URL = "http://192.168.1.100:3000/incoming-call"
Replace: private const val SERVER_URL = "http://YOUR.IP.HERE:3000/incoming-call"
```

**Verification:**
- [ ] File opened successfully
- [ ] Line 53 found with SERVER_URL
- [ ] Updated to correct IP address
- [ ] File saved (Ctrl+S or Cmd+S)
- [ ] No compilation errors after save

### Step 4: Connect Android Device
```
Steps:
1. Enable Developer Mode on phone:
   Settings → About Phone → Tap "Build Number" 7 times
2. Settings → Developer Options → Enable "USB Debugging"
3. Connect phone via USB
4. Accept RSA fingerprint dialog on phone
5. Verify: adb devices (shows phone serial)
```

**Verification:**
- [ ] Phone shows "USB Debugging" is enabled
- [ ] Phone shows USB connection notification
- [ ] adb devices shows phone serial number
- [ ] No "unauthorized" device status

### Step 5: Build & Run App
```
Android Studio:
1. Click Run button (Shift+F10) or Run → Run 'app'
2. Select connected device
3. Wait for app to build and install
```

**Verification:**
- [ ] Build completes without errors
- [ ] App installs on phone
- [ ] App launches successfully
- [ ] No crash on startup
- [ ] Permission request dialog appears

### Step 6: Grant Permissions
```
On phone:
1. When app requests permissions, tap "Allow" or "Grant"
2. Grant for each permission:
   - Phone
   - Contacts
   - Internet
```

**Verification:**
- [ ] All permissions granted (not denied)
- [ ] Permissions persisted after restart
- [ ] Notification shows service is running
- [ ] No permission error messages

### Step 7: Verify Android App
```bash
# Monitor app logs
adb logcat | grep "Pager"

# Should see:
# [PagerMainActivity] MainActivity created
# [PagerCallService] Starting CallForegroundService
# [PagerCallService] Service onCreate
```

**Checklist:**
- [ ] App starts without crashes
- [ ] Logs show service starting
- [ ] Foreground notification visible
- [ ] No permission-related errors
- [ ] No network connection errors (yet)

---

## 🌐 WEB PAGER SETUP VERIFICATION

### Step 1: Start Web Server
```bash
cd pager/web/pager

# Option A: Python (recommended)
python -m http.server 8000
# or: python3 -m http.server 8000

# Option B: Node.js
npm install -g http-server
http-server -p 8000 --cors
```

**Verification:**
- [ ] Server starts on port 8000
- [ ] No "Address already in use" errors
- [ ] No module not found errors

### Step 2: Test Web Server
```bash
# In another terminal
curl http://localhost:8000/

# Should return HTML content starting with:
# <!DOCTYPE html>
# <html lang="en">
```

**Verification:**
- [ ] HTTP request succeeds (status 200)
- [ ] Returns HTML content
- [ ] No 404 errors

### Step 3: Access from Browser
```
Open browser and navigate to:
http://192.168.1.100:8000
(replace 192.168.1.100 with your server IP)
```

**Verification:**
- [ ] Page loads (not blank)
- [ ] Sees "📟 WiFi Pager" title
- [ ] Status shows "Disconnected" or "Connecting..."
- [ ] UI elements visible
- [ ] No console errors (check browser DevTools → Console)

### Step 4: Enable Sound
```
On web page:
1. Look for blue "Enable Sound" button
2. Click the button
3. Should hear brief beep
4. Button changes to "✓ Sound Enabled"
```

**Verification:**
- [ ] "Enable Sound" button visible and clickable
- [ ] Clicking plays beep sound
- [ ] Button text changes to "✓ Sound Enabled"
- [ ] No browser audio permission errors

### Step 5: Configure Server URL
```
Web page settings panel:
1. Find "Server URL" input field
2. Clear default value
3. Enter: ws://192.168.1.100:3000
4. Click "Update" button
```

**Verification:**
- [ ] Server URL input field visible
- [ ] Can type in field
- [ ] Update button works
- [ ] Status updates after click

---

## 🔗 INTEGRATION VERIFICATION

### Step 1: Verify All Components Running
```bash
# Terminal 1: Check server is running
curl http://localhost:3000/health

# Terminal 2: Check web server is running
curl http://localhost:8000/

# Terminal 3: Check Android app is running
adb logcat | grep "Pager"

# Browser: Check web pager loads
# Open http://192.168.1.100:8000
```

**Checklist:**
- [ ] Server responds to /health
- [ ] Web server returns HTML
- [ ] Android app logs visible
- [ ] Web pager loads in browser

### Step 2: Verify Network Connectivity
```bash
# From server machine to device network
ping 192.168.1.100

# Should show responses:
# 64 bytes from 192.168.1.100: icmp_seq=1 ttl=64 time=5.5 ms
```

**Verification:**
- [ ] Ping succeeds
- [ ] Response time reasonable (< 100ms)
- [ ] No "host unreachable" errors

### Step 3: Send Test Call to Server
```bash
curl -X POST http://192.168.1.100:3000/incoming-call \
  -H "Content-Type: application/json" \
  -d '{
    "number": "+1234567890",
    "name": "Test Caller",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'

# Expected response:
# {"success":true,"message":"Call alert broadcast","clientsNotified":1}
```

**Verification:**
- [ ] Server responds with 200 status
- [ ] Response contains `"success":true`
- [ ] Shows `"clientsNotified"` count
- [ ] No errors in response

### Step 4: Verify Web Pager Receives Call Alert
```
On web pager browser:
1. Should see "Connected" (not "Disconnected")
2. Should show the call alert overlay with:
   - Test Caller (name)
   - +1234567890 (number)
   - Timestamp
3. Should show call in "Recent Calls" list
4. Should hear beep sound
5. Screen should flash briefly
```

**Checklist:**
- [ ] Status shows "Connected"
- [ ] Call alert appeared after POST
- [ ] Call information displayed correctly
- [ ] Beep sound played
- [ ] Screen flash animation visible
- [ ] Call added to history

### Step 5: Verify Call Count Updates
```
On web pager:
1. Check "Calls Received:" counter
2. Should show 1 (from test call)
3. Make another test call
4. Counter should increase to 2
```

**Dropdown:**
- [ ] Call counter increments
- [ ] Counter matches number of test calls

### Step 6: Test Real Incoming Call (Android)
```
On Android phone 1:
1. Have someone call the phone
2. OR use another phone to call this number
3. Observe call detection
```

**On web pager (Phone 2):
1. Should display incoming call details
2. Should play beep
3. Should flash screen
4. Should add to call history
```

**Verification:**
- [ ] Call detected by Android app
- [ ] Call details received by server
- [ ] Web pager displays call info
- [ ] Audio/visual alerts work
- [ ] Call history updated

---

## 📊 DIAGNOSTICS

### Check Server Health
```bash
# While server is running
curl -v http://localhost:3000/health

# Should show:
# < HTTP/1.1 200 OK
# < Content-Type: application/json
# {
#   "status": "ok",
#   "timestamp": "...",
#   "uptime": ...,
#   "clients": 0,
#   "connectedDevices": []
# }
```

### Check Android Logs
```bash
# Comprehensive log view
adb logcat -s "PagerMainActivity:D" "PagerCallService:D" "PagerApiClient:D"

# Filter for errors
adb logcat | grep -i error

# Clear logs and then run
adb logcat -c
# [Do something]
# adb logcat > logs.txt
```

### Check Web Console
```
Browser DevTools (F12 or Cmd+Option+I):
1. Console tab → should show connection logs
2. Network tab → shows WebSocket connection
3. Application tab → LocalStorage shows settings
```

### Check Network Connectivity
```bash
# From each device, ping server
ping 192.168.1.100

# Check port accessibility
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# macOS/Linux
lsof -i :3000
lsof -i :8000
```

---

## 🚨 TROUBLESHOOTING DURING INSTALLATION

### Issue: Node.js not found
```
Solution:
1. Download from nodejs.org
2. Install to system PATH
3. Restart terminal
4. Verify: node --version
```

### Issue: Port 3000 already in use
```bash
# Find process using port
lsof -i :3000

# Kill process (on macOS/Linux)
kill -9 <PID>

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm start
```

### Issue: Android app crashes on startup
```
Verify:
1. Android version is 8.0+ (adb shell getprop ro.build.version.release)
2. All permissions granted
3. Server URL is correct (with your IP, not 192.168.1.100)
4. Check Logcat for specific error
```

### Issue: Can't connect to web pager
```
Verify:
1. Server IP is correct (pingable)
2. Both on same WiFi network
3. Web server running on port 8000
4. No firewall blocking ports
5. URL format: http://<IP>:8000 (not https)
```

### Issue: No beep sound
```
Solutions:
1. Click "Enable Sound" button
2. Check browser volume (not muted)
3. Check system volume
4. Check if OS has muted browser audio
5. Try different browser
6. Check browser permissions for audio
```

---

## ✨ SUCCESSFUL INSTALLATION INDICATORS

If you see all of these, your installation is successful:

✅ **Server:**
- Starts without errors
- Responds to /health endpoint
- Shows "Waiting for Android app & web pager..."

✅ **Android App:**
- Installs successfully
- Shows permissions permission request
- Displays "Call Detection Service Active"
- Logs show service running
- Foreground notification visible

✅ **Web Pager:**
- Loads in browser
- Status shows "Connected"
- Sound can be enabled
- Test call displays properly
- Beep sounds when call received
- Screen flashes on alert
- Call appears in history

✅ **Integration:**
- Curl/curl test call succeeds
- Web pager receives and displays call
- Audio and visual alerts work
- Call count increments
- Real incoming calls detected on Android

---

## 📋 QUICK VERIFICATION SCRIPT

Run this to verify all components (on server machine):

```bash
#!/bin/bash
echo "=== WiFi Pager Installation Verification ==="

echo "✓ Node.js version:"
node --version

echo "✓ npm version:"
npm --version

echo "✓ Server can access:"
curl -s http://localhost:3000/health | python -m json.tool

echo "✓ Web server can access:"
curl -s http://localhost:8000/ | grep -o "<title>[^<]*</title>"

echo "✓ Network interfaces:"
ifconfig | grep "inet " | grep -v "127.0"

echo "✓ Port 3000 in use:"
lsof -i :3000

echo "✓ Port 8000 in use:"
lsof -i :8000

echo "=== Verification Complete ==="
```

---

## 📞 VERIFICATION SUPPORT

If verification fails:

1. **Review relevant documentation:**
   - SETUP.md for detailed setup
   - QUICK_START.md for quick reference
   - ARCHITECTURE.md for technical details

2. **Check common issues in QUICK_START.md troubleshooting section**

3. **Verify each component separately before testing integration**

4. **Ensure all devices are on same WiFi network**

---

**Checklist Version:** 1.0  
**Last Updated:** February 19, 2024  
**For:** WiFi Pager v1.0

