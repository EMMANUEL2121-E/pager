# 📟 WiFi Pager – Installation & Deployment Guide

Quick reference for getting everything running.

## 🎯 Prerequisites

- **Server Machine:** Windows/macOS/Linux with Node.js 14+
- **Phone 1:** Android 8.0+ device
- **Phone 2:** Any device with web browser
- **Network:** All devices on same WiFi

---

## ⚡ 5-Minute Quick Start

### 1. Get Server IP
```bash
# Windows
ipconfig

# macOS/Linux  
ifconfig
```
**Note:** Look for `192.168.x.x` format

### 2. Start Server
```bash
cd pager/server
npm install
npm start
```

### 3. Start Web Pager
```bash
# Terminal 2
cd pager/web/pager
python -m http.server 8000
```

### 4. Install Android App
- Open `pager/android/` in Android Studio
- Update IP in `CallForegroundService.kt`
- Run on phone

### 5. Open Web Pager
- Browser: `http://192.168.1.100:8000`
- Replace with your server IP
- Click "Enable Sound"

✅ **Done! System ready for incoming calls**

---

## 🔧 Detailed Installation

### Windows Setup

**Install Node.js:**
1. Download from nodejs.org
2. Run installer
3. Verify: `node --version`

**Start Server:**
```cmd
cd pager\server
npm install
npm start
```

**Web Pager (Python):**
```cmd
cd pager\web\pager
python -m http.server 8000
```

**Android Studio:**
1. Download & install from google.com/android/studio
2. Open `pager/android` folder
3. Wait for Gradle sync
4. Update IP in `CallForegroundService.kt`

---

### macOS Setup

**Install Node.js:**
```bash
brew install node
node --version
```

**Start Server:**
```bash
cd pager/server
npm install
npm start
```

**Web Pager:**
```bash
cd pager/web/pager
python3 -m http.server 8000
```

**Android/iOS:**
- Download Android Studio
- Follow same steps as Windows

---

### Linux Setup

**Install Node.js:**
```bash
sudo apt-get update
sudo apt-get install nodejs npm
node --version
```

**Start Server:**
```bash
cd pager/server
npm install
npm start
```

**Web Pager:**
```bash
cd pager/web/pager
python3 -m http.server 8000
```

---

## 📱 Android App Configuration

### Step-by-Step

1. **Open Android Studio**
2. **File → Open** → Select `pager/android`
3. **Wait** for Gradle sync
4. **Open:** `app/src/main/java/com/wifi/pager/CallForegroundService.kt`
5. **Find line 53:** 
   ```kotlin
   private const val SERVER_URL = "http://192.168.1.100:3000/incoming-call"
   ```
6. **Replace** `192.168.1.100` with your server IP
7. **Save** (Ctrl+S)
8. **Connect phone** via USB
9. **Enable USB Debugging** on phone
10. **Click Run** (Shift+F10)

### Permissions

Ensure device grants permissions:
- ✅ Phone
- ✅ Contacts  
- ✅ Internet

---

## 🌐 Web Pager Hosting

### Option 1: Python (Recommended for Quick Start)

```bash
cd pager/web/pager

# Python 3 (macOS/Linux/Windows)
python3 -m http.server 8000

# Python 2 (older systems)
python -m SimpleHTTPServer 8000

# Access: http://192.168.1.100:8000
```

### Option 2: Node.js HTTP Server

```bash
cd pager/web/pager
npm install -g http-server
http-server -p 8000 --cors

# Access: http://192.168.1.100:8000
```

### Option 3: Production (Express)

```bash
npm install -g express-static-gzip
express-static-gzip -p 8000 .

# Access: http://192.168.1.100:8000
```

---

## ✅ Verification Checklist

### Server Running?
```bash
curl http://localhost:3000/health
```
Should return JSON with `"status": "ok"`

### Web Pager Loading?
```bash
curl http://localhost:8000/
```
Should return HTML

### Devices Connected?
```bash
ping 192.168.1.100  # Your server IP
```
Should respond with pings

### Ports Available?
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# macOS/Linux
lsof -i :3000
lsof -i :8000
```

---

## 🐛 Quick Troubleshooting

### "Connection Refused"
- [ ] Server running (`npm start`)?
- [ ] Correct IP address?
- [ ] Same WiFi network?
- [ ] Port 3000 open?

### "Android App Crashes"
- [ ] Correct server IP in code?
- [ ] Permissions granted?
- [ ] Android 8.0+?
- [ ] WiFi connected?

### "No Sound on Web Pager"
- [ ] Clicked "Enable Sound"?
- [ ] Browser audio enabled?
- [ ] Volume turned up?
- [ ] Try different browser?

### "Port Already in Use"
```bash
# Windows
taskkill /PID <PID> /F

# macOS/Linux
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

---

## 📊 Testing the System

### Test 1: Server Health
```bash
curl -X GET http://192.168.1.100:3000/health
```

### Test 2: Simulate Call
```bash
curl -X POST http://192.168.1.100:3000/incoming-call \
  -H "Content-Type: application/json" \
  -d '{
    "number": "+1234567890",
    "name": "Test User",
    "timestamp": "'$(date -Iseconds)'"
  }'
```

### Test 3: WebSocket Connection
Open web pager and check browser console for connection messages

---

## 🚀 Deployment Checklist

- [ ] Server IP identified and documented
- [ ] Node.js installed and verified
- [ ] Server started and running
- [ ] Web server started and accessible
- [ ] Android app updated with correct IP
- [ ] Android app installed on device
- [ ] All devices on same WiFi network
- [ ] Web pager loads in browser
- [ ] "Enable Sound" clicked
- [ ] Test call simulated successfully
- [ ] Call appears on web pager
- [ ] Beep sounds and screen flashes

---

## 📞 Common Ports

| Service | Port | URL |
|---------|------|-----|
| WiFi Pager Server | 3000 | http://IP:3000 |
| Web Pager | 8000 | http://IP:8000 |
| Alternative Web | 8080 | http://IP:8080 |

---

## 🔐 Security Reminders

⚠️ **For Development/Home Use Only**

- Not suitable for production without HTTPS
- No authentication implemented
- All data transmitted in plain text
- CORS open to all origins

For production, add:
- SSL/TLS certificates
- Authentication system
- Rate limiting
- Input validation
- Firewall rules

---

## 📚 Documentation Files

- **SETUP.md** - This file (quick setup)
- **DEPLOYMENT.md** - Detailed deployment
- **API.md** - API reference
- **TROUBLESHOOTING.md** - Common issues
- **server/README.md** - Server documentation

---

## 🎓 Architecture Overview

```
Incoming Call (Android Phone)
    ↓
Detected by CallForegroundService
    ↓
HTTP POST to Node.js Server
    ↓
Server broadcasts via WebSocket
    ↓
Web Pager receives "call-alert" event
    ↓
Display caller info + Play beep + Flash screen
```

---

**Status:** Ready for deployment  
**Version:** 1.0.0  
**Updated:** February 19, 2024

