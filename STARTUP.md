# FIX Hub - Startup & Stop Scripts

Two convenient shell scripts to manage the FIX Hub application.

## Quick Start

### Start Everything (Frontend + Backend)

```bash
./start.sh
```

This script will:
1. Stop any running FIX Hub instances
2. Build the frontend (React/Vite)
3. Copy frontend to backend static resources
4. Build the backend (Maven)
5. Start the backend server on port 8080

### Stop the Application

```bash
./stop.sh
```

This script stops the FIX Hub backend gracefully.

## Manual Alternative

If you prefer to run commands directly:

**Build and start:**
```bash
cd finclusion
mvn clean package -DskipTests
java -jar target/fix-hub-0.1.0.jar
```

**Or just start (if already built):**
```bash
java -jar finclusion/target/fix-hub-0.1.0.jar
```

## Access the Application

Once running, access:

- **Frontend**: http://localhost:8080
- **API Base**: http://localhost:8080/api
- **WebSocket**: ws://localhost:8080/ws/messages

### Demo Credentials

- **Username**: `admin`
- **Password**: `admin`

## Features

- ✅ WebSocket real-time message streaming
- ✅ Session management
- ✅ Connection management
- ✅ Route configuration
- ✅ JWT authentication
- ✅ Responsive UI

## Endpoints

### Authentication
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/validate` - Validate token

### Connections
- `GET /api/connections` - List connections
- `POST /api/connections` - Create connection
- `PUT /api/connections/{id}` - Update connection
- `DELETE /api/connections/{id}` - Delete connection

### Sessions
- `GET /api/sessions` - List sessions
- `POST /api/sessions/{sessionId}/disconnect` - Disconnect session

### Routes
- `GET /api/routes` - List routes
- `POST /api/routes` - Create route
- `PUT /api/routes/{index}` - Update route
- `DELETE /api/routes/{index}` - Delete route

### Status
- `GET /api/websocket/status` - Check WebSocket status

## Logs

Application logs are written to: `/tmp/fixhub.log`

View logs:
```bash
tail -f /tmp/fixhub.log
```

## Troubleshooting

**Port 8080 already in use:**
```bash
./stop.sh
# or
pkill -f 'java.*fix-hub'
```

**Build issues:**
```bash
mvn clean install
```

**Frontend not updating:**
```bash
rm -rf src/main/resources/static/*
npm run build -C ui
cp -r ui/dist/* src/main/resources/static/
```

## Requirements

- Java 17+
- Node.js 16+
- Maven 3.8+
- npm or yarn
