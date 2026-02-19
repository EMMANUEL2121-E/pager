/**
 * WiFi Pager - Web Application
 * 
 * Features:
 * - Real-time WebSocket connection to server
 * - Call alert display and audio notification
 * - Screen flash effect
 * - Call history tracking
 * - Auto-reconnection logic
 * - Service Worker support (PWA)
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    DEFAULT_SERVER: 'ws://192.168.1.100:3000',
    RECONNECT_DELAY: 3000,
    RECONNECT_MAX_ATTEMPTS: 10,
    ALERT_DURATION: 5000,
    HISTORY_MAX_ITEMS: 20
};

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
    socket: null,
    connected: false,
    soundEnabled: false,
    callCount: 0,
    callHistory: [],
    reconnectAttempts: 0,
    serverUrl: localStorage.getItem('serverUrl') || CONFIG.DEFAULT_SERVER,
    audioElement: null
};

// ============================================
// AUDIO GENERATION (Web Audio API)
// ============================================

/**
 * Generate beep sound using custom audio file
 */
function generateBeepSound() {
    try {
        if (!state.audioElement) {
            state.audioElement = new Audio('pager sound.mp3');
        }

        // Play the custom sound
        state.audioElement.currentTime = 0;
        state.audioElement.play().catch(err => {
            console.error('✗ Error playing audio:', err);
        });

        console.log('✓ Custom sound played');
        return true;
    } catch (error) {
        console.error('✗ Error generating beep:', error);
        return false;
    }
}

/**
 * Play beep sound (with audio fallback)
 */
function playBeep() {
    if (!state.soundEnabled) {
        console.log('⊘ Sound is disabled');
        return;
    }

    console.log('🔊 Playing beep sound');

    // Generate beep via Web Audio API (most reliable)
    try {
        generateBeepSound();
    } catch (err) {
        console.log('Could not generate beep:', err);
    }
}

/**
 * Enable sound (required due to browser autoplay restrictions)
 */
function enableSound() {
    console.log('🔊 Sound enabled by user');
    state.soundEnabled = true;

    // Play test beep
    playBeep();

    // Update UI
    const btn = document.getElementById('enableSoundBtn');
    btn.textContent = '✓ Sound Enabled';
    btn.classList.add('enabled');
    btn.disabled = true;

    localStorage.setItem('soundEnabled', 'true');
}

// ============================================
// VISUAL EFFECTS
// ============================================

/**
 * Flash screen - visual alert effect
 */
function flashScreen() {
    const displayArea = document.getElementById('displayArea');
    displayArea.classList.add('flash');

    setTimeout(() => {
        displayArea.classList.remove('flash');
    }, 200);

    // Multiple flashes for stronger effect
    setTimeout(() => {
        displayArea.classList.add('flash');
    }, 300);

    setTimeout(() => {
        displayArea.classList.remove('flash');
    }, 500);

    console.log('✨ Screen flashed');
}

/**
 * Animate call alert appearance
 */
function showCallAlert(callerName, callerNumber, timestamp) {
    const callAlert = document.getElementById('callAlert');
    const callerNameEl = document.getElementById('callerName');
    const callerNumberEl = document.getElementById('callerNumber');
    const callTimeEl = document.getElementById('callTime');

    callerNameEl.textContent = callerName || 'Unknown Caller';
    callerNumberEl.textContent = callerNumber || 'Unknown Number';
    callTimeEl.textContent = formatTime(timestamp);

    callAlert.classList.remove('hidden');
    callAlert.classList.add('show');

    // Auto-hide alert after duration
    setTimeout(() => {
        callAlert.classList.remove('show');
        callAlert.classList.add('hidden');
    }, CONFIG.ALERT_DURATION);
}

/**
 * Format timestamp for display
 */
function formatTime(timestamp) {
    try {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);

        if (diffSecs < 60) return 'Just now';
        if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
        if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;

        return date.toLocaleTimeString();
    } catch (e) {
        return 'Now';
    }
}

// ============================================
// CALL HISTORY MANAGEMENT
// ============================================

/**
 * Add call to history
 */
function addToHistory(callerName, callerNumber, timestamp) {
    const historyItem = {
        name: callerName || callerNumber || 'Unknown',
        number: callerNumber || 'No number',
        timestamp: timestamp,
        id: Date.now()
    };

    state.callHistory.unshift(historyItem);

    // Limit history size
    if (state.callHistory.length > CONFIG.HISTORY_MAX_ITEMS) {
        state.callHistory.pop();
    }

    updateHistoryDisplay();
    localStorage.setItem('callHistory', JSON.stringify(state.callHistory));
}

/**
 * Update history display
 */
function updateHistoryDisplay() {
    const historyContainer = document.getElementById('callHistory');

    if (state.callHistory.length === 0) {
        historyContainer.innerHTML = '<p class="empty-message">No call history</p>';
        return;
    }

    historyContainer.innerHTML = state.callHistory.map(item => `
        <div class="history-item">
            <div class="history-info">
                <div class="history-name">${escapeHtml(item.name)}</div>
                <div class="history-number">${escapeHtml(item.number)}</div>
            </div>
            <div class="history-time">${formatTime(item.timestamp)}</div>
        </div>
    `).join('');
}

/**
 * Clear history
 */
function clearHistory() {
    state.callHistory = [];
    updateHistoryDisplay();
    localStorage.removeItem('callHistory');
}

// ============================================
// WEBSOCKET CONNECTION
// ============================================

/**
 * Connect to server via Socket.io
 */
function connectToServer() {
    console.log(`📡 Connecting to ${state.serverUrl}`);

    try {
        // Convert ws:// to http: for Socket.io
        const httpUrl = state.serverUrl.replace('ws://', 'http://').replace('wss://', 'https://');
        
        state.socket = io(httpUrl, {
            reconnection: true,
            reconnectionDelay: CONFIG.RECONNECT_DELAY,
            reconnectionDelayMax: 10000,
            reconnectionAttempts: CONFIG.RECONNECT_MAX_ATTEMPTS
        });

        state.socket.on('connect', () => {
            console.log('✓ Socket.io connected');
            state.connected = true;
            state.reconnectAttempts = 0;
            updateConnectionStatus(true);
        });

        state.socket.on('call-alert', (data) => {
            try {
                console.log('📞 Received call-alert:', data);
                handleCallAlert(data);
            } catch (error) {
                console.error('✗ Error handling call:', error);
            }
        });

        state.socket.on('error', (error) => {
            console.error('✗ Socket.io error:', error);
            updateConnectionStatus(false);
        });

        state.socket.on('disconnect', () => {
            console.log('✗ Socket.io disconnected');
            state.connected = false;
            updateConnectionStatus(false);
        });

    } catch (error) {
        console.error('✗ Connection error:', error);
        updateConnectionStatus(false);
        attemptReconnect();
    }
}

/**
 * Attempt to reconnect with exponential backoff
 */
function attemptReconnect() {
    if (state.reconnectAttempts >= CONFIG.RECONNECT_MAX_ATTEMPTS) {
        console.error('✗ Max reconnection attempts reached');
        return;
    }

    state.reconnectAttempts++;
    const delay = CONFIG.RECONNECT_DELAY * state.reconnectAttempts;

    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${state.reconnectAttempts})`);

    setTimeout(() => {
        connectToServer();
    }, delay);
}

/**
 * Handle incoming call alert
 */
function handleCallAlert(data) {
    console.log('📞 INCOMING CALL:', data);

    // Update call count
    state.callCount++;
    document.getElementById('callCount').textContent = state.callCount;

    // Add to history
    addToHistory(data.name, data.number, data.timestamp);

    // Show visual alert
    showCallAlert(data.name, data.number, data.timestamp);

    // Play sound - repeat custom sound 3 times
    playBeep();
    setTimeout(() => playBeep(), 800);  // Play again after sound finishes
    setTimeout(() => playBeep(), 1600);  // Play third time

    // Flash screen
    const flashEnabled = document.getElementById('flashCheckbox').checked;
    if (flashEnabled) {
        flashScreen();
    }

    // Vibrate (if available)
    if (navigator.vibrate) {
        navigator.vibrate([300, 150, 300, 150, 300]); // Longer vibration pattern
    }
}

// ============================================
// UI STATUS UPDATES
// ============================================

/**
 * Update connection status display
 */
function updateConnectionStatus(connected) {
    const statusContainer = document.getElementById('statusContainer');
    const statusLabel = document.getElementById('statusLabel');
    const statusSubtext = document.getElementById('statusSubtext');
    const connectionStatusEl = document.getElementById('connectionStatus');

    if (connected) {
        statusContainer.classList.remove('disconnected');
        statusContainer.classList.add('connected');
        statusLabel.textContent = 'Connected';
        statusSubtext.textContent = 'Ready for calls';
        connectionStatusEl.textContent = 'Online';
    } else {
        statusContainer.classList.remove('connected');
        statusContainer.classList.add('disconnected');
        statusLabel.textContent = 'Disconnected';
        statusSubtext.textContent = 'Reconnecting...';
        connectionStatusEl.textContent = 'Offline';
    }
}

// ============================================
// HTML UTILITIES
// ============================================

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 WiFi Pager Web App Starting');

    // Load persisted settings
    const savedSoundEnabled = localStorage.getItem('soundEnabled') === 'true';
    if (savedSoundEnabled) {
        setTimeout(enableSound, 500);
    }

    // Load call history
    const savedHistory = localStorage.getItem('callHistory');
    if (savedHistory) {
        try {
            state.callHistory = JSON.parse(savedHistory);
            updateHistoryDisplay();
        } catch (e) {
            console.log('Could not load history:', e);
        }
    }

    // Enable sound button
    document.getElementById('enableSoundBtn').addEventListener('click', enableSound);

    // Clear button
    document.getElementById('clearBtn').addEventListener('click', () => {
        document.getElementById('callAlert').classList.add('hidden');
        console.log('✓ Alert cleared');
    });

    // Update server button
    document.getElementById('updateServerBtn').addEventListener('click', () => {
        const newUrl = document.getElementById('serverInput').value.trim();
        if (newUrl) {
            state.serverUrl = newUrl;
            localStorage.setItem('serverUrl', newUrl);
            console.log('✓ Server URL updated:', newUrl);

            // Reconnect with new URL
            if (state.socket) {
                state.socket.close();
            }
            setTimeout(connectToServer, 500);
        }
    });

    // Initialize server URL input
    document.getElementById('serverInput').value = state.serverUrl;

    // Connect to server
    connectToServer();

    // Periodic health check (Socket.io handles this automatically)
    setInterval(() => {
        if (state.socket && state.socket.connected) {
            state.socket.emit('ping');
        }
    }, 30000);

    console.log('✓ Application initialized');
});

// Handle page visibility to manage reconnections
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('⊘ App hidden');
    } else {
        console.log('✓ App visible');
        if (!state.connected && (!state.socket || !state.socket.connected)) {
            connectToServer();
        }
    }
});
