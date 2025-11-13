# 🚀 Deployment Guide - Sistem Pengaduan Sarana Prasarana

## 📋 Daftar Isi

1. [Spesifikasi Server](#spesifikasi-server)
2. [Persiapan Awal](#persiapan-awal)
3. [Setup Docker & Docker Compose](#setup-docker--docker-compose)
4. [Konfigurasi Environment](#konfigurasi-environment)
5. [Build & Deploy](#build--deploy)
6. [SSL dengan Cloudflare](#ssl-dengan-cloudflare)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## 🖥️ Spesifikasi Server

### Biznet Gio NEO Lite - SS.2

**Spesifikasi:**

- **CPU:** 1 vCPU
- **RAM:** 2 GB
- **Storage:** 60 GB SSD
- **Bandwidth:** Unlimited
- **OS:** Ubuntu 22.04 LTS (Recommended)

**Apakah Cukup?** ✅ **YA, SANGAT CUKUP!**

**Analisis Kebutuhan Project:**

```
Backend (Node.js):        ~150-200 MB RAM
Database (MySQL 8):       ~400-500 MB RAM
Nginx:                    ~50-100 MB RAM
Docker Overhead:          ~200-300 MB RAM
OS Ubuntu:                ~300-400 MB RAM
─────────────────────────────────────────
Total Estimasi:           ~1.1-1.5 GB RAM
Available:                2 GB RAM ✅

Storage:
Application Code:         ~100 MB
Docker Images:            ~2-3 GB
MySQL Data:               ~1-5 GB (tergantung data)
Logs & Backups:          ~5-10 GB
─────────────────────────────────────────
Total Estimasi:          ~8-18 GB
Available:               60 GB SSD ✅
```

**Kesimpulan:** NEO Lite SS.2 perfect untuk project ini! 🎉

---

## 🔧 Persiapan Awal

### 1. Akses ke Server

```bash
# Login via SSH
ssh root@your-server-ip

# Update sistem
sudo apt update && sudo apt upgrade -y

# Install dependencies dasar
sudo apt install -y curl wget git vim nano htop
```

### 2. Setup User Non-Root (Security Best Practice)

```bash
# Buat user baru
adduser deploy
usermod -aG sudo deploy

# Switch ke user deploy
su - deploy
```

### 3. Setup Firewall

```bash
# Install UFW (Uncomplicated Firewall)
sudo apt install ufw -y

# Konfigurasi firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Cek status
sudo ufw status verbose
```

---

## 🐳 Setup Docker & Docker Compose

### 1. Install Docker

```bash
# Remove old versions jika ada
sudo apt remove docker docker-engine docker.io containerd runc

# Install prerequisites
sudo apt update
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Setup repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine (Latest)
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
docker --version
# Output: Docker version 24.x.x, build xxx

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Test Docker
docker run hello-world
```

### 2. Install Docker Compose V2 (Latest)

```bash
# Docker Compose V2 sudah included di Docker Engine terbaru
docker compose version
# Output: Docker Compose version v2.x.x

# Jika perlu install manual:
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

## 📁 Struktur Project di Server

```bash
# Buat direktori project
mkdir -p ~/pengaduan-sarpras
cd ~/pengaduan-sarpras

# Clone repository (atau upload via SFTP)
git clone https://github.com/your-username/pengaduan-sarpras.git .

# Struktur yang akan kita buat:
pengaduan-sarpras/
├── docker-compose.yml
├── .env.production
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf
├── server/
│   ├── Dockerfile
│   ├── .env
│   └── ... (backend files)
├── clients/
│   └── web/
│       ├── Dockerfile
│       └── ... (frontend files)
└── mysql/
    └── init.sql (optional)
```

---

## 🐋 Docker Configuration Files

### 1. Docker Compose (Root: `docker-compose.yml`)

Buat file `docker-compose.yml` di root project:

```yaml
version: "3.8"

services:
  # MySQL Database
  mysql:
    image: mysql:8.2.0
    container_name: pengaduan-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
      TZ: Asia/Jakarta
    volumes:
      - mysql_data:/var/lib/mysql
      - ./server/database/stored_procedures.sql:/docker-entrypoint-initdb.d/01-stored_procedures.sql
      - ./server/database/add_columns.sql:/docker-entrypoint-initdb.d/02-add_columns.sql
    ports:
      - "3306:3306"
    networks:
      - pengaduan-network
    command: --default-authentication-plugin=mysql_native_password --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    healthcheck:
      test:
        [
          "CMD",
          "mysqladmin",
          "ping",
          "-h",
          "localhost",
          "-u",
          "root",
          "-p${DB_ROOT_PASSWORD}",
        ]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend Node.js
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: pengaduan-backend
    restart: always
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 5000
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      IMAGEKIT_PUBLIC_KEY: ${IMAGEKIT_PUBLIC_KEY}
      IMAGEKIT_PRIVATE_KEY: ${IMAGEKIT_PRIVATE_KEY}
      IMAGEKIT_URL_ENDPOINT: ${IMAGEKIT_URL_ENDPOINT}
    volumes:
      - ./server:/app
      - /app/node_modules
    ports:
      - "5000:5000"
    networks:
      - pengaduan-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend Web (React + Vite)
  frontend:
    build:
      context: ./clients/web
      dockerfile: Dockerfile
      args:
        VITE_API_URL: ${VITE_API_URL}
    container_name: pengaduan-frontend
    restart: always
    depends_on:
      - backend
    volumes:
      - frontend_dist:/app/dist
    networks:
      - pengaduan-network

  # Nginx Reverse Proxy
  nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile
    container_name: pengaduan-nginx
    restart: always
    depends_on:
      - backend
      - frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - frontend_dist:/usr/share/nginx/html:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - nginx_logs:/var/log/nginx
    networks:
      - pengaduan-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  mysql_data:
    driver: local
  frontend_dist:
    driver: local
  nginx_logs:
    driver: local

networks:
  pengaduan-network:
    driver: bridge
```

### 2. Backend Dockerfile (`server/Dockerfile`)

```dockerfile
# Multi-stage build untuk optimize size
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Production stage
FROM node:20-alpine

# Install curl untuk healthcheck
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

# Start application
CMD ["node", "server.js"]
```

### 3. Frontend Dockerfile (`clients/web/Dockerfile`)

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument untuk API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build production
RUN npm run build

# Production stage - Nginx untuk serve static files
FROM nginx:1.25-alpine

# Copy built files dari builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config (jika ada custom config untuk frontend)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 4. Nginx Dockerfile (`nginx/Dockerfile`)

```dockerfile
FROM nginx:1.25-alpine

# Install curl untuk healthcheck
RUN apk add --no-cache curl

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Create health check endpoint
RUN mkdir -p /usr/share/nginx/html && \
    echo "OK" > /usr/share/nginx/html/health

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 5. Nginx Configuration (`nginx/nginx.conf`)

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

    # Upstream backend
    upstream backend {
        server backend:5000 max_fails=3 fail_timeout=30s;
    }

    # HTTP Server (Redirect to HTTPS in production)
    server {
        listen 80;
        server_name _;

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "OK\n";
            add_header Content-Type text/plain;
        }

        # Untuk development, allow HTTP
        # Untuk production dengan SSL, uncomment redirect di bawah:
        # return 301 https://$host$request_uri;

        # Root location - Frontend
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;

            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # API Proxy ke Backend
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;

            proxy_pass http://backend;
            proxy_http_version 1.1;

            # Headers
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;

            # Buffering
            proxy_buffering on;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
            proxy_busy_buffers_size 8k;
        }

        # Socket.io (jika dipakai)
        location /socket.io/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Login endpoint - stricter rate limit
        location /api/auth/login {
            limit_req zone=login_limit burst=3 nodelay;

            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
    }

    # HTTPS Server (Uncomment when SSL ready)
    # server {
    #     listen 443 ssl http2;
    #     server_name your-domain.com;
    #
    #     # SSL Certificates (dari Cloudflare Origin CA)
    #     ssl_certificate /etc/nginx/ssl/cert.pem;
    #     ssl_certificate_key /etc/nginx/ssl/key.pem;
    #
    #     # SSL Configuration
    #     ssl_protocols TLSv1.2 TLSv1.3;
    #     ssl_ciphers HIGH:!aNULL:!MD5;
    #     ssl_prefer_server_ciphers on;
    #     ssl_session_cache shared:SSL:10m;
    #     ssl_session_timeout 10m;
    #
    #     # Same locations as HTTP server above
    #     # ... (copy dari server block HTTP)
    # }
}
```

---

## 🔐 Konfigurasi Environment

### 1. Environment Variables (`.env.production`)

Buat file `.env.production` di root project:

```bash
# Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_NAME=db_pengaduan_sarpras
DB_USER=pengaduan_user
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
