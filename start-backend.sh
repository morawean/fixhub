#!/bin/bash
# Start FIX Hub Backend

echo "======================================"
echo "FIX Hub - Backend Startup"
echo "======================================"

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "ERROR: Maven not found. Please install Maven."
    exit 1
fi

# Check if Java 17+ is installed
JAVA_VERSION=$(java -version 2>&1 | grep -oP '"(?:\d+)\.(?:\d+)' | cut -d'"' -f2)
echo "Java Version: $JAVA_VERSION"

echo ""
echo "Building project..."
mvn clean package -DskipTests

if [ $? -ne 0 ]; then
    echo "ERROR: Build failed"
    exit 1
fi

echo ""
echo "======================================"
echo "Starting Backend Server..."
echo "======================================"
echo "Server running on: http://localhost:8080"
echo "Actuator health: http://localhost:8080/actuator/health"
echo ""
echo "Press Ctrl+C to stop"
echo ""

java -jar target/fix-hub-0.1.0.jar
