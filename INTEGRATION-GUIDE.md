# 🏏 OBSBOT Tail Air → Facebook Live Integration Guide

## Overview
This guide walks you through connecting your OBSBOT Tail Air camera to Facebook Live via our streaming server.

## System Architecture
```
OBSBOT Tail Air → SRT Stream → Local Server → RTMPS → Facebook Live
     (Camera)      (Mobile)     (This Mac)    (Internet)   (Viewers)
```

## Required Information

### Facebook Account Details
- **Facebook Page Name:** [NEEDED]
- **Facebook Page URL:** [NEEDED] 
- **Admin Access:** Do you have admin access to create live streams?

### OBSBOT Tail Air Details
- **Camera Model:** OBSBOT Tail Air (confirmed)
- **Mobile App:** OBSBOT app installed on which phone?
- **Network:** Will you use mobile hotspot or WiFi?

### Network Setup
- **Streaming Location:** Where will you stream from?
- **Internet Speed:** What's your upload speed? (test at speedtest.net)
- **Mobile Carrier:** Which carrier for hotspot?

## Step 1: Facebook Live Setup

### Get Your Stream Key
1. **Go to Facebook Page**
   - Navigate to your Facebook Page
   - Click "Publishing Tools" in left menu
   - Click "Live" section

2. **Create Live Stream**
   - Click "Create Live Video"
   - Select "Use Stream Key" option
   - **IMPORTANT:** Choose "Persistent Stream Key" 
   - Copy the stream key (starts with rtmp://)

3. **Stream Settings**
   - Title: "Cricket Tournament 2025 - Live Coverage"
   - Description: "All-day cricket tournament live from the field"
   - Privacy: Start with "Only Me" for testing
   - Category: Sports

### Facebook Live Producer Settings
- **Ingest URL:** rtmps://live-api-s.facebook.com:443/rtmp/
- **Stream Key:** [Your persistent key from above]
- **Protocol:** RTMPS (secure)
- **Keep Page Open:** Don't close during tournament!

## Step 2: Local Streaming Server Setup

### Server Location
The web service runs on **your Mac** at these addresses:
- **Dashboard:** http://localhost:3000
- **SRT Input:** srt://[YOUR_MAC_IP]:9999
- **Internal RTMP:** rtmp://localhost:1935

### Start the Server
```bash
# In the cricket-streaming-standalone folder:
./start-cricket-stream.sh
```

The server will:
1. Auto-detect your Mac's IP address
2. Ask for Facebook stream key
3. Show OBSBOT configuration settings
4. Start streaming services
5. Open monitoring dashboard

## Step 3: OBSBOT Tail Air Configuration

### In OBSBOT Mobile App

#### Connection Settings
- **Protocol:** SRT
- **Mode:** Caller (OBSBOT connects TO server)
- **Host:** [Your Mac IP - shown by server startup]
- **Port:** 9999
- **Stream ID:** cricket-tournament-2025
- **Passphrase:** CricketLive2025!

#### Video Settings
**For Good Connection (≥6 Mbps upload):**
- Resolution: 1920x1080
- Frame Rate: 30 fps
- Bitrate: 5000 kbps
- Codec: H.264
- Profile: High
- Rate Control: CBR (Constant Bitrate)
- Keyframe Interval: 2 seconds

**For Limited Bandwidth (<6 Mbps upload):**
- Resolution: 1280x720
- Frame Rate: 30 fps
- Bitrate: 3000 kbps
- Codec: H.264
- Profile: Main
- Rate Control: CBR
- Keyframe Interval: 2 seconds

#### Audio Settings
- Codec: AAC
- Bitrate: 128 kbps
- Sample Rate: 44.1 kHz
- Channels: Stereo (2)

### Network Connection
1. **Connect OBSBOT to Phone**
   - Open OBSBOT app
   - Connect to Tail Air camera via WiFi/Bluetooth
   
2. **Phone Internet Connection**
   - Use mobile hotspot OR
   - Connect phone to same WiFi as Mac
   
3. **Test Connection**
   - Phone must reach Mac IP address
   - Test: ping [MAC_IP] from phone

## Step 4: Testing Process

### Pre-Stream Test (5 minutes)
1. **Start Server**
   ```bash
   ./start-cricket-stream.sh
   ```
   
2. **Note the IP Address** shown by server

3. **Configure OBSBOT** with settings above

4. **Start OBSBOT Streaming**
   - In OBSBOT app: Start SRT stream
   - Check server dashboard: "OBSBOT Input: Connected"

5. **Verify Facebook Output**
   - Dashboard shows: "Facebook Output: Streaming Live"
   - Check Facebook Live Producer page

6. **Test Stream Quality**
   - Set Facebook privacy to "Only Me"
   - Stream for 2-3 minutes
   - Check video/audio quality
   - Monitor dropped frames

### Live Stream Test
1. **Change Privacy to Public**
2. **Announce Test Stream**
3. **Monitor Dashboard** at http://localhost:3000
4. **Check Stream Health:**
   - Input connection stable
   - Output bitrate consistent
   - No excessive dropped frames
   - Audio sync correct

## Step 5: Monitoring During Tournament

### Real-time Dashboard (http://localhost:3000)
- **Connection Status:** Green = good, Red = issues
- **Stream Metrics:** Bitrate, uptime, dropped frames
- **Controls:** Test mode, go live, stop stream

### Health Monitoring
```bash
# In separate terminal:
./monitor-stream.sh
```

Monitors:
- Network connectivity
- Bandwidth estimation
- Stream stability
- Auto-reconnection attempts
- Performance analytics

### Key Metrics to Watch
- **Dropped Frames:** Should be <100 for good quality
- **Bitrate:** Should be stable around target (3000 or 5000)
- **Uptime:** Tracks total streaming time
- **Reconnections:** Automatic recovery from network drops

## Troubleshooting

### OBSBOT Won't Connect
**Check:**
- Mac IP address correct in OBSBOT app
- Port 9999 not blocked by firewall
- Phone and Mac on same network/reachable
- OBSBOT app has latest version

**Fix:**
```bash
# Check Mac IP
ifconfig | grep inet
# Test port
telnet [MAC_IP] 9999
```

### Facebook Stream Issues
**Check:**
- Stream key copied correctly
- Facebook Live Producer page still open
- Internet connection stable
- RTMPS ports (443/80) not blocked

**Fix:**
- Try backup ingest URL (port 80)
- Regenerate stream key if needed
- Check Facebook Live status page

### Poor Quality/Buffering
**Check:**
- Upload speed: speedtest.net
- Mobile signal strength
- Network congestion

**Fix:**
- Reduce OBSBOT bitrate to 2000-3000 kbps
- Lower resolution to 720p
- Move closer to cell tower
- Switch to WiFi if available

### Stream Drops/Reconnects
**Automatic Recovery:**
- Server detects disconnection
- Attempts reconnection every 5 seconds
- Facebook persistent key maintains viewer session
- Stream resumes when connection restored

**Manual Recovery:**
- Restart OBSBOT streaming
- Check network connection
- Monitor dashboard for status

## Emergency Backup Plan

If complete system failure:
1. **Use Facebook Live Mobile App**
   - Stream directly from phone
   - Lower quality but maintains coverage
   - Use same Facebook Live session

2. **Alternative Setup**
   - Use OBS Studio on Mac
   - OBSBOT as webcam input
   - Stream via OBS to Facebook

## Security Notes

### Network Security
- SRT stream uses passphrase authentication
- RTMPS uses encrypted connection to Facebook
- Local dashboard only accessible on Mac

### Facebook Security
- Use persistent stream key (doesn't expire)
- Don't share stream key publicly
- Monitor Facebook Live Producer for unauthorized access

## Performance Optimization

### For 8+ Hour Tournament
- **Power Management:** Keep Mac plugged in
- **Network Stability:** Use wired connection if possible
- **Cooling:** Ensure Mac ventilation for long streaming
- **Backup Power:** UPS for network equipment

### Quality vs Stability
- **Priority:** Stability over maximum resolution
- **Adaptive:** System automatically adjusts quality
- **Conservative:** Better to stream 720p reliably than drop 1080p

---

## Ready to Test!

Please provide:
1. **Facebook Page details** (name, URL, admin access)
2. **Network setup** (WiFi/hotspot, upload speed)
3. **OBSBOT app status** (installed, camera connected)

Then we can run through the complete integration test!