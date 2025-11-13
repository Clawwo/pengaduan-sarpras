#!/bin/bash

# Test Docker build script
# Usage: ./test-build.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Docker Build Test Script${NC}"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose V2"
    exit 1
fi

echo -e "${GREEN}✅ Docker installed:${NC} $(docker --version)"
echo -e "${GREEN}✅ Docker Compose installed:${NC} $(docker compose version)"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating from .env.production template..."
    cp .env.production .env
    echo -e "${YELLOW}⚠️  Please edit .env file with your configuration${NC}"
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"
echo ""

# Test 1: Build frontend only
echo -e "${YELLOW}📦 Test 1: Building frontend...${NC}"
if docker compose build frontend; then
    echo -e "${GREEN}✅ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi
echo ""

# Test 2: Build backend only
echo -e "${YELLOW}📦 Test 2: Building backend...${NC}"
if docker compose build backend; then
    echo -e "${GREEN}✅ Backend build successful${NC}"
else
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
fi
echo ""

# Test 3: Build nginx
echo -e "${YELLOW}📦 Test 3: Building nginx...${NC}"
if docker compose build nginx; then
    echo -e "${GREEN}✅ Nginx build successful${NC}"
else
    echo -e "${RED}❌ Nginx build failed${NC}"
    exit 1
fi
echo ""

# Test 4: Check images created
echo -e "${YELLOW}🖼️  Test 4: Checking images...${NC}"
docker images | grep "pengaduan-sarpras"
echo ""

# Test 5: Check image sizes
echo -e "${YELLOW}📏 Test 5: Image sizes:${NC}"
FRONTEND_SIZE=$(docker images pengaduan-sarpras-frontend:latest --format "{{.Size}}")
BACKEND_SIZE=$(docker images pengaduan-sarpras-backend:latest --format "{{.Size}}")
NGINX_SIZE=$(docker images pengaduan-sarpras-nginx:latest --format "{{.Size}}")

echo "  Frontend: $FRONTEND_SIZE"
echo "  Backend:  $BACKEND_SIZE"
echo "  Nginx:    $NGINX_SIZE"
echo ""

# Summary
echo "================================"
echo -e "${GREEN}✅ All build tests passed!${NC}"
echo ""
echo "Next steps:"
echo "  1. Start services: docker compose up -d"
echo "  2. Check status:   docker compose ps"
echo "  3. View logs:      docker compose logs -f"
echo ""
echo "Access application at:"
echo "  - Frontend: http://localhost"
echo "  - Backend:  http://localhost/api"
echo "  - Health:   http://localhost/health"
