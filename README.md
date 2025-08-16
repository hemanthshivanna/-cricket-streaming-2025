# 🏏 Cricket Tournament Live Streaming - Cloud Service

Professional live streaming system for cricket tournaments. Streams from OBSBOT Tail Air cameras to Facebook Live via cloud infrastructure.

## 🌐 Cloud Deployment

This system runs on cloud infrastructure for maximum reliability:

- ✅ **24/7 Uptime** - Never sleeps, always ready
- ✅ **Auto-reconnection** - Handles network drops gracefully  
- ✅ **Global CDN** - Better reach to viewers worldwide
- ✅ **Professional Infrastructure** - Enterprise-grade hosting
- ✅ **Real-time Monitoring** - Built-in health checks and dashboard

## 🚀 Quick Deploy

### Railway (Recommended)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/YOUR_USERNAME/cricket-streaming)

### Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## 📱 OBSBOT Configuration

Configure your OBSBOT Tail Air with these settings:

```
Protocol: SRT Caller
Host: your-app-name.railway.app
Port: 9999
Stream ID: cricket-tournament-2025
Passphrase: CricketLive2025!

Video: 720p30, 3000 kbps (cloud optimized)
Audio: AAC, 128 kbps, 44.1 kHz
```

## 📺 Facebook Live Setup

1. Go to Facebook Page → Publishing Tools → Live
2. Create Live Video → Use Stream Key  
3. Copy the **Persistent Stream Key**
4. Set as `FACEBOOK_STREAM_KEY` environment variable
5. Keep Facebook Live Producer page open during tournament

## 🔧 Environment Variables

Set these in your cloud platform dashboard:

```
FACEBOOK_STREAM_KEY=your_facebook_stream_key_here
STREAM_TITLE=Cricket Tournament 2025 - Live Coverage
NODE_ENV=production
```

## 📊 Monitoring

- **Dashboard:** https://your-app-name.railway.app
- **Health Check:** https://your-app-name.railway.app/health
- **Real-time Metrics:** WebSocket updates every 10 seconds

## 🏏 Tournament Ready

- **8+ Hour Streaming** - Designed for all-day tournaments
- **Mobile Optimized** - Works great with mobile hotspots
- **Automatic Quality** - Adapts to network conditions
- **Persistent Keys** - Viewers stay connected during network drops

## 💰 Cost

- **Railway:** $5/month (first month free)
- **Render:** Free tier + $7/month pro
- **Tournament Day:** ~$0.17 for 8 hours

## 🆘 Support

- **Real-time Dashboard:** Monitor stream health
- **Auto-reconnection:** Handles network issues
- **Emergency Backup:** Use Facebook Live mobile app

---

**Perfect for remote cricket tournaments with reliable, professional live streaming! 🏏📺**
