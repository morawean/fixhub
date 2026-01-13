#!/bin/bash

# FIX Hub - Startup Script
# Starts both frontend and backend

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR"
FRONTEND_DIR="$PROJECT_DIR/ui"
JAR_FILE="$BACKEND_DIR/target/fix-hub-0.1.0.jar"
LOG_FILE="/tmp/fixhub.log"
PID_FILE="$BACKEND_DIR/backend.pid"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  FIX Hub - Startup Script${NC}"
echo -e "${YELLOW}========================================${NC}"

# Stop existing processes
echo -e "${YELLOW}[1/5] Stopping existing processes...${NC}"
if pgrep -f "java.*fix-hub" > /dev/null 2>&1; then
    pkill -f "java.*fix-hub" || true
    sleep 2
    echo -e "${GREEN}✓ Stopped old processes${NC}"
else
    echo -e "${GREEN}✓ No existing processes${NC}"
fi

# Build frontend
echo -e "${YELLOW}[2/5] Building frontend...${NC}"
cd "$FRONTEND_DIR"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend built successfully${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi

# Copy frontend to static resources
echo -e "${YELLOW}[3/5] Copying frontend to backend resources...${NC}"
cp -r "$FRONTEND_DIR/dist"/* "$BACKEND_DIR/src/main/resources/static/"
echo -e "${GREEN}✓ Frontend copied${NC}"

# Build backend
echo -e "${YELLOW}[4/5] Building backend...${NC}"
cd "$BACKEND_DIR"
if mvn clean package -DskipTests > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend built successfully${NC}"
else
    echo -e "${RED}✗ Backend build failed${NC}"
    exit 1
fi

# Start backend
echo -e "${YELLOW}[5/5] Starting backend server...${NC}"
if [ ! -f "$JAR_FILE" ]; then
    echo -e "${RED}✗ JAR file not found at $JAR_FILE${NC}"
    exit 1
fi

nohup java -jar "$JAR_FILE" > "$LOG_FILE" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$PID_FILE"

# Wait for startup
sleep 8

# Check if server is running (retry up to 5 times)
for i in {1..5}; do
    if curl -s http://localhost:8080/api/websocket/status > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
        STARTUP_SUCCESS=true
        break
    fi
    echo -e "${YELLOW}  Waiting for server... ($i/5)${NC}"
    sleep 2
done

if [ "$STARTUP_SUCCESS" = true ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  FIX Hub is running!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "  Frontend: ${YELLOW}http://localhost:8080${NC}"
    echo -e "  API:      ${YELLOW}http://localhost:8080/api${NC}"
    echo -e "  WebSocket: ${YELLOW}ws://localhost:8080/ws/messages${NC}"
    echo ""
    echo -e "  Demo Login:"
    echo -e "    Username: ${YELLOW}admin${NC}"
    echo -e "    Password: ${YELLOW}admin${NC}"
    echo ""
    echo -e "  Logs: ${YELLOW}$LOG_FILE${NC}"
    echo -e "  Stop: ${YELLOW}pkill -f 'java.*fix-hub'${NC}"
    echo ""
else
    echo -e "${RED}✗ Backend failed to start${NC}"
    echo -e "  Check logs: tail -f $LOG_FILE"
    exit 1
fi
