#!/bin/bash

# Cricket Tournament Streaming - Standalone Installation Script
# This script sets up everything needed to run independently

echo "🏏 Cricket Tournament Live Streaming - Standalone Setup"
echo "======================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first:"
    echo "   Visit: https://nodejs.org/en/download/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Run system tests
echo ""
echo "🧪 Running system tests..."
npm run test

# Create startup script
echo ""
echo "📝 Creating startup scripts..."

# Create start-tournament.sh
cat > start-tournament.sh << 'EOF'
#!/bin/bash

echo "🏏 Starting Cricket Tournament Live Stream Server..."
echo "=================================================="

# Check if Facebook stream key is set
if [ -z "$FACEBOOK_STREAM_KEY" ]; then
    echo "⚠️  Facebook stream key not set as environment variable"
    echo "   You can set it now or update facebook-config.json manually"
    echo ""
    read -p "Enter Facebook Stream Key (or press Enter to skip): " stream_key
    if [ ! -z "$stream_key" ]; then
        export FACEBOOK_STREAM_KEY="$stream_key"
        echo "✅ Stream key set for this session"
    fi
fi

# Get server IP automatically
SERVER_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)

if [ -z "$SERVER_IP" ]; then
    # Fallback method for different systems
    SERVER_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || ipconfig getifaddr en0 2>/dev/null || echo "192.168.1.100")
fi

echo "🌐 Detected Server IP: $SERVER_IP"
echo "   Configure OBSBOT with this IP address"
echo ""

# Update obsbot-config.json with detected IP
if [ -f "obsbot-config.json" ]; then
    # Use sed to replace YOUR_SERVER_IP with actual IP
    sed -i.bak "s/YOUR_SERVER_IP/$SERVER_IP/g" obsbot-config.json
    echo "✅ Updated OBSBOT config with server IP: $SERVER_IP"
fi

echo "🚀 Starting streaming server..."
echo "   Dashboard: http://localhost:3000"
echo "   SRT Input: srt://$SERVER_IP:9999?streamid=cricket-tournament-2025"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
node streaming-server.js
EOF

# Make startup script executable
chmod +x start-tournament.sh

# Create Windows batch file
cat > start-tournament.bat << 'EOF'
@echo off
echo 🏏 Starting Cricket Tournament Live Stream Server...
echo ==================================================

REM Check if Facebook stream key is set
if "%FACEBOOK_STREAM_KEY%"=="" (
    echo ⚠️  Facebook stream key not set as environment variable
    echo    You can set it now or update facebook-config.json manually
    echo.
    set /p stream_key="Enter Facebook Stream Key (or press Enter to skip): "
    if not "!stream_key!"=="" (
        set FACEBOOK_STREAM_KEY=!stream_key!
        echo ✅ Stream key set for this session
    )
)

REM Get server IP (Windows)
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set SERVER_IP=%%a
    goto :found_ip
)
set SERVER_IP=192.168.1.100

:found_ip
set SERVER_IP=%SERVER_IP: =%
echo 🌐 Detected Server IP: %SERVER_IP%
echo    Configure OBSBOT with this IP address
echo.

REM Update obsbot-config.json with detected IP
if exist "obsbot-config.json" (
    powershell -Command "(gc obsbot-config.json) -replace 'YOUR_SERVER_IP', '%SERVER_IP%' | Out-File -encoding ASCII obsbot-config.json"
    echo ✅ Updated OBSBOT config with server IP: %SERVER_IP%
)

echo 🚀 Starting streaming server...
echo    Dashboard: http://localhost:3000
echo    SRT Input: srt://%SERVER_IP%:9999?streamid=cricket-tournament-2025
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
node streaming-server.js
EOF

# Create monitoring script
cat > monitor-tournament.sh << 'EOF'
#!/bin/bash

echo "📊 Cricket Tournament Stream Monitor"
echo "==================================="
echo ""
echo "This will monitor your stream health in real-time"
echo "Press Ctrl+C to stop monitoring"
echo ""

node monitor.js
EOF

chmod +x monitor-tournament.sh

# Create monitoring batch file for Windows
cat > monitor-tournament.bat << 'EOF'
@echo off
echo 📊 Cricket Tournament Stream Monitor
echo ===================================
echo.
echo This will monitor your stream health in real-time
echo Press Ctrl+C to stop monitoring
echo.

node monitor.js
EOF

# Create quick setup guide
cat > QUICK-START.txt << 'EOF'
🏏 CRICKET TOURNAMENT STREAMING - QUICK START GUIDE
==================================================

STEP 1: GET YOUR FACEBOOK STREAM KEY
-----------------------------------
1. Go to your Facebook Page
2. Click "Publishing Tools" → "Live"  
3. Click "Create Live Video"
4. Select "Use Stream Key"
5. Copy the PERSISTENT STREAM KEY
6. Keep this page open during the tournament!

STEP 2: START THE SERVER
-----------------------
On Mac/Linux: ./start-tournament.sh
On Windows:   start-tournament.bat

The script will:
- Auto-detect your server IP address
- Update OBSBOT configuration automatically  
- Start the streaming server
- Show you the dashboard URL

STEP 3: CONFIGURE OBSBOT TAIL AIR
--------------------------------
In OBSBOT app → Settings → Streaming:

Protocol: SRT Caller
Host: [IP shown by startup script]
Port: 9999
Stream ID: cricket-tournament-2025  
Passphrase: CricketLive2025!

Video Quality:
- Good connection (6+ Mbps): 1080p30, 5000 kbps
- Limited bandwidth: 720p30, 3000 kbps

Audio: AAC, 128 kbps, 44.1 kHz

STEP 4: MONITOR THE STREAM
-------------------------
Dashboard: http://localhost:3000
Monitor: ./monitor-tournament.sh (Mac/Linux) or monitor-tournament.bat (Windows)

STEP 5: GO LIVE
--------------
1. Start OBSBOT streaming (connects to server)
2. Check dashboard shows "OBSBOT Input: Connected"
3. Verify "Facebook Output: Streaming Live"  
4. Test with "Only Me" privacy first
5. Switch to "Public" when ready
6. Tournament is now live!

TROUBLESHOOTING
--------------
- OBSBOT won't connect: Check IP address and firewall
- Facebook issues: Verify stream key and page is open
- Poor quality: Reduce bitrate in OBSBOT app
- Stream drops: Monitor shows auto-reconnection

EMERGENCY BACKUP
---------------
If everything fails, use Facebook Live mobile app directly from your phone as backup.

The server runs completely independently - no internet tools needed after setup!
EOF

echo ""
echo "✅ Standalone installation complete!"
echo ""
echo "📋 What's been created:"
echo "   • start-tournament.sh/.bat - Main startup script"
echo "   • monitor-tournament.sh/.bat - Stream monitoring"  
echo "   • QUICK-START.txt - Simple operator guide"
echo ""
echo "🚀 Ready to run independently! Next steps:"
echo "   1. Get your Facebook persistent stream key"
echo "   2. Run: ./start-tournament.sh (or .bat on Windows)"
echo "   3. Configure OBSBOT with the IP address shown"
echo "   4. Start streaming!"
echo ""
echo "📖 See QUICK-START.txt for detailed instructions"