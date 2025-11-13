# 🔧 MySQL Container Unhealthy - Quick Fix

## 🐛 Problem
```
Container pengaduan-mysql is unhealthy
dependency failed to start: container pengaduan-mysql is unhealthy
```

## 🔍 Root Causes

1. **Healthcheck timeout** - MySQL butuh waktu lama untuk initialize (60-90 detik pertama kali)
2. **Init scripts besar** - `stored_procedures.sql` dan `add_columns.sql` butuh waktu eksekusi
3. **Deprecated warning** - `version: "3.8"` sudah tidak diperlukan di Docker Compose V2

## ✅ Solutions Applied

### 1. Fixed `docker-compose.yml`

#### Removed deprecated version:
```diff
- version: "3.8"
- 
  services:
```

#### Improved MySQL healthcheck:
```diff
  healthcheck:
-   test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${DB_ROOT_PASSWORD}"]
-   interval: 10s
-   timeout: 5s
-   retries: 5
+   test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "--silent"]
+   interval: 15s
+   timeout: 10s
+   retries: 10
+   start_period: 60s
```

**Changes:**
- ✅ Removed password dari healthcheck (tidak perlu, lebih aman)
- ✅ Increased `interval` 10s → 15s
- ✅ Increased `timeout` 5s → 10s
- ✅ Increased `retries` 5 → 10
- ✅ Added `start_period: 60s` - memberi waktu MySQL untuk initialize sebelum healthcheck dimulai

### 2. Created `fix-mysql.sh` script

Automated troubleshooting script untuk:
- Stop semua containers
- Optional: Remove MySQL volume (fresh start)
- Verify .env configuration
- Start MySQL first, wait untuk healthy
- Test connection
- Start remaining services

## 🚀 Quick Fix di Server

### Method 1: Automated Script (Recommended)

```bash
# Make executable
chmod +x fix-mysql.sh

# Run fix script
./fix-mysql.sh

# Follow prompts:
# - Choose 'y' jika mau fresh database (akan hapus data lama)
# - Choose 'n' jika mau keep existing data
```

### Method 2: Manual Steps

```bash
# 1. Stop all containers
docker compose down

# 2. Optional: Remove volume untuk fresh start
docker volume rm pengaduan-sarpras_mysql_data

# 3. Start MySQL only
docker compose up -d mysql

# 4. Wait dan monitor (60-90 detik)
watch -n 2 'docker compose ps mysql'
# Tunggu sampai status: healthy

# 5. Check logs jika ada masalah
docker compose logs -f mysql

# 6. Setelah healthy, start semua
docker compose up -d

# 7. Verify all services
docker compose ps
```

### Method 3: Quick Restart

```bash
# Jika ini bukan first run, cukup restart
docker compose restart mysql

# Wait for healthy
sleep 60

# Check status
docker compose ps
```

## 🔍 Verify MySQL is Working

```bash
# 1. Check container status
docker compose ps mysql
# Should show: Up (healthy)

# 2. Check logs
docker compose logs mysql | tail -20
# Should see: "ready for connections"

# 3. Test MySQL connection
docker compose exec mysql mysql -u root -p${DB_ROOT_PASSWORD} -e "SHOW DATABASES;"

# 4. Verify database exists
docker compose exec mysql mysql -u root -p${DB_ROOT_PASSWORD} -e "USE db_pengaduan_sarpras; SHOW TABLES;"

# 5. Test backend connection
curl http://localhost:5000/
# Should return response (bukan connection error)
```

## 📊 Understanding MySQL Initialization Time

### First Run (Fresh Database):
```
0-20s:   Creating data directory, system tables
20-40s:  Running init scripts (stored_procedures.sql)
40-60s:  Running init scripts (add_columns.sql)
60-80s:  Finalizing, starting MySQL server
80s+:    Ready for connections ✅
```

### Subsequent Runs:
```
0-10s:   Loading existing data
10-15s:  Starting MySQL server
15s+:    Ready for connections ✅
```

## ⚠️ Common Issues & Solutions

### Issue 1: "unhealthy" after 60 seconds

**Possible causes:**
- Init scripts terlalu besar
- Server resource terbatas (RAM)
- Disk I/O slow

**Solution:**
```bash
# Check init script size
ls -lh server/database/*.sql

# If very large (>10MB), consider splitting or optimizing

# Check container resources
docker stats pengaduan-mysql

# Increase healthcheck timeout
# Edit docker-compose.yml:
healthcheck:
  start_period: 120s  # Increase to 120 seconds
  retries: 15
```

### Issue 2: Password authentication failed

**Symptoms:**
```
Access denied for user 'root'@'localhost'
```

**Solution:**
```bash
# Check .env file
cat .env | grep DB_

# Ensure no special characters or spaces
# DB_ROOT_PASSWORD should not have: $ ` " ' \ space

# If password has special chars, escape properly:
DB_ROOT_PASSWORD='MyPass$123'  # Single quotes!
```

### Issue 3: Init scripts not running

**Symptoms:**
- Database created but empty
- No tables or stored procedures

**Solution:**
```bash
# Verify files exist
ls -la server/database/

# Check file permissions
chmod 644 server/database/*.sql

# Remove volume and restart fresh
docker compose down
docker volume rm pengaduan-sarpras_mysql_data
docker compose up -d mysql

# Monitor logs
docker compose logs -f mysql
```

### Issue 4: Port 3306 already in use

**Symptoms:**
```
Error starting userland proxy: listen tcp 0.0.0.0:3306: bind: address already in use
```

**Solution:**
```bash
# Check what's using port 3306
sudo netstat -tulpn | grep 3306

# Option 1: Stop local MySQL
sudo systemctl stop mysql

# Option 2: Change port in docker-compose.yml
ports:
  - "3307:3306"  # Use different host port
```

## 📝 Best Practices

### 1. Environment Variables
```bash
# Use strong passwords without special chars for Docker
DB_ROOT_PASSWORD=MySecurePassword123
DB_PASSWORD=AnotherSecurePass456

# Avoid: $, `, ", ', \, spaces
```

### 2. Database Initialization
```bash
# Keep init scripts optimized
# Split large files if > 10MB
# Use indexes in CREATE TABLE statements
# Avoid heavy data inserts in init scripts
```

### 3. Monitoring
```bash
# Always check logs after startup
docker compose logs -f mysql

# Monitor resources
docker stats

# Regular health checks
docker compose ps
```

### 4. Backup Before Fresh Start
```bash
# Before removing volume
./backup.sh

# Or manual backup
docker compose exec mysql mysqldump -u root -p${DB_ROOT_PASSWORD} ${DB_NAME} > backup.sql
```

## 🎯 Summary

| Change | Before | After | Impact |
|--------|--------|-------|--------|
| Docker Compose version | `version: "3.8"` | Removed | No warning |
| Healthcheck start_period | None | 60s | MySQL has time to init |
| Healthcheck interval | 10s | 15s | Less aggressive |
| Healthcheck timeout | 5s | 10s | More time to respond |
| Healthcheck retries | 5 | 10 | More attempts |
| Password in healthcheck | Yes | No | More secure |

## 🚀 Next Steps

1. **Apply fixes:**
   ```bash
   git pull origin main  # Get latest docker-compose.yml
   chmod +x fix-mysql.sh
   ./fix-mysql.sh
   ```

2. **Verify deployment:**
   ```bash
   docker compose ps
   docker compose logs -f
   ```

3. **Test application:**
   ```bash
   curl http://localhost:5000/  # Backend
   curl http://localhost/        # Frontend
   ```

4. **Monitor for 5 minutes:**
   ```bash
   watch -n 5 'docker compose ps'
   ```

---

**Status:** ✅ Fixed  
**Last Updated:** November 13, 2025  
**Files Modified:**
- `docker-compose.yml` - Healthcheck optimized
- `fix-mysql.sh` - Automated fix script created
