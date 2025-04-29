#!/bin/bash

# Start script for counter application in production mode

# Check if the .next directory exists
if [ ! -d ".next" ]; then
    echo "Building application first..."
    npm run build
fi

# Start the application
echo "Starting counter application in production mode..."
node .next/standalone/server.js 