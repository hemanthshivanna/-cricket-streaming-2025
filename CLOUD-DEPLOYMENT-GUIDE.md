# 🌐 Cloud Deployment Guide - Cricket Tournament Streaming

## Quick Cloud Setup (5 minutes)

### Option 1: Railway (Recommended - Easiest)

#### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (recommended) or email
3. Verify your account

#### Step 2: Deploy from GitHub
1. **Fork this repository** to your GitHub account
2. In Railway dashboard, click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your forked repository
5. Railway will auto-deploy in ~2 minutes

#### Step 3: Configure Environment Variables
In Railway dashboard → Your Project → Variables tab, add:

```
FACEBOOK_STREAM_KEY=your_facebook_stream_key_here
STREAM_TITLE=Cricket Tournament 2025 - Live Coverage
NODE_ENV=production
```

#### Step 4: Get Your Cloud URLs
Railway will provide:
- **Dashboard URL:** `https://your-app-name.railway.app`
- **SRT Endpoint:** `srt://your-app-name.railway.app:9999?streamid=cricket-tournament-2025`

### Option 2: Render (Great Alternative)

#### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Verify your account

#### Step 2: Deploy Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** cricket-streaming
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start:cloud`

#### Step 3: Set Environment Variables
In Render dashboard → Environment tab:
```
FACEBOOK_STREAM_KEY=your_facebook_stream_key_here
STREAM_TITLE=Cricket Tournament 2025 - Live Coverage
NODE_ENV=production
```

## Facebook Live Setup

### Get Your Stream Key
1. **Go to Facebook Page** → Publishing Tools → Live
2. **Create Live Video** → Use Stream Key
3. **Copy Persistent Stream Key** (starts with rtmp://)
4. **Set Privacy to "Only Me"** for testing
5. **Keep this page open** during tournament

### Facebook Configuration
- **Ingest URL:** rtmps://live-api-s.facebook.com:443/rtmp/
- **Protocol:** RTMPS (secure)
- **Stream Key:** [Your persistent key from above]

## OBSBOT Tail Air Configuration

### Cloud SRT Settings
Configure in OBSBOT app → Settings → Streaming:

```
Protocol: SRT Caller
Host: your-app-name.railway.app (or render URL)
Port: 9999
Stream ID: cricket-tournament-2025
Passphrase: CricketLive2025!
```

### Video Settings (Cloud Optimized)
```
Resolution: 1280x720 (720p for stability)
Frame Rate: 30 fps
Bitrate: 3000 kbps (conservative for cloud)
Codec: H.264
Profile: Main
Rate Control: CBR
Keyframe Interval: 2 seconds
```

### Audio Settings
```
Codec: AAC
Bitrate: 128 kbps
Sample Rate: 44.1 kHz
Channels: Stereo
```

## Testing Your Cloud Setup

### Step 1: Verify Deployment
1. Visit your cloud dashboard URL
2. Should show "Cloud Cricket Streaming Server"
3. Check server status shows "Online (Cloud Hosted)"

### Step 2: Test OBSBOT Connection
1. Configure OBSBOT with cloud settings above
2. Start streaming from OBSBOT app
3. Dashboard should show "OBSBOT Input: Connected"

### Step 3: Test Facebook Output
1. Ensure Facebook stream key is set
2. Dashboard should show "Facebook Output: Streaming Live"
3. Check Facebook Live Producer page

### Step 4: Quality Test
1. Set Facebook privacy to "Only Me"
2. Stream for 2-3 minutes
3. Monitor metrics on dashboard
4. Check video/audio quality

## Cloud Advantages

### 24/7 Reliability
- ✅ **Never sleeps** - Always ready for connections
- ✅ **Auto-restart** - Recovers from any issues
- ✅ **Global CDN** - Better reach to viewers worldwide
- ✅ **Professional infrastructure** - Enterprise-grade hosting

### Monitoring & Health
- ✅ **Built-in health checks** - Platform monitors service
- ✅ **Real-time dashboard** - Live metrics and status
- ✅ **Automatic scaling** - Handles high viewer counts
- ✅ **Detailed logging** - Full visibility into operations

### Network Optimization
- ✅ **Dedicated bandwidth** - No competition with other apps
- ✅ **Multiple data centers** - Redundancy and speed
- ✅ **Auto-reconnection** - Handles network drops gracefully
- ✅ **Optimized routing** - Best path to Facebook servers

## Cost Breakdown

### Railway
- **Free Tier:** $5 credit (covers ~1 month)
- **Pro Plan:** $5/month after credit
- **Tournament Cost:** ~$0.17 for 8-hour event

### Render
- **Free Tier:** 750 hours/month (sufficient for testing)
- **Starter Plan:** $7/month for guaranteed uptime
- **No usage limits** on starter plan

## Troubleshooting

### OBSBOT Won't Connect to Cloud
**Check:**
- Cloud service is running (visit dashboard URL)
- OBSBOT host setting matches your cloud URL
- Port 9999 is configured correctly
- Internet connection on mobile device

**Fix:**
```bash
# Test connection from phone/computer
telnet your-app-name.railway.app 9999
```

### Facebook Stream Issues
**Check:**
- Stream key is set in cloud environment variables
- Facebook Live Producer page is still open
- Cloud service shows "Facebook Output: Streaming Live"

**Fix:**
- Restart cloud service from platform dashboard
- Regenerate Facebook stream key if needed
- Check cloud service logs for errors

### Poor Stream Quality
**Cloud automatically optimizes for:**
- 720p resolution for stability
- 3000 kbps bitrate (conservative)
- Auto-reconnection on drops
- Adaptive quality based on connection

### Service Down/Unreachable
**Railway/Render provide:**
- Automatic restarts on failure
- Health check monitoring
- Platform status pages
- Support channels

## Going Live for Tournament

### Pre-Tournament (30 minutes before)
1. **Verify cloud service** is running
2. **Test OBSBOT connection** with cloud
3. **Confirm Facebook stream** with "Only Me" privacy
4. **Check all metrics** on dashboard
5. **Have backup plan** ready (mobile app)

### During Tournament
1. **Monitor cloud dashboard** regularly
2. **Check Facebook Live Producer** page
3. **Watch for reconnection** messages
4. **Switch to public** when ready to go live

### Emergency Backup
If cloud service fails:
1. **Use Facebook Live mobile app** directly
2. **Stream from phone** as backup
3. **Lower quality** but maintain coverage
4. **Restart cloud service** from platform

## Support & Monitoring

### Cloud Platform Support
- **Railway:** [railway.app/help](https://railway.app/help)
- **Render:** [render.com/docs](https://render.com/docs)
- **Platform status pages** for outage information

### Real-time Monitoring
- **Dashboard:** Your cloud URL (bookmark this!)
- **Health endpoint:** `/health` for status checks
- **Logs:** Available in platform dashboard

### Key Metrics to Watch
- **Server Uptime:** Should be continuous
- **Input Connection:** Green when OBSBOT connected
- **Output Connection:** Green when streaming to Facebook
- **Bitrate:** Should be stable around 3000 kbps
- **Dropped Frames:** Should be minimal (<100)

---

## Ready to Deploy!

**Choose your platform:**
1. **Railway** (easiest): Fork repo → Deploy → Set env vars
2. **Render** (alternative): Connect repo → Configure → Deploy

**Your cloud streaming server will be:**
- ✅ Always online and ready
- ✅ Automatically configured
- ✅ Monitored and self-healing
- ✅ Perfect for your cricket tournament

**Need help with setup? Let me know which platform you prefer and I'll walk you through it step by step!**