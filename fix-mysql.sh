#!/bin/bash

# MySQL Troubleshooting Script
# Untuk memperbaiki MySQL container yang unhealthy

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 MySQL Container Fix Script${NC}"
echo "================================"
echo ""

# Step 1: Stop all containers
echo -e "${YELLOW}🛑 Stopping all containers...${NC}"
docker compose down

# Step 2: Remove MySQL volume (if needed)
read -p "Remove MySQL volume and start fresh? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🗑️  Removing MySQL volume...${NC}"
    docker volume rm pengaduan-sarpras_mysql_data || true
    echo -e "${GREEN}✅ MySQL volume removed${NC}"
fi

# Step 3: Check .env file
echo -e "${YELLOW}📝 Checking .env file...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

# Load env vars
set -a
source .env
set +a

echo "DB_NAME: ${DB_NAME}"
echo "DB_USER: ${DB_USER}"
echo "DB_PASSWORD: [HIDDEN]"
echo "DB_ROOT_PASSWORD: [HIDDEN]"
echo ""

# Step 4: Verify database files exist
echo -e "${YELLOW}📁 Checking database initialization files...${NC}"
if [ ! -f server/database/stored_procedures.sql ]; then
    echo -e "${RED}❌ stored_procedures.sql not found!${NC}"
    exit 1
fi

if [ ! -f server/database/add_columns.sql ]; then
    echo -e "${RED}❌ add_columns.sql not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database files found${NC}"
echo ""

# Step 5: Start MySQL only first
echo -e "${YELLOW}🚀 Starting MySQL container...${NC}"
docker compose up -d mysql

echo -e "${YELLOW}⏳ Waiting for MySQL to initialize (this may take 60-90 seconds)...${NC}"
echo "Progress: "

for i in {1..90}; do
    echo -n "."
    sleep 1
    
    # Check if MySQL is healthy
    if docker compose ps mysql | grep -q "healthy"; then
        echo ""
        echo -e "${GREEN}✅ MySQL is healthy!${NC}"
        break
    fi
    
    # Check for errors
    if docker compose ps mysql | grep -q "unhealthy"; then
        echo ""
        echo -e "${RED}⚠️  MySQL still unhealthy after $i seconds${NC}"
        
        if [ $i -eq 90 ]; then
            echo -e "${RED}❌ MySQL failed to start properly${NC}"
            echo ""
            echo "Showing MySQL logs:"
            docker compose logs mysql | tail -30
            exit 1
        fi
    fi
done

echo ""

# Step 6: Verify MySQL is accessible
echo -e "${YELLOW}🔍 Testing MySQL connection...${NC}"
docker compose exec mysql mysql -u root -p${DB_ROOT_PASSWORD} -e "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ MySQL connection successful${NC}"
else
    echo -e "${RED}❌ MySQL connection failed${NC}"
    echo "Trying to connect..."
    docker compose exec mysql mysql -u root -p${DB_ROOT_PASSWORD} -e "SHOW DATABASES;"
fi

echo ""

# Step 7: Check database created
echo -e "${YELLOW}📊 Checking database...${NC}"
docker compose exec mysql mysql -u root -p${DB_ROOT_PASSWORD} -e "SHOW DATABASES;" | grep ${DB_NAME}
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database '${DB_NAME}' exists${NC}"
else
    echo -e "${YELLOW}⚠️  Database '${DB_NAME}' not found, creating...${NC}"
    docker compose exec mysql mysql -u root -p${DB_ROOT_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};"
fi

echo ""

# Step 8: Start all services
echo -e "${YELLOW}🚀 Starting all services...${NC}"
docker compose up -d

echo ""
echo -e "${YELLOW}⏳ Waiting for all services to be ready...${NC}"
sleep 10

# Step 9: Check all services
echo -e "${YELLOW}📊 Service status:${NC}"
docker compose ps

echo ""
echo "================================"
echo -e "${GREEN}✅ MySQL fix completed!${NC}"
echo ""
echo "Next steps:"
echo "  1. Check logs: docker compose logs -f"
echo "  2. Test backend: curl http://localhost:5000"
echo "  3. Test frontend: curl http://localhost"
echo ""
echo "If issues persist, check:"
echo "  - MySQL logs: docker compose logs mysql"
echo "  - Backend logs: docker compose logs backend"
echo "  - Environment variables in .env file"
