#!/bin/bash

# Backup script untuk database
# Usage: ./backup.sh

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📦 Starting database backup...${NC}"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
echo -e "${YELLOW}💾 Backing up database: ${DB_NAME}${NC}"
docker exec pengaduan-mysql mysqldump \
    -u root \
    -p${DB_ROOT_PASSWORD} \
    ${DB_NAME} > ${BACKUP_DIR}/${BACKUP_FILE}

# Compress backup
echo -e "${YELLOW}🗜️  Compressing backup...${NC}"
gzip ${BACKUP_DIR}/${BACKUP_FILE}

# Show backup info
BACKUP_SIZE=$(du -h ${BACKUP_DIR}/${BACKUP_FILE}.gz | cut -f1)
echo -e "${GREEN}✅ Backup completed!${NC}"
echo "File: ${BACKUP_DIR}/${BACKUP_FILE}.gz"
echo "Size: ${BACKUP_SIZE}"

# Keep only last 7 backups
echo -e "${YELLOW}🧹 Cleaning old backups (keeping last 7)...${NC}"
cd ${BACKUP_DIR}
ls -t backup_*.sql.gz | tail -n +8 | xargs -r rm --
cd ..

echo -e "${GREEN}✅ Backup process finished!${NC}"
