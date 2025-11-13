# 🔧 Fix Frontend Tidak Muncul (Nginx Default Page)

## ❌ Problem

Saat akses domain/IP, yang muncul adalah **nginx default page** bukan aplikasi React frontend.

```
Welcome to nginx!
If you see this page, the nginx web server is successfully installed...
```

## 🔍 Root Cause

**Volume mounting issue** - Frontend dist files tidak ter-copy dengan benar ke nginx container.

### Masalah di docker-compose.yml sebelumnya:

```yaml
frontend:
  volumes:
    - frontend_dist:/app/dist # ❌ SALAH - path tidak match
```

Frontend Dockerfile build ke `/usr/share/nginx/html` tapi volume mount ke `/app/dist`.

## ✅ Solution

### 1. Perbaikan docker-compose.yml

**Frontend service** - Changed to "build only" container:

```yaml
frontend:
  build:
    context: ./clients/web
    dockerfile: Dockerfile
    args:
      VITE_API_URL: ${VITE_API_URL}
  container_name: pengaduan-frontend
  restart: "no" # ✅ Exit after copy
  depends_on:
    - backend
  volumes:
    - frontend_dist:/tmp/dist # ✅ Shared volume
  networks:
    - pengaduan-network
  command: sh -c "cp -r /usr/share/nginx/html/* /tmp/dist/ && echo 'Frontend files copied' && exit 0"
```

**Nginx service** - Wait for frontend to complete:

```yaml
nginx:
  depends_on:
    backend:
      condition: service_healthy
    frontend:
      condition: service_completed_successfully # ✅ Wait for copy
  volumes:
    - frontend_dist:/usr/share/nginx/html:ro # ✅ Read shared volume
```

### 2. Cara Build Flow Baru

```
┌─────────────────┐
│ Frontend Build  │
│  (Node Alpine)  │
│   npm run build │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Copy to       │
│  Shared Volume  │
│ (/tmp/dist)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Nginx Reads    │
│  from Volume    │
│ (/usr/share/...) │
└─────────────────┘
```

## 🚀 Cara Fix (Manual)

### Step 1: Stop semua container

```bash
cd ~/pengaduan-sarpras
docker compose down
```

### Step 2: Remove volume lama

```bash
docker volume rm pengaduan-sarpras_frontend_dist
```

### Step 3: Rebuild frontend (no cache)

```bash
docker compose build --no-cache frontend
```

### Step 4: Start semua services

```bash
docker compose up -d
```

### Step 5: Tunggu 15 detik

```bash
sleep 15
```

### Step 6: Check status

```bash
docker compose ps
```

Expected:

```
pengaduan-frontend    Exited (0)       # ✅ Normal - sudah copy files
pengaduan-nginx       Up (healthy)     # ✅ Running
pengaduan-backend     Up (healthy)     # ✅ Running
pengaduan-mysql       Up (healthy)     # ✅ Running
```

### Step 7: Verify frontend files

```bash
# Check volume content
docker run --rm -v pengaduan-sarpras_frontend_dist:/tmp alpine ls -lah /tmp

# Check nginx html directory
docker compose exec nginx ls -lah /usr/share/nginx/html
```

Expected output:

```
-rw-r--r-- index.html
drwxr-xr-x assets/
-rw-r--r-- favicon.ico
-rw-r--r-- vite.svg
```

### Step 8: Test di browser

```bash
# Local test
curl http://localhost/

# Atau test dengan server IP
curl http://your-server-ip/
```

Expected: HTML content, bukan "Welcome to nginx!"

## 🤖 Cara Fix (Automated)

Gunakan script otomatis:

```bash
cd ~/pengaduan-sarpras
chmod +x fix-frontend.sh
./fix-frontend.sh
```

Script akan:

- ✅ Stop containers
- ✅ Remove old volume
- ✅ Rebuild frontend (no cache)
- ✅ Start services
- ✅ Verify files copied
- ✅ Test endpoints
- ✅ Show logs

## 🔍 Troubleshooting

### Issue 1: Frontend container tidak exit

**Check logs:**

```bash
docker compose logs frontend
```

**Expected:**

```
Frontend files copied
```

**Fix:**

```bash
docker compose restart frontend
```

### Issue 2: Nginx masih show default page

**Check nginx html directory:**

```bash
docker compose exec nginx ls -lah /usr/share/nginx/html
```

**If empty or only health file:**

```bash
# Force rebuild
docker compose down
docker volume rm pengaduan-sarpras_frontend_dist
docker compose build --no-cache frontend
docker compose up -d
```

### Issue 3: Permission denied

**Check volume permissions:**

```bash
docker volume inspect pengaduan-sarpras_frontend_dist
```

**Fix:**

```bash
docker compose down
docker volume rm pengaduan-sarpras_frontend_dist
sudo docker compose up -d
```

### Issue 4: Build error (npm)

**Check .dockerignore:**

```bash
cat clients/web/.dockerignore
```

**Should NOT exclude:**

- ❌ src/
- ❌ public/
- ❌ vite.config.js
- ❌ index.html

**Should exclude:**

- ✅ node_modules/
- ✅ dist/
- ✅ build/
- ✅ .env\*

### Issue 5: Blank page (no errors)

**Check browser console:**

```
Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html"
```

**Cause:** VITE_API_URL not set during build

**Fix:**

```bash
# Check .env
cat .env | grep VITE_API_URL

# Should be:
VITE_API_URL=http://your-server-ip:5000
# or
VITE_API_URL=https://api.yourdomain.com

# Rebuild
docker compose build --no-cache frontend
docker compose up -d
```

## ✅ Verification Checklist

- [ ] `docker compose ps` - frontend Exited (0), nginx Up (healthy)
- [ ] `docker compose exec nginx ls /usr/share/nginx/html` - Shows index.html, assets/
- [ ] `curl http://localhost/` - Returns HTML (not nginx default page)
- [ ] Browser test - Shows React app (not nginx page)
- [ ] Browser console - No 404 errors for assets
- [ ] Login page loads correctly
- [ ] Images and CSS load correctly

## 📝 Summary

**Before:**

- ❌ Frontend dist not copied to nginx
- ❌ Nginx serves default page
- ❌ Volume mounting mismatch

**After:**

- ✅ Frontend builds and copies to shared volume
- ✅ Nginx serves React app from volume
- ✅ Proper dependency chain (frontend → nginx)
- ✅ Frontend container exits after copy (no wasted resources)

## 🎯 Key Changes

1. **Frontend service:**

   - Changed from long-running to "run-once" container
   - Copies dist files to shared volume
   - Exits with code 0 after copy

2. **Nginx service:**

   - Depends on frontend completion
   - Reads from shared volume
   - No longer depends on frontend health (can't be healthy if exited)

3. **Volume:**
   - Single source of truth for frontend files
   - Shared between frontend (write) and nginx (read)

## 📚 References

- [Docker Compose Depends On](https://docs.docker.com/compose/compose-file/05-services/#depends_on)
- [Docker Volumes](https://docs.docker.com/storage/volumes/)
- [Nginx Serving Static Content](https://nginx.org/en/docs/beginners_guide.html#static)
