#!/bin/bash

# Cricket Tournament Streaming - Complete Standalone Deployment
# This creates a fully independent streaming system

echo "🏏 Cricket Tournament Streaming - Standalone Deployment"
echo "======================================================="

# Create deployment directory
DEPLOY_DIR="cricket-streaming-standalone"
echo "📁 Creating deployment package: $DEPLOY_DIR"

# Remove existing deployment if it exists
if [ -d "$DEPLOY_DIR" ]; then
    rm -rf "$DEPLOY_DIR"
fi

mkdir -p "$DEPLOY_DIR"

# Copy all necessary files
echo "📋 Copying application files..."
cp package.json "$DEPLOY_DIR/"
cp streaming-server.js "$DEPLOY_DIR/"
cp config-helper.js "$DEPLOY_DIR/"
cp monitor.js "$DEPLOY_DIR/"
cp test-stream.js "$DEPLOY_DIR/"
cp obsbot-config.json "$DEPLOY_DIR/"
cp facebook-config.json "$DEPLOY_DIR/"
cp README.md "$DEPLOY_DIR/"
cp setup-instructions.md "$DEPLOY_DIR/"

# Create standalone startup scripts
echo "🚀 Creating standalone startup scripts..."

# Create main startup script for Unix/Mac
cat > "$DEPLOY_DIR/start-cricket-stream.sh" << 'EOF'
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
EOF

# Create Windows batch file
cat > "$DEPLOY_DIR/start-cricket-stream.bat" << 'EOF'
@echo off
setlocal enabledelayedexpansion

echo 🏏 Cricket Tournament Live Streaming Server
echo ===========================================

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js first:
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
for /f "tokens=*" %%i in ('node --version') do echo    Version: %%i

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Get Facebook stream key if not set
if "%FACEBOOK_STREAM_KEY%"=="" (
    echo.
    echo 📺 Facebook Live Stream Key Setup
    echo =================================
    echo 1. Go to your Facebook Page
    echo 2. Click 'Publishing Tools' → 'Live'
    echo 3. Click 'Create Live Video'
    echo 4. Select 'Use Stream Key'
    echo 5. Copy the PERSISTENT STREAM KEY
    echo.
    set /p stream_key="Enter your Facebook Stream Key (or press Enter to set later): "
    if not "!stream_key!"=="" (
        set FACEBOOK_STREAM_KEY=!stream_key!
        echo ✅ Stream key set for this session
    ) else (
        echo ⚠️  You can set the stream key later in facebook-config.json
    )
)

echo.
echo 🚀 Starting Cricket Tournament Streaming Server...
echo    This system runs completely independently
echo    No external tools or internet dependencies required during streaming
echo.

REM Start the server
node streaming-server.js
EOF

# Create monitoring script
cat > "$DEPLOY_DIR/monitor-stream.sh" << 'EOF'
#!/bin/bash
echo "📊 Cricket Tournament Stream Monitor"
echo "==================================="
echo "Monitoring stream health in real-time..."
echo "Press Ctrl+C to stop"
echo ""
node monitor.js
EOF

cat > "$DEPLOY_DIR/monitor-stream.bat" << 'EOF'
@echo off
echo 📊 Cricket Tournament Stream Monitor
echo ===================================
echo Monitoring stream health in real-time...
echo Press Ctrl+C to stop
echo.
node monitor.js
EOF

# Create system test script
cat > "$DEPLOY_DIR/test-system.sh" << 'EOF'
#!/bin/bash
echo "🧪 Testing Cricket Streaming System"
echo "==================================="
node test-stream.js
EOF

cat > "$DEPLOY_DIR/test-system.bat" << 'EOF'
@echo off
echo 🧪 Testing Cricket Streaming System
echo ===================================
node test-stream.js
EOF

# Make scripts executable
chmod +x "$DEPLOY_DIR"/*.sh

# Create comprehensive README for standalone deployment
cat > "$DEPLOY_DIR/STANDALONE-README.md" << 'EOF'
# 🏏 Cricket Tournament Live Streaming - Standalone System

This is a completely independent live streaming system that requires no external tools or internet dependencies during operation.

## System Requirements

- **Node.js 14+** (Download from https://nodejs.org/)
- **Internet connection** (for initial setup and streaming)
- **Mobile hotspot** with 4+ Mbps upload speed
- **OBSBOT Tail Air camera**
- **Facebook Page** with Live Producer access

## Quick Start (5 minutes)

### 1. Start the System
**On Mac/Linux:**
```bash
./start-cricket-stream.sh
```

**On Windows:**
```
start-cricket-stream.bat
```

### 2. Get Facebook Stream Key
1. Go to your Facebook Page
2. Click "Publishing Tools" → "Live"
3. Click "Create Live Video" 
4. Select "Use Stream Key"
5. Copy the **PERSISTENT STREAM KEY**
6. Enter it when prompted by the startup script

### 3. Configure OBSBOT Tail Air
The startup script will show you the exact settings:

```
Protocol: SRT Caller
Host: [Auto-detected IP]
Port: 9999
Stream ID: cricket-tournament-2025
Passphrase: CricketLive2025!
```

**Video Quality:**
- Good connection (≥6 Mbps): 1080p30, 5000 kbps
- Limited bandwidth: 720p30, 3000 kbps

### 4. Monitor the Stream
- **Dashboard:** http://localhost:3000
- **Monitor script:** `./monitor-stream.sh` (or `.bat`)

### 5. Go Live!
1. Start OBSBOT streaming
2. Check dashboard shows "Connected"
3. Test with "Only Me" privacy first
4. Switch to "Public" when ready

## Files Included

- `streaming-server.js` - Main streaming server
- `config-helper.js` - Auto-configuration system
- `monitor.js` - Stream health monitoring
- `obsbot-config.json` - Camera settings
- `facebook-config.json` - Facebook Live settings
- `start-cricket-stream.*` - Main startup scripts
- `monitor-stream.*` - Monitoring scripts
- `test-system.*` - System validation scripts

## Complete Independence

Once started, this system:
- ✅ Runs without any external tools
- ✅ Auto-detects network configuration
- ✅ Handles reconnections automatically
- ✅ Monitors stream health continuously
- ✅ Works for 8+ hour tournaments
- ✅ Requires no internet tools during streaming

## Troubleshooting

### OBSBOT Won't Connect
- Check the IP address shown by startup script
- Ensure mobile hotspot has internet
- Verify firewall allows port 9999

### Facebook Stream Issues
- Confirm stream key is correct
- Keep Facebook Live Producer page open
- Check internet connection stability

### Poor Stream Quality
- Reduce video quality in OBSBOT app
- Check mobile signal strength
- Move closer to cell tower

## Emergency Backup

If the system fails completely:
1. Use Facebook Live mobile app directly
2. Stream from your phone as backup
3. Lower quality but maintain coverage

## Support

- **Dashboard:** http://localhost:3000 (real-time status)
- **Logs:** Check console output and `stream-monitor.log`
- **Test System:** Run `./test-system.sh` (or `.bat`)

---

**This system is designed to work completely independently once set up. Perfect for remote cricket tournaments! 🏏📺**
EOF

# Create installation instructions
cat > "$DEPLOY_DIR/INSTALL.txt" << 'EOF'
🏏 CRICKET TOURNAMENT STREAMING - INSTALLATION
=============================================

STEP 1: INSTALL NODE.JS
----------------------
Visit: https://nodejs.org/
Download and install the LTS version for your operating system.

STEP 2: EXTRACT AND RUN
-----------------------
1. Extract this folder to your desired location
2. Open terminal/command prompt in this folder
3. Run the startup script:

   Mac/Linux: ./start-cricket-stream.sh
   Windows:   start-cricket-stream.bat

STEP 3: FOLLOW ON-SCREEN INSTRUCTIONS
------------------------------------
The startup script will:
- Install dependencies automatically
- Detect your network settings
- Guide you through Facebook setup
- Show OBSBOT configuration details
- Start the streaming server

STEP 4: CONFIGURE OBSBOT
-----------------------
Use the settings shown by the startup script in your OBSBOT app.

STEP 5: START STREAMING
----------------------
Open the dashboard at http://localhost:3000 and start streaming!

That's it! The system runs completely independently after setup.
EOF

echo "✅ Standalone deployment package created: $DEPLOY_DIR"
echo ""
echo "📦 Package Contents:"
echo "   • Complete streaming server with auto-configuration"
echo "   • Cross-platform startup scripts (Mac/Linux/Windows)"
echo "   • Stream monitoring and health checking"
echo "   • Comprehensive documentation"
echo "   • System validation tests"
echo ""
echo "🚀 To deploy:"
echo "   1. Copy the '$DEPLOY_DIR' folder to target computer"
echo "   2. Install Node.js on target computer"
echo "   3. Run startup script in the folder"
echo "   4. Follow on-screen instructions"
echo ""
echo "📋 The system will be completely independent and ready for your cricket tournament!"

# Create a zip package for easy distribution
if command -v zip &> /dev/null; then
    echo ""
    echo "📦 Creating distribution package..."
    zip -r "${DEPLOY_DIR}.zip" "$DEPLOY_DIR"
    echo "✅ Distribution package created: ${DEPLOY_DIR}.zip"
    echo "   This zip file contains everything needed for standalone deployment"
fi

echo ""
echo "🏏 Deployment complete! Ready for cricket tournament streaming! 🏏"