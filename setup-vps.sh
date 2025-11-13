#!/bin/bash

# Initial VPS Setup Script for Ubuntu Server
# Run this once on fresh VPS: ./setup-vps.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 VPS Setup Script for Pengaduan Sarpras${NC}"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root: sudo ./setup-vps.sh${NC}"
    exit 1
fi

# Step 1: Update system
echo -e "${YELLOW}1/12 Updating system...${NC}"
apt update && apt upgrade -y
echo -e "${GREEN}✅ System updated${NC}"
echo ""

# Step 2: Install Node.js 20
echo -e "${YELLOW}2/12 Installing Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
npm -v
echo -e "${GREEN}✅ Node.js installed${NC}"
echo ""

# Step 3: Install PM2
echo -e "${YELLOW}3/12 Installing PM2...${NC}"
npm install -g pm2
pm2 startup systemd -u $(logname) --hp /home/$(logname)
echo -e "${GREEN}✅ PM2 installed${NC}"
echo ""

# Step 4: Install Nginx
echo -e "${YELLOW}4/12 Installing Nginx...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx
echo -e "${GREEN}✅ Nginx installed${NC}"
echo ""

# Step 5: Install MySQL
echo -e "${YELLOW}5/12 Installing MySQL...${NC}"
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql
echo -e "${GREEN}✅ MySQL installed${NC}"
echo ""

# Step 6: Secure MySQL
echo -e "${YELLOW}6/12 Securing MySQL...${NC}"
echo "Run 'sudo mysql_secure_installation' manually after this script"
echo -e "${GREEN}✅ MySQL ready${NC}"
echo ""

# Step 7: Install Git
echo -e "${YELLOW}7/12 Installing Git...${NC}"
apt install -y git
echo -e "${GREEN}✅ Git installed${NC}"
echo ""

# Step 8: Install UFW Firewall
echo -e "${YELLOW}8/12 Setting up firewall...${NC}"
apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 3306  # MySQL (only if needed externally)
echo "y" | ufw enable
ufw status
echo -e "${GREEN}✅ Firewall configured${NC}"
echo ""

# Step 9: Create application directory
echo -e "${YELLOW}9/12 Creating application directory...${NC}"
mkdir -p /var/www/pengaduan-sarpras/frontend
mkdir -p /var/www/pengaduan-sarpras/logs
chown -R $(logname):$(logname) /var/www/pengaduan-sarpras
echo -e "${GREEN}✅ Directory created${NC}"
echo ""

# Step 10: Clone repository
echo -e "${YELLOW}10/12 Cloning repository...${NC}"
read -p "Enter your GitHub repository URL: " REPO_URL
if [ ! -z "$REPO_URL" ]; then
    cd /var/www
    rm -rf pengaduan-sarpras
    git clone $REPO_URL pengaduan-sarpras
    chown -R $(logname):$(logname) /var/www/pengaduan-sarpras
    echo -e "${GREEN}✅ Repository cloned${NC}"
else
    echo -e "${YELLOW}⚠️  Skipped repository cloning${NC}"
fi
echo ""

# Step 11: Setup MySQL database
echo -e "${YELLOW}11/12 Setting up MySQL database...${NC}"
read -p "Enter MySQL root password (press Enter if none): " MYSQL_ROOT_PASS
read -p "Enter database name [pengaduan_sarpras]: " DB_NAME
DB_NAME=${DB_NAME:-pengaduan_sarpras}
read -p "Enter database user [pengaduan_user]: " DB_USER
DB_USER=${DB_USER:-pengaduan_user}
read -sp "Enter database password: " DB_PASS
echo ""

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

echo -e "${GREEN}✅ Database created${NC}"
echo ""

# Step 12: Import database schema
echo -e "${YELLOW}12/12 Importing database schema...${NC}"
if [ -f "/var/www/pengaduan-sarpras/server/database/stored_procedures.sql" ]; then
    if [ -z "$MYSQL_ROOT_PASS" ]; then
        mysql $DB_NAME < /var/www/pengaduan-sarpras/server/database/stored_procedures.sql
    else
        mysql -u root -p$MYSQL_ROOT_PASS $DB_NAME < /var/www/pengaduan-sarpras/server/database/stored_procedures.sql
    fi
    echo -e "${GREEN}✅ Database schema imported${NC}"
else
    echo -e "${YELLOW}⚠️  Database schema file not found, skip this step${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo -e "${GREEN}🎉 VPS Setup Completed!${NC}"
echo ""
echo "What's installed:"
echo "  ✅ Node.js $(node -v)"
echo "  ✅ npm $(npm -v)"
echo "  ✅ PM2"
echo "  ✅ Nginx"
echo "  ✅ MySQL"
echo "  ✅ Git"
echo "  ✅ UFW Firewall"
echo ""
echo "Next steps:"
echo "  1. Run: sudo mysql_secure_installation"
echo "  2. Configure .env file in server directory"
echo "  3. Configure Nginx: sudo nano /etc/nginx/sites-available/pengaduan-sarpras"
echo "  4. Copy nginx.conf content from project root"
echo "  5. Enable site: sudo ln -s /etc/nginx/sites-available/pengaduan-sarpras /etc/nginx/sites-enabled/"
echo "  6. Test Nginx: sudo nginx -t"
echo "  7. Restart Nginx: sudo systemctl restart nginx"
echo "  8. Install dependencies: cd /var/www/pengaduan-sarpras/server && npm install"
echo "  9. Build frontend: cd /var/www/pengaduan-sarpras/clients/web && npm install && npm run build"
echo "  10. Start backend: cd /var/www/pengaduan-sarpras && pm2 start ecosystem.config.js --env production"
echo "  11. Setup SSL: sudo certbot --nginx -d your-domain.com"
echo ""
echo "Database Info:"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Host: localhost"
echo ""
echo "Useful commands:"
echo "  - PM2 logs: pm2 logs pengaduan-backend"
echo "  - PM2 status: pm2 status"
echo "  - Nginx logs: sudo tail -f /var/log/nginx/pengaduan-error.log"
echo "  - Restart app: ./deploy.sh"
