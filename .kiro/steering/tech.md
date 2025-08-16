# Technology Stack & Build System

## Core Technologies

### Runtime & Language
- **Node.js 14+** - JavaScript runtime
- **CommonJS modules** - Module system (not ES modules)

### Key Dependencies
- **node-media-server** ^2.6.0 - SRT/RTMP media server
- **fluent-ffmpeg** ^2.1.2 - Video processing and transcoding
- **ffmpeg-static** ^5.2.0 - Static FFmpeg binary
- **express** ^4.18.2 - Web server for dashboard
- **ws** ^8.14.2 - WebSocket for real-time updates
- **node-cron** ^3.0.3 - Scheduled tasks and monitoring

### Protocols & Streaming
- **SRT (Secure Reliable Transport)** - Input from OBSBOT camera
- **RTMPS** - Output to Facebook Live
- **WebSocket** - Real-time dashboard updates
- **HTTP/Express** - REST API and web interface

## Build System & Commands

### Standard npm Scripts
```bash
# Start the streaming server
npm start

# Run system validation tests
npm test

# Start stream health monitoring
npm run monitor

# Install dependencies
npm run install-deps

# Complete setup with testing
npm run setup
```

### Platform-Specific Scripts
```bash
# Unix/Mac startup (auto-configures IP and stream key)
./start-cricket-stream.sh

# Windows startup
start-cricket-stream.bat

# Stream monitoring
./monitor-stream.sh  # Unix/Mac
monitor-stream.bat   # Windows

# System testing
./test-system.sh     # Unix/Mac
test-system.bat      # Windows
```

### Deployment
```bash
# Create standalone deployment package
./deploy-standalone.sh

# Install system on target machine
./install.sh
```

## Configuration Management

### Auto-Configuration System
- **IP Detection** - Automatically detects server IP address
- **Config Updates** - Updates JSON configs with detected settings
- **Environment Variables** - Supports FACEBOOK_STREAM_KEY env var
- **Cross-Platform** - Works on macOS, Linux, Windows

### Configuration Files
- `obsbot-config.json` - Camera SRT settings
- `facebook-config.json` - Facebook Live RTMPS settings
- `package.json` - Dependencies and scripts

## Development Patterns

### Error Handling
- Graceful degradation for network issues
- Automatic reconnection with exponential backoff
- Comprehensive logging and monitoring

### Code Style
- CommonJS require/module.exports
- Class-based architecture for main components
- Async/await for asynchronous operations
- Console logging with emoji prefixes for clarity

### Testing & Validation
- System readiness checks (Node version, dependencies, ports, network)
- Stream validation tests
- Real-time health monitoring
- Bandwidth estimation and quality adaptation