# Cricket Tournament Live Streaming Setup

## Overview
This setup creates a streaming pipeline from OBSBOT Tail Air → SRT → Processing Server → Facebook Live

## Network Requirements
- Upload speed: 6+ Mbps for 1080p30, 4+ Mbps for 720p30
- Stable connection for 8+ hours
- Mobile hotspot with good signal strength

## Equipment Checklist
- [ ] OBSBOT Tail Air camera
- [ ] Phone with OBSBOT app
- [ ] Mobile hotspot device
- [ ] Computer running streaming software
- [ ] Facebook Page with Live Producer access

## Configuration Files
- `obsbot-config.json` - Camera SRT output settings
- `streaming-server.js` - Node.js streaming server
- `facebook-config.json` - Facebook Live settings
- `monitor.js` - Stream health monitoring