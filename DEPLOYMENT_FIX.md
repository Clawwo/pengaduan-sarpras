# 🚀 DEPLOYMENT FIX - Complete Guide

## 📋 Issues Fixed

### 1. ❌ Backend Unhealthy

**Problem:** `container pengaduan-backend is unhealthy`

**Root Cause:** Healthcheck mencoba curl ke `/` tapi route tidak ada

**Fix:** Changed healthcheck URL to `/api/health` in:

- ✅ `docker-compose.yml` line 59
- ✅ `server/Dockerfile` line 40

### 2. ❌ Frontend Not Displaying

**Problem:** Nginx default page muncul, bukan React app

**Root Cause:** Volume mounting mismatch

**Fix:** Changed frontend to "build-only" container in:

- ✅ `docker-compose.yml` lines 64-77

## 🎯 Files Updated

### Modified Files:

1. **docker-compose.yml**

   - Backend healthcheck: `http://localhost:5000/` → `http://localhost:5000/api/health`
   - Added `start_period: 40s` to backend healthcheck
   - Frontend: Changed to run-once container with volume copy
   - Nginx: Wait for `frontend:service_completed_successfully`

2. **server/Dockerfile**
   - Healthcheck URL: `http://localhost:5000/` → `http://localhost:5000/api/health`

### New Files:

1. **fix-backend.sh** - Fix backend unhealthy issue
2. **fix-frontend.sh** - Fix frontend display issue
3. **fix-all.sh** - All-in-one fix script
4. **BACKEND_FIX.md** - Backend troubleshooting guide
5. **FRONTEND_FIX.md** - Frontend troubleshooting guide (already exists)

## 🚀 Quick Fix (Recommended)

Upload updated files to server, then run:

```bash
cd ~/pengaduan-sarpras

# Make scripts executable
chmod +x fix-all.sh fix-backend.sh fix-frontend.sh

# Run all-in-one fix
./fix-all.sh
```

This will:

- ✅ Stop containers
- ✅ Clean volumes (optional)
- ✅ Rebuild all images
- ✅ Start services
- ✅ Monitor health status
- ✅ Test all endpoints
- ✅ Show summary

**Time:** ~10-15 minutes total

## 🔧 Specific Fixes

### Fix Backend Only:

```bash
chmod +x fix-backend.sh
./fix-backend.sh
```

### Fix Frontend Only:

```bash
chmod +x fix-frontend.sh
./fix-frontend.sh
```

## 📝 Manual Fix Steps

### Step 1: Upload Files

Upload these updated files to server:

- `docker-compose.yml` ⭐ CRITICAL
- `server/Dockerfile` ⭐ CRITICAL
- `fix-all.sh`
- `fix-backend.sh`
- `fix-frontend.sh`
- `BACKEND_FIX.md`

### Step 2: Stop & Clean

```bash
cd ~/pengaduan-sarpras
docker compose down
docker volume rm pengaduan-sarpras_frontend_dist
```

### Step 3: Rebuild

```bash
docker compose build --no-cache backend
docker compose build --no-cache frontend
```

### Step 4: Start

```bash
docker compose up -d
```

### Step 5: Monitor (2 minutes)

```bash
watch -n 5 docker compose ps
```

Expected:

```
pengaduan-mysql       Up (healthy)
pengaduan-backend     Up (healthy)     ✅ Should be healthy now
pengaduan-frontend    Exited (0)       ✅ Normal
pengaduan-nginx       Up (healthy)
```

### Step 6: Verify

```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend HTML
curl http://localhost/ | head -20

# Should see: <!DOCTYPE html>...
```

## ✅ Verification Checklist

- [ ] All containers running (frontend can be exited)
- [ ] Backend status: healthy
- [ ] MySQL status: healthy
- [ ] Nginx status: healthy
- [ ] `curl http://localhost:5000/api/health` returns JSON
- [ ] `curl http://localhost/` returns HTML (not nginx page)
- [ ] Browser shows React app
- [ ] No errors in logs

## 🔍 Troubleshooting

### Backend Still Unhealthy?

**Check logs:**

```bash
docker compose logs backend --tail=50
```

**Common issues:**

- Database connection failed → Check .env credentials
- Port already in use → `sudo lsof -i :5000`
- Module not found → Rebuild with `--no-cache`

**Fix:**

```bash
./fix-backend.sh
```

### Frontend Still Shows Nginx Page?

**Check files:**

```bash
docker compose exec nginx ls -lah /usr/share/nginx/html
```

**Should see:** index.html, assets/, favicon.ico

**If empty:**

```bash
./fix-frontend.sh
```

### All Services Unhealthy?

**Nuclear option:**

```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

## 📊 Expected Results

### Container Status:

```
NAME                STATUS
pengaduan-mysql     Up 2 minutes (healthy)
pengaduan-backend   Up 1 minute (healthy)      ✅ Fixed
pengaduan-frontend  Exited (0) 1 minute ago    ✅ Normal
pengaduan-nginx     Up 1 minute (healthy)
```

### Health Endpoints:

```bash
# Backend
$ curl http://localhost:5000/api/health
{"status":"healthy","uptime":45,"timestamp":"..."}

# Backend API
$ curl http://localhost:5000/api
{"status":"ok","message":"Sarpras API is running","timestamp":"..."}

# Nginx health
$ curl http://localhost/health
Frontend OK
```

### Frontend:

```bash
$ curl http://localhost/ | head -5
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
```

## 🎯 Next Steps

After deployment is successful:

### 1. Setup Domain (if not yet)

- Buy domain (.my.id recommended)
- Add to Cloudflare
- Update nameservers

### 2. Configure Subdomains

```bash
./setup-subdomain.sh your-domain.com
```

This will:

- Update nginx.conf with your domain
- Update .env with API URL
- Rebuild frontend
- Test endpoints

### 3. Setup SSL

- Generate Cloudflare Origin Certificate
- Upload to `nginx/ssl/`
- Uncomment HTTPS blocks in nginx.conf
- Change Cloudflare SSL to "Full (Strict)"

### 4. Test Production

- Test all endpoints with domain
- Test login/register
- Test create pengaduan
- Test image upload
- Test notifications

## 📚 Documentation Reference

- **BACKEND_FIX.md** - Backend troubleshooting
- **FRONTEND_FIX.md** - Frontend troubleshooting
- **FRONTEND_FIX_QUICK.md** - Quick frontend fix
- **SUBDOMAIN_SETUP.md** - Subdomain configuration
- **CLOUDFLARE_SETUP.md** - Cloudflare setup guide

## 🆘 Need Help?

If issues persist after all fixes:

1. Check all logs:

```bash
docker compose logs
```

2. Check .env file:

```bash
cat .env | grep -v "PASSWORD\|SECRET\|KEY"
```

3. Check network:

```bash
docker network inspect pengaduan-sarpras_pengaduan-network
```

4. Full system info:

```bash
docker compose ps
docker compose exec backend node -v
docker compose exec mysql mysql --version
docker compose exec nginx nginx -v
```

5. Contact with logs and error messages

---

## 🎉 Success Criteria

✅ All containers healthy (except frontend - should be exited)
✅ Backend responds at port 5000
✅ Frontend shows React app (not nginx page)
✅ No errors in logs
✅ Can access all API endpoints
✅ Ready for subdomain setup

---

**Estimated fix time:** 10-15 minutes
**Complexity:** Medium
**Risk:** Low (volumes can be backed up first)
