# 📦 VPS Deployment Files Summary

## ✅ Files Created

### 1. **ecosystem.config.js** - PM2 Configuration

Process manager untuk menjalankan Node.js backend:

- Auto-restart on crash
- Cluster mode support
- Log management
- Memory limit (500MB)

### 2. **nginx.conf** - Nginx Reverse Proxy

Konfigurasi web server:

- Serve React static files
- Proxy `/api` ke backend
- Socket.io WebSocket support
- SSL/HTTPS ready (commented)
- Security headers
- Cache control untuk static assets

### 3. **.env.production** - Backend Environment Template

Template environment variables:

- Database credentials
- JWT secret
- ImageKit API keys
- Port configuration

### 4. **clients/web/.env.production** - Frontend Environment

Frontend build-time variables:

- API URL configuration

### 5. **setup-vps.sh** - VPS Initial Setup Script (CRITICAL)

One-time setup script untuk VPS baru:

- Install Node.js 20
- Install PM2
- Install Nginx
- Install MySQL
- Setup UFW firewall
- Create application directory
- Clone repository
- Setup database
- Import schema

### 6. **deploy.sh** - Deployment Script

Deploy updates ke production:

- Pull latest code
- Install dependencies
- Build frontend
- Deploy static files
- Restart backend with PM2
- Reload Nginx

### 7. **DEPLOYMENT_GUIDE.md** - Complete Deployment Guide (30+ pages)

Dokumentasi lengkap step-by-step:

- Prerequisites
- Initial VPS setup
- Database configuration
- Backend setup
- Frontend setup
- Nginx configuration
- SSL certificate setup
- Troubleshooting guide
- Monitoring tips

### 8. **QUICK_DEPLOY.md** - Quick Reference

Quick start guide untuk deployment:

- 5-step deployment
- Essential commands
- Common troubleshooting

### 9. **DEPLOYMENT_CHECKLIST.md** - Deployment Checklist

Printable checklist:

- 8 deployment phases
- Time estimates per phase
- Testing procedures
- Credentials tracking

### 10. **README.md** - Updated Project Documentation

Comprehensive project documentation:

- Features overview
- Tech stack
- Project structure
- Development setup
- API documentation
- Production deployment
- Troubleshooting

### 11. **server/package.json** - Updated Scripts

Added production scripts:

- `npm start` - Production mode
- `npm run dev` - Development mode

---

## 🚀 Quick Start untuk Deploy ke VPS

### Step 1: Connect to VPS

```bash
ssh your-user@your-vps-ip
```

### Step 2: Clone & Setup

```bash
cd /var/www
sudo git clone https://github.com/Clawwo/pengaduan-sarpras.git
cd pengaduan-sarpras

# Run setup script
sudo chmod +x setup-vps.sh
sudo ./setup-vps.sh
```

### Step 3: Configure

```bash
# Backend
cp .env.production server/.env
nano server/.env  # Update credentials

# Nginx
sudo cp nginx.conf /etc/nginx/sites-available/pengaduan-sarpras
sudo nano /etc/nginx/sites-available/pengaduan-sarpras  # Update domain
sudo ln -s /etc/nginx/sites-available/pengaduan-sarpras /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### Step 4: Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

### Step 5: SSL (Optional)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

**Done!** 🎉

---

## 📋 What Each File Does

### **ecosystem.config.js**

```javascript
// PM2 runs your Node.js app as a service
// Auto-restart if crash, cluster mode for scaling
pm2 start ecosystem.config.js --env production
```

### **nginx.conf**

```nginx
# Nginx acts as reverse proxy:
# - Serves React static files at /
# - Proxies /api to Node.js backend at localhost:5000
# - Handles SSL termination
```

### **setup-vps.sh**

```bash
# One-time setup - installs everything needed:
# Node.js, PM2, Nginx, MySQL, Firewall
# Creates directories, imports database schema
```

### **deploy.sh**

```bash
# Deploy new version:
# Pull code → Install deps → Build frontend → Restart backend
```

---

## 🔧 Architecture

```
Internet
    ↓
Cloudflare/DNS (your-domain.com)
    ↓
VPS (Ubuntu)
    ↓
UFW Firewall (ports 80, 443, 22)
    ↓
Nginx (Port 80/443)
    ├─→ / (Static React Files)
    └─→ /api (Proxy to Backend)
             ↓
        PM2 Process Manager
             ↓
        Node.js Backend (Port 5000)
             ↓
        MySQL Database (Port 3306)
```

---

## 🎯 Deployment Workflow

### First Time Deployment:

1. `setup-vps.sh` - Setup VPS (once)
2. Configure `.env` files
3. Setup Nginx config
4. `deploy.sh` - Deploy app
5. Setup SSL with Certbot

### Future Updates:

1. Commit code changes
2. Push to GitHub
3. On VPS: `cd /var/www/pengaduan-sarpras && git pull && ./deploy.sh`

---

## 📊 File Sizes

- `DEPLOYMENT_GUIDE.md`: ~45 KB (30+ pages)
- `setup-vps.sh`: ~8 KB (automated setup)
- `deploy.sh`: ~2 KB (deployment automation)
- `nginx.conf`: ~3 KB (web server config)
- `ecosystem.config.js`: ~500 bytes (PM2 config)
- `QUICK_DEPLOY.md`: ~2 KB (quick reference)
- `DEPLOYMENT_CHECKLIST.md`: ~4 KB (checklist)
- `README.md`: ~8 KB (updated docs)

---

## ✅ Next Steps

1. **Test Locally** (Optional)

   ```bash
   cd server && npm install && npm run dev
   cd clients/web && npm install && npm run dev
   ```

2. **Prepare VPS**

   - Get VPS (Biznet Gio, DigitalOcean, Vultr, etc.)
   - Get domain name (optional but recommended)
   - Point DNS to VPS IP

3. **Deploy**

   - Follow QUICK_DEPLOY.md or DEPLOYMENT_GUIDE.md
   - Run setup-vps.sh
   - Configure and deploy

4. **Monitor**
   ```bash
   pm2 logs pengaduan-backend
   pm2 monit
   sudo tail -f /var/log/nginx/pengaduan-access.log
   ```

---

## 🆘 If Issues Occur

1. **Check documentation:**

   - DEPLOYMENT_GUIDE.md (detailed)
   - QUICK_DEPLOY.md (quick fix)

2. **Check logs:**

   ```bash
   pm2 logs pengaduan-backend
   sudo tail -f /var/log/nginx/pengaduan-error.log
   ```

3. **Common fixes:**
   - Backend: Check .env credentials, restart with `pm2 restart pengaduan-backend`
   - Frontend: Rebuild with `npm run build` in clients/web
   - Nginx: Test config with `sudo nginx -t`
   - Database: Check connection with `mysql -u pengaduan_user -p`

---

## 🎉 Summary

**You now have:**

- ✅ Complete VPS deployment configuration
- ✅ Automated setup script (setup-vps.sh)
- ✅ Automated deploy script (deploy.sh)
- ✅ Production-ready Nginx config
- ✅ PM2 process management
- ✅ Comprehensive documentation (30+ pages)
- ✅ Quick reference guides
- ✅ Deployment checklist
- ✅ Updated README

**Total deployment time:** 30-60 minutes (first time)  
**Future deployments:** 5-10 minutes with deploy.sh

**Ready to deploy!** 🚀
