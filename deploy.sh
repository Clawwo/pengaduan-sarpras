#!/bin/bash

# Deployment script untuk Sistem Pengaduan Sarana Prasarana
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Copy .env.production to .env and configure it first."
    exit 1
fi

# Pull latest code
echo -e "${YELLOW}📥 Pulling latest code...${NC}"
git pull origin main

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker compose down

# Remove old images (optional)
read -p "Remove old Docker images? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🗑️  Removing old images...${NC}"
    docker system prune -af --volumes
fi

# Build new images
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker compose build --no-cache

# Start containers
echo -e "${YELLOW}🚢 Starting containers...${NC}"
docker compose up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check service status
echo -e "${YELLOW}📊 Checking service status...${NC}"
docker compose ps

# Show logs
echo -e "${YELLOW}📜 Recent logs:${NC}"
docker compose logs --tail=50

# Test health endpoints
echo -e "${YELLOW}🏥 Testing health endpoints...${NC}"

if curl -f http://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Nginx: Healthy${NC}"
else
    echo -e "${RED}❌ Nginx: Not responding${NC}"
fi

if curl -f http://localhost:5000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend: Healthy${NC}"
else
    echo -e "${RED}❌ Backend: Not responding${NC}"
fi

# Show resource usage
echo -e "${YELLOW}💻 Resource usage:${NC}"
docker stats --no-stream

echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""
echo "Access your application at:"
echo "  - Frontend: http://localhost"
echo "  - Backend API: http://localhost:5000"
echo "  - Health Check: http://localhost/health"
echo ""
echo "To view logs: docker compose logs -f"
echo "To restart: docker compose restart"
echo "To stop: docker compose down"
