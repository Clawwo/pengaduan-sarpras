#!/bin/bash

# Script untuk fix backend unhealthy issue
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Fixing Backend Unhealthy Issue${NC}"
echo "================================"
echo ""

# Step 1: Check current status
echo -e "${YELLOW}📊 Current container status:${NC}"
docker compose ps
echo ""

# Step 2: Check backend logs
echo -e "${YELLOW}📋 Recent backend logs:${NC}"
docker compose logs backend --tail=30
echo ""

# Step 3: Test database connection
echo -e "${YELLOW}🔍 Testing database connection...${NC}"
if docker compose exec mysql mysqladmin ping -h localhost --silent; then
    echo -e "${GREEN}✅ MySQL is reachable${NC}"
else
    echo -e "${RED}❌ MySQL is NOT reachable${NC}"
    exit 1
fi
echo ""

# Step 4: Check environment variables
echo -e "${YELLOW}🔍 Checking environment variables...${NC}"
echo "Database config:"
docker compose exec backend env | grep -E "DB_HOST|DB_PORT|DB_NAME|DB_USER|PORT" || echo "ENV vars not found"
echo ""

# Step 5: Rebuild backend
echo -e "${YELLOW}🔨 Rebuilding backend...${NC}"
docker compose build --no-cache backend
echo -e "${GREEN}✅ Backend rebuilt${NC}"
echo ""

# Step 6: Restart services
echo -e "${YELLOW}🔄 Restarting services...${NC}"
docker compose up -d backend
echo ""

# Step 7: Wait for backend
echo -e "${YELLOW}⏳ Waiting for backend to be healthy (max 2 minutes)...${NC}"
for i in {1..24}; do
    sleep 5
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' pengaduan-backend 2>/dev/null || echo "none")
    echo -n "Attempt $i/24: Backend status is '$STATUS'..."
    
    if [ "$STATUS" = "healthy" ]; then
        echo -e " ${GREEN}✅ HEALTHY!${NC}"
        break
    elif [ "$STATUS" = "unhealthy" ]; then
        echo -e " ${RED}❌ UNHEALTHY${NC}"
        echo ""
        echo "Checking logs for errors:"
        docker compose logs backend --tail=20
        echo ""
    else
        echo " waiting..."
    fi
done
echo ""

# Step 8: Test health endpoint
echo -e "${YELLOW}🧪 Testing health endpoint...${NC}"
echo ""

echo -n "Testing /api/health... "
if curl -s -f "http://localhost:5000/api/health" > /dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
    curl -s "http://localhost:5000/api/health" | jq '.' 2>/dev/null || curl -s "http://localhost:5000/api/health"
else
    echo -e "${RED}❌ Failed${NC}"
fi
echo ""

echo -n "Testing /api... "
if curl -s -f "http://localhost:5000/api" > /dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
    curl -s "http://localhost:5000/api" | jq '.' 2>/dev/null || curl -s "http://localhost:5000/api"
else
    echo -e "${RED}❌ Failed${NC}"
fi
echo ""

# Step 9: Final status check
echo -e "${YELLOW}📊 Final container status:${NC}"
docker compose ps
echo ""

# Step 10: Check if all healthy
ALL_HEALTHY=true
for container in pengaduan-mysql pengaduan-backend pengaduan-nginx; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' $container 2>/dev/null || echo "none")
    if [ "$STATUS" != "healthy" ] && [ "$container" != "pengaduan-nginx" ]; then
        ALL_HEALTHY=false
        echo -e "${RED}❌ $container is $STATUS${NC}"
    fi
done

echo ""
if [ "$ALL_HEALTHY" = true ]; then
    echo "================================"
    echo -e "${GREEN}✅ Backend is now healthy!${NC}"
    echo ""
    echo "All services are running:"
    echo "  ✅ MySQL: healthy"
    echo "  ✅ Backend: healthy"
    echo "  ✅ Frontend: completed"
    echo "  ✅ Nginx: running"
else
    echo "================================"
    echo -e "${RED}❌ Some containers are still unhealthy${NC}"
    echo ""
    echo "Troubleshooting steps:"
    echo "  1. Check logs: docker compose logs backend"
    echo "  2. Check database: docker compose exec backend node -e 'console.log(\"Node OK\")'"
    echo "  3. Check .env file for correct DB credentials"
    echo "  4. Try full rebuild: docker compose down && docker compose up -d"
fi
