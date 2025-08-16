const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');

class ConfigHelper {
    constructor() {
        this.serverIP = null;
        this.facebookStreamKey = null;
    }

    // Auto-detect server IP address
    async detectServerIP() {
        return new Promise((resolve) => {
            // Try multiple methods to get IP
            const methods = [
                // macOS/Linux
                "ifconfig | grep -Eo 'inet (addr:)?([0-9]*\\.){3}[0-9]*' | grep -Eo '([0-9]*\\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1",
                // Alternative Linux
                "hostname -I | awk '{print $1}'",
                // macOS specific
                "ipconfig getifaddr en0",
                // Windows (if running under WSL)
                "ip route get 1 | awk '{print $7}' | head -1"
            ];

            let methodIndex = 0;
            
            const tryNextMethod = () => {
                if (methodIndex >= methods.length) {
                    // Fallback to network interfaces
                    const interfaces = os.networkInterfaces();
                    for (const name of Object.keys(interfaces)) {
                        for (const iface of interfaces[name]) {
                            if (iface.family === 'IPv4' && !iface.internal) {
                                console.log(`✅ Detected IP via network interfaces: ${iface.address}`);
                                resolve(iface.address);
                                return;
                            }
                        }
                    }
                    
                    // Ultimate fallback
                    console.log('⚠️  Could not auto-detect IP, using default: 192.168.1.100');
                    resolve('192.168.1.100');
                    return;
                }

                exec(methods[methodIndex], (error, stdout) => {
                    if (!error && stdout.trim()) {
                        const ip = stdout.trim();
                        if (this.isValidIP(ip)) {
                            console.log(`✅ Detected server IP: ${ip}`);
                            resolve(ip);
                            return;
                        }
                    }
                    
                    methodIndex++;
                    tryNextMethod();
                });
            };

            tryNextMethod();
        });
    }

    isValidIP(ip) {
        const parts = ip.split('.');
        return parts.length === 4 && parts.every(part => {
            const num = parseInt(part);
            return num >= 0 && num <= 255;
        });
    }

    // Update configuration files with detected settings
    async updateConfigurations() {
        console.log('🔧 Auto-configuring system...');

        // Detect server IP
        this.serverIP = await this.detectServerIP();

        // Get Facebook stream key from environment or prompt
        this.facebookStreamKey = process.env.FACEBOOK_STREAM_KEY;

        // Update OBSBOT configuration
        await this.updateObsbotConfig();

        // Update Facebook configuration  
        await this.updateFacebookConfig();

        console.log('✅ Configuration updated successfully');
        
        return {
            serverIP: this.serverIP,
            hasStreamKey: !!this.facebookStreamKey
        };
    }

    async updateObsbotConfig() {
        try {
            const config = JSON.parse(fs.readFileSync('obsbot-config.json', 'utf8'));
            
            // Update server IP
            config.srt_output.host = this.serverIP;
            
            // Write back to file
            fs.writeFileSync('obsbot-config.json', JSON.stringify(config, null, 2));
            
            console.log(`✅ Updated OBSBOT config with server IP: ${this.serverIP}`);
        } catch (error) {
            console.error('❌ Failed to update OBSBOT config:', error.message);
        }
    }

    async updateFacebookConfig() {
        try {
            const config = JSON.parse(fs.readFileSync('facebook-config.json', 'utf8'));
            
            // Update stream key if available
            if (this.facebookStreamKey && this.facebookStreamKey !== 'YOUR_PERSISTENT_STREAM_KEY_HERE') {
                config.facebook_live.stream_key = this.facebookStreamKey;
                console.log('✅ Updated Facebook config with stream key');
            } else {
                console.log('⚠️  Facebook stream key not set - update facebook-config.json manually');
            }
            
            // Write back to file
            fs.writeFileSync('facebook-config.json', JSON.stringify(config, null, 2));
            
        } catch (error) {
            console.error('❌ Failed to update Facebook config:', error.message);
        }
    }

    // Generate connection instructions for OBSBOT
    generateObsbotInstructions() {
        return `
🎥 OBSBOT TAIL AIR CONFIGURATION
===============================

In OBSBOT App → Settings → Streaming:

Protocol: SRT Caller
Host: ${this.serverIP}
Port: 9999
Stream ID: cricket-tournament-2025
Passphrase: CricketLive2025!

Video Settings:
- Good connection (≥6 Mbps upload): 1080p30, 5000 kbps
- Limited bandwidth (<6 Mbps upload): 720p30, 3000 kbps

Audio Settings:
- Codec: AAC
- Bitrate: 128 kbps
- Sample Rate: 44.1 kHz
- Channels: Stereo

Connection URL: srt://${this.serverIP}:9999?streamid=cricket-tournament-2025
`;
    }

    // Check system readiness
    async checkSystemReadiness() {
        const checks = {
            nodeVersion: this.checkNodeVersion(),
            dependencies: this.checkDependencies(),
            ports: await this.checkPorts(),
            configs: this.checkConfigurations(),
            network: await this.checkNetwork()
        };

        return checks;
    }

    checkNodeVersion() {
        const version = process.version;
        const major = parseInt(version.split('.')[0].substring(1));
        return {
            version,
            ok: major >= 14,
            message: major >= 14 ? 'Node.js version OK' : 'Node.js version too old (need 14+)'
        };
    }

    checkDependencies() {
        const required = ['node-media-server', 'fluent-ffmpeg', 'express', 'ws'];
        const missing = [];

        for (const dep of required) {
            try {
                require(dep);
            } catch (e) {
                missing.push(dep);
            }
        }

        return {
            ok: missing.length === 0,
            missing,
            message: missing.length === 0 ? 'All dependencies installed' : `Missing: ${missing.join(', ')}`
        };
    }

    async checkPorts() {
        const ports = [9999, 3000, 1935];
        const results = {};

        for (const port of ports) {
            results[port] = await this.isPortAvailable(port);
        }

        const allAvailable = Object.values(results).every(available => available);
        
        return {
            ok: allAvailable,
            ports: results,
            message: allAvailable ? 'All ports available' : 'Some ports may be in use'
        };
    }

    async isPortAvailable(port) {
        return new Promise((resolve) => {
            const net = require('net');
            const server = net.createServer();
            
            server.listen(port, () => {
                server.close(() => resolve(true));
            });
            
            server.on('error', () => resolve(false));
        });
    }

    checkConfigurations() {
        const configs = ['obsbot-config.json', 'facebook-config.json'];
        const results = {};

        for (const config of configs) {
            try {
                const data = JSON.parse(fs.readFileSync(config, 'utf8'));
                results[config] = { ok: true, data };
            } catch (e) {
                results[config] = { ok: false, error: e.message };
            }
        }

        const allOk = Object.values(results).every(result => result.ok);
        
        return {
            ok: allOk,
            configs: results,
            message: allOk ? 'All config files valid' : 'Some config files have issues'
        };
    }

    async checkNetwork() {
        return new Promise((resolve) => {
            exec('ping -c 2 8.8.8.8', (error) => {
                resolve({
                    ok: !error,
                    message: error ? 'No internet connection' : 'Internet connection OK'
                });
            });
        });
    }

    // Generate startup summary
    generateStartupSummary(config) {
        return `
🏏 CRICKET TOURNAMENT STREAMING SERVER
=====================================

Server Status: ✅ Ready
Server IP: ${config.serverIP}
Dashboard: http://localhost:3000
SRT Input: srt://${config.serverIP}:9999?streamid=cricket-tournament-2025

Facebook Stream Key: ${config.hasStreamKey ? '✅ Configured' : '⚠️  Not set'}

Next Steps:
1. ${config.hasStreamKey ? '✅' : '❌'} Set Facebook stream key
2. 🎥 Configure OBSBOT Tail Air (see instructions above)
3. 📱 Start streaming from OBSBOT app
4. 📊 Monitor at http://localhost:3000
5. 🔴 Go live on Facebook!

The system will run completely independently once started.
No internet tools or external dependencies required during streaming.
`;
    }
}

module.exports = ConfigHelper;