#!/bin/bash

# All-in-one fix script untuk deployment issues
# Usage: ./fix-all.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 All-in-One Fix Script${NC}"
echo "================================"
echo "This will fix:"
echo "  - Backend unhealthy issue"
echo "  - Frontend not displaying"
echo "  - Volume mounting issues"
echo "================================"
echo ""

# Confirm
read -p "Continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

# Step 1: Check .env
echo -e "${YELLOW}1/8 Checking .env file...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env not found!${NC}"
    echo "Copy .env.production to .env first:"
    echo "  cp .env.production .env"
    exit 1
fi
echo -e "${GREEN}✅ .env exists${NC}"
echo ""

# Step 2: Stop all containers
echo -e "${YELLOW}2/8 Stopping all containers...${NC}"
docker compose down
echo -e "${GREEN}✅ Containers stopped${NC}"
echo ""

# Step 3: Clean volumes
echo -e "${YELLOW}3/8 Cleaning volumes...${NC}"
read -p "Remove all volumes (will lose data)? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose down -v
    echo -e "${GREEN}✅ Volumes removed${NC}"
else
    # Only remove frontend volume
    docker volume rm pengaduan-sarpras_frontend_dist 2>/dev/null || echo "Frontend volume already removed"
    echo -e "${GREEN}✅ Frontend volume removed${NC}"
fi
echo ""

# Step 4: Rebuild all images
echo -e "${YELLOW}4/8 Rebuilding all images (this may take 5-10 minutes)...${NC}"
echo "Building backend..."
docker compose build --no-cache backend
echo "Building frontend..."
docker compose build --no-cache frontend
echo "Building nginx..."
docker compose build --no-cache nginx
echo -e "${GREEN}✅ All images rebuilt${NC}"
echo ""

# Step 5: Start services
echo -e "${YELLOW}5/8 Starting services...${NC}"
docker compose up -d
echo -e "${GREEN}✅ Services started${NC}"
echo ""

# Step 6: Wait and monitor
echo -e "${YELLOW}6/8 Waiting for services (2 minutes)...${NC}"
for i in {1..24}; do
    sleep 5
    echo "Checking status ($i/24)..."
    
    MYSQL_STATUS=$(docker inspect --format='{{.State.Health.Status}}' pengaduan-mysql 2>/dev/null || echo "none")
    BACKEND_STATUS=$(docker inspect --format='{{.State.Health.Status}}' pengaduan-backend 2>/dev/null || echo "none")
    NGINX_STATUS=$(docker inspect --format='{{.State.Health.Status}}' pengaduan-nginx 2>/dev/null || echo "none")
    FRONTEND_STATUS=$(docker inspect --format='{{.State.Status}}' pengaduan-frontend 2>/dev/null || echo "none")
    
    echo "  MySQL: $MYSQL_STATUS | Backend: $BACKEND_STATUS | Nginx: $NGINX_STATUS | Frontend: $FRONTEND_STATUS"
    
    if [ "$MYSQL_STATUS" = "healthy" ] && [ "$BACKEND_STATUS" = "healthy" ] && [ "$FRONTEND_STATUS" = "exited" ]; then
        echo -e "${GREEN}✅ All critical services are ready!${NC}"
        break
    fi
done
echo ""

# Step 7: Verify
echo -e "${YELLOW}7/8 Verifying deployment...${NC}"
echo ""

# Container status
echo "Container status:"
docker compose ps
echo ""

# Frontend files
echo "Frontend files in nginx:"
docker compose exec nginx ls -lah /usr/share/nginx/html | head -10
echo ""

# Test endpoints
echo "Testing endpoints:"

echo -n "  - MySQL: "
if docker compose exec mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo -n "  - Backend health: "
if curl -s -f "http://localhost:5000/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo -n "  - Backend API: "
if curl -s -f "http://localhost:5000/api" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo -n "  - Nginx health: "
if curl -s -f "http://localhost/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo -n "  - Frontend HTML: "
RESPONSE=$(curl -s "http://localhost/" 2>/dev/null || echo "")
if echo "$RESPONSE" | grep -q "<!DOCTYPE html\|<html"; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Failed (still showing nginx page)${NC}"
fi

echo ""

# Step 8: Summary
echo -e "${YELLOW}8/8 Deployment Summary${NC}"
echo "================================"

ALL_OK=true

# Check each service
for service in mysql backend nginx; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' pengaduan-$service 2>/dev/null || echo "none")
    if [ "$STATUS" = "healthy" ]; then
        echo -e "  ✅ $service: ${GREEN}healthy${NC}"
    else
        echo -e "  ❌ $service: ${RED}$STATUS${NC}"
        ALL_OK=false
    fi
done

FRONTEND_STATUS=$(docker inspect --format='{{.State.Status}}' pengaduan-frontend 2>/dev/null || echo "none")
if [ "$FRONTEND_STATUS" = "exited" ]; then
    echo -e "  ✅ frontend: ${GREEN}exited (normal)${NC}"
else
    echo -e "  ❌ frontend: ${RED}$FRONTEND_STATUS${NC}"
    ALL_OK=false
fi

echo "================================"
echo ""

if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo ""
    echo "Access your application:"
    echo "  - Frontend: http://localhost/"
    echo "  - Backend API: http://localhost:5000/api"
    echo "  - Backend Health: http://localhost:5000/api/health"
    echo ""
    echo "Next steps:"
    echo "  1. Setup domain & DNS (if not yet)"
    echo "  2. Run ./setup-subdomain.sh your-domain.com"
    echo "  3. Setup SSL certificates"
else
    echo -e "${RED}⚠️  Some services are not healthy${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  - Check logs: docker compose logs [service-name]"
    echo "  - Check .env file for correct credentials"
    echo "  - Try manual fixes:"
    echo "    - Backend: ./fix-backend.sh"
    echo "    - Frontend: ./fix-frontend.sh"
    echo "  - Full rebuild: docker compose down -v && docker compose up -d"
fi
