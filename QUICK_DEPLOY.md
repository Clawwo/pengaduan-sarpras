# 🚀 Quick Deploy to VPS

## Pre-requisites
- VPS with Ubuntu 22.04+
- Domain name (optional but recommended)
- SSH access

## 1️⃣ One-Command Setup

Connect to VPS and run:

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/Clawwo/pengaduan-sarpras.git
cd pengaduan-sarpras

# Run setup script
sudo chmod +x setup-vps.sh
sudo ./setup-vps.sh
```

**Follow the prompts:**
- Enter your GitHub repo URL (if different)
- Enter MySQL credentials (save these!)
- Wait for installation (~5-10 minutes)

## 2️⃣ Configure Application

```bash
# Setup backend environment
cd /var/www/pengaduan-sarpras
cp .env.production server/.env
nano server/.env
```

**Update these values:**
- `DB_PASSWORD` - your MySQL password from setup
- `JWT_SECRET` - run `openssl rand -base64 32` to generate
- `IMAGEKIT_*` - get from https://imagekit.io

## 3️⃣ Setup Nginx & Domain

```bash
# Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/pengaduan-sarpras

# Edit with your domain
sudo nano /etc/nginx/sites-available/pengaduan-sarpras
# Replace "your-domain.com" with actual domain

# Enable site
sudo ln -s /etc/nginx/sites-available/pengaduan-sarpras /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

## 4️⃣ Deploy Application

```bash
cd /var/www/pengaduan-sarpras
chmod +x deploy.sh
./deploy.sh
```

## 5️⃣ Setup SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## ✅ Done!

Access your app at: `https://your-domain.com`

---

## 🔄 Future Deployments

Just run:
```bash
cd /var/www/pengaduan-sarpras
./deploy.sh
```

---

## 🆘 Troubleshooting

### Backend not starting?
```bash
pm2 logs pengaduan-backend
```

### Frontend shows blank page?
```bash
cd /var/www/pengaduan-sarpras/clients/web
npm run build
sudo cp -r dist/* /var/www/pengaduan-sarpras/frontend/
```

### Database connection error?
```bash
# Test connection
mysql -u pengaduan_user -p pengaduan_sarpras

# Check .env
cat /var/www/pengaduan-sarpras/server/.env | grep DB_
```

---

**Total time: ~20-30 minutes**

For detailed guide, see: **DEPLOYMENT_GUIDE.md**
