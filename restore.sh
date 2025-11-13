#!/bin/bash

# Restore database dari backup
# Usage: ./restore.sh backup_20241112_143000.sql.gz

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if backup file provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: No backup file specified${NC}"
    echo "Usage: ./restore.sh backup_20241112_143000.sql.gz"
    echo ""
    echo "Available backups:"
    ls -lh backups/backup_*.sql.gz
    exit 1
fi

BACKUP_FILE=$1

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Confirm restore
echo -e "${YELLOW}⚠️  WARNING: This will replace the current database!${NC}"
read -p "Are you sure you want to restore from $BACKUP_FILE? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled."
    exit 0
fi

echo -e "${YELLOW}📦 Starting database restore...${NC}"

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
    echo -e "${YELLOW}🗜️  Decompressing backup...${NC}"
    gunzip -c $BACKUP_FILE > temp_restore.sql
    SQL_FILE="temp_restore.sql"
else
    SQL_FILE=$BACKUP_FILE
fi

# Restore database
echo -e "${YELLOW}💾 Restoring database: ${DB_NAME}${NC}"
docker exec -i pengaduan-mysql mysql \
    -u root \
    -p${DB_ROOT_PASSWORD} \
    ${DB_NAME} < $SQL_FILE

# Cleanup temp file
if [ "$SQL_FILE" == "temp_restore.sql" ]; then
    rm temp_restore.sql
fi

echo -e "${GREEN}✅ Database restored successfully!${NC}"
echo ""
echo "Restarting backend service..."
docker compose restart backend

echo -e "${GREEN}✅ Restore process completed!${NC}"
