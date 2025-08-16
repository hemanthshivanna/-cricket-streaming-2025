const fs = require('fs');
const { exec } = require('child_process');

class StreamMonitor {
    constructor() {
        this.logFile = 'stream-monitor.log';
        this.alertThresholds = {
            maxDroppedFrames: 100,
            minBitrate: 1000,
            maxReconnects: 5
        };
        this.stats = {
            startTime: Date.now(),
            reconnectCount: 0,
            totalDroppedFrames: 0,
            avgBitrate: 0,
            alerts: []
        };
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n`;
        
        console.log(logEntry.trim());
        fs.appendFileSync(this.logFile, logEntry);
    }

    checkNetworkHealth() {
        return new Promise((resolve) => {
            exec('ping -c 3 8.8.8.8', (error, stdout, stderr) => {
                if (error) {
                    this.log(`❌ Network Check Failed: ${error.message}`);
                    resolve(false);
                } else {
                    const lines = stdout.split('\n');
                    const statsLine = lines.find(line => line.includes('packet loss'));
                    this.log(`✅ Network Check: ${statsLine || 'Connection OK'}`);
                    resolve(true);
                }
            });
        });
    }

    checkBandwidth() {
        return new Promise((resolve) => {
            // Simple bandwidth estimation using curl
            const testUrl = 'http://speedtest.ftp.otenet.gr/files/test1Mb.db';
            const startTime = Date.now();
            
            exec(`curl -o /dev/null -s -w "%{speed_download}" ${testUrl}`, (error, stdout) => {
                if (error) {
                    this.log(`❌ Bandwidth Test Failed: ${error.message}`);
                    resolve(0);
                } else {
                    const speedBps = parseFloat(stdout);
                    const speedKbps = Math.round(speedBps * 8 / 1024);
                    this.log(`📊 Upload Speed Estimate: ${speedKbps} Kbps`);
                    resolve(speedKbps);
                }
            });
        });
    }

    async monitorStream() {
        this.log('🔍 Starting Stream Health Monitor');
        
        setInterval(async () => {
            // Check network connectivity
            const networkOk = await this.checkNetworkHealth();
            
            // Check bandwidth periodically (every 5 minutes)
            if (Date.now() % 300000 < 10000) {
                await this.checkBandwidth();
            }

            // Check stream health via API
            try {
                const response = await fetch('http://localhost:3000/api/health');
                const health = await response.json();
                
                this.analyzeStreamHealth(health);
                
            } catch (error) {
                this.log(`❌ Failed to get stream health: ${error.message}`);
            }
            
        }, 10000); // Check every 10 seconds
    }

    analyzeStreamHealth(health) {
        const issues = [];

        // Check dropped frames
        if (health.droppedFrames > this.alertThresholds.maxDroppedFrames) {
            issues.push(`High dropped frames: ${health.droppedFrames}`);
        }

        // Check bitrate
        if (health.bitrate > 0 && health.bitrate < this.alertThresholds.minBitrate) {
            issues.push(`Low bitrate: ${health.bitrate} Kbps`);
        }

        // Check connection status
        if (!health.inputConnected) {
            issues.push('OBSBOT input disconnected');
        }

        if (!health.outputConnected && health.inputConnected) {
            issues.push('Facebook output disconnected but input active');
        }

        // Log issues or status
        if (issues.length > 0) {
            this.log(`⚠️  Stream Issues: ${issues.join(', ')}`);
            this.sendAlert(issues);
        } else if (health.inputConnected && health.outputConnected) {
            this.log(`✅ Stream Healthy - Uptime: ${health.uptime}s, Bitrate: ${health.bitrate}kbps`);
        }

        // Update stats
        this.updateStats(health);
    }

    updateStats(health) {
        this.stats.totalDroppedFrames = health.droppedFrames;
        
        if (health.bitrate > 0) {
            this.stats.avgBitrate = (this.stats.avgBitrate + health.bitrate) / 2;
        }
    }

    sendAlert(issues) {
        const alert = {
            timestamp: new Date().toISOString(),
            issues: issues,
            severity: issues.length > 2 ? 'HIGH' : 'MEDIUM'
        };

        this.stats.alerts.push(alert);
        
        // In production, you could send notifications here
        // - Email alerts
        // - SMS notifications  
        // - Slack/Discord webhooks
        // - Push notifications to mobile app
        
        console.log(`🚨 ALERT [${alert.severity}]: ${issues.join(', ')}`);
    }

    generateReport() {
        const runtime = Math.floor((Date.now() - this.stats.startTime) / 1000);
        const hours = Math.floor(runtime / 3600);
        const minutes = Math.floor((runtime % 3600) / 60);
        
        const report = {
            tournament_duration: `${hours}h ${minutes}m`,
            total_dropped_frames: this.stats.totalDroppedFrames,
            average_bitrate: Math.round(this.stats.avgBitrate),
            reconnect_count: this.stats.reconnectCount,
            total_alerts: this.stats.alerts.length,
            stream_stability: this.calculateStability(),
            recommendations: this.getRecommendations()
        };

        this.log(`📊 Stream Report: ${JSON.stringify(report, null, 2)}`);
        
        // Save detailed report
        fs.writeFileSync('tournament-report.json', JSON.stringify({
            ...report,
            detailed_alerts: this.stats.alerts
        }, null, 2));

        return report;
    }

    calculateStability() {
        const totalMinutes = Math.floor((Date.now() - this.stats.startTime) / 60000);
        const alertsPerHour = (this.stats.alerts.length / totalMinutes) * 60;
        
        if (alertsPerHour < 1) return 'EXCELLENT';
        if (alertsPerHour < 3) return 'GOOD';
        if (alertsPerHour < 6) return 'FAIR';
        return 'POOR';
    }

    getRecommendations() {
        const recommendations = [];
        
        if (this.stats.totalDroppedFrames > 500) {
            recommendations.push('Consider reducing video quality due to high frame drops');
        }
        
        if (this.stats.avgBitrate < 2000) {
            recommendations.push('Network bandwidth may be insufficient for current quality');
        }
        
        if (this.stats.reconnectCount > 3) {
            recommendations.push('Check mobile hotspot signal strength and position');
        }
        
        if (this.stats.alerts.length > 10) {
            recommendations.push('Consider backup streaming solution for future events');
        }

        return recommendations.length > 0 ? recommendations : ['Stream performed well - no major issues detected'];
    }

    // Graceful shutdown
    shutdown() {
        this.log('🏁 Tournament ended - generating final report');
        const finalReport = this.generateReport();
        
        console.log('\n🏏 CRICKET TOURNAMENT STREAMING COMPLETE 🏏');
        console.log('📊 Final Report saved to tournament-report.json');
        console.log('📝 Full logs available in stream-monitor.log');
        
        process.exit(0);
    }
}

// Handle graceful shutdown
const monitor = new StreamMonitor();

process.on('SIGINT', () => monitor.shutdown());
process.on('SIGTERM', () => monitor.shutdown());

// Start monitoring
monitor.monitorStream();

module.exports = StreamMonitor;