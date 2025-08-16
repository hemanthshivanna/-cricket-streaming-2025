const fs = require('fs');
const path = require('path');

class QuickCloudSetup {
    constructor() {
        this.config = {
            platform: 'railway', // Default to Railway
            facebookStreamKey: '',
            facebookPageUrl: '',
            tournamentName: 'Cricket Tournament 2025',
            streamTitle: 'Cricket Tournament 2025 - Live Coverage',
            githubRepo: '',
            deploymentUrl: ''
        };
    }

    generateCloudFiles() {
        console.log('🚀 Generating cloud deployment files...\n');

        // Create .gitignore for GitHub
        this.createGitIgnore();
        
        // Create README for GitHub repository
        this.createGitHubReadme();
        
        // Create deployment configuration
        this.createDeploymentConfig();
        
        // Create environment variables template
        this.createEnvTemplate();
        
        // Generate setup instructions
        this.generateSetupInstructions();
        
        console.log('✅ All cloud deployment files generated!\n');
    }

    createGitIgnore() {
        const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage
.grunt

# Bower dependency directory
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons
build/Release

# Dependency directories
jspm_packages/

# TypeScript v1 declaration files
typings/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test
.env.local
.env.production

# parcel-bundler cache
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Local development files
*.log
test-report.json
integration-test-report.json
tournament-report.json
stream-monitor.log

# Media files
media/
*.mp4
*.flv
*.ts
`;

        fs.writeFileSync('.gitignore', gitignoreContent);
        console.log('✅ Created .gitignore');
    }

    createGitHubReadme() {
        const readmeContent = `# 🏏 Cricket Tournament Live Streaming - Cloud Service

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

\`\`\`
Protocol: SRT Caller
Host: your-app-name.railway.app
Port: 9999
Stream ID: cricket-tournament-2025
Passphrase: CricketLive2025!

Video: 720p30, 3000 kbps (cloud optimized)
Audio: AAC, 128 kbps, 44.1 kHz
\`\`\`

## 📺 Facebook Live Setup

1. Go to Facebook Page → Publishing Tools → Live
2. Create Live Video → Use Stream Key  
3. Copy the **Persistent Stream Key**
4. Set as \`FACEBOOK_STREAM_KEY\` environment variable
5. Keep Facebook Live Producer page open during tournament

## 🔧 Environment Variables

Set these in your cloud platform dashboard:

\`\`\`
FACEBOOK_STREAM_KEY=your_facebook_stream_key_here
STREAM_TITLE=${this.config.streamTitle}
NODE_ENV=production
\`\`\`

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
`;

        fs.writeFileSync('README.md', readmeContent);
        console.log('✅ Created GitHub README.md');
    }

    createDeploymentConfig() {
        // Update railway.json with proper configuration
        const railwayConfig = {
            "$schema": "https://railway.app/railway.schema.json",
            "build": {
                "builder": "NIXPACKS"
            },
            "deploy": {
                "startCommand": "npm run start:cloud",
                "healthcheckPath": "/health",
                "healthcheckTimeout": 300,
                "restartPolicyType": "ON_FAILURE",
                "restartPolicyMaxRetries": 10
            }
        };

        fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));
        console.log('✅ Updated railway.json');

        // Update render.yaml
        const renderConfig = `services:
  - type: web
    name: cricket-streaming
    env: node
    plan: starter
    buildCommand: npm install
    startCommand: npm run start:cloud
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: STREAM_ID
        value: cricket-tournament-2025
      - key: STREAM_PASSPHRASE
        value: CricketLive2025!
      - key: STREAM_TITLE
        value: ${this.config.streamTitle}
      - key: SRT_PORT
        value: 9999
    # Set FACEBOOK_STREAM_KEY manually in Render dashboard`;

        fs.writeFileSync('render.yaml', renderConfig);
        console.log('✅ Updated render.yaml');
    }

    createEnvTemplate() {
        const envTemplate = `# Environment Variables for Cloud Deployment
# Copy these to your cloud platform dashboard

FACEBOOK_STREAM_KEY=your_facebook_stream_key_here
STREAM_TITLE=${this.config.streamTitle}
STREAM_ID=cricket-tournament-2025
STREAM_PASSPHRASE=CricketLive2025!
SRT_PORT=9999
NODE_ENV=production

# Instructions:
# 1. Get Facebook Stream Key from Facebook Live Producer
# 2. Set these variables in Railway/Render dashboard
# 3. Deploy and your service will be live!
`;

        fs.writeFileSync('.env.example', envTemplate);
        console.log('✅ Created .env.example');
    }

    generateSetupInstructions() {
        const instructions = `
🌐 CRICKET TOURNAMENT CLOUD STREAMING - DEPLOYMENT GUIDE
=======================================================

Your cloud streaming service is ready to deploy! Follow these steps:

📂 STEP 1: CREATE GITHUB REPOSITORY
----------------------------------
1. Go to https://github.com
2. Click "New repository"
3. Name: cricket-streaming-${new Date().getFullYear()}
4. Make it Public
5. Upload all files from this folder

📺 STEP 2: GET FACEBOOK STREAM KEY
---------------------------------
1. Go to your Facebook Page
2. Click "Publishing Tools" → "Live"
3. Click "Create Live Video"
4. Select "Use Stream Key"
5. Copy the PERSISTENT STREAM KEY
6. Keep this page open during tournament!

🚀 STEP 3: DEPLOY TO RAILWAY (RECOMMENDED)
------------------------------------------
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your cricket-streaming repository
5. Railway auto-deploys in ~2 minutes
6. Go to Variables tab and add:
   FACEBOOK_STREAM_KEY=your_stream_key_here
   STREAM_TITLE=${this.config.streamTitle}
   NODE_ENV=production

🎥 STEP 4: CONFIGURE OBSBOT TAIL AIR
-----------------------------------
In OBSBOT app → Settings → Streaming:

Protocol: SRT Caller
Host: your-app-name.railway.app
Port: 9999
Stream ID: cricket-tournament-2025
Passphrase: CricketLive2025!

Video: 720p30, 3000 kbps
Audio: AAC, 128 kbps, 44.1 kHz

🧪 STEP 5: TEST YOUR SETUP
-------------------------
1. Visit your Railway app URL
2. Should show "Cricket Tournament - Cloud Streaming"
3. Start OBSBOT streaming
4. Check dashboard shows "OBSBOT Input: Connected"
5. Verify "Facebook Output: Streaming Live"

🔴 STEP 6: GO LIVE
-----------------
1. Set Facebook privacy to "Only Me" for testing
2. Test stream for 2-3 minutes
3. Switch to "Public" when ready
4. Tournament is now live globally!

💰 COST: ~$5/month (first month free)
🕐 SETUP TIME: ~10 minutes total
📊 MONITORING: Real-time dashboard at your Railway URL

🆘 EMERGENCY BACKUP
------------------
If cloud service fails, use Facebook Live mobile app directly from your phone.

✅ READY FOR CRICKET TOURNAMENT!
Your cloud streaming service will be:
- Always online (24/7)
- Auto-reconnecting on network drops
- Globally accessible
- Professionally monitored

Need help? Check the dashboard at your Railway URL for real-time status!
`;

        fs.writeFileSync('DEPLOYMENT-INSTRUCTIONS.txt', instructions);
        console.log('✅ Created DEPLOYMENT-INSTRUCTIONS.txt');
        
        console.log('\n📋 Next Steps:');
        console.log('1. Read DEPLOYMENT-INSTRUCTIONS.txt');
        console.log('2. Create GitHub repository');
        console.log('3. Upload all files');
        console.log('4. Deploy to Railway');
        console.log('5. Configure OBSBOT and Facebook');
        console.log('6. Start streaming!\n');
    }

    createGitHubUploadGuide() {
        const uploadGuide = `
📂 HOW TO UPLOAD FILES TO GITHUB
===============================

OPTION 1: WEB INTERFACE (EASIEST)
---------------------------------
1. Go to https://github.com
2. Sign up/login
3. Click "New repository"
4. Name: cricket-streaming-2025
5. Make it Public
6. Click "Create repository"
7. Click "uploading an existing file"
8. Drag and drop ALL files from this folder
9. Scroll down, click "Commit changes"

OPTION 2: GITHUB DESKTOP (RECOMMENDED)
--------------------------------------
1. Download GitHub Desktop: https://desktop.github.com
2. Install and login
3. Click "Create New Repository"
4. Choose this folder as location
5. Click "Publish repository"
6. Make it Public

OPTION 3: COMMAND LINE (ADVANCED)
---------------------------------
git init
git add .
git commit -m "Initial cricket streaming setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cricket-streaming-2025.git
git push -u origin main

FILES TO UPLOAD:
- All .js files (streaming-server.js, cloud-deploy-railway.js, etc.)
- All .json files (package.json, obsbot-config.json, etc.)
- All .md files (README.md, etc.)
- railway.json and render.yaml
- Dockerfile
- .gitignore
- .env.example

DO NOT UPLOAD:
- node_modules/ folder
- .env file (if it exists)
- Any log files

Once uploaded, your repository will be ready for Railway deployment!
`;

        fs.writeFileSync('GITHUB-UPLOAD-GUIDE.txt', uploadGuide);
        console.log('✅ Created GITHUB-UPLOAD-GUIDE.txt');
    }
}

// Run the setup
const setup = new QuickCloudSetup();
setup.generateCloudFiles();
setup.createGitHubUploadGuide();

console.log('🎯 READY TO DEPLOY YOUR CLOUD STREAMING SERVICE!');
console.log('================================================\n');
console.log('📖 Read DEPLOYMENT-INSTRUCTIONS.txt for complete setup guide');
console.log('📂 Read GITHUB-UPLOAD-GUIDE.txt for uploading files to GitHub');
console.log('🚀 Your cloud service will be live in ~10 minutes!\n');
console.log('💡 Need help with any step? Just ask!\n');