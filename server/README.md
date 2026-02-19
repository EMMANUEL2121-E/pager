# WiFi Pager Server

Real-time call relay server for WiFi Pager system.

## Installation

```bash
cd server
npm install
```

## Running

```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### POST /incoming-call
Receive incoming call from Android app.

```bash
curl -X POST http://localhost:3000/incoming-call \
  -H "Content-Type: application/json" \
  -d '{
    "number": "+1234567890",
    "name": "John Doe",
    "timestamp": "2024-02-19T10:30:45Z"
  }'
```

### GET /health
Health check endpoint.

```bash
curl http://localhost:3000/health
```

## WebSocket Events

### Broadcast: call-alert
Sent to all connected clients when a call is received.

```json
{
  "number": "+1234567890",
  "name": "John Doe",
  "timestamp": "2024-02-19T10:30:45Z",
  "receivedAt": "2024-02-19T10:30:46Z",
  "clientsNotified": 1
}
```

## Configuration

- **PORT**: 3000 (can be changed via `PORT` environment variable)
- **HOST**: 0.0.0.0 (listens on all interfaces)
- **CORS**: Enabled for all origins
