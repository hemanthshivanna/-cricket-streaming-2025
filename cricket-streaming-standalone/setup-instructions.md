# Cricket Tournament Live Streaming - Setup Instructions

## Quick Start Checklist

### 1. Server Setup (5 minutes)
```bash
# Install dependencies
npm install

# Set your Facebook stream key
export FACEBOOK_STREAM_KEY="your_persistent_stream_key_here"

# Start the streaming server
npm start
```

### 2. OBSBOT Tail Air Configuration (3 minutes)

**In OBSBOT App:**
1. Connect camera to phone hotspot
2. Open OBSBOT app → Settings → Streaming
3. Select "SRT" protocol
4. Configure these exact settings:

```
Mode: Caller
Host: [YOUR_SERVER_IP]  # Get this from your computer's network settings
Port: 9999
Stream ID: cricket-tournament-2025
Passphrase: CricketLive2025!
```

**Video Quality Settings:**
- **If upload speed ≥ 6 Mbps:** 1080p30, 5000 Kbps
- **If upload speed < 6 Mbps:** 720p30, 3000 Kbps

**Audio Settings:**
- Codec: AAC
- Bitrate: 128 Kbps  
- Sample Rate: 44.1 KHz

### 3. Facebook Live Setup (2 minutes)

1. Go to your Facebook Page
2. Click "Publishing Tools" → "Live"
3. Click "Create Live Video"
4. Select "Use Stream Key"
5. Copy the **Persistent Stream Key**
6. Set stream details:
   - **Title:** "Cricket Tournament 2025 - Live Coverage"
   - **Description:** "All-day cricket tournament live from the field"
   - **Privacy:** "Only Me" (for testing) → "Public" (when ready)

### 4. Pre-Stream Testing (5 minutes)

1. Start streaming server: `npm start`
2. Open dashboard: http://localhost:3000
3. Configure OBSBOT with server IP and start streaming
4. Verify "OBSBOT Input: Connected" shows green
5. Check "Facebook Output: Streaming Live" shows green
6. Test with "Only Me" privacy first
7. Monitor for 2-3 minutes to ensure stability

### 5. Going Live (1 minute)

1. In Facebook Live Producer, change privacy to "Public"
2. Click "Go Live" button
3. Monitor dashboard for stream health
4. Tournament is now broadcasting live!

## Troubleshooting

### OBSBOT Won't Connect
- Check server IP address is correct
- Ensure port 9999 is not blocked by firewall
- Verify hotspot has internet connectivity
- Try restarting OBSBOT app

### Facebook Stream Issues  
- Verify stream key is correct and persistent
- Check Facebook Live Producer page is still open
- Ensure RTMPS port 443 is not blocked
- Try backup ingest URL (port 80)

### Poor Stream Quality
- Run bandwidth test: `npm run monitor`
- Reduce video quality in OBSBOT app
- Check mobile signal strength
- Move closer to cell tower if possible

### Stream Drops/Reconnects
- Monitor shows automatic reconnection attempts
- Check mobile hotspot battery level
- Verify data plan has sufficient allowance
- Consider backup internet connection

## Monitoring Commands

```bash
# View real-time stream health
npm run monitor

# Check stream statistics
curl http://localhost:3000/api/health

# View dashboard
open http://localhost:3000
```

## Emergency Procedures

### If Stream Drops:
1. Check OBSBOT app - restart streaming if needed
2. Dashboard will show reconnection attempts
3. Facebook Live page stays active with persistent key
4. Stream resumes automatically when connection restored

### If Quality Degrades:
1. Lower OBSBOT video quality immediately
2. Check mobile signal strength
3. Reduce bitrate in real-time via dashboard
4. Consider switching to backup connection

### If Complete Failure:
1. Have backup phone with mobile data ready
2. Use Facebook Live mobile app as emergency backup
3. Switch to lower quality but maintain coverage
4. Document issues for post-tournament analysis

## Post-Tournament

After the tournament ends:
1. Stop streaming in OBSBOT app
2. End Facebook Live stream
3. Check `tournament-report.json` for detailed analytics
4. Review `stream-monitor.log` for any issues
5. Save stream recording from Facebook for highlights

## Support Contacts

- **Technical Issues:** Check dashboard at http://localhost:3000
- **Facebook Live:** Facebook Creator Studio support
- **OBSBOT Support:** OBSBOT app help section
- **Network Issues:** Mobile carrier technical support

---

**Remember:** The persistent stream key allows quick reconnection without losing viewers if the network drops. Keep the Facebook Live Producer page open throughout the entire tournament!