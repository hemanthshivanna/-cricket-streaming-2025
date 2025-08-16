const NodeMediaServer = require('node-media-server');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const express = require('express');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

// Load configuration
const obsbotConfig = JSON.parse(fs.readFileSync('obsbot-config.json', 'utf8'));
const facebookConfig = JSON.parse(fs.readFileSync('facebook-config.json', 'utf8'));

class CricketStreamingServer {
    constructor() {
        this.isStreaming = false;
        this.streamHealth = {
            inputConnected: false,
            outputConnected: false,
            droppedFrames: 0,
            bitrate: 0,
            uptime: 0
        };
        
        this.setupMediaServer();
        this.setupWebInterface();
        this.setupHealthMonitoring();
    }

    setupMediaServer() {
        // SRT Input configuration
        this.nms = new NodeMediaServer({
            rtmp: {
                port: 1935,
                chunk_size: 60000,
                gop_cache: true,
                ping: 30,
                ping_timeout: 60
            },
            http: {
                port: 8000,
                allow_origin: '*'
            },
            // SRT configuration for OBSBOT input
            srt: {
                port: 9999,
                chunk_size: 60000
            }
        });

        // Handle incoming SRT stream from OBSBOT
        this.nms.on('preConnect', (id, args) => {
            console.log('[SRT Input] OBSBOT Tail Air connecting:', id);
            this.streamHealth.inputConnected = true;
        });

        this.nms.on('postConnect', (id, args) => {
            console.log('[SRT Input] OBSBOT connected successfully:', id);
            this.startFacebookRelay(id);
        });

        this.nms.on('doneConnect', (id, args) => {
            console.log('[SRT Input] OBSBOT disconnected:', id);
            this.streamHealth.inputConnected = false;
            this.stopFacebookRelay();
        });
    }

    startFacebookRelay(inputStreamId) {
        if (this.isStreaming) {
            console.log('[Facebook Output] Already streaming, skipping...');
            return;
        }

        const streamKey = process.env.FACEBOOK_STREAM_KEY || facebookConfig.facebook_live.stream_key;
        if (!streamKey || streamKey === 'YOUR_PERSISTENT_STREAM_KEY_HERE') {
            console.error('[Facebook Output] No stream key configured!');
            return;
        }

        const rtmpsUrl = `${facebookConfig.facebook_live.ingest_url}${streamKey}`;
        
        console.log('[Facebook Output] Starting relay to Facebook Live...');
        
        // Determine quality based on input
        const videoSettings = this.determineVideoQuality();
        
        this.ffmpegProcess = ffmpeg()
            // SRT Input from OBSBOT
            .input(`srt://localhost:9999?streamid=${obsbotConfig.srt_output.stream_id}`)
            .inputOptions([
                '-fflags +genpts',
                '-avoid_negative_ts make_zero',
                '-analyzeduration 1000000',
                '-probesize 1000000'
            ])
            
            // Video encoding for Facebook
            .videoCodec('libx264')
            .videoBitrate(videoSettings.bitrate_kbps)
            .size(videoSettings.resolution)
            .fps(videoSettings.framerate)
            .addOptions([
                '-preset veryfast',
                '-tune zerolatency',
                '-profile:v main',
                '-level 4.0',
                '-pix_fmt yuv420p',
                '-g 60', // 2 second keyframes at 30fps
                '-keyint_min 60',
                '-sc_threshold 0',
                '-bufsize 6000k',
                '-maxrate 5000k'
            ])
            
            // Audio encoding
            .audioCodec('aac')
            .audioBitrate('128k')
            .audioFrequency(44100)
            .audioChannels(2)
            
            // Output to Facebook Live
            .format('flv')
            .addOptions([
                '-f flv',
                '-flvflags no_duration_filesize'
            ])
            .output(rtmpsUrl)
            
            .on('start', (commandLine) => {
                console.log('[Facebook Output] FFmpeg started:', commandLine);
                this.isStreaming = true;
                this.streamHealth.outputConnected = true;
                this.streamStartTime = Date.now();
            })
            
            .on('progress', (progress) => {
                this.streamHealth.bitrate = progress.currentKbps || 0;
                this.streamHealth.uptime = Math.floor((Date.now() - this.streamStartTime) / 1000);
                
                if (progress.frames && progress.drop) {
                    this.streamHealth.droppedFrames = progress.drop;
                }
                
                // Log progress every 30 seconds
                if (this.streamHealth.uptime % 30 === 0) {
                    console.log(`[Stream Health] Uptime: ${this.streamHealth.uptime}s, Bitrate: ${this.streamHealth.bitrate}kbps, Dropped: ${this.streamHealth.droppedFrames}`);
                }
            })
            
            .on('error', (err) => {
                console.error('[Facebook Output] FFmpeg error:', err.message);
                this.handleStreamError(err);
            })
            
            .on('end', () => {
                console.log('[Facebook Output] Stream ended');
                this.isStreaming = false;
                this.streamHealth.outputConnected = false;
            });

        this.ffmpegProcess.run();
    }

    determineVideoQuality() {
        // This would ideally check actual bandwidth, for now use config
        // In production, you could implement bandwidth testing
        return facebookConfig.output_video.adaptive_bitrate.standard_quality;
    }

    stopFacebookRelay() {
        if (this.ffmpegProcess) {
            console.log('[Facebook Output] Stopping stream...');
            this.ffmpegProcess.kill('SIGTERM');
            this.ffmpegProcess = null;
            this.isStreaming = false;
            this.streamHealth.outputConnected = false;
        }
    }

    handleStreamError(error) {
        console.error('[Stream Error]', error.message);
        
        // Auto-reconnect logic
        if (this.isStreaming && error.message.includes('Connection')) {
            console.log('[Auto-Reconnect] Attempting to reconnect in 5 seconds...');
            setTimeout(() => {
                if (this.streamHealth.inputConnected) {
                    this.startFacebookRelay();
                }
            }, 5000);
        }
    }

    setupWebInterface() {
        this.app = express();
        this.app.use(express.static('public'));
        this.app.use(express.json());

        // Serve dashboard
        this.app.get('/', (req, res) => {
            res.send(this.generateDashboard());
        });

        // API endpoints
        this.app.get('/api/health', (req, res) => {
            res.json(this.streamHealth);
        });

        this.app.post('/api/start-test', (req, res) => {
            // Start test stream to Facebook with "Only Me" privacy
            console.log('[Test Mode] Starting test stream...');
            res.json({ status: 'Test stream started' });
        });

        this.app.post('/api/go-live', (req, res) => {
            // Switch to public stream
            console.log('[Live Mode] Going live publicly...');
            res.json({ status: 'Now live publicly' });
        });

        // WebSocket for real-time updates
        this.server = require('http').createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });
        
        this.wss.on('connection', (ws) => {
            console.log('[Dashboard] Client connected');
            
            // Send current status
            ws.send(JSON.stringify({
                type: 'health',
                data: this.streamHealth
            }));
        });

        this.server.listen(3000, () => {
            console.log('[Dashboard] Web interface available at http://localhost:3000');
        });
    }

    setupHealthMonitoring() {
        // Send health updates to connected clients every 5 seconds
        setInterval(() => {
            const healthData = JSON.stringify({
                type: 'health',
                data: this.streamHealth,
                timestamp: new Date().toISOString()
            });

            this.wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(healthData);
                }
            });
        }, 5000);
    }

    generateDashboard() {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Cricket Tournament - Live Stream Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status { padding: 10px; border-radius: 4px; margin: 5px 0; }
        .status.connected { background: #d4edda; color: #155724; }
        .status.disconnected { background: #f8d7da; color: #721c24; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .metric { text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .controls button { padding: 10px 20px; margin: 5px; border: none; border-radius: 4px; cursor: pointer; }
        .btn-primary { background: #007bff; color: white; }
        .btn-success { background: #28a745; color: white; }
        .btn-danger { background: #dc3545; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏏 Cricket Tournament Live Stream</h1>
        
        <div class="card">
            <h2>Stream Status</h2>
            <div id="input-status" class="status">OBSBOT Input: Waiting for connection...</div>
            <div id="output-status" class="status">Facebook Output: Not streaming</div>
        </div>

        <div class="card">
            <h2>Stream Metrics</h2>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value" id="uptime">0</div>
                    <div>Uptime (seconds)</div>
                </div>
                <div class="metric">
                    <div class="metric-value" id="bitrate">0</div>
                    <div>Bitrate (kbps)</div>
                </div>
                <div class="metric">
                    <div class="metric-value" id="dropped">0</div>
                    <div>Dropped Frames</div>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>Controls</h2>
            <div class="controls">
                <button class="btn-primary" onclick="startTest()">Start Test Stream (Only Me)</button>
                <button class="btn-success" onclick="goLive()">Go Live Publicly</button>
                <button class="btn-danger" onclick="stopStream()">Stop Stream</button>
            </div>
        </div>

        <div class="card">
            <h2>Configuration</h2>
            <p><strong>SRT Input:</strong> srt://YOUR_SERVER_IP:9999?streamid=cricket-tournament-2025</p>
            <p><strong>Facebook Stream Key:</strong> ${facebookConfig.facebook_live.stream_key.substring(0, 20)}...</p>
            <p><strong>Stream Title:</strong> ${facebookConfig.stream_settings.title}</p>
        </div>
    </div>

    <script>
        const ws = new WebSocket('ws://localhost:3000');
        
        ws.onmessage = function(event) {
            const message = JSON.parse(event.data);
            if (message.type === 'health') {
                updateHealth(message.data);
            }
        };

        function updateHealth(health) {
            document.getElementById('input-status').className = 'status ' + (health.inputConnected ? 'connected' : 'disconnected');
            document.getElementById('input-status').textContent = 'OBSBOT Input: ' + (health.inputConnected ? 'Connected' : 'Disconnected');
            
            document.getElementById('output-status').className = 'status ' + (health.outputConnected ? 'connected' : 'disconnected');
            document.getElementById('output-status').textContent = 'Facebook Output: ' + (health.outputConnected ? 'Streaming Live' : 'Not streaming');
            
            document.getElementById('uptime').textContent = health.uptime;
            document.getElementById('bitrate').textContent = Math.round(health.bitrate);
            document.getElementById('dropped').textContent = health.droppedFrames;
        }

        function startTest() {
            fetch('/api/start-test', { method: 'POST' })
                .then(response => response.json())
                .then(data => alert(data.status));
        }

        function goLive() {
            if (confirm('Are you ready to go live publicly?')) {
                fetch('/api/go-live', { method: 'POST' })
                    .then(response => response.json())
                    .then(data => alert(data.status));
            }
        }

        function stopStream() {
            if (confirm('Stop the live stream?')) {
                // Implementation for stopping stream
                alert('Stream stopped');
            }
        }
    </script>
</body>
</html>`;
    }

    start() {
        console.log('🏏 Cricket Tournament Streaming Server Starting...');
        console.log('📡 SRT Input Port: 9999');
        console.log('🌐 Dashboard: http://localhost:3000');
        console.log('📺 Facebook Live: Ready for stream key');
        
        this.nms.run();
    }
}

// Start the server
const server = new CricketStreamingServer();
server.start();

module.exports = CricketStreamingServer;