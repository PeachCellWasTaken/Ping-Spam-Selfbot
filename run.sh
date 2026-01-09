#!/usr/bin/env bash

echo "============================================"
echo "              Run Application"
echo "============================================"
echo

# Check for Node.js
if ! command -v node >/dev/null 2>&1; then
    echo "Node.js is not installed."
    echo "Please run the Linux installer first."
    exit 1
fi

echo "Node.js found: $(node -v)"
echo "Starting application..."
echo

# Run your app
node index.js

echo
echo "Application exited."
