const { exec } = require('child_process');
const fs = require('fs');

class StreamTester {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0
        };
    }

    async runAllTests() {
        console.log('🧪 Cricket Streaming Setup - Running Tests\n');

        await this.testDependencies();
        await this.testConfiguration();
        await this.testNetworkPorts();
        await this.testFFmpegCapabilities();
        await this.testFacebookConnection();
        
        this.printResults();
    }

    async testDependencies() {
        console.log('📦 Testing Dependencies...');
        
        // Test Node.js version
        const nodeVersion = process.version;
        if (this.compareVersions(nodeVersion, 'v14.0.0') >= 0) {
            this.pass(`Node.js version: ${nodeVersion}`);
        } else {
            this.fail(`Node.js version too old: ${nodeVersion}. Need v14.0.0+`);
        }

        // Test npm packages
        try {
            require('node-media-server');
            this.pass('node-media-server package installed');
        } catch (e) {
            this.fail('node-media-server not installed. Run: npm install');
        }

        try {
            require('fluent-ffmpeg');
            this.pass('fluent-ffmpeg package installed');
        } catch (e) {
            this.fail('fluent-ffmpeg not installed. Run: npm install');
        }

        // Test FFmpeg binary
        return new Promise((resolve) => {
            exec('ffmpeg -version', (error, stdout) => {
                if (error) {
                    this.fail('FFmpeg not found. Install ffmpeg or use ffmpeg-static package');
                } else {
                    const version = stdout.split('\n')[0];
                    this.pass(`FFmpeg available: ${version}`);
                }
                resolve();
            });
        });
    }

    async testConfiguration() {
        console.log('\n⚙️  Testing Configuration Files...');

        // Test obsbot-config.json
        try {
            const obsbotConfig = JSON.parse(fs.readFileSync('obsbot-config.json', 'utf8'));
            
            if (obsbotConfig.srt_output.host === 'YOUR_SERVER_IP') {
                this.warn('OBSBOT config: Update YOUR_SERVER_IP with actual server IP');
            } else {
                this.pass('OBSBOT config: Server IP configured');
            }

            if (obsbotConfig.srt_output.port === 9999) {
                this.pass('OBSBOT config: SRT port 9999 configured');
            } else {
                this.warn('OBSBOT config: Non-standard SRT port');
            }

        } catch (e) {
            this.fail('obsbot-config.json not found or invalid JSON');
        }

        // Test facebook-config.json
        try {
            const facebookConfig = JSON.parse(fs.readFileSync('facebook-config.json', 'utf8'));
            
            if (facebookConfig.facebook_live.stream_key === 'YOUR_PERSISTENT_STREAM_KEY_HERE') {
                this.warn('Facebook config: Update stream key before going live');
            } else {
                this.pass('Facebook config: Stream key configured');
            }

            if (facebookConfig.facebook_live.protocol === 'RTMPS') {
                this.pass('Facebook config: RTMPS protocol configured');
            }

        } catch (e) {
            this.fail('facebook-config.json not found or invalid JSON');
        }
    }

    async testNetworkPorts() {
        console.log('\n🌐 Testing Network Ports...');

        // Test if ports are available
        const ports = [
            { port: 9999, service: 'SRT Input' },
            { port: 3000, service: 'Web Dashboard' },
            { port: 1935, service: 'RTMP (internal)' }
        ];

        for (const { port, service } of ports) {
            await this.testPort(port, service);
        }

        // Test internet connectivity
        return new Promise((resolve) => {
            exec('ping -c 2 8.8.8.8', (error) => {
                if (error) {
                    this.fail('Internet connectivity test failed');
                } else {
                    this.pass('Internet connectivity OK');
                }
                resolve();
            });
        });
    }

    async testPort(port, service) {
        return new Promise((resolve) => {
            const net = require('net');
            const server = net.createServer();
            
            server.listen(port, () => {
                server.close(() => {
                    this.pass(`Port ${port} available for ${service}`);
                    resolve();
                });
            });
            
            server.on('error', () => {
                this.fail(`Port ${port} already in use (${service})`);
                resolve();
            });
        });
    }

    async testFFmpegCapabilities() {
        console.log('\n🎥 Testing FFmpeg Capabilities...');

        const tests = [
            { codec: 'libx264', type: 'video encoder' },
            { codec: 'aac', type: 'audio encoder' },
            { format: 'flv', type: 'output format' },
            { protocol: 'srt', type: 'SRT protocol' }
        ];

        for (const test of tests) {
            await this.testFFmpegFeature(test);
        }
    }

    async testFFmpegFeature({ codec, format, protocol, type }) {
        return new Promise((resolve) => {
            let command;
            if (codec) {
                command = `ffmpeg -encoders 2>/dev/null | grep ${codec}`;
            } else if (format) {
                command = `ffmpeg -formats 2>/dev/null | grep ${format}`;
            } else if (protocol) {
                command = `ffmpeg -protocols 2>/dev/null | grep ${protocol}`;
            }

            exec(command, (error, stdout) => {
                if (error || !stdout.trim()) {
                    this.fail(`FFmpeg ${type} not available: ${codec || format || protocol}`);
                } else {
                    this.pass(`FFmpeg ${type} available: ${codec || format || protocol}`);
                }
                resolve();
            });
        });
    }

    async testFacebookConnection() {
        console.log('\n📺 Testing Facebook Live Connection...');

        // Test Facebook Live API endpoints
        const endpoints = [
            'live-api-s.facebook.com',
            'rtmp-api.facebook.com'
        ];

        for (const endpoint of endpoints) {
            await this.testEndpoint(endpoint);
        }
    }

    async testEndpoint(hostname) {
        return new Promise((resolve) => {
            exec(`ping -c 2 ${hostname}`, (error) => {
                if (error) {
                    this.warn(`Facebook endpoint unreachable: ${hostname}`);
                } else {
                    this.pass(`Facebook endpoint reachable: ${hostname}`);
                }
                resolve();
            });
        });
    }

    pass(message) {
        console.log(`✅ ${message}`);
        this.results.passed++;
    }

    fail(message) {
        console.log(`❌ ${message}`);
        this.results.failed++;
    }

    warn(message) {
        console.log(`⚠️  ${message}`);
        this.results.warnings++;
    }

    compareVersions(version1, version2) {
        const v1 = version1.replace('v', '').split('.').map(Number);
        const v2 = version2.replace('v', '').split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            const num1 = v1[i] || 0;
            const num2 = v2[i] || 0;
            
            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
        }
        return 0;
    }

    printResults() {
        console.log('\n📊 Test Results Summary');
        console.log('========================');
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`⚠️  Warnings: ${this.results.warnings}`);
        
        if (this.results.failed === 0) {
            console.log('\n🎉 All critical tests passed! Ready for cricket tournament streaming.');
            console.log('\n📋 Next Steps:');
            console.log('1. Update YOUR_SERVER_IP in obsbot-config.json');
            console.log('2. Set Facebook stream key in facebook-config.json or environment variable');
            console.log('3. Run: npm start');
            console.log('4. Configure OBSBOT Tail Air with SRT settings');
            console.log('5. Start streaming and monitor dashboard at http://localhost:3000');
        } else {
            console.log('\n🚨 Some tests failed. Please fix the issues above before proceeding.');
        }

        // Generate test report
        const report = {
            timestamp: new Date().toISOString(),
            results: this.results,
            system: {
                platform: process.platform,
                nodeVersion: process.version,
                arch: process.arch
            }
        };

        fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Detailed test report saved to test-report.json');
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new StreamTester();
    tester.runAllTests().catch(console.error);
}

module.exports = StreamTester;