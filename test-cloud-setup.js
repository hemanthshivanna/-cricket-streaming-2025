const fs = require('fs');

class CloudSetupValidator {
    constructor() {
        this.results = {
            files: {},
            configs: {},
            ready: false
        };
    }

    validateSetup() {
        console.log('🧪 Validating Cloud Setup Files');
        console.log('===============================\n');

        this.checkRequiredFiles();
        this.validateConfigurations();
        this.checkDeploymentReadiness();
        this.generateSummary();
    }

    checkRequiredFiles() {
        console.log('📁 Checking Required Files...');
        
        const requiredFiles = [
            'package.json',
            'cloud-deploy-railway.js',
            'streaming-server.js',
            'config-helper.js',
            'obsbot-config.json',
            'facebook-config.json',
            'railway.json',
            'render.yaml',
            'Dockerfile',
            '.gitignore',
            '.env.example',
            'README.md',
            'DEPLOYMENT-INSTRUCTIONS.txt',
            'GITHUB-UPLOAD-GUIDE.txt'
        ];

        for (const file of requiredFiles) {
            const exists = fs.existsSync(file);
            this.results.files[file] = exists;
            console.log(`   ${exists ? '✅' : '❌'} ${file}`);
        }
    }

    validateConfigurations() {
        console.log('\n⚙️  Validating Configurations...');

        // Check package.json
        try {
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const hasCloudScript = pkg.scripts && pkg.scripts['start:cloud'];
            this.results.configs.packageJson = hasCloudScript;
            console.log(`   ${hasCloudScript ? '✅' : '❌'} package.json has start:cloud script`);
        } catch (e) {
            this.results.configs.packageJson = false;
            console.log('   ❌ package.json invalid or missing');
        }

        // Check railway.json
        try {
            const railway = JSON.parse(fs.readFileSync('railway.json', 'utf8'));
            const hasHealthCheck = railway.deploy && railway.deploy.healthcheckPath;
            this.results.configs.railway = hasHealthCheck;
            console.log(`   ${hasHealthCheck ? '✅' : '❌'} railway.json has health check configured`);
        } catch (e) {
            this.results.configs.railway = false;
            console.log('   ❌ railway.json invalid or missing');
        }

        // Check cloud deployment file
        try {
            const cloudCode = fs.readFileSync('cloud-deploy-railway.js', 'utf8');
            const hasHealthEndpoint = cloudCode.includes('/health');
            const hasSRTConfig = cloudCode.includes('srt_output');
            this.results.configs.cloudDeploy = hasHealthEndpoint && hasSRTConfig;
            console.log(`   ${hasHealthEndpoint ? '✅' : '❌'} Cloud server has health endpoint`);
            console.log(`   ${hasSRTConfig ? '✅' : '❌'} Cloud server has SRT configuration`);
        } catch (e) {
            this.results.configs.cloudDeploy = false;
            console.log('   ❌ cloud-deploy-railway.js missing or invalid');
        }
    }

    checkDeploymentReadiness() {
        console.log('\n🚀 Deployment Readiness Check...');

        const allFilesExist = Object.values(this.results.files).every(exists => exists);
        const allConfigsValid = Object.values(this.results.configs).every(valid => valid);
        
        this.results.ready = allFilesExist && allConfigsValid;

        console.log(`   ${allFilesExist ? '✅' : '❌'} All required files present`);
        console.log(`   ${allConfigsValid ? '✅' : '❌'} All configurations valid`);
        console.log(`   ${this.results.ready ? '✅' : '❌'} Ready for cloud deployment`);
    }

    generateSummary() {
        console.log('\n📊 Setup Summary');
        console.log('================');

        const totalFiles = Object.keys(this.results.files).length;
        const existingFiles = Object.values(this.results.files).filter(exists => exists).length;
        
        console.log(`Files: ${existingFiles}/${totalFiles} present`);
        console.log(`Configs: ${Object.values(this.results.configs).filter(valid => valid).length}/${Object.keys(this.results.configs).length} valid`);
        console.log(`Status: ${this.results.ready ? 'READY FOR DEPLOYMENT' : 'NEEDS ATTENTION'}`);

        if (this.results.ready) {
            console.log('\n🎉 EXCELLENT! Your cloud setup is complete and ready!');
            console.log('\n📋 Next Steps:');
            console.log('1. Create GitHub account at https://github.com');
            console.log('2. Create new repository called "cricket-streaming-2025"');
            console.log('3. Upload all files to your repository');
            console.log('4. Deploy to Railway: https://railway.app');
            console.log('5. Set environment variables (see .env.example)');
            console.log('6. Configure OBSBOT and Facebook');
            console.log('7. Start streaming!');
            
            console.log('\n💰 Cost: ~$5/month (first month free)');
            console.log('⏱️  Setup time: ~10 minutes');
            console.log('🌐 Your service will be live 24/7');
            
        } else {
            console.log('\n⚠️  Some files or configurations need attention.');
            console.log('   Check the items marked with ❌ above.');
        }

        // Generate file list for GitHub upload
        this.generateFileList();
    }

    generateFileList() {
        console.log('\n📂 Files to Upload to GitHub:');
        console.log('=============================');
        
        const filesToUpload = Object.keys(this.results.files)
            .filter(file => this.results.files[file])
            .sort();
            
        filesToUpload.forEach(file => {
            console.log(`   📄 ${file}`);
        });
        
        console.log(`\nTotal: ${filesToUpload.length} files ready for upload`);
        
        // Save file list
        const fileListContent = `# Files to Upload to GitHub Repository

## Required Files (${filesToUpload.length} total):

${filesToUpload.map(file => `- ${file}`).join('\n')}

## Upload Instructions:

1. **Create GitHub Repository:**
   - Go to https://github.com
   - Click "New repository"
   - Name: cricket-streaming-2025
   - Make it Public
   - Click "Create repository"

2. **Upload Files:**
   - Click "uploading an existing file"
   - Drag and drop all files listed above
   - Click "Commit changes"

3. **Deploy to Railway:**
   - Go to https://railway.app
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Add environment variables from .env.example

Your cloud streaming service will be live in minutes!
`;

        fs.writeFileSync('FILES-TO-UPLOAD.md', fileListContent);
        console.log('\n✅ Created FILES-TO-UPLOAD.md with complete upload guide');
    }
}

// Run validation
const validator = new CloudSetupValidator();
validator.validateSetup();