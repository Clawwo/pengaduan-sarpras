# 📝 Quick Reference - VPS Commands

## 🚀 Quick Start (Copy-Paste Ready)

### Initial VPS Setup
```bash
# 1. Upload dan jalankan setup script
wget https://raw.githubusercontent.com/YOUR_REPO/pengaduan-sarpras/main/fresh-setup-vps.sh
chmod +x fresh-setup-vps.sh
sudo ./fresh-setup-vps.sh

# 2. Clone repository
cd /var/www/pengaduan-sarpras
git clone YOUR_REPO_URL .

# 3. Setup backend
cd server
cp .env.example .env
nano .env  # Edit credentials
npm install --production

# 4. Setup frontend
cd ../clients/web
cp .env.example .env.production
nano .env.production  # Edit API URL
npm install

# 5. Import database
mysql -u clawwo -p pengaduan_sarpras < ~/pengaduan_sarpras.sql

# 6. Build dan deploy
npm run build
sudo mkdir -p /var/www/pengaduan-sarpras-web
sudo cp -r dist/* /var/www/pengaduan-sarpras-web/
sudo chown -R www-data:www-data /var/www/pengaduan-sarpras-web

# 7. Setup Nginx
cd /var/www/pengaduan-sarpras
sudo nano nginx.conf  # Edit domain
sudo cp nginx.conf /etc/nginx/sites-available/pengaduan-sarpras
sudo ln -sf /etc/nginx/sites-available/pengaduan-sarpras /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 8. Start backend
cd /var/www/pengaduan-sarpras
pm2 start ecosystem.config.js --env production
pm2 save

# 9. Setup SSL (setelah DNS ready)
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

---

## 📋 Daily Commands

### Check Status
```bash
# PM2 status
pm2 status
pm2 logs pengaduan-backend --lines 50

# Nginx status
sudo systemctl status nginx

# MySQL status
sudo systemctl status mysql
```

### Update Code
```bash
# Pull latest code
cd /var/www/pengaduan-sarpras
git pull origin main

# Update backend
cd server
npm install --production
pm2 restart pengaduan-backend

# Update frontend
cd ../clients/web
npm install
npm run build
sudo cp -r dist/* /var/www/pengaduan-sarpras-web/
```

### View Logs
```bash
# Backend logs
pm2 logs pengaduan-backend

# Nginx access logs
sudo tail -f /var/log/nginx/pengaduan-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/pengaduan-api-error.log

# MySQL error log
sudo tail -f /var/log/mysql/error.log
```

### Restart Services
```bash
# Restart backend
pm2 restart pengaduan-backend

# Restart Nginx
sudo systemctl restart nginx

# Restart MySQL
sudo systemctl restart mysql
```

---

## 🔍 Debugging

### Backend Not Working
```bash
# Check if running
pm2 status

# Check logs
pm2 logs pengaduan-backend --lines 100

# Test locally
curl http://localhost:5000/api/health

# Check port
sudo netstat -tlnp | grep 5000

# Restart
pm2 restart pengaduan-backend
```

### Frontend Not Loading
```bash
# Check files exist
ls -la /var/www/pengaduan-sarpras-web/

# Check Nginx config
sudo nginx -t

# Check Nginx logs
sudo tail -100 /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Database Issues
```bash
# Login to MySQL
mysql -u clawwo -p

# Check tables
USE pengaduan_sarpras;
SHOW TABLES;

# Check data
SELECT COUNT(*) FROM users;

# Test connection from backend
cd /var/www/pengaduan-sarpras/server
node -e "require('./config/dbConfig').query('SELECT 1', console.log)"
```

### CORS Errors
```bash
# Check ORIGIN in .env
cat /var/www/pengaduan-sarpras/server/.env | grep ORIGIN

# Should match frontend URL
# Edit if wrong
nano /var/www/pengaduan-sarpras/server/.env

# Restart backend
pm2 restart pengaduan-backend
```

---

## 🛠️ Maintenance

### Database Backup
```bash
# Create backup
mysqldump -u clawwo -p pengaduan_sarpras > backup-$(date +%Y%m%d).sql

# Restore backup
mysql -u clawwo -p pengaduan_sarpras < backup-20250114.sql
```

### Clean Logs
```bash
# Clear PM2 logs
pm2 flush

# Clean old Nginx logs
sudo find /var/log/nginx/ -name "*.gz" -mtime +30 -delete
```

### Update SSL Certificate
```bash
# Check expiry
sudo certbot certificates

# Renew (automatic usually)
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

---

## 🚨 Emergency Recovery

### Complete Backend Restart
```bash
# Stop all
pm2 delete all

# Clear cache
cd /var/www/pengaduan-sarpras
rm -rf server/node_modules
cd server
npm install --production

# Start fresh
cd /var/www/pengaduan-sarpras
pm2 start ecosystem.config.js --env production
pm2 save
```

### Reset Database
```bash
# DANGER: This will delete all data!
mysql -u clawwo -p
DROP DATABASE pengaduan_sarpras;
CREATE DATABASE pengaduan_sarpras CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Re-import
mysql -u clawwo -p pengaduan_sarpras < ~/pengaduan_sarpras.sql
```

### Nginx Not Starting
```bash
# Check config
sudo nginx -t

# Check what's using port 80
sudo lsof -i :80

# Kill conflicting process
sudo kill -9 PID

# Restart Nginx
sudo systemctl restart nginx
```

---

## 📊 Monitoring

### Resource Usage
```bash
# CPU and memory
htop

# Disk space
df -h

# Nginx connections
sudo netstat -an | grep :80 | wc -l

# PM2 monitoring
pm2 monit
```

### Performance Check
```bash
# Response time
time curl http://localhost:5000/api/health

# Database query time
mysql -u clawwo -p pengaduan_sarpras -e "SELECT SLEEP(0); SELECT NOW();" --verbose
```

---

## 🔐 Security

### Update System
```bash
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y
```

### Check Firewall
```bash
sudo ufw status verbose
```

### Check Failed Logins
```bash
sudo tail -100 /var/log/auth.log | grep "Failed password"
```

---

## 📱 Testing Endpoints

### Backend API
```bash
# Health check
curl http://api.yourdomain.com/api/health

# Get locations
curl http://api.yourdomain.com/api/lokasi

# Register (change data)
curl -X POST http://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test123!","email":"test@test.com","nama":"Test"}'

# Login (get token)
curl -X POST http://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test","password":"Test123!"}'
```

### Frontend
```bash
# Check if accessible
curl -I http://yourdomain.com

# Check files served
curl http://yourdomain.com/index.html | head -20
```

---

**Simpan file ini dan bookmark untuk referensi cepat! 📌**
