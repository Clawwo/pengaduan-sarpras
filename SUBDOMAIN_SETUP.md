# 🌐 Setup Subdomain - API & Frontend Terpisah

## 📋 Arsitektur Subdomain

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare Proxy                        │
└────────────┬──────────────────────────────┬─────────────────┘
             │                              │
             │                              │
    ┌────────▼────────┐           ┌────────▼────────┐
    │ api.domainmu.com│           │ ukk.domainmu.com│
    │   (Backend API) │           │   (Frontend)    │
    └────────┬────────┘           └────────┬────────┘
             │                              │
             │                              │
    ┌────────▼────────┐           ┌────────▼────────┐
    │  Nginx Proxy    │           │  Nginx Proxy    │
    │  → backend:5000 │           │  → Static Files │
    └─────────────────┘           └─────────────────┘
```

**Keuntungan:**
- ✅ Backend dan Frontend terpisah (lebih profesional)
- ✅ Mudah scale independently
- ✅ CORS configuration lebih mudah
- ✅ Rate limiting per subdomain
- ✅ SSL certificate terpisah (optional)
- ✅ Lebih aman (Backend tidak exposed langsung)

---

## 🚀 Setup Step-by-Step

### Step 1: Setup DNS di Cloudflare

Login ke Cloudflare Dashboard → DNS → Records

**Tambahkan 4 DNS records:**

| Type | Name | Content | Proxy | TTL |
|------|------|---------|-------|-----|
| A | api | [IP-SERVER] | ☁️ Proxied | Auto |
| A | ukk | [IP-SERVER] | ☁️ Proxied | Auto |
| A | @ | [IP-SERVER] | ☁️ Proxied | Auto |
| A | www | [IP-SERVER] | ☁️ Proxied | Auto |

**Contoh:**
Jika domain: `pengaduan-sarpras.my.id` dan IP: `103.123.45.67`

```
A    api    103.123.45.67    Proxied    Auto
A    ukk    103.123.45.67    Proxied    Auto
A    @      103.123.45.67    Proxied    Auto
A    www    103.123.45.67    Proxied    Auto
```

**Klik Save untuk setiap record.**

---

### Step 2: Update nginx.conf di Server

Nginx config sudah diupdate dengan subdomain configuration!

**Konfigurasi yang sudah ditambahkan:**

1. **API Subdomain** (`api.domainmu.com`):
   - Port 80 (HTTP) & 443 (HTTPS)
   - Proxy semua request ke backend:5000
   - Rate limiting untuk API
   - CORS headers untuk allow frontend
   - Socket.io support

2. **Frontend Subdomain** (`ukk.domainmu.com`):
   - Port 80 (HTTP) & 443 (HTTPS)
   - Serve static files (React build)
   - Cache control untuk assets
   - Security headers

3. **Fallback Server**:
   - Redirect domain root ke ukk.domainmu.com

**Update server_name di config:**

```bash
# Di server
cd ~/pengaduan-sarpras
nano nginx/nginx.conf
```

**Ganti placeholder domain:**
```nginx
# Line ~46: API subdomain
server_name api.domainmu.com;
# Ganti jadi: api.pengaduan-sarpras.my.id

# Line ~110: Frontend subdomain
server_name ukk.domainmu.com;
# Ganti jadi: ukk.pengaduan-sarpras.my.id

# Di CORS header (line ~94):
add_header Access-Control-Allow-Origin "https://ukk.domainmu.com" always;
# Ganti jadi: https://ukk.pengaduan-sarpras.my.id

# Line ~151: Default server redirect
return 301 http://ukk.domainmu.com$request_uri;
# Ganti jadi: http://ukk.pengaduan-sarpras.my.id$request_uri;

# Di HTTPS sections (commented, line ~170+):
# server_name api.domainmu.com;
# Ganti jadi: api.pengaduan-sarpras.my.id
# server_name ukk.domainmu.com;
# Ganti jadi: ukk.pengaduan-sarpras.my.id
```

**Save:** `Ctrl+O`, Enter, `Ctrl+X`

---

### Step 3: Update Environment Variables

```bash
# Edit .env
cd ~/pengaduan-sarpras
nano .env
```

**Update VITE_API_URL:**
```bash
# Before:
VITE_API_URL=http://your-server-ip

# After:
VITE_API_URL=https://api.pengaduan-sarpras.my.id
```

**Save:** `Ctrl+O`, Enter, `Ctrl+X`

---

### Step 4: Rebuild Frontend

Frontend perlu rebuild karena API URL berubah:

```bash
# Rebuild frontend dengan API URL baru
docker compose build --no-cache frontend

# Verify build success
docker images | grep frontend
```

---

### Step 5: Restart Services

```bash
# Test nginx config
docker compose exec nginx nginx -t

# Output should be:
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Restart nginx
docker compose restart nginx

# Check status
docker compose ps

# All should be healthy/running
```

---

### Step 6: Test Subdomain Configuration

#### Test DNS Resolution:
```bash
# Test API subdomain
nslookup api.pengaduan-sarpras.my.id

# Test Frontend subdomain
nslookup ukk.pengaduan-sarpras.my.id

# Both should return Cloudflare IPs (104.x.x.x)
```

#### Test HTTP Endpoints:
```bash
# Test API subdomain
curl -I http://api.pengaduan-sarpras.my.id/health
# Should return: 200 OK, "API OK"

# Test Frontend subdomain
curl -I http://ukk.pengaduan-sarpras.my.id/health
# Should return: 200 OK, "Frontend OK"

# Test API endpoint
curl http://api.pengaduan-sarpras.my.id/api/
# Should return JSON response dari backend

# Test Frontend
curl http://ukk.pengaduan-sarpras.my.id/
# Should return HTML
```

#### Test via Browser:

1. **API Subdomain:**
   ```
   http://api.pengaduan-sarpras.my.id/health
   → Should show: "API OK"
   
   http://api.pengaduan-sarpras.my.id/api/lokasi
   → Should show: JSON data lokasi
   ```

2. **Frontend Subdomain:**
   ```
   http://ukk.pengaduan-sarpras.my.id/
   → Should show: React aplikasi kamu
   ```

3. **Root Domain:**
   ```
   http://pengaduan-sarpras.my.id/
   → Should redirect to: ukk.pengaduan-sarpras.my.id
   ```

---

### Step 7: Setup SSL (Flexible Mode)

**Di Cloudflare Dashboard:**

1. **SSL/TLS → Overview:**
   - Set mode: **"Flexible"**

2. **SSL/TLS → Edge Certificates:**
   - Always Use HTTPS: **ON**
   - Automatic HTTPS Rewrites: **ON**

**Test HTTPS:**
```bash
# API
curl -I https://api.pengaduan-sarpras.my.id/health

# Frontend
curl -I https://ukk.pengaduan-sarpras.my.id/

# Both should return: 200 OK
```

**Browser test:**
- `https://api.pengaduan-sarpras.my.id/health` ✅
- `https://ukk.pengaduan-sarpras.my.id/` ✅

---

### Step 8: Upgrade to Full (Strict) SSL (Optional)

Untuk production, upgrade ke Full (Strict):

#### 1. Generate Cloudflare Origin Certificate

Cloudflare Dashboard → SSL/TLS → Origin Server → Create Certificate

Settings:
- Private key: RSA (2048)
- Hostnames:
  ```
  *.pengaduan-sarpras.my.id
  pengaduan-sarpras.my.id
  ```
- Validity: 15 years

**Copy kedua certificates!**

#### 2. Upload ke Server

```bash
# Create SSL directory
mkdir -p ~/pengaduan-sarpras/nginx/ssl

# Create cert file
nano ~/pengaduan-sarpras/nginx/ssl/cert.pem
# Paste Origin Certificate, Save

# Create key file
nano ~/pengaduan-sarpras/nginx/ssl/key.pem
# Paste Private Key, Save

# Set permissions
chmod 600 ~/pengaduan-sarpras/nginx/ssl/*.pem
```

#### 3. Enable HTTPS in nginx.conf

```bash
nano ~/pengaduan-sarpras/nginx/nginx.conf
```

**Uncomment HTTPS sections:**
- Lines ~165-230 (API HTTPS server)
- Lines ~235-280 (Frontend HTTPS server)

**Enable HTTP→HTTPS redirects:**
```nginx
# Line ~52 (API HTTP server):
return 301 https://$host$request_uri;

# Line ~117 (Frontend HTTP server):
return 301 https://$host$request_uri;
```

**Save & restart:**
```bash
docker compose restart nginx
```

#### 4. Change Cloudflare SSL Mode

Cloudflare Dashboard → SSL/TLS → Overview:
- Change mode: **"Flexible"** → **"Full (Strict)"**

#### 5. Update .env

```bash
nano .env
```

Update:
```bash
VITE_API_URL=https://api.pengaduan-sarpras.my.id
```

Rebuild frontend:
```bash
docker compose build --no-cache frontend
docker compose up -d
```

---

## 🔍 Verification Checklist

### DNS:
- [ ] `nslookup api.domainmu.com` returns Cloudflare IP
- [ ] `nslookup ukk.domainmu.com` returns Cloudflare IP

### HTTP:
- [ ] `curl http://api.domainmu.com/health` returns "API OK"
- [ ] `curl http://ukk.domainmu.com/health` returns "Frontend OK"
- [ ] `curl http://api.domainmu.com/api/lokasi` returns JSON
- [ ] `curl http://ukk.domainmu.com/` returns HTML

### HTTPS (after SSL setup):
- [ ] `curl https://api.domainmu.com/health` returns 200
- [ ] `curl https://ukk.domainmu.com/` returns 200
- [ ] HTTP redirects to HTTPS
- [ ] SSL padlock showing in browser

### Application:
- [ ] Frontend loads di browser via subdomain
- [ ] API calls dari frontend ke api subdomain working
- [ ] Login/Register berfungsi
- [ ] Upload foto berfungsi
- [ ] Notifikasi working

---

## 📊 Example Configuration

### Your Setup:
```
Domain: pengaduan-sarpras.my.id
Server IP: 103.123.45.67

Subdomains:
  - api.pengaduan-sarpras.my.id → Backend (Node.js)
  - ukk.pengaduan-sarpras.my.id → Frontend (React)
  - pengaduan-sarpras.my.id → Redirect to ukk
  - www.pengaduan-sarpras.my.id → Redirect to ukk
```

### Frontend Config:
```javascript
// .env atau vite config
VITE_API_URL=https://api.pengaduan-sarpras.my.id

// API calls in code:
axios.get(`${VITE_API_URL}/api/pengaduan`)
// Will call: https://api.pengaduan-sarpras.my.id/api/pengaduan
```

### API Endpoints:
```
https://api.pengaduan-sarpras.my.id/api/auth/login
https://api.pengaduan-sarpras.my.id/api/pengaduan
https://api.pengaduan-sarpras.my.id/api/lokasi
https://api.pengaduan-sarpras.my.id/api/petugas
etc...
```

---

## 🛠️ Troubleshooting

### Issue 1: 502 Bad Gateway di API subdomain

**Check:**
```bash
docker compose ps backend
docker compose logs backend
curl http://localhost:5000/
```

**Solution:**
- Ensure backend container running
- Check backend logs for errors
- Verify proxy_pass in nginx config

### Issue 2: CORS errors

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
Update CORS headers di nginx.conf (line ~94):
```nginx
add_header Access-Control-Allow-Origin "https://ukk.domainmu.com" always;
```

Atau di backend (server.js):
```javascript
app.use(cors({
  origin: 'https://ukk.pengaduan-sarpras.my.id',
  credentials: true
}));
```

### Issue 3: Frontend tidak bisa connect ke API

**Check .env:**
```bash
cat .env | grep VITE_API_URL
# Should be: https://api.pengaduan-sarpras.my.id
```

**Rebuild frontend:**
```bash
docker compose build --no-cache frontend
docker compose up -d
```

### Issue 4: SSL certificate errors

**Check nginx logs:**
```bash
docker compose logs nginx | grep -i ssl
```

**Verify cert files:**
```bash
ls -la nginx/ssl/
# Should show: cert.pem, key.pem
```

**Test nginx config:**
```bash
docker compose exec nginx nginx -t
```

---

## 📚 Quick Commands Reference

```bash
# Update nginx config
nano nginx/nginx.conf

# Test nginx config
docker compose exec nginx nginx -t

# Restart nginx
docker compose restart nginx

# Rebuild frontend
docker compose build --no-cache frontend

# View logs
docker compose logs -f nginx
docker compose logs -f backend

# Test endpoints
curl -I https://api.domainmu.com/health
curl -I https://ukk.domainmu.com/

# Check DNS
nslookup api.domainmu.com
nslookup ukk.domainmu.com
```

---

## 🎯 Summary

**Subdomain Structure:**
```
api.domainmu.com  → Backend API (Port 5000 internal)
ukk.domainmu.com  → Frontend (Static files)
domainmu.com      → Redirect to ukk.domainmu.com
www.domainmu.com  → Redirect to ukk.domainmu.com
```

**Files Modified:**
- ✅ `nginx/nginx.conf` - Subdomain configuration
- ✅ `.env` - API URL updated
- ✅ Frontend rebuild needed

**Next Steps:**
1. Update DNS records di Cloudflare (4 A records)
2. Edit nginx.conf ganti domain placeholders
3. Update .env dengan API URL
4. Rebuild frontend
5. Restart nginx
6. Test semua endpoints
7. Enable SSL

**Estimated Time:** 15-20 minutes

---

**Created:** November 13, 2025  
**Status:** Configuration ready  
**Architecture:** Subdomain-based microservices
