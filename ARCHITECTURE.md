# WiFi Pager – Architecture & Technical Details

## 🏗 System Architecture

```
╔══════════════════════════════════════════════════════════════════╗
║              WIFI PAGER - SYSTEM ARCHITECTURE                    ║
╚══════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────┐
│ PHONE 1 (Android Device)                      PHONE 2 (Browser)      │
│ ─────────────────────────                    ──────────────────      │
│                                                                      │
│  CallForegroundService                        WebSocket Client      │
│  • Monitors phone state                       • Connects to server   │
│  • Detects incoming calls                     • Listens for events   │
│  • Extracts caller info                       • Displays alerts      │
│  • Resolves contact name                      • Plays sounds         │
│        ↓                                              ↑               │
│  ApiClient (HTTP)                          script.js (JavaScript)  │
│  • Creates JSON payload                   • WebSocket listener      │
│  • POST to /incoming-call                 • Audio player           │
│                                                                      │
└──────────────────────────┬──────────────────────────┬───────────────┘
                           │                          │
                    HTTP POST                  WebSocket Event
                    JSON Data                (call-alert)
                           │                          │
            ┌──────────────▼──────────────┐           │
            │                              │           │
        ┌───▼────────────────────────┐    │           │
        │  NODE.JS SERVER (Port 3000) │    │           │
        │  ──────────────────────────│    │           │
        │  Express + Socket.io        │    │           │
        │                              │    │           │
        │  POST /incoming-call        ◄────┘           │
        │  • Validate JSON                 │           │
        │  • Log call data                 │           │
        │  • Broadcast event ──────────────┼──────────►│
        │  • Send response                 │           │
        │                              │                │
        └──────────────────────────────┘                │
```

---

## 📊 Data Flow

### 1. Call Detection (Android)

```
User receives call
    ↓
TelephonyManager detects RINGING state
    ↓
BroadcastReceiver intercepts ACTION_PHONE_STATE_CHANGED
    ↓
CallForegroundService processes call
    ↓
ContactResolver queries Android Contacts database
    ↓
Creates JSON:
{
  "number": "+1234567890",
  "name": "John Doe",
  "timestamp": "2024-02-19T10:30:45Z"
}
```

### 2. Server Processing

```
Receives POST /incoming-call
    ↓
Validate JSON fields
    ↓
Log to console
    ↓
Broadcast via Socket.io event: "call-alert"
                ↓
        To ALL connected clients
    ↓
Send JSON response to Android app
```

### 3. Web Client Update

```
WebSocket receives "call-alert" event
    ↓
Parse JSON data
    ↓
Update call count
    ↓
Add to call history
    ↓
Show call alert overlay
    ↓
Generate beep (Web Audio API)
    ↓
Flash screen
    ↓
Send vibration pattern (if available)
```

---

## 🔐 Security Architecture

### Current Implementation

```
┌─────────────────────────────────────────┐
│ DEVELOPMENT / LOCAL NETWORK ONLY       │
├─────────────────────────────────────────┤
│ • HTTP (no encryption)                  │
│ • No authentication required            │
│ • CORS open to all origins              │
│ • No rate limiting                      │
│ • No input validation                   │
└─────────────────────────────────────────┘
```

### Recommended for Production

```
┌─────────────────────────────────────────┐
│ PRODUCTION / INTERNET DEPLOYMENT       │
├─────────────────────────────────────────┤
│ • HTTPS with SSL/TLS certificates       │
│ • JWT or OAuth authentication           │
│ • CORS whitelist (specific IPs)         │
│ • Rate limiting (requests per minute)   │
│ • Input sanitization & validation       │
│ • Data encryption (AES-256)             │
│ • Request signing (HMAC-SHA256)         │
│ • Firewall rules                        │
│ • VPN for remote access                 │
│ • Logging & monitoring                  │
└─────────────────────────────────────────┘
```

---

## 🔌 API Specification

### POST /incoming-call

**Protocol:** HTTP/1.1  
**Content-Type:** application/json  
**Timeout:** 10 seconds  

**Request Body:**
```json
{
  "number": "+1234567890",
  "name": "John Doe",
  "timestamp": "2024-02-19T10:30:45Z"
}
```

**Required Fields:**
- `number` (string): Phone number (min 5 chars)
- `name` (string): Caller name (optional, defaults to number)
- `timestamp` (string): ISO 8601 format (optional, server generates if missing)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Call alert broadcast",
  "clientsNotified": 2
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "Error message describing issue"
}
```

---

## 📡 WebSocket Events

### Client → Server

**Event: ping**
```json
{ "type": "ping" }
```

**Response: pong**
```json
{ "timestamp": "2024-02-19T10:30:46Z" }
```

### Server → Broadcast

**Event: call-alert** (broadcast to all connected clients)
```json
{
  "number": "+1234567890",
  "name": "John Doe",
  "timestamp": "2024-02-19T10:30:45Z",
  "receivedAt": "2024-02-19T10:30:46Z",
  "clientsNotified": 2
}
```

---

## 🎯 Module Responsibilities

### Android App

**Foreground Service:**
- Run continuously in background
- Monitor phone state changes
- Extract caller information
- Resolve contact names
- Handle errors gracefully
- Provide user notification

**Broadcast Receiver:**
- Listen for phone state events
- Filter for incoming calls (RINGING state)
- Pass to foreground service

**HTTP Client:**
- Create JSON payload
- POST to server endpoint
- Handle network errors
- Retry logic (optional)

### Node.js Server

**HTTP Server:**
- Accept POST requests
- Validate input
- Log events
- Send responses

**WebSocket Server:**
- Maintain client connections
- Broadcast events
- Track connected clients
- Handle disconnections

**Error Handling:**
- Invalid JSON responses
- Network error handling
- Connection timeout handling

### Web Pager

**WebSocket Client:**
- Establish connection
- Auto-reconnect on disconnect
- Handle incoming events

**UI:**
- Display caller information
- Show connection status
- Update call history
- Responsive design

**Audio:**
- Generate beep sound
- Web Audio API fallback
- Volume control

**Visual Effects:**
- Alert overlay
- Screen flash animation
- Real-time updates

---

## ⚙️ Configuration Parameters

### Server (index.js)

```javascript
const PORT = 3000;              // Server port
const HOST = '0.0.0.0';         // Listen on all interfaces
const RECONNECT_DELAY = 3000;   // ms
const RECONNECT_MAX = 3600000;  // Max retry time
```

### Android (CallForegroundService.kt)

```kotlin
const val SERVER_URL = "http://192.168.1.100:3000/incoming-call"
const val CHANNEL_ID = "wifi_pager_channel"
const val NOTIFICATION_ID = 1001
```

### Web Pager (script.js)

```javascript
const CONFIG = {
    DEFAULT_SERVER: 'ws://192.168.1.100:3000',
    RECONNECT_DELAY: 3000,
    RECONNECT_MAX_ATTEMPTS: 10,
    ALERT_DURATION: 5000,
    HISTORY_MAX_ITEMS: 20
};
```

---

## 🔄 Connection Lifecycle

### Android App

```
App Start
    ↓
MainActivity requests permissions
    ↓
Permissions granted ✓
    ↓
Start CallForegroundService
    ↓
Register BroadcastReceiver
    ↓
Show foreground notification
    ↓
Listen for phone state changes
    ↓
[Incoming Call] ──────────→ Process ──→ HTTP POST ──→ Server
    ↓
Continue listening
    ↓
[Device Reboot] ──────→ BootReceiver ──→ Restart Service
```

### Server

```
npm start
    ↓
Create Express app
    ↓
Setup CORS & body-parser
    ↓
Initialize Socket.io
    ↓
Listen on port 3000
    ↓
Wait for connections
    ↓
[Android POST] ───────→ Process ───→ Broadcast to WebSocket clients
    ↓
[Web Client Connect] ──→ Log connection ──→ Ready for events
    ↓
[Web Client Disconnect] ──→ Remove from tracking
```

### Web Pager

```
Page Load
    ↓
Load HTML, CSS, JS
    ↓
Register Service Worker
    ↓
Create WebSocket connection
    ↓
On connection:
    ↓
Update UI to "Connected"
    ↓
Listen for "call-alert" events
    ↓
[Event received] ──→ Display ──→ Sound ──→ Flash ──→ History
    ↓
[Connection lost] ──→ Auto-reconnect with backoff
```

---

## 📱 Android Foreground Service

### Why Foreground Service?

- Android 8.0+ kills background services
- Foreground service keeps running
- Requires persistent notification
- Survives device reboot (if registered)

### Notification Requirements

```
Notification must have:
- Title: "WiFi Pager Active"
- Text: "Monitoring for incoming calls"
- Channel ID: "wifi_pager_channel"
- Priority: PRIORITY_LOW
- Small icon
```

### Permissions Required

```xml
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.READ_CALL_LOG" />
<uses-permission android:name="android.permission.READ_CONTACTS" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
```

---

## 🎵 Web Audio API

### Beep Generation

```javascript
// Create audio context
const audioContext = new AudioContext();

// Create oscillator (sound generator)
const oscillator = audioContext.createOscillator();
const gainNode = audioContext.createGain();

// Connect nodes
oscillator → gainNode → destination (speakers)

// Parameters
frequency = 800 Hz
type = sine wave
duration = 0.5 seconds
```

### Fallback Methods

1. **HTML5 Audio Element** (if audio file available)
2. **Web Audio API** (oscillator method)
3. **Vibration API** (as backup notification)

---

## 💾 Data Storage

### Android

**SharedPreferences:**
- Contact cache (optional)
- Settings

**ContentProvider:**
- System Contacts database
- Read-only access

**Logs:**
- Logcat (view with `adb logcat`)

### Server

**Memory:**
- Connected client tracking
- Connection statistics

**File System:**
- Logs (optional, can be added)
- Call history (optional, can be added)

### Web Pager

**LocalStorage:**
```javascript
{
  "serverUrl": "ws://192.168.1.100:3000",
  "soundEnabled": "true",
  "callHistory": "[{...}, {...}]"
}
```

**Browser Cache:**
- Service Worker cache
- Static assets (HTML, CSS, JS)

---

## 🧪 Testing Strategy

### Unit Testing

**Android:**
- Contact resolver tests
- API client tests
- JSON validation

**Server:**
- Input validation tests
- WebSocket broadcast tests
- Route tests

**Web:**
- Audio generation tests
- WebSocket mock tests
- UI update tests

### Integration Testing

1. **Android → Server Connection**
   - POST request validation
   - Response verification

2. **Server → Web Broadcasting**
   - WebSocket event delivery
   - Multiple client handling

3. **End-to-End**
   - Full call flow
   - Error scenarios
   - Network interruptions

### Load Testing

```
Simulate:
- 10+ simultaneous calls
- Multiple client connections
- Network latency (added with tc)
- Server under load (Apache Bench)
```

---

## 📈 Performance Metrics

### Target Performance

- **Call Detection Latency:** < 500ms
- **Server Processing:** < 100ms
- **WebSocket Delivery:** < 200ms
- **Audio Playback:** < 100ms
- **Total End-to-End:** < 1 second

### Optimization Tips

1. **Android:**
   - Use coroutines for async operations
   - Cache contact results
   - Batch network requests

2. **Server:**
   - Use connection pooling
   - Implement request queuing
   - Monitor memory usage

3. **Web:**
   - Minimize DOM manipulation
   - Use CSS animations (GPU accelerated)
   - Lazy load history
   - Cache static assets

---

## 🚀 Scaling Considerations

### Current Limitations

- Single server instance
- In-memory client tracking
- No database
- No load balancing

### Scaling Solutions

1. **Multiple Servers:**
   - Use Redis for state sharing
   - Implement sticky sessions
   - Use load balancer

2. **Database:**
   - MongoDB for call history
   - PostgreSQL for users
   - Redis for caching

3. **Message Queue:**
   - RabbitMQ for reliability
   - Kafka for high-volume

4. **Monitoring:**
   - ELK Stack (Elasticsearch, Logstash, Kibana)
   - New Relic or Datadog
   - Prometheus metrics

---

## 📚 Dependencies

### Android

- androidx.core:core
- androidx.appcompat:appcompat
- com.squareup.okhttp3:okhttp
- com.google.code.gson:gson
- androidx.lifecycle:lifecycle-runtime-ktx

### Server

- express (web framework)
- socket.io (real-time events)
- cors (cross-origin support)
- body-parser (JSON parsing)

### Web

- HTML5 (no external dependencies)
- CSS3 (no preprocessors)
- JavaScript (vanilla, no frameworks)

---

**Documentation Version:** 1.0  
**Last Updated:** February 19, 2024

