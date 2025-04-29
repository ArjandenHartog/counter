#!/bin/bash

# First build the application
echo "Building Next.js application..."
npm run build

# Copy the service file to the systemd directory
echo "Installing systemd service..."
sudo cp counter.service /etc/systemd/system/

# Reload systemd to recognize the new service
sudo systemctl daemon-reload

# Enable the service to start on boot
sudo systemctl enable counter.service

# Start the service
sudo systemctl start counter.service

echo "Service installed and started. Check status with: sudo systemctl status counter.service" 