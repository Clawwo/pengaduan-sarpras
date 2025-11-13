#!/bin/bash

# Script untuk fix frontend tidak muncul di nginx
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Fixing Frontend Display Issue${NC}"
echo "================================"
echo ""

# Step 1: Stop containers
echo -e "${YELLOW}🛑 Stopping containers...${NC}"
docker compose down
echo ""

# Step 2: Remove old frontend volume
echo -e "${YELLOW}🗑️  Removing old frontend volume...${NC}"
docker volume rm pengaduan-sarpras_frontend_dist 2>/dev/null || echo "Volume already removed"
echo ""

# Step 3: Rebuild frontend (no cache)
echo -e "${YELLOW}🔨 Rebuilding frontend (this may take 2-3 minutes)...${NC}"
docker compose build --no-cache frontend
echo -e "${GREEN}✅ Frontend rebuilt${NC}"
echo ""

# Step 4: Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker compose up -d
echo ""

# Step 5: Wait for services
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 15

# Step 6: Check status
echo -e "${YELLOW}📊 Service status:${NC}"
docker compose ps
echo ""

# Step 7: Check frontend dist volume
echo -e "${YELLOW}🔍 Checking frontend files in volume...${NC}"
docker run --rm -v pengaduan-sarpras_frontend_dist:/tmp/dist alpine ls -lah /tmp/dist | head -20
echo ""

# Step 8: Check nginx html directory
echo -e "${YELLOW}🔍 Checking nginx html directory...${NC}"
docker compose exec nginx ls -lah /usr/share/nginx/html | head -20
echo ""

# Step 9: Test endpoints
echo -e "${YELLOW}🧪 Testing endpoints...${NC}"
echo ""

echo -n "Testing health endpoint... "
if curl -s -f "http://localhost/health" > /dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo -n "Testing root endpoint (should return HTML)... "
RESPONSE=$(curl -s "http://localhost/")
if echo "$RESPONSE" | grep -q "<!DOCTYPE html\|<html"; then
    echo -e "${GREEN}✅ OK - HTML detected${NC}"
else
    echo -e "${RED}❌ Failed - No HTML detected${NC}"
    echo "Response preview:"
    echo "$RESPONSE" | head -5
fi
echo ""

# Step 10: Show logs
echo -e "${YELLOW}📋 Recent nginx logs:${NC}"
docker compose logs --tail=20 nginx
echo ""

echo "================================"
echo -e "${GREEN}✅ Fix completed!${NC}"
echo ""
echo -e "${BLUE}Test di browser:${NC}"
echo "  http://localhost/"
echo "  http://your-server-ip/"
echo ""
echo -e "${BLUE}Jika masih belum muncul, jalankan:${NC}"
echo "  docker compose logs frontend"
echo "  docker compose logs nginx"
