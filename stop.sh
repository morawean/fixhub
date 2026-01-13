#!/bin/bash

# FIX Hub - Stop Script
# Stops the backend server

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$PROJECT_DIR/backend.pid"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Stopping FIX Hub...${NC}"

if pgrep -f "java.*fix-hub" > /dev/null 2>&1; then
    pkill -f "java.*fix-hub"
    rm -f "$PID_FILE"
    sleep 1
    if ! pgrep -f "java.*fix-hub" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ FIX Hub stopped successfully${NC}"
    else
        echo -e "${RED}✗ Failed to stop FIX Hub${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ FIX Hub is not running${NC}"
fi
