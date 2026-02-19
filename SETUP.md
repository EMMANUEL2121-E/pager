# 📟 WiFi Pager – Real-Time Call Relay System

Complete project with Android app, Node.js server, and web pager.

## 🎯 System Overview

```
Phone 1 (Android)                 Node.js Server                Phone 2 (Browser)
    ↓                                  ↓                               ↓
• Call detected          ─────→   • Receives data      ─────→    • Displays caller
• Extract caller info            • Broadcasts event            • Plays beep
• HTTP POST to server           • WebSocket API              • Screen flash
```

## 📦 Project Structure

```
pager/
├── android/                    # MODULE 1: Android App
│   ├── build.gradle           # Project config
│   ├── settings.gradle        # Module settings
│   └── app/
│       ├── build.gradle       # App config
│       ├── src/main/
│       │   ├── java/com/wifi/pager/
│       │   │   ├── MainActivity.kt
│       │   │   ├── CallReceiver.kt
│       │   │   ├── CallForegroundService.kt
│       │   │   ├── ApiClient.kt
│       │   │   ├── ContactResolver.kt
│       │   │   ├── BootReceiver.kt
│       │   │   └── R.kt
│       │   ├── res/layout/
│       │   │   └── activity_main.xml
│       │   └── AndroidManifest.xml
│
├── server/                     # MODULE 2: Node.js Server
│   ├── package.json           # Dependencies
│   ├── index.js               # Main server
│   └── README.md              # Server docs
│
├── web/pager/                 # MODULE 3: Web Pager
│   ├── index.html             # UI structure
│   ├── style.css              # Styling
│   ├── script.js              # WebSocket client
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service worker
│
└── SETUP.md                   # This file
```

---

## 🚀 QUICK START

### Step 1: Find Your Server IP Address

**Windows (Command Prompt):**
```cmd
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (e.g., `192.168.1.100`)

**macOS/Linux (Terminal):**
```bash
ifconfig
```
Look for `inet` address (e.g., `192.168.1.100`)

**Store this IP** - you'll use it for all components.

### Step 2: Setup Node.js Server

```bash
cd server
npm install
npm start
```

**Expected output:**
```
╔════════════════════════════════════════════╗
║     📟 WiFi PAGER SERVER STARTED 📟        ║
╠════════════════════════════════════════════╣
║ Server: http://0.0.0.0:3000                ║
║ REST API: POST /incoming-call              ║
║ WebSocket: ws://localhost:3000             ║
║ Health Check: GET /health                  ║
╠════════════════════════════════════════════╣
║ Waiting for Android app & web pager...    ║
╚════════════════════════════════════════════╝
```

**Keep this terminal open!**

### Step 3: Deploy Web Pager

Host the `web/pager/` directory on any web server:

**Option A: Using Python (Built-in)**
```bash
cd web/pager
python -m http.server 8000
# Access at: http://192.168.1.100:8000
```

**Option B: Using Node.js**
```bash
cd web/pager
npx http-server -p 8000
# Access at: http://192.168.1.100:8000
```

**Option C: Using Node.js (recommended for production)**
```bash
cd web/pager
npm install -g http-server
http-server -p 8000
```

### Step 4: Configure Android App

1. **Open Android Studio**
2. **Import** the `android/` folder
3. **Find file:** `app/src/main/java/com/wifi/pager/CallForegroundService.kt`
4. **Replace line 53:**
   ```kotlin
   private const val SERVER_URL = "http://192.168.1.100:3000/incoming-call"
   ```
   With your actual server IP (from Step 1)

5. **Build and run** on Android device

### Step 5: Connect All Devices

✅ **All devices must be on the same WiFi network**

1. **Server machine:** Running on `http://192.168.1.100:3000`
2. **Phone 1 (Android):** Running WiFi Pager app
3. **Phone 2 (Browser):** Open `http://192.168.1.100:8000`

---

## 🔧 DETAILED SETUP INSTRUCTIONS

### PART 1: NODE.JS SERVER (Backend)

#### Requirements
- Node.js 14+ 
- npm 6+
- Free port 3000

#### Installation
```bash
# Navigate to server directory
cd pager/server

# Install dependencies
npm install

# Verify installation
npm list
```

#### Running
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

#### Testing Server
```bash
# Test endpoint is working
curl http://localhost:3000/health

# Send test call
curl -X POST http://localhost:3000/incoming-call \
  -H "Content-Type: application/json" \
  -d '{
    "number": "+1234567890",
    "name": "Test Call",
    "timestamp": "2024-02-19T10:30:45Z"
  }'
```

---

### PART 2: ANDROID APP (Phone 1)

#### Requirements
- Android 8.0+ (API 26)
- Android Studio
- Kotlin support

#### Setup Steps

1. **Open Android Studio**
   - File → Open → Select `pager/android/` folder

2. **Configure Build**
   - Wait for Gradle sync
   - Let Android Studio download dependencies

3. **Update Server IP**
   - Open `CallForegroundService.kt`
   - Line 53: Update `SERVER_URL`
   - Replace `192.168.1.100` with your server IP

4. **Configure Device**
   - Connect Android phone via USB
   - Enable Developer Mode:
     - Settings → About Phone → Tap "Build Number" 7 times
     - Settings → Developer Options → Enable USB Debugging

5. **Build & Run**
   - Click "Run" or press Shift+F10
   - Select connected device

6. **Grant Permissions**
   - App will request permissions on first launch
   - Grant: Phone, Contacts, Internet

#### Testing
- Incoming calls will be detected automatically
- Check Logcat for debug messages
- Notification will show service is running

#### Permissions

The app requires these permissions in `AndroidManifest.xml`:
- `READ_PHONE_STATE` - Detect incoming calls
- `READ_CALL_LOG` - Access call history
- `READ_CONTACTS` - Resolve contact names
- `INTERNET` - Send data to server
- `FOREGROUND_SERVICE` - Run background service

---

### PART 3: WEB PAGER (Phone 2)

#### Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- WiFi connection
- No server needed (static files)

#### Option A: Quick Start (Python)
```bash
cd pager/web/pager

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Then open: http://192.168.1.100:8000
```

#### Option B: Using Node.js HTTP Server
```bash
cd pager/web/pager

# Install global
npm install -g http-server

# Run
http-server -p 8000 --cors

# Then open: http://192.168.1.100:8000
```

#### Accessing Web Pager

1. **From Phone 2 Browser:**
   - Open: `http://192.168.1.100:8000`
   - Replace `192.168.1.100` with your server IP

2. **Configuration:**
   - Click "Update" button to change server URL
   - Enable sound (required for audio alerts)
   - Configure settings

3. **Features:**
   - ✓ Real-time call notifications
   - ✓ Audio alerts with beep
   - ✓ Screen flash effect
   - ✓ Call history
   - ✓ Connection status
   - ✓ PWA support (installable)

---

## 🔌 NETWORK CONFIGURATION

### Finding Your Server IP

#### Windows Command Prompt
```cmd
ipconfig
```
Look for line: `IPv4 Address . . . . . . . . . . : 192.168.1.100`

#### macOS Terminal
```bash
ifconfig
```
Look for line: `inet 192.168.1.100 netmask`

#### Linux Terminal
```bash
hostname -I
# or
ifconfig | grep "inet "
```

### Updating Configurations

After finding your IP (e.g., `192.168.1.100`):

1. **Android App:**
   - File: `CallForegroundService.kt`
   - Line: `private const val SERVER_URL = "http://192.168.1.100:3000/incoming-call"`

2. **Web Pager:**
   - In UI: Use settings panel
   - Or default: `http://192.168.1.100:3000`
   - File: `script.js` line: `DEFAULT_SERVER: 'ws://192.168.1.100:3000'`

3. **Verify Connection:**
   ```bash
   ping 192.168.1.100
   curl http://192.168.1.100:3000/health
   ```

---

## 🔐 SECURITY NOTES

### Current Configuration (Development)

⚠️ **Important:** This setup is for local WiFi networks only.

- **CORS enabled** for all origins
- **No authentication** required
- **No encryption** on HTTP
- **No rate limiting**

### For Production Use

Implement:
1. **HTTPS with SSL certificates**
2. **Authentication tokens**
3. **Request rate limiting**
4. **CORS whitelist (specific IPs only)**
5. **Input validation & sanitization**
6. **Firewall rules**
7. **VPN for remote access**

---

## 🐛 TROUBLESHOOTING

### Server Issues

**Port 3000 already in use:**
```bash
# Windows: Find process on port 3000
netstat -ano | findstr :3000
# Kill process: taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Use different port
PORT=3001 npm start
```

**Module not found:**
```bash
cd server
npm install
npm run dev
```

### Android App Issues

**App crashes on startup:**
- Check permissions are granted
- Verify Android version 8.0+
- Check server URL is correct
- Review Logcat for errors

**Calls not detected:**
- Ensure app has RECEIVE_CALLS permission
- Check device settings (Samsung/MIUI may block)
- Test with native dialer

**Server connection timeout:**
- Verify server is running
- Check IP address is correct
- Ensure devices on same WiFi
- Disable firewall temporarily

### Web Pager Issues

**Server connection refused:**
- Verify Node.js server running: `npm start`
- Check correct IP address
- Check port 3000 is accessible
- Try: `http://localhost:3000/health`

**No sound when calling:**
- Click "Enable Sound" button
- Check browser audio permissions
- Try different browser
- Check browser mute status

**Screen flash not working:**
- Enable in settings: "Flash screen"
- Check browser supports DOM manipulation
- Verify CSS loaded correctly

**Not connecting to server:**
- Update URL in settings
- Clear browser cache
- Check server is running
- Verify firewall allows port 3000

---

## 📊 API REFERENCE

### POST /incoming-call

**Request:**
```json
{
  "number": "+1234567890",
  "name": "John Doe",
  "timestamp": "2024-02-19T10:30:45Z"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Call alert broadcast",
  "clientsNotified": 1
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Missing required field: number"
}
```

### WebSocket Event: call-alert

**Broadcast to all clients:**
```json
{
  "number": "+1234567890",
  "name": "John Doe",
  "timestamp": "2024-02-19T10:30:45Z",
  "receivedAt": "2024-02-19T10:30:46Z",
  "clientsNotified": 2
}
```

### GET /health

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-02-19T10:30:46Z",
  "uptime": 3600.5,
  "clients": 2,
  "connectedDevices": [
    {
      "id": "socket_id_1",
      "ip": "192.168.1.50",
      "connectedAt": "2024-02-19T09:30:00Z",
      "callsReceived": 5
    }
  ]
}
```

---

## 🎨 CUSTOMIZATION

### Beep Sound

Edit `web/pager/script.js`:
```javascript
oscillator.frequency.value = 1000; // Change frequency (Hz)
gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5); // Duration
```

### UI Colors

Edit `web/pager/style.css`:
```css
:root {
    --primary: #0D1B2A;
    --accent: #4FC3F7;
    /* ... other colors ... */
}
```

### Call Alert Duration

Edit `web/pager/script.js` line 82:
```javascript
CONFIG.ALERT_DURATION = 5000; // milliseconds
```

### Server Port

Edit `server/index.js` line 13:
```javascript
const PORT = process.env.PORT || 3000;
```

Or run:
```bash
PORT=3001 npm start
```

---

## 📱 PLATFORM-SPECIFIC NOTES

### Android Battery Optimization

On some devices (Samsung, Xiaomi), background services are killed:

**Solutions:**
1. **Whitelist app:** Settings → Battery → App Battery Saver → Don't optimize
2. **Disable power management:** Settings → Power → Power mode → High performance
3. **Allow background activity:** Settings → Apps → WiFi Pager → Permissions → Allow in background

### iOS Limitations

❌ Real-time call interception not possible due to iOS restrictions.

**Workaround:** Use web pager only on iOS (no native app possible).

### Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Recommended |
| Firefox | ✅ Full | Full support |
| Safari | ✅ Partial | Sound may require user interaction |
| Edge | ✅ Full | Full support |
| Opera | ✅ Full | Full support |

---

## 🚀 DEPLOYMENT OPTIONS

### Option 1: Local Network Only (Current)
- Server on home WiFi
- All devices connected to same network
- No external access

### Option 2: Cloud Deployment

**AWS/Azure/DigitalOcean:**
1. Setup Linux VM
2. Install Node.js
3. Deploy server
4. Use static IP or DNS
5. Update Android app with public IP

**Note:** Add HTTPS and authentication for security

### Option 3: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/ .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t wifi-pager .
docker run -p 3000:3000 wifi-pager
```

---

## ✨ ADVANCED FEATURES (Commented in Code)

### Commented Enhancements Ready to Enable

1. **Call History Database** - Persist calls to file/database
2. **Multiple Device Support** - Track multiple pagers
3. **AES Encryption** - Secure payload encryption
4. **Missed Call Counter** - Track missed calls
5. **PWA Manifest** - Already included, ready for app store
6. **Service Worker** - Offline support, already implemented

### Enabling Advanced Features

See comments in:
- `web/pager/script.js` - Lines with `// ADVANCED:`
- `server/index.js` - Comments about enhancements
- `android/app/src/main/java/com/wifi/pager/` - Battery optimization notes

---

## 📋 CHECKLIST

- [ ] Find server IP address
- [ ] Start Node.js server (`npm start`)
- [ ] Update Android app with server IP
- [ ] Build and install Android app
- [ ] Deploy web pager (Python/Node.js server)
- [ ] Connect Android phone to WiFi
- [ ] Open web pager in browser
- [ ] Grant app permissions
- [ ] Enable sound on web pager
- [ ] Test with incoming call
- [ ] Verify call appears on Phone 2

---

## 📚 FILE DESCRIPTIONS

### Android Files

| File | Purpose |
|------|---------|
| `MainActivity.kt` | App entry point, permission handling |
| `CallReceiver.kt` | BroadcastReceiver for phone state |
| `CallForegroundService.kt` | Background service for call detection |
| `ApiClient.kt` | HTTP client for server communication |
| `ContactResolver.kt` | Resolves contact names from numbers |
| `BootReceiver.kt` | Restarts service on device boot |
| `AndroidManifest.xml` | App configuration and permissions |

### Server Files

| File | Purpose |
|------|---------|
| `index.js` | Express server with Socket.io |
| `package.json` | Dependencies and scripts |
| `README.md` | Server documentation |

### Web Pager Files

| File | Purpose |
|------|---------|
| `index.html` | HTML structure |
| `style.css` | Styling and layout |
| `script.js` | WebSocket client and app logic |
| `manifest.json` | PWA manifest for app installation |
| `sw.js` | Service worker for offline support |

---

## 📞 SUPPORT

For issues or questions:

1. Check `AndroidManifest.xml` for correct permissions
2. Verify all devices on same WiFi
3. Check server IP in all configurations
4. Review Logcat (Android) and browser console
5. Ensure Node.js server is running
6. Test with: `curl http://IP:3000/health`

---

## 📄 LICENSE

This project is provided as-is for personal and educational use.

---

## 🎓 TECHNICAL STACK

**Android:**
- Kotlin
- Android Framework 8.0+
- OkHttp3
- GSON
- BroadcastReceiver

**Server:**
- Node.js
- Express
- Socket.io
- CORS

**Web:**
- HTML5
- CSS3
- JavaScript (ES6+)
- Web Audio API
- Service Worker
- WebSocket

---

**Version:** 1.0.0  
**Last Updated:** February 19, 2024  
**Created:** WiFi Pager Development Team

