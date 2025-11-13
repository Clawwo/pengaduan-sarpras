# 📋 VPS Deployment Checklist

Print this and check off as you complete each step.

## Phase 1: VPS Initial Setup

- [ ] Connect to VPS via SSH
- [ ] Create non-root user (optional)
- [ ] Upload `setup-vps.sh` to VPS
- [ ] Run `sudo ./setup-vps.sh`
- [ ] Note down MySQL credentials
- [ ] Run `sudo mysql_secure_installation`

**Time estimate: 15 minutes**

---

## Phase 2: Application Configuration

- [ ] Navigate to `/var/www/pengaduan-sarpras`
- [ ] Copy `.env.production` to `server/.env`
- [ ] Update `DB_PASSWORD` in `server/.env`
- [ ] Generate and set `JWT_SECRET`
- [ ] Configure ImageKit credentials
- [ ] Update `clients/web/.env.production` with domain

**Time estimate: 5 minutes**

---

## Phase 3: Nginx Setup

- [ ] Copy `nginx.conf` to `/etc/nginx/sites-available/`
- [ ] Edit nginx config with actual domain
- [ ] Create symbolic link to sites-enabled
- [ ] Remove default site
- [ ] Test nginx config: `sudo nginx -t`
- [ ] Restart nginx: `sudo systemctl restart nginx`

**Time estimate: 5 minutes**

---

## Phase 4: Application Deployment

- [ ] Make deploy script executable: `chmod +x deploy.sh`
- [ ] Run deployment: `./deploy.sh`
- [ ] Check PM2 status: `pm2 status`
- [ ] Verify backend logs: `pm2 logs pengaduan-backend`
- [ ] Check frontend files in `/var/www/pengaduan-sarpras/frontend/`

**Time estimate: 10 minutes**

---

## Phase 5: SSL Certificate (Optional)

- [ ] Install Certbot
- [ ] Run certbot: `sudo certbot --nginx -d your-domain.com`
- [ ] Verify HTTPS works
- [ ] Test auto-renewal: `sudo certbot renew --dry-run`

**Time estimate: 5 minutes**

---

## Phase 6: Testing

### Frontend Tests:
- [ ] Visit `https://your-domain.com`
- [ ] Page loads without errors
- [ ] Can navigate to login page
- [ ] No console errors in browser

### Backend Tests:
- [ ] Visit `https://your-domain.com/api/health`
- [ ] Returns JSON response
- [ ] Test register new user
- [ ] Test login
- [ ] Test create pengaduan

### Database Tests:
- [ ] Connect to MySQL
- [ ] Verify tables exist
- [ ] Check stored procedures loaded

**Time estimate: 10 minutes**

---

## Phase 7: Monitoring Setup

- [ ] PM2 logs accessible: `pm2 logs`
- [ ] Nginx logs accessible: `sudo tail -f /var/log/nginx/pengaduan-access.log`
- [ ] PM2 auto-restart configured: `pm2 save`
- [ ] Setup database backup script
- [ ] Test deploy script works: `./deploy.sh`

**Time estimate: 5 minutes**

---

## Phase 8: Security Hardening

- [ ] UFW firewall enabled
- [ ] Only necessary ports open (22, 80, 443)
- [ ] MySQL only accessible from localhost
- [ ] `.env` file has proper permissions (600)
- [ ] Non-root user for PM2 (if applicable)

**Time estimate: 5 minutes**

---

## Total Time Estimate: 60 minutes

---

## ✅ Deployment Complete!

**Application URLs:**
- Frontend: https://your-domain.com
- Backend API: https://your-domain.com/api
- Health Check: https://your-domain.com/api/health

**Credentials to Save:**
- MySQL User: ________________
- MySQL Password: ________________
- JWT Secret: ________________
- Domain: ________________

**Useful Commands:**
```bash
# View logs
pm2 logs pengaduan-backend

# Restart app
pm2 restart pengaduan-backend

# Check status
pm2 status

# Deploy updates
cd /var/www/pengaduan-sarpras && ./deploy.sh

# Check nginx
sudo systemctl status nginx

# Check database
mysql -u pengaduan_user -p pengaduan_sarpras
```

---

## 🆘 Emergency Contacts

- VPS Provider Support: ________________
- Domain Provider Support: ________________
- Developer: ________________

---

**Deployment Date:** ________________  
**Deployed By:** ________________  
**VPS IP:** ________________  
**Domain:** ________________
