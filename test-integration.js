const { exec } = require('child_process');
const fs = require('fs');
const net = require('net');
const os = require('os');

class IntegrationTester {
    constructor() {
        this.results = {
            system: {},
            network: {},
            facebook: {},
            obsbot: {},
            streaming: {}
        };
    }

    async runFullIntegrationTest() {
        console.log('🧪 Cricket Tournament Integration Test');
        console.log('=====================================\n');

        await this.testSystemRequirements();
        await this.testNetworkSetup();
        await this.testFacebookConfiguration();
        await this.testObsbotConfiguration();
        await this.testStreamingPipeline();
        
        this.generateIntegrationReport();
    }

    async testSystemRequirements() {
        console.log('💻 Testing System Requirements...');
        
        // Test Node.js version
        const nodeVersion = process.version;
        const nodeMajor = parseInt(nodeVersion.split('.')[0].substring(1));
        this.results.system.nodeVersion = {
            version: nodeVersion,
            ok: nodeMajor >= 14,
            message: nodeMajor >= 14 ? 'Node.js version OK' : 'Node.js too old (need 14+)'
        };
        this.logResult('Node.js', this.results.system.nodeVersion);

        // Test available memory
        const totalMem = Math.round(os.totalmem() / 1024 / 1024 / 1024);
        const freeMem = Math.round(os.freemem() / 1024 / 1024 / 1024);
        this.results.system.memory = {
            total: totalMem,
            free: freeMem,
            ok: freeMem >= 2,
            message: `${freeMem}GB free of ${totalMem}GB total`
        };
        this.logResult('Memory', this.results.system.memory);

        // Test disk space
        await this.testDiskSpace();

        // Test dependencies
        const deps = ['node-media-server', 'fluent-ffmpeg', 'express', 'ws'];
        const missing = [];
        for (const dep of deps) {
            try {
                require(dep);
            } catch (e) {
                missing.push(dep);
            }
        }
        this.results.system.dependencies = {
            ok: missing.length === 0,
            missing,
            message: missing.length === 0 ? 'All dependencies installed' : `Missing: ${missing.join(', ')}`
        };
        this.logResult('Dependencies', this.results.system.dependencies);
    }

    async testDiskSpace() {
        return new Promise((resolve) => {
            exec('df -h .', (error, stdout) => {
                if (error) {
                    this.results.system.diskSpace = {
                        ok: false,
                        message: 'Could not check disk space'
                    };
                } else {
                    const lines = stdout.split('\n');
                    const dataLine = lines[1];
                    const parts = dataLine.split(/\s+/);
                    const available = parts[3];
                    
                    this.results.system.diskSpace = {
                        available,
                        ok: true,
                        message: `${available} available`
                    };
                }
                this.logResult('Disk Space', this.results.system.diskSpace);
                resolve();
            });
        });
    }

    async testNetworkSetup() {
        console.log('\n🌐 Testing Network Setup...');

        // Get network interfaces
        const interfaces = os.networkInterfaces();
        const activeInterfaces = [];
        
        for (const [name, addrs] of Object.entries(interfaces)) {
            for (const addr of addrs) {
                if (addr.family === 'IPv4' && !addr.internal) {
                    activeInterfaces.push({
                        name,
                        address: addr.address,
                        netmask: addr.netmask
                    });
                }
            }
        }

        this.results.network.interfaces = {
            count: activeInterfaces.length,
            interfaces: activeInterfaces,
            ok: activeInterfaces.length > 0,
            message: `Found ${activeInterfaces.length} network interface(s)`
        };
        this.logResult('Network Interfaces', this.results.network.interfaces);

        // Test internet connectivity
        await this.testInternetConnectivity();

        // Test required ports
        await this.testRequiredPorts();

        // Test bandwidth (basic)
        await this.testBandwidth();
    }

    async testInternetConnectivity() {
        return new Promise((resolve) => {
            exec('ping -c 3 8.8.8.8', (error, stdout) => {
                if (error) {
                    this.results.network.internet = {
                        ok: false,
                        message: 'No internet connection'
                    };
                } else {
                    const lines = stdout.split('\n');
                    const statsLine = lines.find(line => line.includes('packet loss'));
                    this.results.network.internet = {
                        ok: true,
                        message: statsLine ? statsLine.trim() : 'Internet connection OK'
                    };
                }
                this.logResult('Internet', this.results.network.internet);
                resolve();
            });
        });
    }

    async testRequiredPorts() {
        const ports = [
            { port: 9999, service: 'SRT Input' },
            { port: 3000, service: 'Web Dashboard' },
            { port: 1935, service: 'RTMP Internal' }
        ];

        for (const { port, service } of ports) {
            const available = await this.isPortAvailable(port);
            this.results.network[`port_${port}`] = {
                port,
                service,
                ok: available,
                message: available ? `Port ${port} available` : `Port ${port} in use`
            };
            this.logResult(`Port ${port} (${service})`, this.results.network[`port_${port}`]);
        }
    }

    async isPortAvailable(port) {
        return new Promise((resolve) => {
            const server = net.createServer();
            server.listen(port, () => {
                server.close(() => resolve(true));
            });
            server.on('error', () => resolve(false));
        });
    }

    async testBandwidth() {
        console.log('   Testing bandwidth (this may take 10-15 seconds)...');
        
        return new Promise((resolve) => {
            // Simple bandwidth test using curl to download a small file
            const testUrl = 'http://speedtest.ftp.otenet.gr/files/test1Mb.db';
            const startTime = Date.now();
            
            exec(`curl -o /dev/null -s -w "%{speed_download}" --max-time 15 ${testUrl}`, (error, stdout) => {
                if (error) {
                    this.results.network.bandwidth = {
                        ok: false,
                        message: 'Bandwidth test failed'
                    };
                } else {
                    const speedBps = parseFloat(stdout);
                    const speedMbps = Math.round(speedBps * 8 / 1024 / 1024 * 10) / 10;
                    
                    this.results.network.bandwidth = {
                        speedMbps,
                        ok: speedMbps >= 4,
                        message: `Download: ${speedMbps} Mbps ${speedMbps >= 6 ? '(Good for 1080p)' : speedMbps >= 4 ? '(OK for 720p)' : '(May be insufficient)'}`
                    };
                }
                this.logResult('Bandwidth', this.results.network.bandwidth);
                resolve();
            });
        });
    }

    async testFacebookConfiguration() {
        console.log('\n📺 Testing Facebook Configuration...');

        // Check Facebook config file
        try {
            const config = JSON.parse(fs.readFileSync('facebook-config.json', 'utf8'));
            
            // Check stream key
            const hasStreamKey = config.facebook_live.stream_key && 
                               config.facebook_live.stream_key !== 'YOUR_PERSISTENT_STREAM_KEY_HERE';
            
            this.results.facebook.streamKey = {
                ok: hasStreamKey,
                message: hasStreamKey ? 'Stream key configured' : 'Stream key not set'
            };
            this.logResult('Facebook Stream Key', this.results.facebook.streamKey);

            // Check ingest URL
            const validIngest = config.facebook_live.ingest_url.includes('facebook.com');
            this.results.facebook.ingestUrl = {
                ok: validIngest,
                url: config.facebook_live.ingest_url,
                message: validIngest ? 'Valid Facebook ingest URL' : 'Invalid ingest URL'
            };
            this.logResult('Facebook Ingest URL', this.results.facebook.ingestUrl);

        } catch (e) {
            this.results.facebook.config = {
                ok: false,
                message: 'facebook-config.json not found or invalid'
            };
            this.logResult('Facebook Config', this.results.facebook.config);
        }

        // Test Facebook Live API connectivity
        await this.testFacebookConnectivity();
    }

    async testFacebookConnectivity() {
        const endpoints = [
            'live-api-s.facebook.com',
            'rtmp-api.facebook.com'
        ];

        for (const endpoint of endpoints) {
            await new Promise((resolve) => {
                exec(`ping -c 2 ${endpoint}`, (error) => {
                    this.results.facebook[`endpoint_${endpoint.split('.')[0]}`] = {
                        endpoint,
                        ok: !error,
                        message: error ? `Cannot reach ${endpoint}` : `${endpoint} reachable`
                    };
                    this.logResult(`Facebook ${endpoint}`, this.results.facebook[`endpoint_${endpoint.split('.')[0]}`]);
                    resolve();
                });
            });
        }
    }

    async testObsbotConfiguration() {
        console.log('\n🎥 Testing OBSBOT Configuration...');

        // Check OBSBOT config file
        try {
            const config = JSON.parse(fs.readFileSync('obsbot-config.json', 'utf8'));
            
            // Check SRT settings
            const validPort = config.srt_output.port === 9999;
            this.results.obsbot.srtPort = {
                ok: validPort,
                port: config.srt_output.port,
                message: validPort ? 'SRT port 9999 configured' : `SRT port is ${config.srt_output.port}, should be 9999`
            };
            this.logResult('OBSBOT SRT Port', this.results.obsbot.srtPort);

            // Check stream ID
            const validStreamId = config.srt_output.stream_id === 'cricket-tournament-2025';
            this.results.obsbot.streamId = {
                ok: validStreamId,
                streamId: config.srt_output.stream_id,
                message: validStreamId ? 'Stream ID configured correctly' : 'Stream ID mismatch'
            };
            this.logResult('OBSBOT Stream ID', this.results.obsbot.streamId);

            // Check server IP
            const hasServerIp = config.srt_output.host !== 'YOUR_SERVER_IP';
            this.results.obsbot.serverIp = {
                ok: hasServerIp,
                host: config.srt_output.host,
                message: hasServerIp ? `Server IP: ${config.srt_output.host}` : 'Server IP not configured'
            };
            this.logResult('OBSBOT Server IP', this.results.obsbot.serverIp);

        } catch (e) {
            this.results.obsbot.config = {
                ok: false,
                message: 'obsbot-config.json not found or invalid'
            };
            this.logResult('OBSBOT Config', this.results.obsbot.config);
        }
    }

    async testStreamingPipeline() {
        console.log('\n🎬 Testing Streaming Pipeline...');

        // Test FFmpeg availability and capabilities
        await this.testFFmpeg();

        // Test SRT listener capability
        await this.testSRTCapability();

        // Test RTMPS output capability
        await this.testRTMPSCapability();
    }

    async testFFmpeg() {
        return new Promise((resolve) => {
            exec('ffmpeg -version', (error, stdout) => {
                if (error) {
                    this.results.streaming.ffmpeg = {
                        ok: false,
                        message: 'FFmpeg not found'
                    };
                } else {
                    const version = stdout.split('\n')[0];
                    this.results.streaming.ffmpeg = {
                        ok: true,
                        version,
                        message: `FFmpeg available: ${version}`
                    };
                }
                this.logResult('FFmpeg', this.results.streaming.ffmpeg);
                resolve();
            });
        });
    }

    async testSRTCapability() {
        return new Promise((resolve) => {
            exec('ffmpeg -protocols 2>/dev/null | grep srt', (error, stdout) => {
                this.results.streaming.srt = {
                    ok: !error && stdout.includes('srt'),
                    message: (!error && stdout.includes('srt')) ? 'SRT protocol supported' : 'SRT protocol not available'
                };
                this.logResult('SRT Protocol', this.results.streaming.srt);
                resolve();
            });
        });
    }

    async testRTMPSCapability() {
        return new Promise((resolve) => {
            exec('ffmpeg -protocols 2>/dev/null | grep rtmps', (error, stdout) => {
                this.results.streaming.rtmps = {
                    ok: !error && stdout.includes('rtmps'),
                    message: (!error && stdout.includes('rtmps')) ? 'RTMPS protocol supported' : 'RTMPS protocol not available'
                };
                this.logResult('RTMPS Protocol', this.results.streaming.rtmps);
                resolve();
            });
        });
    }

    logResult(test, result) {
        const status = result.ok ? '✅' : '❌';
        console.log(`   ${status} ${test}: ${result.message}`);
    }

    generateIntegrationReport() {
        console.log('\n📊 Integration Test Summary');
        console.log('===========================');

        const categories = [
            { name: 'System Requirements', results: this.results.system },
            { name: 'Network Setup', results: this.results.network },
            { name: 'Facebook Configuration', results: this.results.facebook },
            { name: 'OBSBOT Configuration', results: this.results.obsbot },
            { name: 'Streaming Pipeline', results: this.results.streaming }
        ];

        let totalTests = 0;
        let passedTests = 0;

        for (const category of categories) {
            const tests = Object.values(category.results);
            const passed = tests.filter(test => test.ok).length;
            totalTests += tests.length;
            passedTests += passed;
            
            console.log(`\n${category.name}: ${passed}/${tests.length} passed`);
        }

        console.log(`\nOverall: ${passedTests}/${totalTests} tests passed`);

        // Generate recommendations
        this.generateRecommendations();

        // Save detailed report
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: totalTests - passedTests,
                percentage: Math.round((passedTests / totalTests) * 100)
            },
            results: this.results,
            recommendations: this.getRecommendations()
        };

        fs.writeFileSync('integration-test-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Detailed report saved to integration-test-report.json');
    }

    generateRecommendations() {
        console.log('\n💡 Recommendations:');

        const recommendations = this.getRecommendations();
        
        if (recommendations.length === 0) {
            console.log('   ✅ System is ready for cricket tournament streaming!');
        } else {
            recommendations.forEach((rec, index) => {
                console.log(`   ${index + 1}. ${rec}`);
            });
        }
    }

    getRecommendations() {
        const recommendations = [];

        // System recommendations
        if (!this.results.system.nodeVersion?.ok) {
            recommendations.push('Update Node.js to version 14 or higher');
        }
        if (this.results.system.memory?.free < 4) {
            recommendations.push('Close other applications to free up memory');
        }

        // Network recommendations
        if (!this.results.network.internet?.ok) {
            recommendations.push('Check internet connection before streaming');
        }
        if (this.results.network.bandwidth?.speedMbps < 4) {
            recommendations.push('Test upload speed - may need better internet for streaming');
        }
        if (this.results.network.bandwidth?.speedMbps < 6) {
            recommendations.push('Use 720p quality setting due to limited bandwidth');
        }

        // Facebook recommendations
        if (!this.results.facebook.streamKey?.ok) {
            recommendations.push('Set Facebook stream key in facebook-config.json or environment variable');
        }

        // OBSBOT recommendations
        if (!this.results.obsbot.serverIp?.ok) {
            recommendations.push('Update server IP in obsbot-config.json (run ./start-cricket-stream.sh to auto-configure)');
        }

        // Streaming recommendations
        if (!this.results.streaming.srt?.ok) {
            recommendations.push('Install FFmpeg with SRT support for OBSBOT input');
        }
        if (!this.results.streaming.rtmps?.ok) {
            recommendations.push('Install FFmpeg with RTMPS support for Facebook output');
        }

        return recommendations;
    }
}

// Run integration test if called directly
if (require.main === module) {
    const tester = new IntegrationTester();
    tester.runFullIntegrationTest().catch(console.error);
}

module.exports = IntegrationTester;