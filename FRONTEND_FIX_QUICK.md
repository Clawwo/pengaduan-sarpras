# 🚀 Quick Fix: Frontend Tidak Muncul

## Problem

Nginx default page muncul, bukan aplikasi React.

## Solusi Cepat

```bash
cd ~/pengaduan-sarpras

# 1. Stop dan clean
docker compose down
docker volume rm pengaduan-sarpras_frontend_dist

# 2. Rebuild frontend
docker compose build --no-cache frontend

# 3. Start semua
docker compose up -d

# 4. Tunggu 15 detik
sleep 15

# 5. Check
docker compose ps
docker compose exec nginx ls -lah /usr/share/nginx/html

# 6. Test
curl http://localhost/
```

## Atau Gunakan Script

```bash
chmod +x fix-frontend.sh
./fix-frontend.sh
```

## Expected Result

```
✅ pengaduan-frontend: Exited (0)
✅ pengaduan-nginx: Up (healthy)
✅ Browser: Tampil aplikasi React
```

## Jika Masih Gagal

```bash
# Check logs
docker compose logs frontend
docker compose logs nginx

# Force restart
docker compose restart nginx

# Ultimate fix
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

Dokumentasi lengkap: **FRONTEND_FIX.md**
