# 🌐 Cloudflare & Domain Setup Guide

## 📋 Prerequisites

✅ All Docker containers running (DONE!)
✅ Server IP address: `[your-server-ip]`
✅ Domain name (pilih salah satu):

- Domain berbayar (.com, .id, .net)
- Domain gratis (.my.id, .eu.org, Freenom)

---

## 🎯 Step-by-Step Setup

### Phase 1: Persiapan Domain

#### Option A: Beli Domain Berbayar (Recommended)

**Provider Lokal Indonesia:**

1. **Niagahoster** - https://www.niagahoster.co.id

   - .com: ~Rp 150.000/tahun
   - .id: ~Rp 200.000/tahun
   - .my.id: ~Rp 15.000/tahun (MURAH!)

2. **Rumahweb** - https://www.rumahweb.com
3. **Domainesia** - https://www.domainesia.com
4. **IDwebhost** - https://www.idwebhost.com

**Rekomendasi:** Pilih `.my.id` (murah, lokal, cepat)

#### Option B: Domain Gratis

1. **My.ID** - https://register.my.id (Gratis untuk pelajar/mahasiswa)
2. **Freenom** - https://www.freenom.com (.tk, .ml, .ga)
3. **EU.org** - https://nic.eu.org (Proses 2-4 minggu)

**Catatan:** Untuk laporan akademik, domain gratis cukup!

---

### Phase 2: Setup Cloudflare

#### Step 1: Daftar Cloudflare

1. Buka https://dash.cloudflare.com/sign-up
2. Daftar dengan email kamu
3. Verifikasi email

#### Step 2: Add Site (Domain) ke Cloudflare

1. Klik **"Add a Site"**
2. Masukkan domain kamu (contoh: `pengaduan-sarpras.my.id`)
3. Pilih plan **"Free"** (Rp 0, fitur sudah sangat lengkap!)
4. Klik **"Continue"**

#### Step 3: Review DNS Records

Cloudflare akan scan DNS records existing (jika ada). Skip dulu, kita akan setup manual.

Klik **"Continue"**

#### Step 4: Update Nameservers

Cloudflare akan memberikan 2 nameservers:

```
nameserver1: finn.ns.cloudflare.com
nameserver2: gloria.ns.cloudflare.com
```

**PENTING:** Catat nameservers ini!

Sekarang update di domain registrar kamu:

##### Jika beli di Niagahoster:

1. Login ke https://panel.niagahoster.co.id
2. Menu **"Domain"** → Pilih domain kamu
3. Klik **"Kelola"** atau **"Manage Domain"**
4. Cari menu **"Nameservers"** atau **"DNS Management"**
5. Pilih **"Custom Nameservers"**
6. Masukkan 2 nameservers dari Cloudflare
7. **Save/Update**

##### Jika domain dari registrar lain:

Proses serupa, cari menu Nameservers dan ganti ke Cloudflare nameservers.

**Waktu propagasi:** 5 menit - 24 jam (biasanya 15-30 menit)

---

### Phase 3: Configure DNS di Cloudflare

Setelah nameservers active, setup DNS records:

#### Step 1: Buka DNS Management

1. Di Cloudflare dashboard
2. Pilih domain kamu
3. Menu **"DNS"** → **"Records"**

#### Step 2: Add DNS Records

Tambahkan 2 records berikut:

**Record 1 - Root Domain (@):**

```
Type:     A
Name:     @ (atau domain.com)
Content:  [IP-SERVER-KAMU]
Proxy:    Proxied (Orange Cloud ☁️ ON)
TTL:      Auto
```

**Record 2 - WWW Subdomain:**

```
Type:     A
Name:     www
Content:  [IP-SERVER-KAMU]
Proxy:    Proxied (Orange Cloud ☁️ ON)
TTL:      Auto
```

**PENTING:** Pastikan **Proxy Status** adalah **"Proxied"** (orange cloud), bukan "DNS only"!

#### Contoh:

Jika domain kamu `pengaduan-sarpras.my.id` dan server IP `103.123.45.67`:

| Type | Name | Content       | Proxy      | TTL  |
| ---- | ---- | ------------- | ---------- | ---- |
| A    | @    | 103.123.45.67 | ☁️ Proxied | Auto |
| A    | www  | 103.123.45.67 | ☁️ Proxied | Auto |

Klik **"Save"**

---

### Phase 4: Configure SSL/TLS di Cloudflare

#### Step 1: SSL/TLS Settings

1. Menu **"SSL/TLS"** → **"Overview"**
2. Pilih mode **"Flexible"** (untuk awal)

**SSL Modes:**

- ❌ **Off** - Tidak aman, jangan pakai
- ✅ **Flexible** - HTTPS antara user ↔ Cloudflare, HTTP antara Cloudflare ↔ Server (OK untuk awal)
- ✅ **Full** - HTTPS di semua sisi, tapi SSL certificate self-signed OK
- ✅ **Full (Strict)** - Paling aman, butuh valid SSL certificate di server

**Pilih "Flexible" dulu**, nanti bisa upgrade ke "Full (Strict)" setelah setup Origin Certificate.

#### Step 2: Always Use HTTPS

1. Menu **"SSL/TLS"** → **"Edge Certificates"**
2. Aktifkan **"Always Use HTTPS"** - ON
3. Aktifkan **"Automatic HTTPS Rewrites"** - ON

#### Step 3: Minimum TLS Version

Scroll ke bawah, set:

- **Minimum TLS Version:** TLS 1.2
- **TLS 1.3:** ON

---

### Phase 5: Update Application Configuration

Sekarang update konfigurasi aplikasi untuk gunakan domain:

#### Step 1: Update .env di Server

```bash
# SSH ke server
ssh Clawwo@your-server-ip

# Edit .env
cd ~/pengaduan-sarpras
nano .env
```

Update nilai `VITE_API_URL`:

```bash
# Before:
VITE_API_URL=http://your-server-ip

# After:
VITE_API_URL=https://pengaduan-sarpras.my.id
```

**Save:** `Ctrl + O`, Enter, `Ctrl + X`

#### Step 2: Rebuild Frontend

Frontend perlu rebuild karena `VITE_API_URL` di-embed saat build:

```bash
# Rebuild frontend dengan API URL baru
docker compose build --no-cache frontend

# Restart all services
docker compose down
docker compose up -d
```

#### Step 3: Verify Services Running

```bash
docker compose ps

# Should show all healthy
```

---

### Phase 6: Test Domain & SSL

#### Step 1: Test DNS Propagation

```bash
# Di server atau local
nslookup pengaduan-sarpras.my.id

# Atau
dig pengaduan-sarpras.my.id

# Should return your server IP
```

**Online tools:**

- https://www.whatsmydns.net (Cek propagasi global)
- https://dnschecker.org

#### Step 2: Test HTTP Access

```bash
curl -I http://pengaduan-sarpras.my.id

# Should redirect to HTTPS:
# HTTP/1.1 301 Moved Permanently
# Location: https://pengaduan-sarpras.my.id/
```

#### Step 3: Test HTTPS Access

```bash
curl -I https://pengaduan-sarpras.my.id

# Should return:
# HTTP/2 200
# server: cloudflare
```

#### Step 4: Test via Browser

1. Buka browser
2. Go to: `https://pengaduan-sarpras.my.id`
3. Should see your application! 🎉
4. Check SSL padlock di address bar (should be green/secure)

---

### Phase 7: Cloudflare Additional Settings (Optional)

#### 1. Speed Optimization

**Menu: Speed → Optimization**

Enable:

- ✅ Auto Minify (JavaScript, CSS, HTML)
- ✅ Brotli compression
- ✅ Early Hints
- ✅ Rocket Loader (might break some apps, test first)

#### 2. Caching Rules

**Menu: Caching → Configuration**

Settings:

- **Caching Level:** Standard
- **Browser Cache TTL:** Respect Existing Headers

**Cache Rules:**
Create rule untuk static assets:

```
If URI Path matches: .*\.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$
Then:
  - Cache Level: Cache Everything
  - Edge TTL: 1 month
  - Browser TTL: 1 day
```

#### 3. Security Settings

**Menu: Security → Settings**

Enable:

- ✅ Security Level: Medium
- ✅ Challenge Passage: 30 minutes
- ✅ Browser Integrity Check: ON

**Bot Fight Mode:**

- Enable untuk block bad bots

#### 4. Firewall Rules (WAF)

**Menu: Security → WAF**

Free plan includes:

- DDoS protection
- Basic rate limiting
- IP blocking

**Create custom rule (example):**

**Block non-Indonesia traffic (optional):**

```
Field: Country
Operator: does not equal
Value: ID
Action: Block
```

**Rate limit login endpoint:**

```
Field: URI Path
Operator: equals
Value: /api/auth/login
Rate: 5 requests per minute
Action: Challenge (CAPTCHA)
```

#### 5. Page Rules (Optional)

**Menu: Rules → Page Rules**

Free plan: 3 page rules

**Example rules:**

**Rule 1: Cache API responses**

```
If URL matches: *pengaduan-sarpras.my.id/api/lokasi*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 5 minutes
```

**Rule 2: Force HTTPS**

```
If URL matches: http://*pengaduan-sarpras.my.id/*
Settings:
  - Always Use HTTPS: ON
```

---

### Phase 8: Upgrade to Full (Strict) SSL (Recommended)

Untuk security terbaik, upgrade ke Full (Strict) mode:

#### Step 1: Generate Cloudflare Origin Certificate

1. Cloudflare Dashboard → **SSL/TLS** → **Origin Server**
2. Klik **"Create Certificate"**
3. Settings:
   - **Private key type:** RSA (2048)
   - **Hostnames:**
     - `pengaduan-sarpras.my.id`
     - `*.pengaduan-sarpras.my.id`
   - **Certificate Validity:** 15 years
4. Klik **"Create"**

#### Step 2: Save Certificates

Cloudflare akan show 2 text boxes:

**Origin Certificate** (Public Key):

```
-----BEGIN CERTIFICATE-----
MIIEpDCCA...
[LONG STRING]
...xyzABC=
-----END CERTIFICATE-----
```

**Private Key:**

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBA...
[LONG STRING]
...abcXYZ==
-----END PRIVATE KEY-----
```

**Copy kedua text tersebut!**

#### Step 3: Upload ke Server

```bash
# SSH ke server
ssh Clawwo@your-server-ip

# Buat directory SSL
cd ~/pengaduan-sarpras
mkdir -p nginx/ssl

# Create certificate file
nano nginx/ssl/cert.pem
# Paste Origin Certificate
# Save: Ctrl+O, Enter, Ctrl+X

# Create private key file
nano nginx/ssl/key.pem
# Paste Private Key
# Save: Ctrl+O, Enter, Ctrl+X

# Set proper permissions
chmod 600 nginx/ssl/*.pem
```

#### Step 4: Update Nginx Config

Edit `nginx/nginx.conf`:

```bash
nano nginx/nginx.conf
```

Uncomment HTTPS server block (sekitar line 100+):

```nginx
# Remove comment (#) dari baris-baris ini:
server {
    listen 443 ssl http2;
    server_name pengaduan-sarpras.my.id;  # Update dengan domain kamu

    # SSL Certificates
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # ... rest of config
}
```

Dan di HTTP server block (line ~40), uncomment redirect:

```nginx
server {
    listen 80;
    server_name _;

    # Uncomment baris ini:
    return 301 https://$host$request_uri;

    # Comment atau hapus location blocks lainnya
}
```

**Save:** `Ctrl+O`, Enter, `Ctrl+X`

#### Step 5: Restart Nginx

```bash
# Test nginx config
docker compose exec nginx nginx -t

# Should output:
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Restart nginx
docker compose restart nginx

# Verify
docker compose ps nginx
```

#### Step 6: Update Cloudflare SSL Mode

1. Cloudflare Dashboard → **SSL/TLS** → **Overview**
2. Change mode dari **"Flexible"** → **"Full (Strict)"**
3. Wait 1-2 minutes for propagation

#### Step 7: Test HTTPS

```bash
# Test redirect HTTP → HTTPS
curl -I http://pengaduan-sarpras.my.id
# Should return: 301 Moved Permanently

# Test HTTPS
curl -I https://pengaduan-sarpras.my.id
# Should return: 200 OK

# Check SSL certificate
openssl s_client -connect pengaduan-sarpras.my.id:443 -servername pengaduan-sarpras.my.id
```

Browser test:

- Buka `https://pengaduan-sarpras.my.id`
- Click padlock icon
- Check certificate (should be valid, issued by Cloudflare)

---

## 🎯 Quick Reference Commands

### Check DNS

```bash
nslookup your-domain.com
dig your-domain.com
```

### Check SSL

```bash
curl -I https://your-domain.com
openssl s_client -connect your-domain.com:443
```

### Check Application

```bash
curl https://your-domain.com/
curl https://your-domain.com/api/
curl https://your-domain.com/health
```

### Restart Services

```bash
docker compose restart
docker compose restart nginx
docker compose restart backend
```

### View Logs

```bash
docker compose logs -f nginx
docker compose logs -f backend
```

---

## ✅ Final Checklist

- [ ] Domain registered
- [ ] Nameservers updated to Cloudflare
- [ ] DNS records added (A records for @ and www)
- [ ] SSL/TLS configured (Flexible minimum)
- [ ] Always Use HTTPS enabled
- [ ] .env updated with domain
- [ ] Frontend rebuilt with new API URL
- [ ] All containers running
- [ ] HTTP redirects to HTTPS
- [ ] Website accessible via domain
- [ ] SSL padlock showing in browser
- [ ] API endpoints working
- [ ] Cloudflare proxy active (orange cloud)

---

## 🎨 Cloudflare Dashboard Overview

```
Dashboard → Your Domain
├── Analytics (Traffic stats)
├── DNS (A records, CNAME, etc)
├── SSL/TLS
│   ├── Overview (SSL mode)
│   ├── Edge Certificates (Always HTTPS)
│   └── Origin Server (Create certificate)
├── Security
│   ├── WAF (Firewall rules)
│   ├── Bots (Bot management)
│   └── Settings (Security level)
├── Speed
│   ├── Optimization (Minify, compress)
│   └── caching (Cache rules)
├── Caching
│   └── Configuration (Cache settings)
└── Rules
    ├── Page Rules (URL-based rules)
    └── Transform Rules (Headers, etc)
```

---

## 🆘 Troubleshooting

### Issue 1: Domain not resolving

**Symptoms:** Cannot access domain, DNS lookup fails

**Check:**

```bash
nslookup your-domain.com
# Should return Cloudflare IPs (104.x.x.x or 172.x.x.x)
```

**Solution:**

- Wait for DNS propagation (up to 24 hours)
- Check nameservers at registrar
- Verify DNS records in Cloudflare

### Issue 2: SSL certificate errors

**Symptoms:** "Your connection is not private" error

**Solution:**

- Check SSL mode in Cloudflare (use Flexible first)
- Verify Origin Certificate installed on server
- Check nginx config for SSL paths
- Restart nginx: `docker compose restart nginx`

### Issue 3: 502 Bad Gateway

**Symptoms:** Cloudflare shows 502 error

**Check:**

```bash
docker compose ps  # All services running?
docker compose logs backend  # Backend errors?
curl http://localhost:5000/  # Backend responding?
```

**Solution:**

- Ensure backend is running and healthy
- Check backend logs for errors
- Verify VITE_API_URL in .env
- Rebuild frontend if needed

### Issue 4: Mixed content warnings

**Symptoms:** Some resources load over HTTP

**Solution:**

- Enable "Automatic HTTPS Rewrites" in Cloudflare
- Check hardcoded HTTP URLs in code
- Ensure all API calls use HTTPS

### Issue 5: Too many redirects

**Symptoms:** Browser shows "ERR_TOO_MANY_REDIRECTS"

**Solution:**

- Check SSL mode in Cloudflare (should match server config)
- Remove duplicate redirect rules in nginx
- Clear browser cache

---

## 📊 Expected Results

### Before Cloudflare:

```
User → http://103.123.45.67 → Server
- No SSL
- Exposed IP
- No caching
- No DDoS protection
```

### After Cloudflare:

```
User → https://domain.com (Cloudflare) → Server
- ✅ SSL/TLS encryption
- ✅ Hidden server IP
- ✅ Global CDN caching
- ✅ DDoS protection
- ✅ Firewall & bot protection
- ✅ Performance optimization
```

---

## 🎓 For Your Report

**Screenshots to take:**

1. Cloudflare dashboard showing domain added
2. DNS records configuration
3. SSL/TLS settings (Full Strict mode)
4. Website accessible via HTTPS
5. SSL certificate details in browser
6. Cloudflare analytics (after some traffic)
7. Security settings enabled
8. Performance optimization features

**Architecture diagram:**

```
┌─────────┐      HTTPS        ┌────────────┐      HTTP/HTTPS     ┌────────┐
│  User   │ ─────────────────→│ Cloudflare │ ──────────────────→ │ Server │
│ Browser │                   │   (Proxy)  │                     │ Nginx  │
└─────────┘                   └────────────┘                     └────────┘
                                    │                                  │
                              [SSL/TLS]                          [Backend]
                              [Caching]                          [MySQL]
                              [Firewall]
                              [DDoS Protection]
```

---

**Created:** November 13, 2025  
**Status:** Ready for implementation  
**Estimated time:** 30-60 minutes

🚀 **Ready to connect your domain? Follow the steps above!**
