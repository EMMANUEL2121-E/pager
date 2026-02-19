/**
 * WiFi Pager Server
 * 
 * Real-time call relay system for WiFi Pager
 * 
 * Architecture:
 * - Express HTTP server for REST API
 * - Socket.io for WebSocket real-time communication
 * - Receives incoming call alerts from Android phone
 * - Broadcasts to connected web pager clients
 * 
 * Endpoints:
 * - POST /incoming-call (receive call from Android)
 * - WebSocket event: "call-alert" (broadcast to web clients)
 * 
 * Network:
 * - Runs on port 3000
 * - Accessible on local WiFi network
 * - CORS enabled for development
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');

// ============================================
// CONFIGURATION
// ============================================

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all interfaces

// ============================================
// EXPRESS & SOCKET.IO SETUP
// ============================================

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============================================
// WEBSOCKET CONNECTION HANDLING
// ============================================

/**
 * Track connected clients
 * Store client information for debugging and management
 */
const connectedClients = new Map();

io.on('connection', (socket) => {
    const clientId = socket.id;
    const clientIP = socket.handshake.address;
    
    console.log(`\n✓ Client connected`);
    console.log(`  ID: ${clientId}`);
    console.log(`  IP: ${clientIP}`);
    console.log(`  Active clients: ${io.engine.clientsCount}\n`);

    // Store client info
    connectedClients.set(clientId, {
        id: clientId,
        ip: clientIP,
        connectedAt: new Date(),
        callsReceived: 0
    });

    /**
     * Handle client disconnect
     */
    socket.on('disconnect', () => {
        connectedClients.delete(clientId);
        console.log(`\n✗ Client disconnected`);
        console.log(`  ID: ${clientId}`);
        console.log(`  Active clients: ${io.engine.clientsCount}\n`);
    });

    /**
     * Handle test/ping (optional)
     */
    socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date().toISOString() });
    });
});

// ============================================
// REST API ENDPOINTS
// ============================================

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        clients: io.engine.clientsCount,
        connectedDevices: Array.from(connectedClients.values())
    });
});

/**
 * GET /incoming-call - Test endpoint to verify server
 */
app.get('/incoming-call', (req, res) => {
    res.json({
        message: 'WiFi Pager server is running',
        method: 'POST',
        example: {
            number: "+1234567890",
            name: "John Doe",
            timestamp: new Date().toISOString()
        }
    });
});

/**
 * POST /incoming-call - Receive incoming call from Android app
 * 
 * Expected JSON:
 * {
 *   "number": "+1234567890",
 *   "name": "John Doe",
 *   "timestamp": "2024-02-19T10:30:45Z"
 * }
 * 
 * Behavior:
 * - Validate incoming data
 * - Log call details
 * - Broadcast to all connected web clients
 * - Send confirmation response
 */
app.post('/incoming-call', (req, res) => {
    try {
        const callData = req.body;

        // Validate required fields
        if (!callData.number) {
            console.error('✗ Invalid request: missing phone number');
            return res.status(400).json({
                success: false,
                error: 'Missing required field: number'
            });
        }

        if (!callData.name) {
            callData.name = callData.number;
        }

        if (!callData.timestamp) {
            callData.timestamp = new Date().toISOString();
        }

        // Log incoming call
        console.log(`\n📞 INCOMING CALL DETECTED`);
        console.log(`  Number: ${callData.number}`);
        console.log(`  Name: ${callData.name}`);
        console.log(`  Time: ${callData.timestamp}`);
        console.log(`  Clients notified: ${io.engine.clientsCount}\n`);

        // Update client statistics
        connectedClients.forEach(client => {
            client.callsReceived++;
        });

        // Broadcast to all connected web pager clients
        io.emit('call-alert', {
            number: callData.number,
            name: callData.name,
            timestamp: callData.timestamp,
            receivedAt: new Date().toISOString(),
            clientsNotified: io.engine.clientsCount
        });

        // Send success response to Android app
        res.json({
            success: true,
            message: 'Call alert broadcast',
            clientsNotified: io.engine.clientsCount
        });

    } catch (error) {
        console.error('✗ Error processing incoming call:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 404 handler
 */
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path,
        method: req.method
    });
});

// ============================================
// ERROR HANDLING
// ============================================

process.on('uncaughtException', (error) => {
    console.error('✗ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('✗ Unhandled Rejection at:', promise, 'reason:', reason);
});

// ============================================
// SERVER STARTUP
// ============================================

server.listen(PORT, HOST, () => {
    console.log(`
╔════════════════════════════════════════════╗
║     📟 WiFi PAGER SERVER STARTED 📟        ║
╠════════════════════════════════════════════╣
║ Server: http://0.0.0.0:${PORT}                    ║
║ REST API: POST /incoming-call              ║
║ WebSocket: ws://localhost:${PORT}                  ║
║ Health Check: GET /health                  ║
╠════════════════════════════════════════════╣
║ Waiting for Android app & web pager...     ║
╚════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n✓ Server shutting down gracefully...');
    server.close(() => {
        console.log('✓ Server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n\n✓ Server shutting down gracefully...');
    server.close(() => {
        console.log('✓ Server closed');
        process.exit(0);
    });
});
