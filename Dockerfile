# Multi-platform Dockerfile for cricket streaming server
FROM node:18-alpine

# Install FFmpeg and required dependencies
RUN apk add --no-cache \
    ffmpeg \
    curl \
    bash

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY cloud-deploy-railway.js ./
COPY obsbot-config.json ./
COPY facebook-config.json ./

# Create media directory for temporary files
RUN mkdir -p /app/media

# Expose ports
EXPOSE 3000 9999

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "cloud-deploy-railway.js"]