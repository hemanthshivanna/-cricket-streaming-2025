const fs = require('fs');
const { exec } = require('child_process');
const readline = require('readline');

class CloudDeploymentSetup {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        this.config = {
            platform: null,
            facebookStreamKey: null,
            streamTitle: 'Cricket Tournament 2025 - Live Coverage',
            githubRepo: null
        };
    }

    async runSetup() {
        console.log('🌐 Cricket Tournament Cloud Deployment Setup');
        console.log('============================================\n');

        try {
            await this.choosePlatform();
            await this.getFacebookCredentials();
            await this.setupGitHub();
            await this.generateDeploymentInstructions();
            
            console.log('\n✅ Cloud deployment setup complete!');
            console.log('📋 Follow the instructions above to deploy your streaming server.');
            
        } catch (error) {
            console.error('❌ Setup failed:', error.message);
        } finally {
            this.rl.close();
        }
    }

    async choosePlatform() {
        console.log('🚀 Choose your cloud platform:\n');
        console.log('1. Railway (Recommended - Easiest, $5/month)');
        console.log('2. Render (Great alternative, Free tier + $7/month pro)');
        console.log('3. Heroku ($7/month)');
        console.log('4. DigitalOcean ($6/month, more setup required)');
        console.log('5. Oracle Cloud (Free forever, complex setup)\n');

        const choice = await this.question('Enter your choice (1-5): ');
        
        const platforms = {
            '1': 'railway',
            '2': 'render', 
            '3': 'heroku',
            '4': 'digitalocean',
            '5': 'oracle'
        };

        this.config.platform = platforms[choice];
        
        if (!this.config.platform) {
            throw new Error('Invalid platform choice');
        }

        console.log(`✅ Selected: ${this.config.platform}\n`);
    }

    async getFacebookCredentials() {
        console.log('📺 Facebook Live Setup');
        console.log('======================\n');
        
        console.log('To get your Facebook Stream Key:');
        console.log('1. Go to your Facebook Page');
        console.log('2. Click "Publishing Tools" → "Live"');
        console.log('3. Click "Create Live Video"');
        console.log('4. Select "Use Stream Key"');
        console.log('5. Copy the PERSISTENT STREAM KEY\n');

        const hasKey = await this.question('Do you have your Facebook Stream Key ready? (y/n): ');
        
        if (hasKey.toLowerCase() === 'y') {
            this.config.facebookStreamKey = await this.question('Enter your Facebook Stream Key: ');
            console.log('✅ Facebook Stream Key saved\n');
        } else {
            console.log('⚠️  You can set the stream key later in your cloud platform dashboard\n');
        }

        const customTitle = await this.question(`Stream title (press Enter for default): `);
        if (customTitle.trim()) {
            this.config.streamTitle = customTitle.trim();
        }
    }

    async setupGitHub() {
        console.log('📂 GitHub Repository Setup');
        console.log('==========================\n');

        const hasGitHub = await this.question('Do you have a GitHub account? (y/n): ');
        
        if (hasGitHub.toLowerCase() !== 'y') {
            console.log('❌ GitHub account required for easy deployment.');
            console.log('   Please create one at https://github.com and run this setup again.\n');
            throw new Error('GitHub account required');
        }

        console.log('You need to:');
        console.log('1. Create a new repository on GitHub');
        console.log('2. Upload these files to your repository\n');

        const repoUrl = await this.question('Enter your GitHub repository URL (optional): ');
        if (repoUrl.trim()) {
            this.config.githubRepo = repoUrl.trim();
        }
    }

    async generateDeploymentInstructions() {
        console.log('\n🚀 Deployment Instructions');
        console.log('===========================\n');

        switch (this.config.platform) {
            case 'railway':
                this.generateRailwayInstructions();
                break;
            case 'render':
                this.generateRenderInstructions();
                break;
            case 'heroku':
                this.generateHerokuInstructions();
                break;
            case 'digitalocean':
                this.generateDigitalOceanInstructions();
                break;
            case 'oracle':
                this.generateOracleInstructions();
                break;
        }

        // Generate environment variables file
        this.generateEnvFile();
    }

    generateRailwayInstructions() {
        console.log('🚂 Railway Deployment Steps:');
        console.log('1. Go to https://railway.app');
        console.log('2. Sign up/login with GitHub');
        console.log('3. Click "New Project" → "Deploy from GitHub repo"');
        console.log('4. Select your repository with this code');
        console.log('5. Railway will auto-deploy in ~2 minutes');
        console.log('6. Go to Variables tab and add:');
        console.log(`   FACEBOOK_STREAM_KEY=${this.config.facebookStreamKey || 'your_stream_key_here'}`);
        console.log(`   STREAM_TITLE=${this.config.streamTitle}`);
        console.log('   NODE_ENV=production');
        console.log('7. Your app will be available at: https://your-app-name.railway.app');
        console.log('8. Use this URL as your OBSBOT host: your-app-name.railway.app\n');
    }

    generateRenderInstructions() {
        console.log('🎨 Render Deployment Steps:');
        console.log('1. Go to https://render.com');
        console.log('2. Sign up/login with GitHub');
        console.log('3. Click "New +" → "Web Service"');
        console.log('4. Connect your GitHub repository');
        console.log('5. Configure:');
        console.log('   - Name: cricket-streaming');
        console.log('   - Environment: Node');
        console.log('   - Build Command: npm install');
        console.log('   - Start Command: npm run start:cloud');
        console.log('6. Add Environment Variables:');
        console.log(`   FACEBOOK_STREAM_KEY=${this.config.facebookStreamKey || 'your_stream_key_here'}`);
        console.log(`   STREAM_TITLE=${this.config.streamTitle}`);
        console.log('   NODE_ENV=production');
        console.log('7. Deploy and use the provided URL as OBSBOT host\n');
    }

    generateHerokuInstructions() {
        console.log('🟣 Heroku Deployment Steps:');
        console.log('1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli');
        console.log('2. Login: heroku login');
        console.log('3. Create app: heroku create cricket-streaming-[your-name]');
        console.log('4. Set environment variables:');
        console.log(`   heroku config:set FACEBOOK_STREAM_KEY="${this.config.facebookStreamKey || 'your_stream_key_here'}"`);
        console.log(`   heroku config:set STREAM_TITLE="${this.config.streamTitle}"`);
        console.log('   heroku config:set NODE_ENV=production');
        console.log('5. Deploy: git push heroku main');
        console.log('6. Use your Heroku app URL as OBSBOT host\n');
    }

    generateDigitalOceanInstructions() {
        console.log('🌊 DigitalOcean Deployment Steps:');
        console.log('1. Create DigitalOcean account');
        console.log('2. Create a new Droplet (Ubuntu 20.04, $6/month)');
        console.log('3. SSH into your droplet');
        console.log('4. Install Node.js: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -');
        console.log('5. sudo apt-get install -y nodejs');
        console.log('6. Clone your repository');
        console.log('7. npm install && npm run start:cloud');
        console.log('8. Set up PM2 for process management');
        console.log('9. Configure firewall for ports 3000 and 9999\n');
    }

    generateOracleInstructions() {
        console.log('🔶 Oracle Cloud Free Tier Steps:');
        console.log('1. Create Oracle Cloud account (requires credit card for verification)');
        console.log('2. Create Always Free VM instance');
        console.log('3. SSH into instance');
        console.log('4. Install Node.js and dependencies');
        console.log('5. Configure security groups for ports 3000 and 9999');
        console.log('6. Deploy and run your application');
        console.log('⚠️  Note: More complex setup, recommended for advanced users\n');
    }

    generateEnvFile() {
        const envContent = `# Environment variables for cloud deployment
FACEBOOK_STREAM_KEY=${this.config.facebookStreamKey || 'your_facebook_stream_key_here'}
STREAM_TITLE=${this.config.streamTitle}
STREAM_ID=cricket-tournament-2025
STREAM_PASSPHRASE=CricketLive2025!
SRT_PORT=9999
NODE_ENV=production

# Instructions:
# 1. Copy these variables to your cloud platform dashboard
# 2. Replace 'your_facebook_stream_key_here' with actual key
# 3. Adjust STREAM_TITLE if needed
`;

        fs.writeFileSync('.env.example', envContent);
        console.log('📄 Environment variables saved to .env.example');
        console.log('   Copy these to your cloud platform dashboard\n');
    }

    async question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }
}

// Run setup if called directly
if (require.main === module) {
    const setup = new CloudDeploymentSetup();
    setup.runSetup().catch(console.error);
}

module.exports = CloudDeploymentSetup;