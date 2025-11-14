#!/bin/bash

# =============================================
# VPS Fresh Setup Script - Ubuntu 22.04
# =============================================
# Usage: sudo ./fresh-setup-vps.sh
# This script will install everything needed from scratch

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  VPS Fresh Setup - Pengaduan Sarpras  ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root: sudo ./fresh-setup-vps.sh${NC}"
    exit 1
fi

# Get the actual user (not root)
ACTUAL_USER=${SUDO_USER:-$USER}
ACTUAL_HOME=$(eval echo ~$ACTUAL_USER)

echo -e "${YELLOW}Running as: root${NC}"
echo -e "${YELLOW}Actual user: $ACTUAL_USER${NC}"
echo -e "${YELLOW}User home: $ACTUAL_HOME${NC}"
echo ""

# Confirm
read -p "Continue with fresh VPS setup? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

# =============================================
# STEP 1: Update System
# =============================================
echo -e "${YELLOW}[1/10] Updating system packages...${NC}"
apt update && apt upgrade -y
echo -e "${GREEN}✅ System updated${NC}"
echo ""

# =============================================
# STEP 2: Install Node.js 20
# =============================================
echo -e "${YELLOW}[2/10] Installing Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "Node version: $(node -v)"
echo "npm version: $(npm -v)"
echo -e "${GREEN}✅ Node.js installed${NC}"
echo ""

# =============================================
# STEP 3: Install PM2
# =============================================
echo -e "${YELLOW}[3/10] Installing PM2...${NC}"
npm install -g pm2
pm2 startup systemd -u $ACTUAL_USER --hp $ACTUAL_HOME
echo -e "${GREEN}✅ PM2 installed${NC}"
echo ""

# =============================================
# STEP 4: Install Nginx
# =============================================
echo -e "${YELLOW}[4/10] Installing Nginx...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx
echo -e "${GREEN}✅ Nginx installed and running${NC}"
echo ""

# =============================================
# STEP 5: Install MySQL
# =============================================
echo -e "${YELLOW}[5/10] Installing MySQL 8...${NC}"
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql
echo -e "${GREEN}✅ MySQL installed${NC}"
echo ""

# =============================================
# STEP 6: Install Git & Tools
# =============================================
echo -e "${YELLOW}[6/10] Installing Git and tools...${NC}"
apt install -y git curl wget nano htop unzip
echo -e "${GREEN}✅ Tools installed${NC}"
echo ""

# =============================================
# STEP 7: Setup Firewall
# =============================================
echo -e "${YELLOW}[7/10] Setting up UFW firewall...${NC}"
apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable
ufw status
echo -e "${GREEN}✅ Firewall configured${NC}"
echo ""

# =============================================
# STEP 8: Create App Directory
# =============================================
echo -e "${YELLOW}[8/10] Creating application directory...${NC}"
mkdir -p /var/www/pengaduan-sarpras
mkdir -p /var/www/pengaduan-sarpras/logs
chown -R $ACTUAL_USER:$ACTUAL_USER /var/www/pengaduan-sarpras
echo -e "${GREEN}✅ Directory created at /var/www/pengaduan-sarpras${NC}"
echo ""

# =============================================
# STEP 9: Setup MySQL Database
# =============================================
echo -e "${YELLOW}[9/10] Setting up MySQL database...${NC}"
read -p "Enter MySQL root password (press Enter if none): " MYSQL_ROOT_PASS
read -p "Enter new database name [pengaduan_sarpras]: " DB_NAME
DB_NAME=${DB_NAME:-pengaduan_sarpras}
read -p "Enter new database user [clawwo]: " DB_USER
DB_USER=${DB_USER:-clawwo}
read -sp "Enter new database password: " DB_PASS
echo ""

# Create database and user
if [ -z "$MYSQL_ROOT_PASS" ]; then
    mysql <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF
else
    mysql -u root -p$MYSQL_ROOT_PASS <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF
fi

echo -e "${GREEN}✅ Database '$DB_NAME' created${NC}"
echo -e "${GREEN}✅ User '$DB_USER' created with full privileges${NC}"
echo ""

# =============================================
# STEP 10: Save Configuration
# =============================================
echo -e "${YELLOW}[10/10] Saving configuration...${NC}"

# Create config file
cat > /var/www/pengaduan-sarpras/SETUP_INFO.txt <<EOF
=============================================
VPS SETUP CONFIGURATION
=============================================
Setup Date: $(date)
Server User: $ACTUAL_USER
App Directory: /var/www/pengaduan-sarpras

DATABASE INFO:
- Database Name: $DB_NAME
- Database User: $DB_USER
- Database Password: $DB_PASS
- Host: localhost
- Port: 3306

SERVICES INSTALLED:
- Node.js: $(node -v)
- npm: $(npm -v)
- PM2: $(pm2 -v)
- Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)
- MySQL: $(mysql --version | cut -d' ' -f6)
- Git: $(git --version | cut -d' ' -f3)

NEXT STEPS:
1. Clone repository: 
   cd /var/www/pengaduan-sarpras
   git clone <your-repo-url> .

2. Setup environment:
   cp .env.production server/.env
   nano server/.env
   (Update DB credentials and other configs)

3. Install dependencies:
   cd server && npm install --production
   cd ../clients/web && npm install

4. Import database:
   mysql -u $DB_USER -p$DB_PASS $DB_NAME < path/to/database.sql

5. Build frontend:
   cd clients/web
   npm run build

6. Setup Nginx:
   sudo cp nginx.conf /etc/nginx/sites-available/pengaduan-sarpras
   sudo nano /etc/nginx/sites-available/pengaduan-sarpras
   (Update domain name)
   sudo ln -s /etc/nginx/sites-available/pengaduan-sarpras /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx

7. Start backend:
   cd /var/www/pengaduan-sarpras
   pm2 start ecosystem.config.js --env production
   pm2 save

8. Setup SSL:
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com

USEFUL COMMANDS:
- PM2 logs: pm2 logs pengaduan-backend
- PM2 status: pm2 status
- Nginx test: sudo nginx -t
- Restart Nginx: sudo systemctl restart nginx
- MySQL login: mysql -u $DB_USER -p
=============================================
EOF

chown $ACTUAL_USER:$ACTUAL_USER /var/www/pengaduan-sarpras/SETUP_INFO.txt
echo -e "${GREEN}✅ Configuration saved to /var/www/pengaduan-sarpras/SETUP_INFO.txt${NC}"
echo ""

# =============================================
# SUMMARY
# =============================================
echo "=========================================="
echo -e "${GREEN}🎉 VPS Setup Completed Successfully!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}What's Installed:${NC}"
echo "  ✅ Node.js $(node -v)"
echo "  ✅ npm $(npm -v)"
echo "  ✅ PM2 $(pm2 -v)"
echo "  ✅ Nginx"
echo "  ✅ MySQL 8"
echo "  ✅ Git"
echo "  ✅ UFW Firewall"
echo ""
echo -e "${BLUE}Database Created:${NC}"
echo "  Name: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASS"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Logout and login again (for group permissions)"
echo "  2. Run: sudo mysql_secure_installation"
echo "  3. Clone your repository to /var/www/pengaduan-sarpras"
echo "  4. Follow steps in /var/www/pengaduan-sarpras/SETUP_INFO.txt"
echo ""
echo -e "${BLUE}Configuration saved to:${NC}"
echo "  /var/www/pengaduan-sarpras/SETUP_INFO.txt"
echo ""
echo "=========================================="
