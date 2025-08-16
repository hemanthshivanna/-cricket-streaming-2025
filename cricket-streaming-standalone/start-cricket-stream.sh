#!/bin/bash

echo "🏏 Cricket Tournament Live Streaming Server"
echo "==========================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first:"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Get Facebook stream key if not set
if [ -z "$FACEBOOK_STREAM_KEY" ]; then
    echo ""
    echo "📺 Facebook Live Stream Key Setup"
    echo "================================="
    echo "1. Go to your Facebook Page"
    echo "2. Click 'Publishing Tools' → 'Live'"
    echo "3. Click 'Create Live Video'"
    echo "4. Select 'Use Stream Key'"
    echo "5. Copy the PERSISTENT STREAM KEY"
    echo ""
    read -p "Enter your Facebook Stream Key (or press Enter to set later): " stream_key
    if [ ! -z "$stream_key" ]; then
        export FACEBOOK_STREAM_KEY="$stream_key"
        echo "✅ Stream key set for this session"
    else
        echo "⚠️  You can set the stream key later in facebook-config.json"
    fi
fi

echo ""
echo "🚀 Starting Cricket Tournament Streaming Server..."
echo "   This system runs completely independently"
echo "   No external tools or internet dependencies required during streaming"
echo ""

# Start the server
node streaming-server.js
