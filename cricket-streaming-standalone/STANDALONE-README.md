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
