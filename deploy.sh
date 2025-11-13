#!/bin/bash#!/bin/bash



# Deployment script untuk VPS Ubuntu# Deployment script untuk Sistem Pengaduan Sarana Prasarana

# Usage: ./deploy.sh# Usage: ./deploy.sh



set -eset -e



echo "🚀 Starting deployment to VPS..."echo "🚀 Starting deployment..."



# Colors# Colors

GREEN='\033[0;32m'GREEN='\033[0;32m'

YELLOW='\033[1;33m'YELLOW='\033[1;33m'

RED='\033[0;31m'RED='\033[0;31m'

BLUE='\033[0;34m'NC='\033[0m' # No Color

NC='\033[0m'

# Check if .env exists

# Configurationif [ ! -f .env ]; then

APP_DIR="/var/www/pengaduan-sarpras"    echo -e "${RED}❌ Error: .env file not found!${NC}"

FRONTEND_DIR="$APP_DIR/frontend"    echo "Copy .env.production to .env and configure it first."

SERVER_DIR="$APP_DIR/server"    exit 1

fi

# Step 1: Pull latest code

echo -e "${YELLOW}📥 Pulling latest code from repository...${NC}"# Pull latest code

cd $APP_DIRecho -e "${YELLOW}📥 Pulling latest code...${NC}"

git pull origin maingit pull origin main

echo -e "${GREEN}✅ Code updated${NC}"

echo ""# Stop existing containers

echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"

# Step 2: Install backend dependenciesdocker compose down

echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"

cd $SERVER_DIR# Remove old images (optional)

npm install --productionread -p "Remove old Docker images? (y/n): " -n 1 -r

echo -e "${GREEN}✅ Backend dependencies installed${NC}"echo

echo ""if [[ $REPLY =~ ^[Yy]$ ]]; then

    echo -e "${YELLOW}🗑️  Removing old images...${NC}"

# Step 3: Build frontend    docker system prune -af --volumes

echo -e "${YELLOW}🔨 Building frontend...${NC}"fi

cd $APP_DIR/clients/web

npm install# Build new images

npm run buildecho -e "${YELLOW}🔨 Building Docker images...${NC}"

echo -e "${GREEN}✅ Frontend built${NC}"docker compose build --no-cache

echo ""

# Start containers

# Step 4: Deploy frontendecho -e "${YELLOW}🚢 Starting containers...${NC}"

echo -e "${YELLOW}📋 Deploying frontend files...${NC}"docker compose up -d

rm -rf $FRONTEND_DIR/*

cp -r dist/* $FRONTEND_DIR/# Wait for services to be healthy

echo -e "${GREEN}✅ Frontend deployed${NC}"echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"

echo ""sleep 10



# Step 5: Restart backend with PM2# Check service status

echo -e "${YELLOW}🔄 Restarting backend service...${NC}"echo -e "${YELLOW}📊 Checking service status...${NC}"

cd $APP_DIRdocker compose ps

pm2 restart ecosystem.config.js --env production

pm2 save# Show logs

echo -e "${GREEN}✅ Backend restarted${NC}"echo -e "${YELLOW}📜 Recent logs:${NC}"

echo ""docker compose logs --tail=50



# Step 6: Reload Nginx# Test health endpoints

echo -e "${YELLOW}🔄 Reloading Nginx...${NC}"echo -e "${YELLOW}🏥 Testing health endpoints...${NC}"

sudo nginx -t && sudo systemctl reload nginx

echo -e "${GREEN}✅ Nginx reloaded${NC}"if curl -f http://localhost/health > /dev/null 2>&1; then

echo ""    echo -e "${GREEN}✅ Nginx: Healthy${NC}"

else

# Step 7: Show status    echo -e "${RED}❌ Nginx: Not responding${NC}"

echo -e "${YELLOW}📊 Checking service status...${NC}"fi

pm2 status

echo ""if curl -f http://localhost:5000/ > /dev/null 2>&1; then

    echo -e "${GREEN}✅ Backend: Healthy${NC}"

echo "================================"else

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"    echo -e "${RED}❌ Backend: Not responding${NC}"

echo ""fi

echo "Your application is now running at:"

echo "  Frontend: https://your-domain.com"# Show resource usage

echo "  Backend API: https://your-domain.com/api"echo -e "${YELLOW}💻 Resource usage:${NC}"

echo ""docker stats --no-stream

echo "Useful commands:"

echo "  - View logs: pm2 logs pengaduan-backend"echo -e "${GREEN}✅ Deployment completed!${NC}"

echo "  - Restart: pm2 restart pengaduan-backend"echo ""

echo "  - Stop: pm2 stop pengaduan-backend"echo "Access your application at:"

echo "  - Monitor: pm2 monit"echo "  - Frontend: http://localhost"

echo "  - Backend API: http://localhost:5000"
echo "  - Health Check: http://localhost/health"
echo ""
echo "To view logs: docker compose logs -f"
echo "To restart: docker compose restart"
echo "To stop: docker compose down"
