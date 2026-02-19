# 📟 WiFi PAGER – PROJECT INDEX & FILE REFERENCE

Complete file listing and navigation guide for the WiFi Pager system.

---

## 📂 PROJECT STRUCTURE

```
pager/
│
├── 📄 README.md                          # Main project overview
├── 📄 QUICK_START.md                     # 5-minute setup guide
├── 📄 SETUP.md                           # Detailed setup instructions
├── 📄 ARCHITECTURE.md                    # Technical architecture details
├── 📄 VERIFICATION.md                    # Installation verification checklist
├── 📄 INDEX.md                           # This file
│
├── 🤖 android/                           # MODULE 1: ANDROID APP
│   ├── build.gradle                      # Root build configuration
│   ├── settings.gradle                   # Gradle module settings
│   │
│   └── app/                              # Main app module
│       ├── build.gradle                  # App build configuration
│       │
│       └── src/main/
│           ├── java/com/wifi/pager/     # Kotlin source files
│           │   ├── MainActivity.kt                      # Entry point
│           │   ├── CallReceiver.kt                      # Phone state receiver
│           │   ├── CallForegroundService.kt             # Background service
│           │   ├── ApiClient.kt                         # HTTP client
│           │   ├── ContactResolver.kt                   # Contact lookup
│           │   ├── BootReceiver.kt                      # Boot receiver
│           │   └── R.kt                                 # Resource IDs
│           │
│           ├── res/layout/
│           │   └── activity_main.xml                    # UI layout
│           │
│           └── AndroidManifest.xml                      # App manifest
│
├── 🖥️ server/                            # MODULE 2: NODE.JS SERVER
│   ├── package.json                      # Dependencies & scripts
│   ├── index.js                          # Express + Socket.io server
│   └── README.md                         # Server documentation
│
└── 🌐 web/pager/                         # MODULE 3: WEB PAGER
    ├── index.html                        # HTML structure
    ├── style.css                         # Styling & layout
    ├── script.js                         # WebSocket client logic
    ├── manifest.json                     # PWA manifest
    └── sw.js                             # Service worker
```

---

## 📚 DOCUMENTATION FILES

### Main Documentation

| File | Purpose | Read If... |
|------|---------|-----------|
| [README.md](README.md) | Project overview & features | You're new to the project |
| [QUICK_START.md](QUICK_START.md) | 5-minute quick start | You want to get running fast |
| [SETUP.md](SETUP.md) | Detailed setup instructions | You need thorough installation guide |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technical deep dive | You want to understand how it works |
| [VERIFICATION.md](VERIFICATION.md) | Installation verification | You need to verify everything works |
| [INDEX.md](INDEX.md) | This file | You need file reference |

### Secondary Documentation

| File | Purpose |
|------|---------|
| [server/README.md](server/README.md) | Server API & deployment docs |

---

## 🤖 ANDROID APP FILES

### Purpose
Detects incoming phone calls on Phone 1 and sends details to server.

### Key Files

#### MainActivity.kt
**Purpose:** App entry point and permission handling  
**Key Features:**
- Requests runtime permissions
- Starts CallForegroundService
- Handles permission results
**When to Edit:**
- Change app behavior on startup
- Add new permissions

#### CallReceiver.kt
**Purpose:** BroadcastReceiver for phone state changes  
**Key Features:**
- Intercepts phone state broadcasts
- Detects incoming calls (RINGING state)
- Starts service for processing
**When to Edit:**
- Change call detection logic
- Add filtering for specific numbers

#### CallForegroundService.kt
**Purpose:** Foreground service for persistent call monitoring  
**Key Features:**
- Registers receiver for phone state
- Extracts call information
- Sends to server via ApiClient
- Creates foreground notification
**Line 53 - REQUIRED:** Update SERVER_URL with your IP
**When to Edit:**
- Change server endpoint
- Modify notification
- Add call preprocessing

#### ApiClient.kt
**Purpose:** HTTP client for server communication  
**Key Features:**
- Uses OkHttp for reliable HTTP
- Sends JSON call data
- Handles network errors
- Callback-based responses
**When to Edit:**
- Change server endpoint
- Modify HTTP client behavior
- Add retry logic

#### ContactResolver.kt
**Purpose:** Resolves contact names from phone numbers  
**Key Features:**
- Queries Android Contacts database
- Returns contact name or phone number
- Handles errors gracefully
**When to Edit:**
- Change contact lookup behavior
- Add caching
- Modify fallback behavior

#### BootReceiver.kt
**Purpose:** Auto-start service on device reboot  
**Key Features:**
- Listens for BOOT_COMPLETED broadcast
- Restarts service automatically
**When to Edit:**
- Change auto-start behavior
- Add other boot actions

#### R.kt
**Purpose:** Resource file IDs  
**Auto-generated in real projects**

#### AndroidManifest.xml
**Purpose:** App configuration and permissions  
**Key Sections:**
- Permissions required
- Activities, services, receivers
- FOREGROUND_SERVICE declaration
**When to Edit:**
- Add new permissions
- Register new components
- Change app properties

#### activity_main.xml
**Purpose:** User interface layout  
**Key Elements:**
- Title and status display
- Instructions for setup
- Configuration notes
**When to Edit:**
- Change UI design
- Add new UI elements
- Modify layout

---

## 🖥️ SERVER FILES

### Purpose
Receives call data from Android app and broadcasts to connected web clients.

### Key Files

#### index.js
**Purpose:** Express server with Socket.io  
**Key Features:**
- REST API endpoint: POST /incoming-call
- WebSocket broadcasting
- Health check endpoint
- Connection tracking
- Logging
**Ports:** 3000 (configurable)
**Key Lines:**
- Line 13: PORT configuration
- Line 53: POST /incoming-call handler
- Line 80: WebSocket connection handler
**When to Edit:**
- Change port number
- Add new endpoints
- Modify broadcast logic
- Add authentication

#### package.json
**Purpose:** Project dependencies and scripts  
**Key Dependencies:**
- express - Web framework
- socket.io - WebSocket support
- cors - Cross-origin support
- body-parser - JSON parsing
**Scripts:**
- `npm start` - Run server
- `npm run dev` - Run with auto-reload
**When to Edit:**
- Add new dependencies
- Change scripts
- Update versions

#### README.md
**Purpose:** Server-specific documentation  
**Contents:**
- Installation instructions
- API examples
- WebSocket reference
- Configuration options
**When to Read:**
- Need API details
- Deploy server to production
- Troubleshoot server issues

---

## 🌐 WEB PAGER FILES

### Purpose
Browser-based pager for Phone 2 that displays incoming calls.

### Key Files

#### index.html
**Purpose:** HTML structure  
**Key Sections:**
- Header with title
- Status display
- Call alert overlay
- Display area
- Control panel
- Settings panel
- Call history
**When to Edit:**
- Change UI structure
- Add new sections
- Modify form fields
- Change layout

#### style.css
**Purpose:** Styling and layout  
**Key Sections:**
- Color scheme (CSS variables)
- Responsive layout
- Animations
- Dark theme
- Mobile optimization
**CSS Variables:**
- --primary: Main background
- --accent: Highlight color
- --text: Text color
**When to Edit:**
- Change color scheme
- Modify animations
- Update responsive design
- Change typography

#### script.js
**Purpose:** WebSocket client and application logic  
**Key Sections:**
- Configuration
- Audio generation
- Visual effects
- WebSocket connection
- Event handling
- UI updates
- Call history
**Key Functions:**
- `playBeep()` - Play sound alert
- `flashScreen()` - Flash animation
- `connectToServer()` - WebSocket connection
- `handleCallAlert()` - Process incoming calls
- `addToHistory()` - Track calls
**CONFIG variables:**
- Line 13-17: Configuration constants
- DEFAULT_SERVER: Server URL
- RECONNECT_DELAY: Retry delay
- ALERT_DURATION: Alert display time
**When to Edit:**
- Change server URL
- Modify alert duration
- Add new features
- Change beep frequency

#### manifest.json
**Purpose:** PWA (Progressive Web App) manifest  
**Key Properties:**
- name, short_name, description
- start_url, display (standalone)
- colors (background, theme)
- icons, screenshots
- shortcuts
**When to Edit:**
- Change app name
- Update colors
- Add app icons
- Modify shortcuts

#### sw.js
**Purpose:** Service Worker for PWA support  
**Key Features:**
- Cache assets on install
- Serve from cache
- Network fallback
- Offline support
**When to Edit:**
- Add new cache files
- Change caching strategy
- Add new event listeners

---

## 🔄 FILE DEPENDENCIES

### Android App Flow

```
AndroidManifest.xml
    ↓
MainActivity.kt (entry point)
    ↓
CallForegroundService.kt (background)
    ├── CallReceiver.kt (receives events)
    ├── ApiClient.kt (sends to server)
    ├── ContactResolver.kt (gets contact names)
    └── activity_main.xml (UI)
```

### Server Flow

```
package.json (dependencies)
    ↓
index.js (main server)
    ├── POST /incoming-call
    ├── WebSocket connection
    └── Broadcasting
```

### Web Pager Flow

```
index.html (structure)
    ├── style.css (styling)
    └── script.js (logic)
        ├── manifest.json (PWA)
        └── sw.js (offline support)
```

---

## 🎯 QUICK FILE REFERENCE BY TASK

### I want to...

**Change server IP:**
- Edit: `android/app/src/main/java/com/wifi/pager/CallForegroundService.kt` (line 53)
- Edit: `web/pager/script.js` (line 14)

**Change server port:**
- Edit: `server/index.js` (line 13)
- Update: Android and Web configs

**Change beep frequency:**
- Edit: `web/pager/script.js` (line 145)

**Change alert duration:**
- Edit: `web/pager/script.js` (line 14, CONFIG.ALERT_DURATION)

**Change colors:**
- Edit: `web/pager/style.css` (lines 15-23, :root variables)

**Add new endpoint:**
- Edit: `server/index.js` (add route after line 80)

**Change app name:**
- Edit: `web/pager/manifest.json` (lines 1-2)
- Edit: `web/pager/index.html` (line 11, title tag)

**Modify permissions:**
- Edit: `android/app/src/main/AndroidManifest.xml` (uses-permission tags)

**Change UI layout:**
- Edit: `web/pager/index.html` (structure)
- Edit: `web/pager/style.css` (styling)

**Add new feature:**
- Edit: `web/pager/script.js` (add function)
- Edit: `server/index.js` (add endpoint/broadcast)
- Edit: `android/...` (add listener/processor)

---

## 📊 FILE STATISTICS

| Category | Count | Total Lines |
|----------|-------|------------|
| Android Files | 8 | ~1,200+ |
| Server Files | 3 | ~500+ |
| Web Files | 5 | ~1,600+ |
| Documentation | 7 | ~4,000+ |
| **TOTAL** | **23** | **~7,300+** |

---

## 🔐 Security-Related Files

### Permissions
- `android/app/src/main/AndroidManifest.xml` - Permission declarations

### Configuration
- `server/index.js` - CORS settings (line 18)
- `web/pager/script.js` - Server URL validation

### Tokens/Credentials
⚠️ **Currently:** None (local dev only)  
**For Production:** Add to .env or secrets manager

---

## 🚀 Build/Deploy Files

### Android
- `android/build.gradle` - Root build config
- `android/settings.gradle` - Module settings
- `android/app/build.gradle` - App build config

### Server
- `server/package.json` - Dependencies

### Web
- `web/pager/manifest.json` - PWA manifest
- `web/pager/sw.js` - Service worker

---

## 📝 FILE MODIFICATION SUMMARY

### Safe to Modify
- ✅ Server URL in Android app
- ✅ Server port in index.js
- ✅ Colors in CSS
- ✅ Android permissions in manifest
- ✅ Server endpoints
- ✅ Web UI elements

### Requires Care
- ⚠️ Core API endpoints (affects all components)
- ⚠️ WebSocket event names
- ⚠️ JSON payload structure
- ⚠️ Permission requirements

### Do Not Modify
- ❌ Core package.json dependencies (unless upgrading)
- ❌ Service Worker logic (without understanding implications)
- ❌ Build configuration (unless building for different platform)

---

## 🔍 WHERE TO FIND THINGS

**Need to change port?**
→ `server/index.js` line 13

**Need to add permission?**
→ `android/app/src/main/AndroidManifest.xml`

**Need to change alert time?**
→ `web/pager/script.js` line 14

**Need API reference?**
→ `server/README.md`

**Need setup help?**
→ `SETUP.md` or `QUICK_START.md`

**Need technical details?**
→ `ARCHITECTURE.md`

**Need to verify installation?**
→ `VERIFICATION.md`

---

## 📱 Version Information

| Component | Version | Min Requirements |
|-----------|---------|-----------------|
| Android App | 1.0 | Android 8.0+ |
| Node.js Server | 1.0 | Node 14+ |
| Web Pager | 1.0 | Any modern browser |

---

## 🔗 CROSS-REFERENCES

### Related Files

**To implement a new feature:**
1. Start in `server/index.js` (add endpoint/event)
2. Update `web/pager/script.js` (add listener/UI)
3. Update `android/CallForegroundService.kt` (add processor)

**To debug an issue:**
1. Check `server/index.js` logs
2. Check `web/pager` browser console
3. Check `android` Logcat output

**To deploy:**
1. Configure `server/package.json` (dependencies)
2. Update IPs in Android app
3. Deploy `web/pager` to hosting
4. Setup Android Studio build

---

## 📚 READING ORDER FOR NEW USERS

**Quick Start (15 minutes):**
1. README.md
2. QUICK_START.md

**Standard Setup (1 hour):**
1. README.md
2. SETUP.md
3. VERIFICATION.md

**Deep Understanding (2+ hours):**
1. All above
2. ARCHITECTURE.md
3. Individual file comments
4. server/README.md

**Deployment/Production (varies):**
1. ARCHITECTURE.md
2. SETUP.md deployment section
3. Component-specific docs

---

**INDEX Version:** 1.0  
**Last Updated:** February 19, 2024  
**Project:** WiFi Pager v1.0

