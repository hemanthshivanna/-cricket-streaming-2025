# Files to Upload to GitHub Repository

## Required Files (14 total):

- .env.example
- .gitignore
- DEPLOYMENT-INSTRUCTIONS.txt
- Dockerfile
- GITHUB-UPLOAD-GUIDE.txt
- README.md
- cloud-deploy-railway.js
- config-helper.js
- facebook-config.json
- obsbot-config.json
- package.json
- railway.json
- render.yaml
- streaming-server.js

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
