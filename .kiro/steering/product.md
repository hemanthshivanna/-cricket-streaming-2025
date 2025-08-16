# Product Overview

## Cricket Tournament Live Streaming System

A professional live streaming solution designed for all-day cricket tournament broadcasting. The system streams from OBSBOT Tail Air cameras to Facebook Live via SRT protocol with persistent stream keys for maximum reliability.

### Key Features

- **Mobile-optimized streaming** designed for mobile hotspot connections
- **Automatic quality adaptation** (1080p30 @ 5000kbps or 720p30 @ 3000kbps)
- **Persistent stream keys** for seamless reconnection without losing viewers
- **Real-time monitoring** with web dashboard and health alerts
- **Tournament-ready** for 8+ hour continuous streaming
- **Standalone deployment** requiring no external tools during operation

### Target Use Case

Remote cricket tournaments where reliable internet may be limited, using mobile hotspots for connectivity. The system prioritizes stability over maximum quality and includes automatic reconnection capabilities.

### Architecture

```
OBSBOT Tail Air → SRT Stream → Local Server → RTMPS → Facebook Live
     (Camera)      (Mobile)     (Node.js)    (Internet)   (Viewers)
```

The system runs completely independently once configured, with auto-detection of network settings and comprehensive monitoring capabilities.