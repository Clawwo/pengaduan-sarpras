# 🏫 Sistem Pengaduan Sarana Prasarana

Aplikasi web dan mobile untuk mengelola pengaduan sarana dan prasarana sekolah/institusi.

> **🚀 Quick Deploy:** Lihat [FRESH_START_GUIDE.md](./FRESH_START_GUIDE.md) untuk panduan lengkap setup VPS dari nol!

## 📋 Features

- ✅ **User Management** - Registrasi, login, profile management
- ✅ **Pengaduan System** - Create, read, update, delete pengaduan
- ✅ **Image Upload** - Upload foto kerusakan via ImageKit
- ✅ **Role-based Access** - Admin, Petugas, User
- ✅ **Real-time Notifications** - Push notifications via Firebase
- ✅ **Location Management** - Kelola lokasi dan kategori
- ✅ **Riwayat Aksi** - Track semua perubahan status
- ✅ **Mobile App** - React Native (Expo) untuk Android/iOS
- ✅ **Web Dashboard** - React + Vite untuk admin panel

## 🚀 Tech Stack

### Backend

- Node.js 20+ with Express
- MySQL 8.2+ dengan stored procedures
- JWT Authentication
- ImageKit.io untuk image storage
- Firebase Admin untuk push notifications

### Frontend Web

- React 19.1
- Vite 7.1
- TailwindCSS 4
- Radix UI components
- React Router v7
- Axios untuk API calls

### Mobile App

- React Native (Expo)
- Expo Router untuk navigasi
- Firebase Cloud Messaging

## 📁 Project Structure

```
pengaduan-sarpras/
├── server/                 # Backend Node.js
│   ├── config/            # Database & ImageKit config
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth, validation, rate limit
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── database/         # SQL schema & stored procedures
│   └── server.js         # Main entry point
├── clients/
│   ├── web/              # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── contexts/
│   │   │   └── hooks/
│   │   └── package.json
│   └── mobile/           # React Native app
│       ├── app/
│       ├── src/
│       └── package.json
├── ecosystem.config.js    # PM2 configuration
├── nginx.conf            # Nginx reverse proxy config
├── setup-vps.sh          # VPS setup script
├── deploy.sh             # Deployment script
└── DEPLOYMENT_GUIDE.md   # Full deployment guide
```

## 🔧 Development Setup

### Prerequisites

- Node.js 20+
- MySQL 8.2+
- npm or yarn

### 1. Clone Repository

```bash
git clone https://github.com/Clawwo/pengaduan-sarpras.git
cd pengaduan-sarpras
```

### 2. Setup Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE pengaduan_sarpras CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Import schema
mysql -u root -p pengaduan_sarpras < server/database/stored_procedures.sql
mysql -u root -p pengaduan_sarpras < server/database/add_columns.sql
```

### 3. Setup Backend

```bash
cd server
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

### 4. Setup Frontend Web

```bash
cd clients/web
npm install

# Create .env.local
echo "VITE_API_URL=http://localhost:5000" > .env.local

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 5. Setup Mobile App (Optional)

```bash
cd clients/mobile
npm install

# Start Expo
npx expo start
```

Scan QR code with Expo Go app on your phone.

## 🚀 Production Deployment (VPS)

### Quick Deploy (Ubuntu 22.04+)

```bash
# On VPS
cd /var/www
sudo git clone https://github.com/Clawwo/pengaduan-sarpras.git
cd pengaduan-sarpras

# Run setup script
sudo chmod +x setup-vps.sh
sudo ./setup-vps.sh

# Configure application
cp .env.production server/.env
nano server/.env  # Update credentials

# Setup Nginx
sudo cp nginx.conf /etc/nginx/sites-available/pengaduan-sarpras
sudo nano /etc/nginx/sites-available/pengaduan-sarpras  # Update domain
sudo ln -s /etc/nginx/sites-available/pengaduan-sarpras /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# Deploy application
chmod +x deploy.sh
./deploy.sh
```

**See full guide:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)  
**Quick reference:** [QUICK_DEPLOY.md](QUICK_DEPLOY.md)  
**Checklist:** [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

## 📚 API Documentation

### Authentication

```
POST /api/auth/register    # Register new user
POST /api/auth/login       # Login user
GET  /api/auth/me          # Get current user
```

### Pengaduan

```
GET    /api/pengaduan             # Get all pengaduan
GET    /api/pengaduan/:id         # Get pengaduan by ID
POST   /api/pengaduan             # Create pengaduan
PUT    /api/pengaduan/:id         # Update pengaduan
DELETE /api/pengaduan/:id         # Delete pengaduan
PATCH  /api/pengaduan/:id/status  # Update status
```

### Locations

```
GET  /api/lokasi        # Get all locations
POST /api/lokasi        # Create location
PUT  /api/lokasi/:id    # Update location
```

### Admin/Petugas Management

```
GET    /api/petugas           # Get all petugas
POST   /api/petugas           # Create petugas
PUT    /api/petugas/:id       # Update petugas
DELETE /api/petugas/:id       # Delete petugas
```

## 🔐 Environment Variables

### Backend (.env)

```env
NODE_ENV=production
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pengaduan_sarpras
DB_USER=pengaduan_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

### Frontend (.env.production)

```env
VITE_API_URL=https://your-domain.com
```

## 🚀 Production Deployment

### Fresh VPS Setup (Ubuntu 22.04)

```bash
# 1. Run automated setup script
wget https://raw.githubusercontent.com/YOUR_REPO/pengaduan-sarpras/main/fresh-setup-vps.sh
chmod +x fresh-setup-vps.sh
sudo ./fresh-setup-vps.sh

# 2. Follow the complete guide
# See FRESH_START_GUIDE.md for detailed step-by-step instructions
```

### Quick Deploy Command Reference

See [QUICK_COMMANDS.md](./QUICK_COMMANDS.md) for:

- Daily commands (status, logs, restart)
- Debugging guides
- Database backup/restore
- SSL certificate management
- Emergency recovery procedures

## 🛠️ Useful Commands

### Development

```bash
# Backend
cd server
npm run dev          # Start with nodemon

# Frontend
cd clients/web
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Production

```bash
# Status checks
pm2 status                    # Check PM2 processes
sudo systemctl status nginx   # Check Nginx
sudo systemctl status mysql   # Check MySQL

# View logs
pm2 logs pengaduan-backend --lines 50
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart pengaduan-backend
sudo systemctl restart nginx

# Database backup
mysqldump -u clawwo -p pengaduan_sarpras > backup-$(date +%Y%m%d).sql
```

## 🐛 Troubleshooting

### Backend 500 Error

```bash
# Check logs first
pm2 logs pengaduan-backend --lines 100

# Common issues:
# 1. Database not imported
mysql -u clawwo -p pengaduan_sarpras -e "SHOW TABLES;"

# 2. Wrong environment variables
cat /var/www/pengaduan-sarpras/server/.env

# 3. Backend not running
pm2 status
curl http://localhost:5000/api/health
```

### CORS Errors

```bash
# Check ORIGIN matches frontend URL
grep ORIGIN /var/www/pengaduan-sarpras/server/.env

# Should be: ORIGIN=https://yourdomain.com (with https if SSL enabled)
# Edit and restart
nano /var/www/pengaduan-sarpras/server/.env
pm2 restart pengaduan-backend
```

### Frontend Not Loading

```bash
# Check files exist
ls -la /var/www/pengaduan-sarpras-web/

# Rebuild if needed
cd /var/www/pengaduan-sarpras/clients/web
npm run build
sudo cp -r dist/* /var/www/pengaduan-sarpras-web/

# Test Nginx config
sudo nginx -t
sudo systemctl restart nginx
```

### Complete Reset (Last Resort)

```bash
# See FRESH_START_GUIDE.md section "Clean Up Old Files"
# Or run fresh-setup-vps.sh again
```

## 📄 License

MIT License - feel free to use for educational purposes

## 👨‍💻 Developer

Developed by Clawwo

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

For issues and questions:

- Create an issue on GitHub
- Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for deployment help

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** November 2025
