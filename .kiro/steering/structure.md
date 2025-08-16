# Project Structure & Organization

## Root Directory Layout

```
cricket-streaming/
├── streaming-server.js          # Main streaming server application
├── config-helper.js            # Auto-configuration and IP detection
├── monitor.js                  # Stream health monitoring system
├── test-stream.js              # System validation and testing
├── test-integration.js         # Integration testing utilities
├── package.json                # Dependencies and npm scripts
├── obsbot-config.json          # OBSBOT Tail Air camera settings
├── facebook-config.json        # Facebook Live streaming configuration
├── install.sh                  # System installation script
├── deploy-standalone.sh        # Standalone deployment packager
├── README.md                   # Main project documentation
├── setup-instructions.md       # Detailed setup guide
├── INTEGRATION-GUIDE.md        # Step-by-step integration walkthrough
├── DEPLOYMENT-SUMMARY.md       # Deployment documentation
├── CLOUD-STREAMING-OPTIONS.md  # Cloud deployment options
└── cricket-stream-setup.md     # Stream setup documentation
```

## Standalone Distribution

The `cricket-streaming-standalone/` directory contains a complete deployable package:

```
cricket-streaming-standalone/
├── streaming-server.js         # Main application (copied from root)
├── config-helper.js           # Configuration utilities
├── monitor.js                 # Health monitoring
├── test-stream.js             # System tests
├── package.json               # Standalone dependencies
├── obsbot-config.json         # Camera configuration
├── facebook-config.json       # Facebook Live settings
├── start-cricket-stream.sh    # Unix/Mac startup script
├── start-cricket-stream.bat   # Windows startup script
├── monitor-stream.sh          # Unix/Mac monitoring
├── monitor-stream.bat         # Windows monitoring
├── test-system.sh             # Unix/Mac testing
├── test-system.bat            # Windows testing
├── README.md                  # Standalone documentation
├── STANDALONE-README.md       # Deployment-specific docs
├── INSTALL.txt                # Installation instructions
└── setup-instructions.md      # Setup guide
```

## Core Application Files

### Main Components
- **streaming-server.js** - Primary application entry point, handles SRT input and RTMPS output
- **config-helper.js** - Auto-configuration system, IP detection, system validation
- **monitor.js** - Real-time stream health monitoring and analytics
- **test-stream.js** - System validation and readiness testing

### Configuration Files
- **obsbot-config.json** - OBSBOT Tail Air camera SRT settings
- **facebook-config.json** - Facebook Live RTMPS configuration and stream metadata
- **package.json** - Node.js dependencies and npm script definitions

## Documentation Structure

### User Documentation
- **README.md** - Quick start guide and feature overview
- **setup-instructions.md** - Detailed setup procedures
- **INTEGRATION-GUIDE.md** - Complete integration walkthrough
- **INSTALL.txt** - Simple installation instructions (standalone)

### Technical Documentation
- **DEPLOYMENT-SUMMARY.md** - Deployment strategies and options
- **CLOUD-STREAMING-OPTIONS.md** - Cloud deployment alternatives
- **cricket-stream-setup.md** - Stream configuration details

## Script Organization

### Cross-Platform Scripts
All major operations have both Unix/Mac (.sh) and Windows (.bat) versions:

- **Startup**: `start-cricket-stream.sh/.bat`
- **Monitoring**: `monitor-stream.sh/.bat`
- **Testing**: `test-system.sh/.bat`
- **Installation**: `install.sh` (Unix/Mac only)
- **Deployment**: `deploy-standalone.sh` (Unix/Mac only)

### Script Responsibilities
- **Auto-detect network configuration**
- **Update JSON configuration files**
- **Validate system requirements**
- **Provide user-friendly setup guidance**

## Development Patterns

### File Naming Conventions
- **Kebab-case** for script files (`start-cricket-stream.sh`)
- **Camel-case** for JavaScript modules (`config-helper.js`)
- **UPPERCASE** for documentation (`README.md`, `INSTALL.txt`)
- **JSON configs** use kebab-case (`obsbot-config.json`)

### Module Organization
- **Single responsibility** - Each file has a clear, focused purpose
- **Class-based architecture** - Main components use ES6 classes
- **Utility modules** - Helper functions in separate modules
- **Configuration separation** - Settings isolated in JSON files

### Deployment Strategy
- **Dual structure** - Development root + standalone distribution
- **Complete independence** - Standalone package needs no external dependencies
- **Cross-platform support** - Works on macOS, Linux, Windows
- **Auto-configuration** - Minimal manual setup required