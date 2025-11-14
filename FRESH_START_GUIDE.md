# 🚀 Panduan Setup VPS dari Awal - Pengaduan Sarpras

> **Panduan lengkap untuk setup VPS Ubuntu dari nol sampai production**

## 📋 Daftar Isi
- [Persiapan](#persiapan)
- [Step 1: Persiapan Lokal](#step-1-persiapan-lokal)
- [Step 2: Setup VPS Awal](#step-2-setup-vps-awal)
- [Step 3: Clone & Konfigurasi](#step-3-clone--konfigurasi)
- [Step 4: Import Database](#step-4-import-database)
- [Step 5: Build & Deploy](#step-5-build--deploy)
- [Step 6: Setup Nginx](#step-6-setup-nginx)
- [Step 7: Setup SSL](#step-7-setup-ssl)
- [Testing & Troubleshooting](#testing--troubleshooting)

---

## 🎯 Persiapan

### Yang Kamu Butuhkan:
- ✅ VPS Ubuntu 22.04 (minimal 1GB RAM)
- ✅ Domain atau subdomain (misal: farelhry.my.id)
- ✅ Akses SSH ke VPS
- ✅ Git repository (GitHub/GitLab)

### Informasi yang Perlu Disiapkan:
```
Domain utama: ________________
Domain API: api.________________
VPS IP: ________________
VPS User: ________________
MySQL Password: ________________
```

---

## 🧹 Step 1: Persiapan Lokal

### 1.1 Bersihkan File Deploy Lama (Opsional)

Jika ada error sebelumnya, hapus file deploy lama:

```bash
# Di local Windows
cd d:\Developments\Tech\React\React-Projects\pengaduan-sarpras

# Hapus file deploy lama (BACKUP dulu jika perlu!)
# Tidak perlu hapus jika mau keep history
```

### 1.2 Pastikan File-File Penting Ada

Cek file-file ini ada dan benar:

```bash
# File yang WAJIB ada:
✅ server/.env.example         # Template environment
✅ clients/web/.env.example    # Template frontend env
✅ pengaduan_sarpras.sql       # Database dump
✅ ecosystem.config.js         # PM2 config
✅ nginx.conf                  # Nginx config template
✅ fresh-setup-vps.sh          # Script setup VPS baru
```

### 1.3 Update File Konfigurasi

**Edit `server/.env.example`:**
```bash
# Update dengan kredensial production mu
NODE_ENV=production
PORT=5000

# Database - sesuaikan dengan yang akan dibuat di VPS
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pengaduan_sarpras
DB_USER=clawwo
DB_PASSWORD=YOUR_DB_PASSWORD_HERE  # ⬅️ GANTI INI

# JWT Secret - generate baru untuk production
JWT_SECRET=YOUR_SECURE_JWT_SECRET_HERE  # ⬅️ GANTI INI
JWT_EXPIRES_IN=7d

# URLs - sesuaikan dengan domain mu
FRONTEND_URL=http://yourdomain.com     # ⬅️ GANTI INI
ORIGIN=http://yourdomain.com            # ⬅️ GANTI INI
COOKIE_SECURE=false  # true jika sudah pakai HTTPS

# ImageKit (jika pakai)
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_url_endpoint

# Firebase (jika pakai)
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
```

**Edit `clients/web/.env.example`:**
```bash
# API URL - domain API mu
VITE_API_URL=http://api.yourdomain.com  # ⬅️ GANTI INI
```

**Edit `nginx.conf`:**
```nginx
# Ganti semua 'yourdomain.com' dengan domain mu
# Ganti 'api.yourdomain.com' dengan API subdomain mu
```

### 1.4 Commit ke Git

```bash
# Commit semua perubahan
git add .
git commit -m "Prepare for fresh VPS deployment"
git push origin main
```

---

## 🖥️ Step 2: Setup VPS Awal

### 2.1 Login ke VPS

```bash
# Dari Windows PowerShell
ssh your-user@your-vps-ip

# Contoh:
ssh clawwo@103.xxx.xxx.xxx
```

### 2.2 Upload Script Setup

**Dari Windows:**
```powershell
# Upload script setup ke VPS
scp d:\Developments\Tech\React\React-Projects\pengaduan-sarpras\fresh-setup-vps.sh your-user@your-vps-ip:~/
```

**Atau, download langsung di VPS:**
```bash
# Di VPS
cd ~
wget https://raw.githubusercontent.com/YOUR_USERNAME/pengaduan-sarpras/main/fresh-setup-vps.sh
```

### 2.3 Jalankan Script Setup

```bash
# Di VPS
chmod +x ~/fresh-setup-vps.sh
sudo ./fresh-setup-vps.sh
```

**Script ini akan install:**
- ✅ Node.js 20
- ✅ PM2
- ✅ Nginx
- ✅ MySQL 8
- ✅ Git
- ✅ UFW Firewall
- ✅ Membuat database dan user
- ✅ Setup folder aplikasi

**Ikuti prompt yang muncul:**
```
Enter MySQL root password: [Enter jika kosong]
Enter new database name [pengaduan_sarpras]: [Enter atau ketik nama lain]
Enter new database user [clawwo]: [Enter atau ketik user lain]
Enter new database password: ********  [Ketik password mu]
```

### 2.4 Catat Informasi Setup

Setelah setup selesai, informasi penting tersimpan di:
```bash
cat /var/www/pengaduan-sarpras/SETUP_INFO.txt
```

**PENTING:** Simpan informasi ini dengan aman!

### 2.5 Secure MySQL (Opsional tapi Direkomendasikan)

```bash
sudo mysql_secure_installation
```

Jawab:
- Set root password? **Y** (jika belum ada)
- Remove anonymous users? **Y**
- Disallow root login remotely? **Y**
- Remove test database? **Y**
- Reload privilege tables? **Y**

### 2.6 Logout dan Login Lagi

```bash
# Logout
exit

# Login lagi (untuk refresh group permissions)
ssh your-user@your-vps-ip
```

---

## 📦 Step 3: Clone & Konfigurasi

### 3.1 Clone Repository

```bash
# Di VPS
cd /var/www/pengaduan-sarpras
git clone https://github.com/YOUR_USERNAME/pengaduan-sarpras.git .

# Atau jika folder sudah ada file
git clone https://github.com/YOUR_USERNAME/pengaduan-sarpras.git temp
mv temp/* .
mv temp/.* . 2>/dev/null || true
rmdir temp
```

### 3.2 Setup Backend Environment

```bash
# Copy template ke .env
cd /var/www/pengaduan-sarpras/server
cp .env.example .env

# Edit dengan kredensial sebenarnya
nano .env
```

**Edit nilai-nilai ini:**
```bash
# Database - gunakan kredensial dari SETUP_INFO.txt
DB_USER=clawwo              # ⬅️ Sesuaikan
DB_PASSWORD=clawwo071207    # ⬅️ Sesuaikan
DB_NAME=pengaduan_sarpras   # ⬅️ Sesuaikan

# URLs - gunakan domain mu
FRONTEND_URL=http://farelhry.my.id      # ⬅️ Sesuaikan
ORIGIN=http://farelhry.my.id            # ⬅️ Sesuaikan

# JWT Secret - GANTI dengan yang baru!
JWT_SECRET=your-secure-random-string-here  # ⬅️ GANTI!

# ImageKit & Firebase - masukkan credentials mu
```

**Generate JWT Secret baru:**
```bash
# Di VPS
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Save file:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 3.3 Setup Frontend Environment

```bash
cd /var/www/pengaduan-sarpras/clients/web
cp .env.example .env.production

nano .env.production
```

**Edit:**
```bash
VITE_API_URL=http://api.farelhry.my.id  # ⬅️ Sesuaikan dengan domain API mu
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 3.4 Install Dependencies

```bash
# Backend
cd /var/www/pengaduan-sarpras/server
npm install --production

# Frontend (untuk build)
cd /var/www/pengaduan-sarpras/clients/web
npm install
```

⏰ **Ini akan butuh waktu 5-10 menit**

---

## 🗄️ Step 4: Import Database

### 4.1 Upload SQL File ke VPS

**Dari Windows:**
```powershell
scp d:\Developments\Tech\React\React-Projects\pengaduan-sarpras\pengaduan_sarpras.sql your-user@your-vps-ip:~/
```

### 4.2 Import Database

```bash
# Di VPS
cd ~
mysql -u clawwo -p pengaduan_sarpras < pengaduan_sarpras.sql

# Masukkan password saat diminta
```

### 4.3 Verifikasi Import

```bash
# Login ke MySQL
mysql -u clawwo -p

# Gunakan database
USE pengaduan_sarpras;

# Lihat tabel-tabel
SHOW TABLES;

# Cek jumlah data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM pengaduan;

# Keluar
EXIT;
```

**Expected output dari `SHOW TABLES;`:**
```
+----------------------------+
| Tables_in_pengaduan_sarpras|
+----------------------------+
| items                      |
| kategori_lokasi            |
| list_lokasi                |
| lokasi                     |
| notifications              |
| pengaduan                  |
| petugas                    |
| riwayat_aksi               |
| users                      |
+----------------------------+
```

✅ **Jika semua tabel muncul, database berhasil diimport!**

---

## 🔨 Step 5: Build & Deploy

### 5.1 Build Frontend

```bash
cd /var/www/pengaduan-sarpras/clients/web
npm run build
```

⏰ **Build process 2-5 menit**

**Output:** Folder `dist` akan dibuat berisi file static.

### 5.2 Copy Build ke Nginx Directory

```bash
# Buat direktori jika belum ada
sudo mkdir -p /var/www/pengaduan-sarpras-web

# Copy files
sudo cp -r dist/* /var/www/pengaduan-sarpras-web/

# Set permissions
sudo chown -R www-data:www-data /var/www/pengaduan-sarpras-web
```

### 5.3 Start Backend dengan PM2

```bash
cd /var/www/pengaduan-sarpras
pm2 start ecosystem.config.js --env production

# Simpan PM2 process list
pm2 save

# Setup PM2 startup (jika belum)
pm2 startup
# Follow instruksi yang muncul
```

### 5.4 Cek Backend Running

```bash
# Status
pm2 status

# Logs
pm2 logs pengaduan-backend --lines 30

# Health check
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{"status":"healthy","uptime":123,"timestamp":"2025-..."}
```

✅ **Jika dapat response JSON, backend berhasil running!**

---

## 🌐 Step 6: Setup Nginx

### 6.1 Update Nginx Config dengan Domain Mu

```bash
cd /var/www/pengaduan-sarpras
sudo nano nginx.conf
```

**Ganti:**
```nginx
# Sebelum (template):
server_name yourdomain.com;

# Sesudah (contoh):
server_name farelhry.my.id;
```

```nginx
# Sebelum (template):
server_name api.yourdomain.com;

# Sesudah (contoh):
server_name api.farelhry.my.id;
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 6.2 Copy Config ke Nginx

```bash
# Copy ke sites-available
sudo cp nginx.conf /etc/nginx/sites-available/pengaduan-sarpras

# Enable site
sudo ln -sf /etc/nginx/sites-available/pengaduan-sarpras /etc/nginx/sites-enabled/

# Hapus default site jika masih ada
sudo rm -f /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t
```

**Expected output:**
```
nginx: configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 6.3 Restart Nginx

```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

**Status harus:** `active (running)`

---

## 🔐 Step 7: Setup SSL (HTTPS)

### 7.1 Setup DNS Records Dulu

**Di DNS Provider (Cloudflare/Namecheap/dll):**

Tambahkan 2 A Records:
```
Type: A
Name: @
Value: YOUR_VPS_IP
Proxy: Optional

Type: A
Name: api
Value: YOUR_VPS_IP
Proxy: Optional
```

**Tunggu DNS propagate (5-30 menit)**

Cek dengan:
```bash
ping farelhry.my.id
ping api.farelhry.my.id
```

### 7.2 Install Certbot

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### 7.3 Dapatkan SSL Certificate

```bash
# Request certificate untuk kedua domain
sudo certbot --nginx -d farelhry.my.id -d api.farelhry.my.id

# Atau jika pakai www juga:
sudo certbot --nginx -d farelhry.my.id -d www.farelhry.my.id -d api.farelhry.my.id
```

**Ikuti prompt:**
- Email: `your-email@example.com`
- Agree to Terms: `Y`
- Share email: `N`
- Redirect HTTP to HTTPS: `2` (Yes)

**Certbot akan:**
1. ✅ Generate SSL certificate
2. ✅ Update nginx.conf otomatis
3. ✅ Setup auto-renewal

### 7.4 Update Environment untuk HTTPS

**Backend:**
```bash
nano /var/www/pengaduan-sarpras/server/.env
```

Update:
```bash
FRONTEND_URL=https://farelhry.my.id     # http → https
ORIGIN=https://farelhry.my.id           # http → https
COOKIE_SECURE=true                       # false → true
```

**Frontend - Rebuild:**
```bash
nano /var/www/pengaduan-sarpras/clients/web/.env.production
```

Update:
```bash
VITE_API_URL=https://api.farelhry.my.id  # http → https
```

**Rebuild frontend:**
```bash
cd /var/www/pengaduan-sarpras/clients/web
npm run build
sudo cp -r dist/* /var/www/pengaduan-sarpras-web/
```

**Restart backend:**
```bash
pm2 restart pengaduan-backend
```

### 7.5 Test HTTPS

```bash
# Test dengan curl
curl https://farelhry.my.id
curl https://api.farelhry.my.id/api/health

# Atau buka di browser
```

✅ **Harus dapat response tanpa SSL error!**

---

## 🧪 Testing & Troubleshooting

### Testing Checklist

#### 1. Frontend Test
```bash
# Cek bisa diakses
curl -I http://farelhry.my.id
# atau
curl -I https://farelhry.my.id

# Expected: 200 OK
```

**Browser Test:**
- [ ] Buka https://farelhry.my.id
- [ ] Cek console browser (F12) - tidak ada error CORS
- [ ] Cek Network tab - API calls ke https://api.farelhry.my.id

#### 2. Backend API Test
```bash
# Health check
curl http://api.farelhry.my.id/api/health
# atau
curl https://api.farelhry.my.id/api/health

# Expected:
# {"status":"healthy","uptime":xxx,"timestamp":"..."}

# Test lokasi endpoint
curl http://api.farelhry.my.id/api/lokasi

# Test register (ganti data sesuai kebutuhan)
curl -X POST https://api.farelhry.my.id/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"testuser",
    "password":"Test123!",
    "email":"test@example.com",
    "nama":"Test User"
  }'
```

#### 3. Database Test
```bash
mysql -u clawwo -p pengaduan_sarpras -e "SELECT COUNT(*) FROM users;"
mysql -u clawwo -p pengaduan_sarpras -e "SELECT COUNT(*) FROM pengaduan;"
```

#### 4. PM2 Status
```bash
pm2 status
pm2 logs pengaduan-backend --lines 50
```

#### 5. Nginx Status
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/pengaduan-access.log
sudo tail -f /var/log/nginx/pengaduan-api-error.log
```

---

### Common Issues & Solutions

#### ❌ Issue: Backend 500 Error

**Check:**
```bash
pm2 logs pengaduan-backend --lines 100
```

**Common causes:**
1. Database connection error
   - **Fix:** Cek credentials di `server/.env`
   - Test: `mysql -u USER -p DATABASE`

2. Missing dependencies
   - **Fix:** `cd server && npm install --production`

3. Port 5000 sudah dipakai
   - **Fix:** `sudo lsof -i :5000` → kill process atau ganti PORT di `.env`

4. Environment variables salah
   - **Fix:** Cek semua variable di `server/.env`

#### ❌ Issue: CORS Error di Browser

**Check console browser:** `Access-Control-Allow-Origin`

**Fix:**
```bash
# Edit server/.env
nano /var/www/pengaduan-sarpras/server/.env

# Pastikan ORIGIN sesuai
ORIGIN=https://farelhry.my.id

# Restart backend
pm2 restart pengaduan-backend
```

#### ❌ Issue: Nginx 502 Bad Gateway

**Meaning:** Nginx tidak bisa connect ke backend

**Check:**
```bash
# Backend running?
pm2 status

# Backend listening di port 5000?
sudo netstat -tlnp | grep 5000

# Backend logs
pm2 logs pengaduan-backend
```

**Fix:**
```bash
# Restart backend
pm2 restart pengaduan-backend

# Cek lagi
curl http://localhost:5000/api/health
```

#### ❌ Issue: Frontend 404 Not Found

**Check:**
```bash
# File dist ada?
ls -la /var/www/pengaduan-sarpras-web/

# Nginx config benar?
sudo nginx -t

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

**Fix:**
```bash
# Rebuild frontend
cd /var/www/pengaduan-sarpras/clients/web
npm run build
sudo cp -r dist/* /var/www/pengaduan-sarpras-web/

# Set permissions
sudo chown -R www-data:www-data /var/www/pengaduan-sarpras-web
```

#### ❌ Issue: SSL Certificate Error

**Check expiry:**
```bash
sudo certbot certificates
```

**Renew manually:**
```bash
sudo certbot renew --dry-run  # Test
sudo certbot renew            # Actual renew
```

**Check auto-renewal:**
```bash
sudo systemctl status certbot.timer
```

---

### Useful Commands

#### PM2 Commands
```bash
pm2 list                          # List all processes
pm2 logs pengaduan-backend        # View logs
pm2 restart pengaduan-backend     # Restart
pm2 stop pengaduan-backend        # Stop
pm2 delete pengaduan-backend      # Remove
pm2 monit                         # Monitor
pm2 save                          # Save process list
```

#### Nginx Commands
```bash
sudo nginx -t                     # Test config
sudo systemctl restart nginx      # Restart
sudo systemctl reload nginx       # Reload (no downtime)
sudo systemctl status nginx       # Status
sudo tail -f /var/log/nginx/error.log  # Error logs
```

#### MySQL Commands
```bash
mysql -u clawwo -p                # Login
SHOW DATABASES;                   # List databases
USE pengaduan_sarpras;            # Select database
SHOW TABLES;                      # List tables
DESCRIBE users;                   # Table structure
SELECT * FROM users LIMIT 5;     # Query data
```

#### System Commands
```bash
htop                              # System monitor
df -h                             # Disk usage
free -m                           # Memory usage
sudo ufw status                   # Firewall status
sudo netstat -tlnp                # Listening ports
```

---

## 🎯 Post-Deployment Checklist

Setelah semua selesai, cek list ini:

### Functionality
- [ ] Frontend bisa diakses di browser
- [ ] Register user baru berhasil
- [ ] Login berhasil
- [ ] Create pengaduan berhasil
- [ ] Upload gambar berhasil
- [ ] Notifikasi berfungsi
- [ ] Mobile app bisa connect (jika ada)

### Security
- [ ] SSL/HTTPS aktif (🔒 muncul di browser)
- [ ] Firewall UFW enabled
- [ ] MySQL secure (no root remote access)
- [ ] JWT_SECRET diganti dari default
- [ ] Credentials tidak di-commit ke Git

### Performance
- [ ] PM2 auto-restart enabled
- [ ] Nginx gzip compression enabled
- [ ] Static files di-cache
- [ ] Database indexes ada

### Monitoring
- [ ] PM2 logs tersedia
- [ ] Nginx logs tersedia
- [ ] Setup database backup schedule
- [ ] Setup monitoring (optional: UptimeRobot, etc.)

---

## 📝 Clean Up Old Files

Jika ada deployment lama yang error, bersihkan:

### Di VPS:
```bash
# Stop semua PM2 processes lama
pm2 delete all

# Hapus folder lama (BACKUP dulu!)
rm -rf /var/www/pengaduan-sarpras-old
mv /var/www/pengaduan-sarpras /var/www/pengaduan-sarpras-old

# Hapus nginx config lama
sudo rm /etc/nginx/sites-enabled/pengaduan-sarpras-old

# Drop database lama (BACKUP dulu!)
mysql -u root -p
DROP DATABASE pengaduan_sarpras_old;
DROP USER 'old_user'@'localhost';
EXIT;
```

### Di Local:
```bash
# Tidak perlu hapus apa-apa di local
# Cukup commit code bersih ke Git
git add .
git commit -m "Clean deployment setup"
git push
```

---

## 🆘 Need Help?

### Debugging Steps:
1. **Cek PM2 logs:** `pm2 logs --lines 100`
2. **Cek Nginx logs:** `sudo tail -100 /var/log/nginx/error.log`
3. **Cek system logs:** `sudo journalctl -xe`
4. **Test database:** `mysql -u USER -p DATABASE -e "SHOW TABLES;"`
5. **Test backend direct:** `curl http://localhost:5000/api/health`

### Collect Info for Debugging:
```bash
# System info
uname -a
cat /etc/os-release

# Service status
pm2 status
sudo systemctl status nginx
sudo systemctl status mysql

# Ports
sudo netstat -tlnp | grep -E '(5000|80|443|3306)'

# Disk space
df -h

# Logs
pm2 logs pengaduan-backend --lines 50
sudo tail -50 /var/log/nginx/error.log
```

---

## 📚 Additional Resources

- **PM2 Documentation:** https://pm2.keymetrics.io/docs/usage/quick-start/
- **Nginx Documentation:** https://nginx.org/en/docs/
- **MySQL Documentation:** https://dev.mysql.com/doc/
- **Certbot Documentation:** https://certbot.eff.org/docs/

---

## 🎉 Selesai!

Jika semua steps diikuti dengan benar, aplikasi kamu sekarang:
- ✅ Running di VPS production
- ✅ Accessible via domain (HTTPS)
- ✅ Database terkoneksi dengan baik
- ✅ Auto-restart jika crash
- ✅ Secure dengan SSL
- ✅ Monitored dengan PM2

**Enjoy your production app! 🚀**

---

*Last updated: 2025-11-14*
*Version: 1.0 - Fresh Start Guide*
