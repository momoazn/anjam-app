#!/bin/bash

# ================================================================
# Task Manager App - macOS/Linux Launcher
# This shell script runs the task-manager with configurable
# host and port settings
# ================================================================

# Configure these variables as needed
# Can be overridden via command line: ./run.sh [host] [port]
HOST="${1:-0.0.0.0}"
PORT="${2:-8090}"

# Build the server address
SERVER_ADDR="${HOST}:${PORT}"

# Display usage information if help requested
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "Usage: ./run.sh [host] [port]"
    echo ""
    echo "Examples:"
    echo "  ./run.sh                          # Uses default: 0.0.0.0:8090"
    echo "  ./run.sh localhost 9000           # Uses: localhost:9000"
    echo "  ./run.sh 192.168.1.100 3000       # Uses: 192.168.1.100:3000"
    echo "  ./run.sh 0.0.0.0 8080             # Uses: 0.0.0.0:8080"
    echo ""
    exit 0
fi

# Check if executable exists
if [[ ! -f "./task-manager" ]]; then
    echo "Error: task-manager executable not found in current directory"
    echo "Please ensure the executable is in the same folder as this script"
    exit 1
fi

# Make script executable (in case it's not)
chmod +x ./task-manager

# Start the application with specified host and port
echo "=========================================="
echo "Starting Task Manager App..."
echo "=========================================="
echo "Host: $HOST"
echo "Port: $PORT"
echo "Server Address: $SERVER_ADDR"
echo ""
echo "The application will be available at: http://$SERVER_ADDR"
echo ""
echo "Press Ctrl+C to stop the application"
echo "=========================================="
echo ""

# Pass host and port using the correct --http flag
./task-manager serve --http="$SERVER_ADDR"
