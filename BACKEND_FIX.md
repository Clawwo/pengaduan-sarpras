# 🔧 Backend Unhealthy Fix

## ❌ Problem

```
Container pengaduan-backend is unhealthy
dependency failed to start: container pengaduan-backend is unhealthy
```

## 🔍 Root Cause

Healthcheck di docker-compose.yml dan Dockerfile mencoba curl ke `http://localhost:5000/` tapi route ini tidak ada di server.js.

Server.js hanya punya:

- ✅ `/api/health`
- ✅ `/api`
- ❌ `/` (tidak ada)

## ✅ Fix Applied

### 1. docker-compose.yml

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"] # ✅ Fixed
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s # ✅ Added grace period
```

### 2. server/Dockerfile

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1  # ✅ Fixed
```

## 🚀 Cara Fix di Server

### Opsi 1: Quick Fix (Manual)

```bash
cd ~/pengaduan-sarpras

# Rebuild backend
docker compose build --no-cache backend

# Restart
docker compose up -d

# Wait & check
sleep 30
docker compose ps
```

### Opsi 2: Automated Script

```bash
chmod +x fix-backend.sh
./fix-backend.sh
```

Script akan:

- ✅ Check logs & database connection
- ✅ Rebuild backend
- ✅ Test health endpoints
- ✅ Monitor health status

## 🔍 Troubleshooting

### Check logs:

```bash
docker compose logs backend --tail=50
```

### Test manually:

```bash
# From host
curl http://localhost:5000/api/health

# From inside container
docker compose exec backend curl http://localhost:5000/api/health
```

### Check database connection:

```bash
docker compose exec backend node -e "console.log('Node OK')"
docker compose exec mysql mysqladmin ping -h localhost --silent
```

### Nuclear option:

```bash
docker compose down
docker compose up -d
```

## ✅ Expected Result

```
✅ pengaduan-mysql: Up (healthy)
✅ pengaduan-backend: Up (healthy)  # Should be healthy now
✅ pengaduan-frontend: Exited (0)
✅ pengaduan-nginx: Up (healthy)
```
