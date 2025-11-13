#!/bin/bash
# filepath: deploy.sh
# Deployment script untuk VPS Ubuntu

set -e

echo "🚀 Starting deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="$(pwd)"
BACKEND_DIR="$APP_DIR/server"
FRONTEND_DIR="$APP_DIR/clients/web"

# Check if .env exists in server directory
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${RED}❌ Error: server/.env file not found!${NC}"
    echo "Copy .env.production to server/.env and configure it first."
    exit 1
fi

# Check if frontend .env.production exists
if [ ! -f "$FRONTEND_DIR/.env.production" ]; then
    echo -e "${RED}❌ Error: clients/web/.env.production not found!${NC}"
    echo "Create .env.production in clients/web directory."
    exit 1
fi

# Step 1: Pull latest code
echo -e "${YELLOW}📥 Pulling latest code...${NC}"
git pull origin main
echo -e "${GREEN}✅ Code updated${NC}"
echo ""

# Step 2: Install backend dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd "$BACKEND_DIR"
npm install --production
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Step 3: Build frontend
echo -e "${YELLOW}🔨 Building frontend...${NC}"
cd "$FRONTEND_DIR"
npm install
npm run build
echo -e "${GREEN}✅ Frontend built${NC}"
echo ""

# Step 4: Deploy frontend files to nginx web root
echo -e "${YELLOW}📋 Deploying frontend files...${NC}"
NGINX_ROOT="/var/www/pengaduan-sarpras/clients/web/dist"
sudo mkdir -p "$NGINX_ROOT"
sudo cp -r "$FRONTEND_DIR/dist/"* "$NGINX_ROOT/"
echo -e "${GREEN}✅ Frontend deployed to $NGINX_ROOT${NC}"
echo ""

# Step 5: Restart backend with PM2
echo -e "${YELLOW}🔄 Restarting backend service...${NC}"
cd "$APP_DIR"

# Check if PM2 process exists
if pm2 list | grep -q "pengaduan-backend"; then
    pm2 restart ecosystem.config.js --env production
else
    pm2 start ecosystem.config.js --env production
fi

pm2 save
echo -e "${GREEN}✅ Backend restarted${NC}"
echo ""

# Step 6: Reload Nginx
echo -e "${YELLOW}🔄 Reloading Nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx
echo -e "${GREEN}✅ Nginx reloaded${NC}"
echo ""

# Step 7: Show status
echo -e "${YELLOW}📊 Checking service status...${NC}"
pm2 status
echo ""

# Test health endpoints
echo -e "${YELLOW}🏥 Testing health endpoints...${NC}"

# Test backend
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend: Healthy${NC}"
else
    echo -e "${RED}❌ Backend: Not responding${NC}"
fi

# Test frontend
if curl -f http://localhost/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend: Healthy${NC}"
else
    echo -e "${RED}❌ Frontend: Not responding${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "Your application is now running at:"
echo "  Frontend: http://farelhry.my.id"
echo "  Backend API: http://farelhry.my.id/api"
echo ""
echo "Useful commands:"
echo "  - View logs: pm2 logs pengaduan-backend"
echo "  - Restart: pm2 restart pengaduan-backend"
echo "  - Stop: pm2 stop pengaduan-backend"
echo "  - Monitor: pm2 monit"
echo "================================"