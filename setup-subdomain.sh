#!/bin/bash

# Script untuk setup subdomain configuration
# Usage: ./setup-subdomain.sh your-domain.com

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🌐 Subdomain Setup Script${NC}"
echo "================================"
echo ""

# Check if domain provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Domain not provided${NC}"
    echo "Usage: ./setup-subdomain.sh your-domain.com"
    echo "Example: ./setup-subdomain.sh pengaduan-sarpras.my.id"
    exit 1
fi

DOMAIN=$1
API_SUBDOMAIN="api.${DOMAIN}"
UKK_SUBDOMAIN="ukk.${DOMAIN}"
API_URL="https://${API_SUBDOMAIN}"

echo "Domain configuration:"
echo "  Main domain: ${DOMAIN}"
echo "  API subdomain: ${API_SUBDOMAIN}"
echo "  Frontend subdomain: ${UKK_SUBDOMAIN}"
echo "  API URL: ${API_URL}"
echo ""

# Confirm
read -p "Is this correct? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

# Step 1: Backup current nginx.conf
echo -e "${YELLOW}📦 Backing up nginx.conf...${NC}"
cp nginx/nginx.conf nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
echo -e "${GREEN}✅ Backup created${NC}"
echo ""

# Step 2: Update nginx.conf
echo -e "${YELLOW}📝 Updating nginx.conf with domain...${NC}"

# Update API subdomain
sed -i "s/server_name api\.domainmu\.com/server_name ${API_SUBDOMAIN}/g" nginx/nginx.conf
sed -i "s/api\.domainmu\.com/${API_SUBDOMAIN}/g" nginx/nginx.conf

# Update Frontend subdomain
sed -i "s/server_name ukk\.domainmu\.com/server_name ${UKK_SUBDOMAIN}/g" nginx/nginx.conf
sed -i "s/ukk\.domainmu\.com/${UKK_SUBDOMAIN}/g" nginx/nginx.conf

# Update CORS origin
sed -i "s|Access-Control-Allow-Origin \"https://ukk\.domainmu\.com\"|Access-Control-Allow-Origin \"https://${UKK_SUBDOMAIN}\"|g" nginx/nginx.conf

# Update redirect
sed -i "s|return 301 http://ukk\.domainmu\.com|return 301 http://${UKK_SUBDOMAIN}|g" nginx/nginx.conf

echo -e "${GREEN}✅ nginx.conf updated${NC}"
echo ""

# Step 3: Update .env
echo -e "${YELLOW}📝 Updating .env file...${NC}"

# Backup .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Update VITE_API_URL
if grep -q "VITE_API_URL=" .env; then
    sed -i "s|VITE_API_URL=.*|VITE_API_URL=${API_URL}|g" .env
    echo -e "${GREEN}✅ .env updated${NC}"
else
    echo "VITE_API_URL=${API_URL}" >> .env
    echo -e "${GREEN}✅ VITE_API_URL added to .env${NC}"
fi

echo ""
echo "Current .env VITE_API_URL:"
grep "VITE_API_URL" .env
echo ""

# Step 4: Test nginx config
echo -e "${YELLOW}🔍 Testing nginx configuration...${NC}"
if docker compose exec nginx nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    echo "Restoring backup..."
    cp nginx/nginx.conf.backup.* nginx/nginx.conf
    exit 1
fi
echo ""

# Step 5: Stop services
echo -e "${YELLOW}🛑 Stopping services...${NC}"
docker compose down
echo ""

# Step 6: Remove frontend volume (force refresh)
echo -e "${YELLOW}🗑️  Removing frontend volume...${NC}"
docker volume rm pengaduan-sarpras_frontend_dist 2>/dev/null || echo "Volume already removed"
echo ""

# Step 7: Rebuild frontend
echo -e "${YELLOW}🔨 Rebuilding frontend with new API URL...${NC}"
docker compose build --no-cache frontend
echo -e "${GREEN}✅ Frontend rebuilt${NC}"
echo ""

# Step 8: Start all services
echo -e "${YELLOW}� Starting all services...${NC}"
docker compose up -d
echo ""

# Wait for services
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 15

# Step 9: Check status
echo -e "${YELLOW}📊 Service status:${NC}"
docker compose ps
echo ""

# Step 10: Check frontend files
echo -e "${YELLOW}🔍 Checking frontend files...${NC}"
echo "Files in nginx html directory:"
docker compose exec nginx ls -lah /usr/share/nginx/html | head -10
echo ""

# Step 11: Test endpoints
echo -e "${YELLOW}🧪 Testing endpoints...${NC}"
echo ""

# Test API health
echo -n "Testing API health endpoint... "
if curl -s -f "http://localhost/health" -H "Host: ${API_SUBDOMAIN}" > /dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

# Test Frontend health
echo -n "Testing Frontend health endpoint... "
if curl -s -f "http://localhost/health" -H "Host: ${UKK_SUBDOMAIN}" > /dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

# Test Frontend HTML
echo -n "Testing Frontend HTML... "
RESPONSE=$(curl -s "http://localhost/" -H "Host: ${UKK_SUBDOMAIN}")
if echo "$RESPONSE" | grep -q "<!DOCTYPE html\|<html"; then
    echo -e "${GREEN}✅ OK - HTML detected${NC}"
else
    echo -e "${RED}❌ Failed - No HTML detected${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ Subdomain setup completed!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo "1. Setup DNS records di Cloudflare:"
echo "   - Type: A, Name: api, Content: [your-server-ip]"
echo "   - Type: A, Name: ukk, Content: [your-server-ip]"
echo "   - Type: A, Name: @, Content: [your-server-ip]"
echo "   - Type: A, Name: www, Content: [your-server-ip]"
echo ""
echo "2. Wait for DNS propagation (5-30 minutes)"
echo ""
echo "3. Test DNS:"
echo "   nslookup ${API_SUBDOMAIN}"
echo "   nslookup ${UKK_SUBDOMAIN}"
echo ""
echo "4. Test via browser:"
echo "   http://${API_SUBDOMAIN}/health"
echo "   http://${UKK_SUBDOMAIN}/"
echo ""
echo "5. Setup SSL (Cloudflare):"
echo "   - SSL/TLS mode: Flexible (or Full Strict)"
echo "   - Always Use HTTPS: ON"
echo ""
echo "6. Test HTTPS:"
echo "   https://${API_SUBDOMAIN}/health"
echo "   https://${UKK_SUBDOMAIN}/"
echo ""
echo "Backup files created:"
ls -lh nginx/nginx.conf.backup.* .env.backup.* 2>/dev/null | tail -2
