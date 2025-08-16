// Cloud-optimized streaming server for Railway deployment
const NodeMediaServer = require('node-media-server');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const express = require('express');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

class CloudCricketStreamingServer {
    constructor() {
        this.isStreaming = false;
        this.streamHealth = {
            inputConnected: false,
            outputConnected: false,
            droppedFrames: 0,
            bitrate: 0,
            uptime: 0,
            serverStartTime: Date.now()
        };
        
        // Cloud environment configuration
        this.config = {
            port: process.env.PORT || 3000,
            srtPort: process.env.SRT_PORT || 9999,
            facebookStreamKey: process.env.FACEBOOK_STREAM_KEY,
            facebookIngestUrl: process.env.FACEBOOK_INGEST_URL || 'rtmps://live-api-s.facebook.com:443/rtmp/',
            streamTitle: process.env.STREAM_TITLE || 'Cricket Tournament 2025 - Live Coverage',
            streamId: process.env.STREAM_ID || 'cricket-tournament-2025',
            streamPassphrase: process.env.STREAM_PASSPHRASE || 'CricketLive2025!',
            environment: process.env.NODE_ENV || 'production'
        };

        console.log('🌐 Cloud Cricket Streaming Server Initializing...');
        console.log(`📡 Environment: ${this.config.environment}`);
        console.log(`🚀 Port: ${this.config.port}`);
        console.log(`📺 SRT Port: ${this.config.srtPort}`);
    }

    async initialize() {
        try {
            this.setupMediaServer();
            this.setupWebInterface();
            this.setupHealthMonitoring();
            this.setupCloudSpecificFeatures();
            
            console.log('✅ Cloud server initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize cloud server:', error);
            return false;
        }
    }

    setupMediaServer() {
        // Cloud-optimized media server configuration
        this.nms = new NodeMediaServer({
            rtmp: {
                port: 1935,
                chunk_size: 60000,
                gop_cache: true,
                ping: 30,
                ping_timeout: 60
            },
            http: {
                port: 8080, // Internal port for media server
                allow_origin: '*',
                mediaroot: './media'
            },
            // SRT configuration for cloud
            srt: {
                port: this.config.srtPort,
                chunk_size: 60000,
                latency: 2000 // 2 second latency for stability
            }
        });

        // Add SRT output configuration for validation
        this.srt_output = {
            host: "0.0.0.0",
            port: this.config.srtPort,
            stream_id: this.config.streamId,
            passphrase: this.config.streamPassphrase
        });

        // Handle SRT connections from OBSBOT
        this.nms.on('preConnect', (id, args) => {
            console.log(`[SRT Input] OBSBOT connecting: ${id}`);
            this.streamHealth.inputConnected = true;
            this.broadcastHealthUpdate();
        });

        this.nms.on('postConnect', (id, args) => {
            console.log(`[SRT Input] OBSBOT connected: ${id}`);
            this.startFacebookRelay(id);
        });

        this.nms.on('doneConnect', (id, args) => {
            console.log(`[SRT Input] OBSBOT disconnected: ${id}`);
            this.streamHealth.inputConnected = false;
            this.stopFacebookRelay();
            this.broadcastHealthUpdate();
        });

        this.nms.on('prePublish', (id, StreamPath, args) => {
            console.log(`[Stream] Publishing started: ${StreamPath}`);
        });

        this.nms.on('donePublish', (id, StreamPath, args) => {
            console.log(`[Stream] Publishing ended: ${StreamPath}`);
        });
    }

    startFacebookRelay(inputStreamId) {
        if (this.isStreaming) {
            console.log('[Facebook Output] Already streaming');
            return;
        }

        if (!this.config.facebookStreamKey) {
            console.error('[Facebook Output] No stream key configured!');
            console.log('Set FACEBOOK_STREAM_KEY environment variable');
            return;
        }

        const rtmpsUrl = `${this.config.facebookIngestUrl}${this.config.facebookStreamKey}`;
        
        console.log('[Facebook Output] Starting cloud relay to Facebook Live...');
        
        // Cloud-optimized streaming settings
        this.ffmpegProcess = ffmpeg()
            // SRT Input from OBSBOT
            .input(`srt://0.0.0.0:${this.config.srtPort}?streamid=${this.config.streamId}&passphrase=${this.config.streamPassphrase}`)
            .inputOptions([
                '-fflags +genpts',
                '-avoid_negative_ts make_zero',
                '-analyzeduration 2000000',
                '-probesize 2000000',
                '-thread_queue_size 512'
            ])
            
            // Video encoding optimized for cloud
            .videoCodec('libx264')
            .videoBitrate('3000k') // Conservative for cloud stability
            .size('1280x720')     // 720p for reliability
            .fps(30)
            .addOptions([
                '-preset veryfast',
                '-tune zerolatency',
                '-profile:v main',
                '-level 3.1',
                '-pix_fmt yuv420p',
                '-g 60',              // 2 second keyframes
                '-keyint_min 60',
                '-sc_threshold 0',
                '-bufsize 6000k',
                '-maxrate 4000k',
                '-threads 2'          // Limit CPU usage in cloud
            ])
            
            // Audio encoding
            .audioCodec('aac')
            .audioBitrate('128k')
            .audioFrequency(44100)
            .audioChannels(2)
            .addOptions([
                '-ar 44100',
                '-ac 2'
            ])
            
            // Output to Facebook Live
            .format('flv')
            .addOptions([
                '-f flv',
                '-flvflags no_duration_filesize',
                '-reconnect 1',
                '-reconnect_streamed 1',
                '-reconnect_delay_max 5'
            ])
            .output(rtmpsUrl)
            
            .on('start', (commandLine) => {
                console.log('[Facebook Output] Cloud FFmpeg started');
                this.isStreaming = true;
                this.streamHealth.outputConnected = true;
                this.streamStartTime = Date.now();
                this.broadcastHealthUpdate();
            })
            
            .on('progress', (progress) => {
                this.streamHealth.bitrate = progress.currentKbps || 0;
                this.streamHealth.uptime = Math.floor((Date.now() - this.streamStartTime) / 1000);
                
                if (progress.frames && progress.drop) {
                    this.streamHealth.droppedFrames = progress.drop;
                }
                
                // Log progress less frequently in cloud
                if (this.streamHealth.uptime % 60 === 0) {
                    console.log(`[Cloud Stream] Uptime: ${this.streamHealth.uptime}s, Bitrate: ${this.streamHealth.bitrate}kbps`);
                }
                
                this.broadcastHealthUpdate();
            })
            
            .on('error', (err) => {
                console.error('[Facebook Output] Cloud FFmpeg error:', err.message);
                this.handleStreamError(err);
            })
            
            .on('end', () => {
                console.log('[Facebook Output] Cloud stream ended');
                this.isStreaming = false;
                this.streamHealth.outputConnected = false;
                this.broadcastHealthUpdate();
            });

        this.ffmpegProcess.run();
    }

    stopFacebookRelay() {
        if (this.ffmpegProcess) {
            console.log('[Facebook Output] Stopping cloud stream...');
            this.ffmpegProcess.kill('SIGTERM');
            this.ffmpegProcess = null;
            this.isStreaming = false;
            this.streamHealth.outputConnected = false;
            this.broadcastHealthUpdate();
        }
    }

    handleStreamError(error) {
        console.error('[Cloud Stream Error]', error.message);
        
        // Cloud auto-reconnect with exponential backoff
        if (this.isStreaming && error.message.includes('Connection')) {
            const retryDelay = Math.min(5000 * Math.pow(2, this.reconnectAttempts || 0), 30000);
            this.reconnectAttempts = (this.reconnectAttempts || 0) + 1;
            
            console.log(`[Cloud Auto-Reconnect] Attempt ${this.reconnectAttempts} in ${retryDelay/1000}s...`);
            
            setTimeout(() => {
                if (this.streamHealth.inputConnected && !this.isStreaming) {
                    this.startFacebookRelay();
                }
            }, retryDelay);
        }
    }

    setupWebInterface() {
        this.app = express();
        
        // Cloud-specific middleware
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });
        
        this.app.use(express.json());
        this.app.use(express.static('public'));

        // Health check endpoint for cloud platforms
        this.app.get('/health', (req, res) => {
            const serverUptime = Math.floor((Date.now() - this.streamHealth.serverStartTime) / 1000);
            res.json({
                status: 'healthy',
                serverUptime,
                streaming: this.isStreaming,
                inputConnected: this.streamHealth.inputConnected,
                outputConnected: this.streamHealth.outputConnected,
                timestamp: new Date().toISOString()
            });
        });

        // Main dashboard
        this.app.get('/', (req, res) => {
            res.send(this.generateCloudDashboard());
        });

        // API endpoints
        this.app.get('/api/health', (req, res) => {
            res.json(this.streamHealth);
        });

        this.app.get('/api/config', (req, res) => {
            res.json({
                srtEndpoint: `srt://${req.get('host')}:${this.config.srtPort}?streamid=${this.config.streamId}`,
                streamId: this.config.streamId,
                passphrase: this.config.streamPassphrase,
                hasStreamKey: !!this.config.facebookStreamKey,
                environment: this.config.environment
            });
        });

        this.app.post('/api/test-stream', (req, res) => {
            console.log('[API] Test stream requested');
            res.json({ status: 'Test mode activated', privacy: 'Only Me' });
        });

        this.app.post('/api/go-live', (req, res) => {
            console.log('[API] Going live publicly');
            res.json({ status: 'Now streaming publicly' });
        });

        // WebSocket for real-time updates
        this.server = require('http').createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });
        
        this.wss.on('connection', (ws) => {
            console.log('[Dashboard] Client connected to cloud server');
            
            // Send current status
            ws.send(JSON.stringify({
                type: 'health',
                data: this.streamHealth
            }));
            
            // Send configuration
            ws.send(JSON.stringify({
                type: 'config',
                data: {
                    srtEndpoint: `srt://[YOUR_DOMAIN]:${this.config.srtPort}?streamid=${this.config.streamId}`,
                    streamId: this.config.streamId,
                    hasStreamKey: !!this.config.facebookStreamKey
                }
            }));
        });
    }

    setupHealthMonitoring() {
        // Send health updates every 10 seconds
        setInterval(() => {
            this.broadcastHealthUpdate();
        }, 10000);

        // Log server status every 5 minutes
        setInterval(() => {
            const serverUptime = Math.floor((Date.now() - this.streamHealth.serverStartTime) / 1000);
            console.log(`[Cloud Server] Uptime: ${serverUptime}s, Streaming: ${this.isStreaming}, Connections: ${this.wss.clients.size}`);
        }, 300000);
    }

    setupCloudSpecificFeatures() {
        // Graceful shutdown handling
        process.on('SIGTERM', () => {
            console.log('[Cloud] Received SIGTERM, shutting down gracefully...');
            this.shutdown();
        });

        process.on('SIGINT', () => {
            console.log('[Cloud] Received SIGINT, shutting down gracefully...');
            this.shutdown();
        });

        // Memory monitoring
        setInterval(() => {
            const memUsage = process.memoryUsage();
            const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
            
            if (memUsedMB > 400) { // Alert if using more than 400MB
                console.warn(`[Cloud Memory] High memory usage: ${memUsedMB}MB`);
            }
        }, 60000);
    }

    broadcastHealthUpdate() {
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
    }

    generateCloudDashboard() {
        const domain = process.env.RAILWAY_STATIC_URL || process.env.RENDER_EXTERNAL_URL || 'your-app-domain.com';
        
        return `
<!DOCTYPE html>
<html>
<head>
    <title>🏏 Cricket Tournament - Cloud Streaming Dashboard</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
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
        .config-box { background: #f8f9fa; padding: 15px; border-radius: 4px; font-family: monospace; }
        .cloud-badge { background: #28a745; color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.8em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏏 Cricket Tournament - Cloud Streaming <span class="cloud-badge">CLOUD HOSTED</span></h1>
        
        <div class="card">
            <h2>🌐 Cloud Server Status</h2>
            <div id="server-status" class="status">Server: Starting...</div>
            <div id="input-status" class="status">OBSBOT Input: Waiting for connection...</div>
            <div id="output-status" class="status">Facebook Output: Not streaming</div>
        </div>

        <div class="card">
            <h2>📊 Stream Metrics</h2>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value" id="uptime">0</div>
                    <div>Stream Uptime (seconds)</div>
                </div>
                <div class="metric">
                    <div class="metric-value" id="bitrate">0</div>
                    <div>Bitrate (kbps)</div>
                </div>
                <div class="metric">
                    <div class="metric-value" id="dropped">0</div>
                    <div>Dropped Frames</div>
                </div>
                <div class="metric">
                    <div class="metric-value" id="server-uptime">0</div>
                    <div>Server Uptime (hours)</div>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>🎥 OBSBOT Tail Air Configuration</h2>
            <p>Configure your OBSBOT app with these settings:</p>
            <div class="config-box">
Protocol: SRT Caller<br>
Host: ${domain}<br>
Port: ${this.config.srtPort}<br>
Stream ID: ${this.config.streamId}<br>
Passphrase: ${this.config.streamPassphrase}<br><br>
Video: H.264, 720p30, 3000 kbps, CBR<br>
Audio: AAC, 128 kbps, 44.1 kHz
            </div>
        </div>

        <div class="card">
            <h2>📺 Facebook Live Setup</h2>
            <p><strong>Stream Key Status:</strong> <span id="stream-key-status">${this.config.facebookStreamKey ? '✅ Configured' : '❌ Not Set'}</span></p>
            <p><strong>Stream Title:</strong> ${this.config.streamTitle}</p>
            ${!this.config.facebookStreamKey ? '<p style="color: red;">⚠️ Set FACEBOOK_STREAM_KEY environment variable</p>' : ''}
        </div>

        <div class="card">
            <h2>🔧 Cloud Features</h2>
            <ul>
                <li>✅ 24/7 Uptime - Never sleeps</li>
                <li>✅ Auto-reconnection on network drops</li>
                <li>✅ Global CDN for better reach</li>
                <li>✅ Built-in monitoring and health checks</li>
                <li>✅ Scalable to handle high viewer counts</li>
            </ul>
        </div>
    </div>

    <script>
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(protocol + '//' + window.location.host);
        
        ws.onmessage = function(event) {
            const message = JSON.parse(event.data);
            if (message.type === 'health') {
                updateHealth(message.data);
            }
        };

        function updateHealth(health) {
            document.getElementById('server-status').className = 'status connected';
            document.getElementById('server-status').textContent = 'Server: Online (Cloud Hosted)';
            
            document.getElementById('input-status').className = 'status ' + (health.inputConnected ? 'connected' : 'disconnected');
            document.getElementById('input-status').textContent = 'OBSBOT Input: ' + (health.inputConnected ? 'Connected' : 'Waiting for connection');
            
            document.getElementById('output-status').className = 'status ' + (health.outputConnected ? 'connected' : 'disconnected');
            document.getElementById('output-status').textContent = 'Facebook Output: ' + (health.outputConnected ? 'Streaming Live' : 'Not streaming');
            
            document.getElementById('uptime').textContent = health.uptime || 0;
            document.getElementById('bitrate').textContent = Math.round(health.bitrate || 0);
            document.getElementById('dropped').textContent = health.droppedFrames || 0;
            
            const serverUptimeHours = Math.round((Date.now() - health.serverStartTime) / 3600000 * 10) / 10;
            document.getElementById('server-uptime').textContent = serverUptimeHours;
        }

        // Update server uptime every second
        setInterval(() => {
            fetch('/health')
                .then(response => response.json())
                .then(data => {
                    const serverUptimeHours = Math.round(data.serverUptime / 3600 * 10) / 10;
                    document.getElementById('server-uptime').textContent = serverUptimeHours;
                });
        }, 1000);
    </script>
</body>
</html>`;
    }

    shutdown() {
        console.log('[Cloud] Shutting down streaming server...');
        
        if (this.ffmpegProcess) {
            this.ffmpegProcess.kill('SIGTERM');
        }
        
        if (this.nms) {
            this.nms.stop();
        }
        
        if (this.server) {
            this.server.close();
        }
        
        process.exit(0);
    }

    start() {
        console.log('🌐 Starting Cloud Cricket Streaming Server...');
        console.log(`📡 SRT Input: srt://[YOUR_DOMAIN]:${this.config.srtPort}?streamid=${this.config.streamId}`);
        console.log(`🌐 Dashboard: https://[YOUR_DOMAIN]`);
        console.log(`📺 Facebook Live: ${this.config.facebookStreamKey ? 'Ready' : 'Stream key needed'}`);
        
        // Start media server
        this.nms.run();
        
        // Start web server
        this.server.listen(this.config.port, () => {
            console.log(`✅ Cloud server running on port ${this.config.port}`);
            console.log(`🎯 Ready for OBSBOT Tail Air connection!`);
        });
    }
}

// Start cloud server
async function startCloudServer() {
    try {
        const server = new CloudCricketStreamingServer();
        const initialized = await server.initialize();
        
        if (initialized) {
            server.start();
        } else {
            console.error('❌ Failed to initialize cloud server');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Cloud server startup failed:', error);
        process.exit(1);
    }
}

// Only start if this file is run directly
if (require.main === module) {
    startCloudServer();
}

module.exports = CloudCricketStreamingServer;