# 🚀 VPS Deployment Guide - Ubuntu Server# 🚀 Deployment Guide - Sistem Pengaduan Sarana Prasarana



Complete guide untuk deploy aplikasi Pengaduan Sarpras ke VPS Ubuntu.## 📋 Daftar Isi



## 📋 Prerequisites1. [Spesifikasi Server](#spesifikasi-server)

2. [Persiapan Awal](#persiapan-awal)

### VPS Requirements:3. [Setup Docker & Docker Compose](#setup-docker--docker-compose)

- **OS:** Ubuntu 22.04 LTS or newer4. [Konfigurasi Environment](#konfigurasi-environment)

- **RAM:** Minimum 2GB (recommended 4GB)5. [Build & Deploy](#build--deploy)

- **Storage:** Minimum 20GB SSD6. [SSL dengan Cloudflare](#ssl-dengan-cloudflare)

- **CPU:** 1 vCPU minimum7. [Monitoring & Maintenance](#monitoring--maintenance)

- **Network:** Public IP address8. [Troubleshooting](#troubleshooting)



### Domain Requirements:---

- Domain name (e.g., pengaduan-sarpras.my.id)

- DNS pointed to VPS IP address## 🖥️ Spesifikasi Server



### Local Requirements:### Biznet Gio NEO Lite - SS.2

- SSH access to VPS

- Git installed**Spesifikasi:**



---- **CPU:** 1 vCPU

- **RAM:** 2 GB

## 🎯 Quick Start (5 Steps)- **Storage:** 60 GB SSD

- **Bandwidth:** Unlimited

### 1️⃣ Connect to VPS- **OS:** Ubuntu 22.04 LTS (Recommended)

```bash

ssh root@your-vps-ip**Apakah Cukup?** ✅ **YA, SANGAT CUKUP!**

# or

ssh your-username@your-vps-ip**Analisis Kebutuhan Project:**

```

```

### 2️⃣ Upload and Run Setup ScriptBackend (Node.js):        ~150-200 MB RAM

```bashDatabase (MySQL 8):       ~400-500 MB RAM

# Upload setup-vps.sh from local to VPSNginx:                    ~50-100 MB RAM

# On VPS:Docker Overhead:          ~200-300 MB RAM

chmod +x setup-vps.shOS Ubuntu:                ~300-400 MB RAM

sudo ./setup-vps.sh─────────────────────────────────────────

```Total Estimasi:           ~1.1-1.5 GB RAM

Available:                2 GB RAM ✅

This will install:

- ✅ Node.js 20Storage:

- ✅ PM2 (process manager)Application Code:         ~100 MB

- ✅ Nginx (web server)Docker Images:            ~2-3 GB

- ✅ MySQL (database)MySQL Data:               ~1-5 GB (tergantung data)

- ✅ GitLogs & Backups:          ~5-10 GB

- ✅ UFW Firewall─────────────────────────────────────────

Total Estimasi:          ~8-18 GB

### 3️⃣ Configure ApplicationAvailable:               60 GB SSD ✅

```bash```

# Go to application directory

cd /var/www/pengaduan-sarpras**Kesimpulan:** NEO Lite SS.2 perfect untuk project ini! 🎉



# Configure backend environment---

cp .env.production server/.env

nano server/.env## 🔧 Persiapan Awal

# Update: DB credentials, JWT_SECRET, ImageKit keys

### 1. Akses ke Server

# Configure frontend environment

nano clients/web/.env.production```bash

# Update: VITE_API_URL=https://your-domain.com# Login via SSH

```ssh root@your-server-ip



### 4️⃣ Setup Nginx# Update sistem

```bashsudo apt update && sudo apt upgrade -y

# Copy nginx config

sudo cp nginx.conf /etc/nginx/sites-available/pengaduan-sarpras# Install dependencies dasar

sudo apt install -y curl wget git vim nano htop

# Edit with your domain```

sudo nano /etc/nginx/sites-available/pengaduan-sarpras

# Replace: your-domain.com with actual domain### 2. Setup User Non-Root (Security Best Practice)



# Enable site```bash

sudo ln -s /etc/nginx/sites-available/pengaduan-sarpras /etc/nginx/sites-enabled/# Buat user baru

adduser deploy

# Remove default siteusermod -aG sudo deploy

sudo rm /etc/nginx/sites-enabled/default

# Switch ke user deploy

# Test and restartsu - deploy

sudo nginx -t```

sudo systemctl restart nginx

```### 3. Setup Firewall



### 5️⃣ Deploy Application```bash

```bash# Install UFW (Uncomplicated Firewall)

cd /var/www/pengaduan-sarprassudo apt install ufw -y

chmod +x deploy.sh

./deploy.sh# Konfigurasi firewall

```sudo ufw default deny incoming

sudo ufw default allow outgoing

**Done!** 🎉 Your app is live at `http://your-domain.com`sudo ufw allow ssh

sudo ufw allow 80/tcp    # HTTP

---sudo ufw allow 443/tcp   # HTTPS

sudo ufw enable

## 📝 Detailed Step-by-Step Guide

# Cek status

### Step 1: Initial VPS Setupsudo ufw status verbose

```

#### 1.1 Connect to VPS

```bash---

ssh root@your-vps-ip

```## 🐳 Setup Docker & Docker Compose



#### 1.2 Create Non-Root User (Recommended)### 1. Install Docker

```bash

adduser deployer```bash

usermod -aG sudo deployer# Remove old versions jika ada

su - deployersudo apt remove docker docker-engine docker.io containerd runc

```

# Install prerequisites

#### 1.3 Upload Setup Scriptsudo apt update

From your local machine:sudo apt install -y \

```bash    ca-certificates \

scp setup-vps.sh deployer@your-vps-ip:/home/deployer/    curl \

```    gnupg \

    lsb-release

On VPS:

```bash# Add Docker's official GPG key

chmod +x setup-vps.shsudo mkdir -m 0755 -p /etc/apt/keyrings

sudo ./setup-vps.shcurl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

```

# Setup repository

Follow prompts:echo \

- Enter GitHub repository URL  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \

- Enter MySQL database credentials  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

- Confirm installations

# Install Docker Engine (Latest)

---sudo apt update

sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

### Step 2: Database Setup

# Verify installation

#### 2.1 Secure MySQLdocker --version

```bash# Output: Docker version 24.x.x, build xxx

sudo mysql_secure_installation

```# Add user to docker group

sudo usermod -aG docker $USER

Answer:newgrp docker

- Set root password: **Yes** (enter strong password)

- Remove anonymous users: **Yes**# Test Docker

- Disallow root login remotely: **Yes**docker run hello-world

- Remove test database: **Yes**```

- Reload privilege tables: **Yes**

### 2. Install Docker Compose V2 (Latest)

#### 2.2 Verify Database

```bash```bash

mysql -u pengaduan_user -p# Docker Compose V2 sudah included di Docker Engine terbaru

```docker compose version

# Output: Docker Compose version v2.x.x

```sql

SHOW DATABASES;# Jika perlu install manual:

USE pengaduan_sarpras;sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

SHOW TABLES;sudo chmod +x /usr/local/bin/docker-compose

EXIT;```

```

---

#### 2.3 Import Schema (if not auto-imported)

```bash## 📁 Struktur Project di Server

cd /var/www/pengaduan-sarpras

mysql -u pengaduan_user -p pengaduan_sarpras < server/database/stored_procedures.sql```bash

mysql -u pengaduan_user -p pengaduan_sarpras < server/database/add_columns.sql# Buat direktori project

```mkdir -p ~/pengaduan-sarpras

cd ~/pengaduan-sarpras

---

# Clone repository (atau upload via SFTP)

### Step 3: Backend Configurationgit clone https://github.com/your-username/pengaduan-sarpras.git .



#### 3.1 Setup Environment Variables# Struktur yang akan kita buat:

```bashpengaduan-sarpras/

cd /var/www/pengaduan-sarpras├── docker-compose.yml

cp .env.production server/.env├── .env.production

nano server/.env├── nginx/

```│   ├── Dockerfile

│   └── nginx.conf

Update these values:├── server/

```env│   ├── Dockerfile

NODE_ENV=production│   ├── .env

PORT=5000│   └── ... (backend files)

├── clients/

# Database│   └── web/

DB_HOST=localhost│       ├── Dockerfile

DB_PORT=3306│       └── ... (frontend files)

DB_NAME=pengaduan_sarpras└── mysql/

DB_USER=pengaduan_user    └── init.sql (optional)

DB_PASSWORD=your_actual_password```



# JWT Secret (generate with: openssl rand -base64 32)---

JWT_SECRET=your_generated_jwt_secret

## 🐋 Docker Configuration Files

# ImageKit (from https://imagekit.io dashboard)

IMAGEKIT_PUBLIC_KEY=your_public_key### 1. Docker Compose (Root: `docker-compose.yml`)

IMAGEKIT_PRIVATE_KEY=your_private_key

IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_idBuat file `docker-compose.yml` di root project:



# CORS```yaml

FRONTEND_URL=https://your-domain.comversion: "3.8"

```

services:

#### 3.2 Install Backend Dependencies  # MySQL Database

```bash  mysql:

cd /var/www/pengaduan-sarpras/server    image: mysql:8.2.0

npm install --production    container_name: pengaduan-mysql

```    restart: always

    environment:

#### 3.3 Test Backend      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}

```bash      MYSQL_DATABASE: ${DB_NAME}

# Test if backend starts      MYSQL_USER: ${DB_USER}

node server.js      MYSQL_PASSWORD: ${DB_PASSWORD}

      TZ: Asia/Jakarta

# Should see: Server running on port 5000    volumes:

# Press Ctrl+C to stop      - mysql_data:/var/lib/mysql

```      - ./server/database/stored_procedures.sql:/docker-entrypoint-initdb.d/01-stored_procedures.sql

      - ./server/database/add_columns.sql:/docker-entrypoint-initdb.d/02-add_columns.sql

---    ports:

      - "3306:3306"

### Step 4: Frontend Configuration    networks:

      - pengaduan-network

#### 4.1 Setup Environment Variables    command: --default-authentication-plugin=mysql_native_password --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

```bash    healthcheck:

cd /var/www/pengaduan-sarpras/clients/web      test:

nano .env.production        [

```          "CMD",

          "mysqladmin",

Update:          "ping",

```env          "-h",

VITE_API_URL=https://your-domain.com          "localhost",

```          "-u",

          "root",

#### 4.2 Build Frontend          "-p${DB_ROOT_PASSWORD}",

```bash        ]

npm install      interval: 10s

npm run build      timeout: 5s

```      retries: 5



#### 4.3 Deploy Frontend Files  # Backend Node.js

```bash  backend:

sudo cp -r dist/* /var/www/pengaduan-sarpras/frontend/    build:

```      context: ./server

      dockerfile: Dockerfile

---    container_name: pengaduan-backend

    restart: always

### Step 5: Nginx Configuration    depends_on:

      mysql:

#### 5.1 Copy Config File        condition: service_healthy

```bash    environment:

sudo cp /var/www/pengaduan-sarpras/nginx.conf /etc/nginx/sites-available/pengaduan-sarpras      NODE_ENV: production

```      PORT: 5000

      DB_HOST: mysql

#### 5.2 Edit Configuration      DB_PORT: 3306

```bash      DB_NAME: ${DB_NAME}

sudo nano /etc/nginx/sites-available/pengaduan-sarpras      DB_USER: ${DB_USER}

```      DB_PASSWORD: ${DB_PASSWORD}

      JWT_SECRET: ${JWT_SECRET}

Replace:      IMAGEKIT_PUBLIC_KEY: ${IMAGEKIT_PUBLIC_KEY}

- `your-domain.com` → your actual domain      IMAGEKIT_PRIVATE_KEY: ${IMAGEKIT_PRIVATE_KEY}

- `/var/www/pengaduan-sarpras/frontend` → verify path is correct      IMAGEKIT_URL_ENDPOINT: ${IMAGEKIT_URL_ENDPOINT}

    volumes:

#### 5.3 Enable Site      - ./server:/app

```bash      - /app/node_modules

# Create symbolic link    ports:

sudo ln -s /etc/nginx/sites-available/pengaduan-sarpras /etc/nginx/sites-enabled/      - "5000:5000"

    networks:

# Remove default site      - pengaduan-network

sudo rm /etc/nginx/sites-enabled/default    healthcheck:

      test: ["CMD", "curl", "-f", "http://localhost:5000/"]

# Test configuration      interval: 30s

sudo nginx -t      timeout: 10s

      retries: 3

# Restart Nginx

sudo systemctl restart nginx  # Frontend Web (React + Vite)

```  frontend:

    build:

#### 5.4 Check Nginx Status      context: ./clients/web

```bash      dockerfile: Dockerfile

sudo systemctl status nginx      args:

```        VITE_API_URL: ${VITE_API_URL}

    container_name: pengaduan-frontend

---    restart: always

    depends_on:

### Step 6: PM2 Process Manager      - backend

    volumes:

#### 6.1 Start Backend with PM2      - frontend_dist:/app/dist

```bash    networks:

cd /var/www/pengaduan-sarpras      - pengaduan-network

pm2 start ecosystem.config.js --env production

```  # Nginx Reverse Proxy

  nginx:

#### 6.2 Save PM2 Config    build:

```bash      context: ./nginx

pm2 save      dockerfile: Dockerfile

pm2 startup  # Follow instructions    container_name: pengaduan-nginx

```    restart: always

    depends_on:

#### 6.3 Check PM2 Status      - backend

```bash      - frontend

pm2 status    ports:

pm2 logs pengaduan-backend      - "80:80"

pm2 monit      - "443:443"

```    volumes:

      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro

---      - frontend_dist:/usr/share/nginx/html:ro

      - ./nginx/ssl:/etc/nginx/ssl:ro

### Step 7: SSL Certificate (Let's Encrypt)      - nginx_logs:/var/log/nginx

    networks:

#### 7.1 Install Certbot      - pengaduan-network

```bash    healthcheck:

sudo apt install -y certbot python3-certbot-nginx      test: ["CMD", "curl", "-f", "http://localhost/health"]

```      interval: 30s

      timeout: 10s

#### 7.2 Get SSL Certificate      retries: 3

```bash

sudo certbot --nginx -d your-domain.com -d www.your-domain.comvolumes:

```  mysql_data:

    driver: local

Follow prompts:  frontend_dist:

- Enter email address    driver: local

- Agree to terms  nginx_logs:

- Choose: Redirect HTTP to HTTPS    driver: local



#### 7.3 Test Auto-Renewalnetworks:

```bash  pengaduan-network:

sudo certbot renew --dry-run    driver: bridge

``````



#### 7.4 Verify HTTPS### 2. Backend Dockerfile (`server/Dockerfile`)

```bash

# Check certificate```dockerfile

sudo certbot certificates# Multi-stage build untuk optimize size

FROM node:20-alpine AS builder

# Test in browser

https://your-domain.com# Set working directory

```WORKDIR /app



---# Copy package files

COPY package*.json ./

### Step 8: Firewall Configuration

# Install dependencies

#### 8.1 Check UFW StatusRUN npm ci --only=production

```bash

sudo ufw status# Copy application code

```COPY . .



#### 8.2 Verify Rules# Production stage

```bashFROM node:20-alpine

sudo ufw status numbered

```# Install curl untuk healthcheck

RUN apk add --no-cache curl

Should show:

- SSH (22)# Set working directory

- Nginx Full (80, 443)WORKDIR /app

- MySQL (3306) - optional

# Copy from builder

---COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app .

## 🔄 Deployment Workflow

# Create non-root user

### For Future UpdatesRUN addgroup -g 1001 -S nodejs && \

    adduser -S nodejs -u 1001 && \

#### Option 1: Use Deploy Script    chown -R nodejs:nodejs /app

```bash

cd /var/www/pengaduan-sarpras# Switch to non-root user

./deploy.shUSER nodejs

```

# Expose port

#### Option 2: Manual DeploymentEXPOSE 5000

```bash

# 1. Pull latest code# Health check

cd /var/www/pengaduan-sarprasHEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \

git pull origin main  CMD curl -f http://localhost:5000/ || exit 1



# 2. Update backend dependencies# Start application

cd serverCMD ["node", "server.js"]

npm install --production```



# 3. Rebuild frontend### 3. Frontend Dockerfile (`clients/web/Dockerfile`)

cd ../clients/web

npm install```dockerfile

npm run build# Build stage

FROM node:20-alpine AS builder

# 4. Deploy frontend

sudo cp -r dist/* /var/www/pengaduan-sarpras/frontend/WORKDIR /app



# 5. Restart backend# Copy package files

cd ../..COPY package*.json ./

pm2 restart pengaduan-backend

# Install dependencies

# 6. Reload NginxRUN npm ci

sudo systemctl reload nginx

```# Copy source code

COPY . .

---

# Build argument untuk API URL

## 🔍 TroubleshootingARG VITE_API_URL

ENV VITE_API_URL=$VITE_API_URL

### Issue 1: Backend Not Starting

# Build production

**Check logs:**RUN npm run build

```bash

pm2 logs pengaduan-backend# Production stage - Nginx untuk serve static files

```FROM nginx:1.25-alpine



**Common causes:**# Copy built files dari builder

- Database connection failed → Check .env credentialsCOPY --from=builder /app/dist /usr/share/nginx/html

- Port 5000 in use → Check: `sudo lsof -i :5000`

- Missing dependencies → Run: `npm install`# Copy nginx config (jika ada custom config untuk frontend)

# COPY nginx.conf /etc/nginx/conf.d/default.conf

**Fix:**

```bash# Expose port

cd /var/www/pengaduan-sarpras/serverEXPOSE 80

npm install

pm2 restart pengaduan-backend# Start nginx

```CMD ["nginx", "-g", "daemon off;"]

```

---

### 4. Nginx Dockerfile (`nginx/Dockerfile`)

### Issue 2: Frontend Shows 404

```dockerfile

**Check files:**FROM nginx:1.25-alpine

```bash

ls -lah /var/www/pengaduan-sarpras/frontend/# Install curl untuk healthcheck

```RUN apk add --no-cache curl



**Should see:** index.html, assets/, etc.# Remove default config

RUN rm /etc/nginx/conf.d/default.conf

**Fix:**

```bash# Copy custom nginx config

cd /var/www/pengaduan-sarpras/clients/webCOPY nginx.conf /etc/nginx/nginx.conf

npm run build

sudo cp -r dist/* /var/www/pengaduan-sarpras/frontend/# Create health check endpoint

sudo systemctl reload nginxRUN mkdir -p /usr/share/nginx/html && \

```    echo "OK" > /usr/share/nginx/html/health



---# Expose ports

EXPOSE 80 443

### Issue 3: Nginx 502 Bad Gateway

# Start nginx

**Causes:**CMD ["nginx", "-g", "daemon off;"]

- Backend not running```

- Wrong proxy_pass URL

### 5. Nginx Configuration (`nginx/nginx.conf`)

**Check backend:**

```bash```nginx

pm2 statususer nginx;

curl http://localhost:5000/api/healthworker_processes auto;

```error_log /var/log/nginx/error.log warn;

pid /var/run/nginx.pid;

**Fix:**

```bashevents {

pm2 restart pengaduan-backend    worker_connections 1024;

sudo systemctl reload nginx}

```

http {

---    include /etc/nginx/mime.types;

    default_type application/octet-stream;

### Issue 4: Database Connection Error

    # Logging

**Test connection:**    log_format main '$remote_addr - $remote_user [$time_local] "$request" '

```bash                    '$status $body_bytes_sent "$http_referer" '

mysql -u pengaduan_user -p pengaduan_sarpras                    '"$http_user_agent" "$http_x_forwarded_for"';

```

    access_log /var/log/nginx/access.log main;

**Check credentials in .env:**

```bash    # Performance

cat /var/www/pengaduan-sarpras/server/.env | grep DB_    sendfile on;

```    tcp_nopush on;

    tcp_nodelay on;

**Fix:**    keepalive_timeout 65;

```bash    types_hash_max_size 2048;

nano /var/www/pengaduan-sarpras/server/.env    client_max_body_size 10M;

# Update DB_PASSWORD, DB_USER, DB_NAME

pm2 restart pengaduan-backend    # Gzip compression

```    gzip on;

    gzip_vary on;

---    gzip_proxied any;

    gzip_comp_level 6;

### Issue 5: Permission Denied    gzip_types text/plain text/css text/xml text/javascript

               application/json application/javascript application/xml+rss

**Fix ownership:**               application/rss+xml font/truetype font/opentype

```bash               application/vnd.ms-fontobject image/svg+xml;

sudo chown -R $USER:$USER /var/www/pengaduan-sarpras

```    # Rate limiting

    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;

**Fix permissions:**    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

```bash

chmod +x /var/www/pengaduan-sarpras/deploy.sh    # Upstream backend

chmod 600 /var/www/pengaduan-sarpras/server/.env    upstream backend {

```        server backend:5000 max_fails=3 fail_timeout=30s;

    }

---

    # HTTP Server (Redirect to HTTPS in production)

## 📊 Monitoring & Maintenance    server {

        listen 80;

### View Logs        server_name _;

```bash

# Backend logs        # Health check endpoint

pm2 logs pengaduan-backend        location /health {

            access_log off;

# Nginx access logs            return 200 "OK\n";

sudo tail -f /var/log/nginx/pengaduan-access.log            add_header Content-Type text/plain;

        }

# Nginx error logs

sudo tail -f /var/log/nginx/pengaduan-error.log        # Untuk development, allow HTTP

        # Untuk production dengan SSL, uncomment redirect di bawah:

# MySQL logs        # return 301 https://$host$request_uri;

sudo tail -f /var/log/mysql/error.log

```        # Root location - Frontend

        location / {

### Monitor Resources            root /usr/share/nginx/html;

```bash            try_files $uri $uri/ /index.html;

# PM2 monitoring

pm2 monit            # Cache static assets

            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {

# System resources                expires 1y;

htop                add_header Cache-Control "public, immutable";

            }

# Disk usage        }

df -h

        # API Proxy ke Backend

# Memory usage        location /api/ {

free -m            limit_req zone=api_limit burst=20 nodelay;

```

            proxy_pass http://backend;

### Backup Database            proxy_http_version 1.1;

```bash

# Create backup            # Headers

mysqldump -u pengaduan_user -p pengaduan_sarpras > backup-$(date +%Y%m%d).sql            proxy_set_header Host $host;

            proxy_set_header X-Real-IP $remote_addr;

# Restore backup            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

mysql -u pengaduan_user -p pengaduan_sarpras < backup-20250113.sql            proxy_set_header X-Forwarded-Proto $scheme;

```

            # Timeouts

---            proxy_connect_timeout 60s;

            proxy_send_timeout 60s;

## 🛠️ Useful Commands            proxy_read_timeout 60s;



### PM2 Commands            # Buffering

```bash            proxy_buffering on;

pm2 status                      # Check status            proxy_buffer_size 4k;

pm2 logs pengaduan-backend      # View logs            proxy_buffers 8 4k;

pm2 restart pengaduan-backend   # Restart app            proxy_busy_buffers_size 8k;

pm2 stop pengaduan-backend      # Stop app        }

pm2 delete pengaduan-backend    # Remove from PM2

pm2 monit                       # Monitor resources        # Socket.io (jika dipakai)

pm2 save                        # Save current list        location /socket.io/ {

```            proxy_pass http://backend;

            proxy_http_version 1.1;

### Nginx Commands            proxy_set_header Upgrade $http_upgrade;

```bash            proxy_set_header Connection "upgrade";

sudo nginx -t                   # Test config            proxy_set_header Host $host;

sudo systemctl restart nginx    # Restart            proxy_cache_bypass $http_upgrade;

sudo systemctl reload nginx     # Reload config        }

sudo systemctl status nginx     # Check status

```        # Login endpoint - stricter rate limit

        location /api/auth/login {

### MySQL Commands            limit_req zone=login_limit burst=3 nodelay;

```bash

sudo systemctl restart mysql    # Restart MySQL            proxy_pass http://backend;

sudo systemctl status mysql     # Check status            proxy_http_version 1.1;

mysql -u pengaduan_user -p      # Connect to DB            proxy_set_header Host $host;

```            proxy_set_header X-Real-IP $remote_addr;

            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

---        }



## ✅ Post-Deployment Checklist        # Security headers

        add_header X-Frame-Options "SAMEORIGIN" always;

- [ ] VPS setup completed        add_header X-Content-Type-Options "nosniff" always;

- [ ] Database created and schema imported        add_header X-XSS-Protection "1; mode=block" always;

- [ ] Backend .env configured        add_header Referrer-Policy "no-referrer-when-downgrade" always;

- [ ] Frontend .env configured    }

- [ ] Nginx configured with domain

- [ ] SSL certificate installed    # HTTPS Server (Uncomment when SSL ready)

- [ ] Backend running with PM2    # server {

- [ ] Frontend built and deployed    #     listen 443 ssl http2;

- [ ] Can access https://your-domain.com    #     server_name your-domain.com;

- [ ] Can login/register    #

- [ ] Can create pengaduan    #     # SSL Certificates (dari Cloudflare Origin CA)

- [ ] Image upload works    #     ssl_certificate /etc/nginx/ssl/cert.pem;

- [ ] All API endpoints working    #     ssl_certificate_key /etc/nginx/ssl/key.pem;

- [ ] PM2 auto-restart configured    #

- [ ] Firewall rules set    #     # SSL Configuration

- [ ] Backup strategy in place    #     ssl_protocols TLSv1.2 TLSv1.3;

    #     ssl_ciphers HIGH:!aNULL:!MD5;

---    #     ssl_prefer_server_ciphers on;

    #     ssl_session_cache shared:SSL:10m;

## 🎉 Success!    #     ssl_session_timeout 10m;

    #

Your application should now be live at:    #     # Same locations as HTTP server above

- **Frontend:** https://your-domain.com    #     # ... (copy dari server block HTTP)

- **Backend API:** https://your-domain.com/api    # }

- **Health Check:** https://your-domain.com/api/health}

```

---

---

## 📞 Support

## 🔐 Konfigurasi Environment

If you encounter issues:

1. Check logs: `pm2 logs` and `/var/log/nginx/`### 1. Environment Variables (`.env.production`)

2. Verify configurations: `.env`, `nginx.conf`

3. Test components individuallyBuat file `.env.production` di root project:

4. Review this guide step-by-step

```bash

---# Database Configuration

DB_HOST=mysql

**Estimated Setup Time:** 30-60 minutesDB_PORT=3306

**Difficulty:** IntermediateDB_NAME=db_pengaduan_sarpras

**Prerequisites:** Basic Linux command line knowledgeDB_USER=pengaduan_user

DB_PASSWORD=ChangeThisPasswordToStrongOne123!
DB_ROOT_PASSWORD=ChangeThisRootPasswordToStrongOne456!

# Backend Configuration
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string-min-32-chars

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

# Frontend Configuration
VITE_API_URL=http://your-server-ip

# Cloudflare (optional, untuk analytics)
CLOUDFLARE_ZONE_ID=your_zone_id
CLOUDFLARE_API_TOKEN=your_api_token
```

### 2. Generate Strong Secrets

```bash
# Generate JWT Secret (32+ characters random string)
openssl rand -base64 32

# Generate DB Passwords
openssl rand -base64 24
```

### 3. Copy ke Server

```bash
# Copy .env.production ke server
scp .env.production deploy@your-server-ip:~/pengaduan-sarpras/.env.production

# Atau edit langsung di server
nano ~/pengaduan-sarpras/.env.production
```

---

## 🚀 Build & Deploy

### 1. Upload Project ke Server

**Option A: Via Git (Recommended)**

```bash
# Di server
cd ~/pengaduan-sarpras
git clone https://github.com/your-username/pengaduan-sarpras.git .

# Update jika sudah ada
git pull origin main
```

**Option B: Via SFTP/SCP**

```bash
# Di local machine
scp -r ./pengaduan-sarpras deploy@your-server-ip:~/
```

### 2. Setup Environment

```bash
# Di server
cd ~/pengaduan-sarpras

# Copy environment variables
cp .env.production .env

# Copy untuk backend
cp .env.production server/.env

# Edit dan sesuaikan
nano .env
```

### 3. Build & Start Services

```bash
# Build semua containers
docker compose build

# Start services
docker compose up -d

# Check status
docker compose ps

# Output:
# NAME                    STATUS              PORTS
# pengaduan-mysql         Up 1 minute         0.0.0.0:3306->3306/tcp
# pengaduan-backend       Up 1 minute         0.0.0.0:5000->5000/tcp
# pengaduan-frontend      Up 1 minute
# pengaduan-nginx         Up 1 minute         0.0.0.0:80->80/tcp

# Check logs
docker compose logs -f
```

### 4. Database Initialization

```bash
# Akses MySQL container
docker exec -it pengaduan-mysql mysql -u root -p

# Masukkan password DB_ROOT_PASSWORD

# Di MySQL prompt:
USE db_pengaduan_sarpras;

# Import schema (jika belum auto-import via docker-entrypoint-initdb.d)
SOURCE /docker-entrypoint-initdb.d/01-stored_procedures.sql;
SOURCE /docker-entrypoint-initdb.d/02-add_columns.sql;

# Verify tables
SHOW TABLES;

# Create admin user (jika belum ada)
# Gunakan endpoint register atau insert manual
```

### 5. Verify Deployment

```bash
# Test backend
curl http://localhost:5000/

# Test frontend
curl http://localhost/

# Test API
curl http://localhost/api/auth/login

# Check container health
docker compose ps
docker stats --no-stream
```

---

## 🔒 SSL dengan Cloudflare

### Setup Cloudflare (Free Plan)

#### 1. Add Domain ke Cloudflare

1. Login ke https://dash.cloudflare.com
2. Click "Add a Site"
3. Enter domain kamu (misal: `pengaduan-sarpras.com`)
4. Select "Free" plan
5. Review DNS records
6. Update nameservers di domain registrar kamu ke Cloudflare nameservers

#### 2. Configure DNS Records

```
Type    Name    Content                 Proxy Status    TTL
────────────────────────────────────────────────────────────
A       @       your-server-ip          Proxied         Auto
A       www     your-server-ip          Proxied         Auto
```

**Note:** Pastikan "Proxy status" adalah "Proxied" (orange cloud) ✅

#### 3. SSL/TLS Settings

**Cloudflare Dashboard → SSL/TLS:**

1. **Overview:** Set mode ke **"Flexible"** (untuk awal)
   - Cloudflare ↔ User: HTTPS ✅
   - Cloudflare ↔ Server: HTTP
2. **Edge Certificates:**

   - ✅ Always Use HTTPS: ON
   - ✅ HTTP Strict Transport Security (HSTS): Enable (careful!)
   - ✅ Minimum TLS Version: 1.2
   - ✅ Automatic HTTPS Rewrites: ON

3. **Origin Server (Optional - Full Strict Mode):**

   Untuk security lebih baik, gunakan mode **"Full (Strict)"**:

   ```bash
   # Di Cloudflare Dashboard → SSL/TLS → Origin Server
   # Create Certificate

   # Generate Origin Certificate:
   # - Private key type: RSA (2048)
   # - Hostnames: your-domain.com, *.your-domain.com
   # - Certificate Validity: 15 years

   # Save:
   # - Origin Certificate → save as cert.pem
   # - Private Key → save as key.pem
   ```

   Upload ke server:

   ```bash
   # Di server
   mkdir -p ~/pengaduan-sarpras/nginx/ssl

   # Upload cert.pem dan key.pem
   scp cert.pem deploy@your-server-ip:~/pengaduan-sarpras/nginx/ssl/
   scp key.pem deploy@your-server-ip:~/pengaduan-sarpras/nginx/ssl/

   # Set permissions
   chmod 600 ~/pengaduan-sarpras/nginx/ssl/*.pem
   ```

   Update `nginx.conf` (uncomment HTTPS server block)

   Set Cloudflare SSL mode ke **"Full (Strict)"**

#### 4. Firewall Rules (Optional)

**Cloudflare Dashboard → Security → WAF:**

```
Rule 1: Block bad bots
Expression: (cf.client.bot)
Action: Block

Rule 2: Rate limit login
Expression: (http.request.uri.path eq "/api/auth/login")
Action: Rate limit (10 requests per minute)

Rule 3: Allow only Indonesia (optional)
Expression: (ip.geoip.country ne "ID")
Action: Challenge (CAPTCHA)
```

#### 5. Caching Rules

**Cloudflare Dashboard → Caching → Configuration:**

```
Cache Level: Standard
Browser Cache TTL: Respect Existing Headers

Page Rules:
1. URL: yourdomain.com/api/*
   Cache Level: Bypass

2. URL: yourdomain.com/*.js
   Cache Level: Cache Everything
   Edge Cache TTL: 1 month

3. URL: yourdomain.com/*.css
   Cache Level: Cache Everything
   Edge Cache TTL: 1 month
```

---

## 📊 Monitoring & Maintenance

### 1. Docker Management Commands

```bash
# View logs
docker compose logs -f backend
docker compose logs -f mysql
docker compose logs -f nginx

# Restart service
docker compose restart backend

# Stop all services
docker compose down

# Start all services
docker compose up -d

# Rebuild specific service
docker compose build backend
docker compose up -d backend

# View resource usage
docker stats

# Clean up unused resources
docker system prune -a
```

### 2. Database Backup

```bash
# Backup database
docker exec pengaduan-mysql mysqldump \
  -u root -p${DB_ROOT_PASSWORD} \
  ${DB_NAME} > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
docker exec -i pengaduan-mysql mysql \
  -u root -p${DB_ROOT_PASSWORD} \
  ${DB_NAME} < backup_20241112_143000.sql

# Automated daily backup (crontab)
crontab -e

# Add line:
0 2 * * * cd ~/pengaduan-sarpras && docker exec pengaduan-mysql mysqldump -u root -p${DB_ROOT_PASSWORD} ${DB_NAME} > /home/deploy/backups/backup_$(date +\%Y\%m\%d).sql
```

### 3. Log Rotation

```bash
# Configure Docker log rotation
sudo nano /etc/docker/daemon.json

# Add:
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

# Restart Docker
sudo systemctl restart docker
```

### 4. System Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Monitor real-time
htop                    # CPU & RAM
iotop                   # Disk I/O
nethogs                 # Network
docker stats            # Container resources

# Disk usage
df -h
du -sh ~/pengaduan-sarpras/*

# Memory usage
free -h
```

### 5. Automated Updates

```bash
# Create update script
nano ~/update-app.sh

# Content:
#!/bin/bash
cd ~/pengaduan-sarpras
git pull origin main
docker compose build
docker compose up -d
docker system prune -f

# Make executable
chmod +x ~/update-app.sh

# Run update
./update-app.sh
```

---

## 🔧 Troubleshooting

### Problem 1: Container Won't Start

```bash
# Check logs
docker compose logs backend

# Common issues:
# 1. Port already in use
sudo netstat -tulpn | grep :5000
sudo kill -9 <PID>

# 2. Environment variables missing
docker compose config

# 3. Build errors
docker compose build --no-cache backend
```

### Problem 2: Database Connection Failed

```bash
# Check MySQL container
docker compose logs mysql

# Verify database is ready
docker exec -it pengaduan-mysql mysql -u root -p

# Test connection from backend
docker exec -it pengaduan-backend node -e "
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'mysql',
  user: 'pengaduan_user',
  password: 'your-password',
  database: 'db_pengaduan_sarpras'
});
connection.connect(err => {
  if (err) console.error(err);
  else console.log('Connected!');
  connection.end();
});
"
```

### Problem 3: High Memory Usage

```bash
# Check container stats
docker stats --no-stream

# Restart container with memory limit
docker compose down
nano docker-compose.yml

# Add to service:
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'

docker compose up -d
```

### Problem 4: Nginx 502 Bad Gateway

```bash
# Check backend is running
docker compose ps

# Check backend logs
docker compose logs backend

# Test backend directly
curl http://localhost:5000/

# Check nginx config
docker exec pengaduan-nginx nginx -t

# Restart nginx
docker compose restart nginx
```

### Problem 5: Disk Space Full

```bash
# Check disk usage
df -h

# Remove old logs
sudo find /var/lib/docker/containers/ -type f -name "*.log" -delete

# Clean Docker
docker system prune -a --volumes

# Remove old backups
rm ~/backups/backup_2024*.sql
```

---

## 📝 Deployment Checklist

### Pre-Deployment

- [ ] Code tested locally
- [ ] Environment variables configured
- [ ] Database schema ready
- [ ] SSL certificates obtained (if using Full Strict)
- [ ] Domain DNS configured
- [ ] Server access verified

### Deployment

- [ ] Docker & Docker Compose installed
- [ ] Firewall configured
- [ ] Project uploaded to server
- [ ] `.env` files configured
- [ ] Docker images built
- [ ] Containers running
- [ ] Database initialized
- [ ] Nginx configured

### Post-Deployment

- [ ] Website accessible via domain
- [ ] HTTPS working (via Cloudflare)
- [ ] API endpoints working
- [ ] Database connections stable
- [ ] Backups scheduled
- [ ] Monitoring setup
- [ ] Logs rotating
- [ ] Performance tested

---

## 🎯 Performance Optimization

### 1. Frontend Optimization

```javascript
// Vite config optimization
// clients/web/vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### 2. Database Optimization

```sql
-- Add indexes
CREATE INDEX idx_pengaduan_status ON pengaduan_sarpras_pengaduan(status);
CREATE INDEX idx_pengaduan_tanggal ON pengaduan_sarpras_pengaduan(tanggal);
CREATE INDEX idx_pengaduan_user ON pengaduan_sarpras_pengaduan(id_user);

-- Optimize tables
OPTIMIZE TABLE pengaduan_sarpras_pengaduan;
OPTIMIZE TABLE pengaduan_sarpras_user;
```

### 3. Caching Strategy

```javascript
// Backend - Add Redis caching (optional)
// If needed, add redis service to docker-compose.yml

services:
  redis:
    image: redis:7-alpine
    container_name: pengaduan-redis
    restart: always
    ports:
      - "6379:6379"
    networks:
      - pengaduan-network
```

---

## 💰 Cost Estimation

### Biznet Gio NEO Lite SS.2

- **Monthly:** ~Rp 50.000 - 75.000
- **Yearly:** ~Rp 600.000 - 900.000 (biasanya ada diskon)

### Additional Costs (Optional)

- **Domain (.com):** ~Rp 150.000/tahun
- **Cloudflare:** Free (basic features)
- **ImageKit.io:** Free tier (20GB bandwidth/month)
- **Backup Storage:** Included in server

**Total Estimasi:** ~Rp 75.000 - 100.000/bulan 💰

---

## 📚 References

- **Docker Documentation:** https://docs.docker.com/
- **Docker Compose:** https://docs.docker.com/compose/
- **Nginx Documentation:** https://nginx.org/en/docs/
- **MySQL 8 Documentation:** https://dev.mysql.com/doc/refman/8.0/en/
- **Cloudflare SSL:** https://developers.cloudflare.com/ssl/
- **Node.js Best Practices:** https://github.com/goldbergyoni/nodebestpractices

---

## 🆘 Support & Contact

Jika mengalami kendala:

1. **Check logs first:** `docker compose logs -f`
2. **Restart service:** `docker compose restart <service>`
3. **Check resource:** `docker stats`
4. **Review error:** Lihat section Troubleshooting di atas

---

**Created:** November 12, 2025  
**Version:** 1.0.0  
**Project:** Sistem Pengaduan Sarana Prasarana  
**Deployment Target:** Biznet Gio NEO Lite SS.2

---

## 🚀 Quick Start Commands

```bash
# Clone & Setup
git clone <repo> && cd pengaduan-sarpras
cp .env.production .env
nano .env  # Edit configuration

# Build & Deploy
docker compose build
docker compose up -d

# Check Status
docker compose ps
docker compose logs -f

# Access Application
http://your-domain.com
```

**Happy Deploying! 🎉**
