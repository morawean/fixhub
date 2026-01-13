#!/bin/bash
# Start FIX Hub Frontend

echo "======================================"
echo "FIX Hub - Frontend Startup"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Please install Node.js 16+"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "Node Version: $NODE_VERSION"

NPM_VERSION=$(npm -v)
echo "NPM Version: $NPM_VERSION"

cd ui

if [ ! -d "node_modules" ]; then
    echo ""
    echo "Installing dependencies..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "ERROR: npm install failed"
        exit 1
    fi
fi

echo ""
echo "======================================"
echo "Starting Frontend Dev Server..."
echo "======================================"
echo "Frontend running on: http://localhost:5173"
echo "Backend API: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev
