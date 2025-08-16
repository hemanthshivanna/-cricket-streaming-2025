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
