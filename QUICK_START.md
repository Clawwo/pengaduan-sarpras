# 🚀 Quick Start Deployment

## Persiapan di Local

1. **Edit Environment Variables**

   ```bash
   cp .env.production .env
   nano .env
   ```

   Update values:

   - `DB_PASSWORD` - Password database (min 12 karakter)
   - `JWT_SECRET` - Secret key untuk JWT (min 32 karakter)
   - `IMAGEKIT_*` - Credentials dari ImageKit.io
   - `VITE_API_URL` - Domain/IP server kamu

2. **Generate Strong Passwords**

   ```bash
   # Linux/Mac:
   openssl rand -base64 32

   # Windows PowerShell:
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   ```

## Upload ke Server

### Option 1: Via Git (Recommended)

```bash
# Push ke GitHub
git add .
git commit -m "Add Docker configuration"
git push origin main

# Di server:
ssh deploy@your-server-ip
git clone https://github.com/your-username/pengaduan-sarpras.git
cd pengaduan-sarpras
```

### Option 2: Via SCP

```bash
# Di local (Windows PowerShell):
scp -r pengaduan-sarpras deploy@your-server-ip:~/
```

## Deployment di Server

```bash
# 1. Masuk ke server
ssh deploy@your-server-ip

# 2. Masuk ke directory project
cd ~/pengaduan-sarpras

# 3. Setup environment
cp .env.production .env
nano .env  # Edit sesuai kebutuhan

# 4. Make scripts executable
chmod +x deploy.sh backup.sh restore.sh

# 5. Deploy!
./deploy.sh
```

## Test Deployment

```bash
# Check services
docker compose ps

# Test frontend
curl http://your-server-ip/

# Test backend
curl http://your-server-ip/api/

# View logs
docker compose logs -f
```

## Maintenance Commands

```bash
# View logs
docker compose logs -f backend
docker compose logs -f mysql

# Restart service
docker compose restart backend

# Stop all
docker compose down

# Start all
docker compose up -d

# Backup database
./backup.sh

# Restore database
./restore.sh backups/backup_20241112_143000.sql.gz

# Update & redeploy
./deploy.sh
```

## Troubleshooting

### Container won't start

```bash
docker compose logs <service-name>
docker compose restart <service-name>
```

### Port already in use

```bash
sudo netstat -tulpn | grep :80
sudo kill -9 <PID>
```

### Out of disk space

```bash
df -h
docker system prune -af --volumes
```

### Database connection failed

```bash
docker exec -it pengaduan-mysql mysql -u root -p
# Enter DB_ROOT_PASSWORD
```

## Access URLs

- **Frontend:** http://your-server-ip
- **Backend API:** http://your-server-ip/api
- **Health Check:** http://your-server-ip/health

## Security Checklist

- [ ] Changed all default passwords
- [ ] Generated strong JWT_SECRET
- [ ] Configured firewall (UFW)
- [ ] SSL certificate installed (Cloudflare)
- [ ] Backups scheduled (cron)
- [ ] Monitoring enabled

## Support

Lihat `DEPLOYMENT_GUIDE.md` untuk dokumentasi lengkap.
