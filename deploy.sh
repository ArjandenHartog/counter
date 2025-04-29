#!/bin/bash

# Deployment script for counter application

# Exit on any error
set -e

echo "Building application..."
npm run build

echo "Creating deployment package..."
# Create deploy directory
mkdir -p deploy

# Copy standalone files
cp -r .next/standalone/* deploy/
cp -r .next/static deploy/.next/
cp -r public deploy/

# Create archive
TIMESTAMP=$(date +%Y%m%d%H%M%S)
ARCHIVE_NAME="counter-deploy-$TIMESTAMP.tar.gz"

echo "Creating archive $ARCHIVE_NAME..."
tar -czf $ARCHIVE_NAME -C deploy .

echo "Deployment package created: $ARCHIVE_NAME"
echo ""
echo "To deploy, copy this file to your web server and extract it:"
echo "scp $ARCHIVE_NAME user@your-server:/path/to/destination/"
echo "ssh user@your-server 'cd /path/to/destination && tar -xzf $ARCHIVE_NAME'"
echo ""
echo "Then start the application with:"
echo "node server.js"
echo ""
echo "Or use pm2 for production deployment:"
echo "pm2 start server.js --name counter" 