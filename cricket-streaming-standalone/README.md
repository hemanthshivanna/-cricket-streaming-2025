# Cricket Tournament Live Streaming System

🏏 **Professional live streaming setup for all-day cricket tournament broadcasting**

Stream from OBSBOT Tail Air camera → SRT → Processing Server → Facebook Live with persistent stream keys for maximum reliability.

## Quick Setup (10 minutes)

### 1. Install & Test
```bash
npm install
npm run test
```

### 2. Configure Stream Key
```bash
# Set your Facebook persistent stream key
export FACEBOOK_STREAM_KEY="your_stream_key_here"
```

### 3. Update Server IP
Edit `obsbot-config.json` and replace `YOUR_SERVER_IP` with your computer's IP address.

### 4. Start Streaming
```bash
npm start
```

### 5. Configure OBSBOT Tail Air
In OBSBOT app:
- **Protocol:** SRT Caller
- **Host:** [Your Server IP]
- **Port:** 9999
- **Stream ID:** cricket-tournament-2025
- **Passphrase:** CricketLive2025!

### 6. Monitor Dashboard
Open http://localhost:3000 to monitor stream health in real-time.

## Features

✅ **Automatic Quality Adaptation**
- 1080p30 @ 5000kbps for good connections (≥6 Mbps upload)
- 720p30 @ 3000kbps for limited bandwidth (<6 Mbps upload)

✅ **Persistent Stream Keys**
- Reconnect without losing viewers
- Maintains Facebook Live session during network drops

✅ **Real-time Monitoring**
- Web dashboard with live metrics
- Automatic reconnection on network issues
- Stream health alerts and recommendations

✅ **Mobile-Optimized**
- Designed for mobile hotspot streaming
- Low-latency SRT protocol
- Bandwidth-aware quality switching

✅ **Tournament-Ready**
- 8+ hour continuous streaming capability
- Detailed analytics and reporting
- Emergency backup procedures

## File Structure

```
cricket-streaming/
├── streaming-server.js      # Main streaming server
├── monitor.js              # Stream health monitoring
├── test-stream.js          # Setup validation tests
├── obsbot-config.json      # OBSBOT Tail Air settings
├── facebook-config.json    # Facebook Live configuration
├── setup-instructions.md   # Detailed setup guide
└── package.json           # Dependencies and scripts
```

## Configuration Files

### OBSBOT Tail Air Settings (`obsbot-config.json`)
- SRT output configuration
- Video quality profiles (1080p/720p)
- Audio settings (AAC 128kbps)
- Connection parameters

### Facebook Live Settings (`facebook-config.json`)
- RTMPS output configuration
- Stream metadata (title, description)
- Quality adaptation settings
- Backup ingest URLs

## Monitoring & Analytics

### Real-time Dashboard (http://localhost:3000)
- Input/output connection status
- Live bitrate and frame drop monitoring
- Stream uptime and health metrics
- Manual controls for test/live modes

### Stream Health Monitoring
```bash
npm run monitor
```
- Network connectivity checks
- Bandwidth estimation
- Automatic alert generation
- Post-tournament reporting

## Troubleshooting

### Common Issues

**OBSBOT Won't Connect**
- Verify server IP in obsbot-config.json
- Check firewall allows port 9999
- Ensure mobile hotspot has internet

**Facebook Stream Fails**
- Confirm stream key is set correctly
- Check Facebook Live Producer page is open
- Verify RTMPS ports (443/80) not blocked

**Poor Quality/Drops**
- Run bandwidth test: `npm run monitor`
- Lower video quality in OBSBOT app
- Check mobile signal strength
- Move closer to cell tower

### Emergency Procedures

1. **Stream Drops:** Dashboard shows auto-reconnection attempts
2. **Quality Issues:** Reduce bitrate immediately via OBSBOT app
3. **Complete Failure:** Use Facebook Live mobile app as backup

## Technical Specifications

### Input (OBSBOT Tail Air)
- **Protocol:** SRT (Caller mode)
- **Video:** H.264, CBR, 2-second keyframes
- **Audio:** AAC, 128kbps, 44.1kHz stereo
- **Latency:** 2000ms for stability

### Output (Facebook Live)
- **Protocol:** RTMPS over port 443/80
- **Video:** H.264 Main profile, CBR
- **Audio:** AAC, 128kbps, 44.1kHz stereo
- **Keyframes:** 2-second intervals

### Network Requirements
- **Minimum:** 4 Mbps upload for 720p30
- **Recommended:** 6+ Mbps upload for 1080p30
- **Stability:** Consistent connection for 8+ hours

## Support

- **Dashboard:** http://localhost:3000
- **Logs:** `stream-monitor.log`
- **Reports:** `tournament-report.json`
- **Tests:** `npm run test`

---

**Ready to broadcast your cricket tournament with professional reliability! 🏏📺**