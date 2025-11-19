# 🗄️ Sistem Backup Database Otomatis

## 📋 Deskripsi

Sistem backup otomatis untuk database `pengaduan_sarpras` menggunakan `mysqldump` dan `crontab`.

## 🎯 Spesifikasi

- **Jadwal:** 3x seminggu (Senin, Rabu, Jumat jam 02:00 AM)
- **Retention:** 7 backup terakhir (otomatis hapus backup lama)
- **Format File:** `pengaduan_sarpras_YYYY-MM-DD_HH-MM-SS.sql.gz`
- **Kompresi:** Gzip (hemat storage ~70-90%)
- **Lokasi:** `server/scripts/backups/`
- **Log:** `server/scripts/backup.log`

## 🚀 Instalasi & Setup

### 1. Konfigurasi Database

Edit file `backup_database.sh` dan sesuaikan kredensial database:

```bash
# Buka file untuk edit
nano backup_database.sh

# Edit bagian ini:
DB_NAME="pengaduan_sarpras"
DB_USER="root"
DB_PASSWORD="your_password_here"  # ⚠️ GANTI INI!
DB_HOST="localhost"
DB_PORT="3306"
```

### 2. Setup Crontab (Linux/macOS)

```bash
# Jalankan script setup otomatis
cd server/scripts
chmod +x setup_crontab.sh
./setup_crontab.sh
```

Script akan:

- ✅ Membuat script executable
- ✅ Menambahkan cron job otomatis
- ✅ Menampilkan jadwal backup

### 3. Setup Manual (Windows)

**Windows tidak support crontab**, gunakan alternatif:

#### A. Windows Task Scheduler (GUI)

1. Buka **Task Scheduler**
2. Klik **Create Basic Task**
3. Name: "Database Backup Pengaduan Sarpras"
4. Trigger: **Weekly** → Senin, Rabu, Jumat jam 02:00
5. Action: **Start a program**
   - Program: `bash` atau `wsl`
   - Arguments: `/path/to/backup_database.sh`
6. Finish & Enable

#### B. PowerShell Scheduled Task

```powershell
# Buat scheduled task via PowerShell
$action = New-ScheduledTaskAction -Execute "bash" -Argument "D:\path\to\backup_database.sh"
$trigger1 = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 2am
$trigger2 = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Wednesday -At 2am
$trigger3 = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Friday -At 2am
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName "DatabaseBackup" -Action $action -Trigger @($trigger1,$trigger2,$trigger3) -Principal $principal
```

#### C. WSL (Windows Subsystem for Linux)

Jika menggunakan WSL, setup seperti Linux biasa:

```bash
wsl
cd /mnt/d/path/to/server/scripts
./setup_crontab.sh
```

## 🔍 Cara Menggunakan

### Test Manual Backup

```bash
# Jalankan backup manual
cd server/scripts
./backup_database.sh
```

### Lihat Log Backup

```bash
# Lihat log realtime
tail -f server/scripts/backup.log

# Lihat 50 baris terakhir
tail -n 50 server/scripts/backup.log

# Lihat semua log
cat server/scripts/backup.log
```

### Lihat Daftar Backup

```bash
# List semua backup
ls -lh server/scripts/backups/

# Lihat 5 backup terakhir
ls -lt server/scripts/backups/ | head -n 6
```

### Restore Database dari Backup

```bash
# 1. Ekstrak file backup
cd server/scripts/backups
gunzip -k pengaduan_sarpras_2025-11-19_02-00-00.sql.gz

# 2. Restore ke database
mysql -u root -p pengaduan_sarpras < pengaduan_sarpras_2025-11-19_02-00-00.sql

# Atau restore langsung tanpa ekstrak:
gunzip < pengaduan_sarpras_2025-11-19_02-00-00.sql.gz | mysql -u root -p pengaduan_sarpras
```

## ⚙️ Konfigurasi Lanjutan

### Ubah Jadwal Backup

Edit crontab manual:

```bash
crontab -e
```

Format crontab: `menit jam hari bulan hari_minggu perintah`

- Harian jam 3 pagi: `0 3 * * *`
- Setiap 6 jam: `0 */6 * * *`
- Setiap hari kerja: `0 2 * * 1-5`

### Ubah Jumlah Retention

Edit `backup_database.sh`:

```bash
MAX_BACKUPS=14  # Simpan 14 backup terakhir
```

### Ubah Lokasi Backup

Edit `backup_database.sh`:

```bash
BACKUP_DIR="/custom/path/backups"
```

### Notifikasi Email (Opsional)

Tambah di akhir `backup_database.sh`:

```bash
# Kirim notifikasi email
echo "Backup database berhasil: $BACKUP_FILE_GZ" | mail -s "Database Backup Success" admin@example.com
```

## 📊 Monitoring

### Cek Cron Job Aktif

```bash
# Lihat semua cron job
crontab -l

# Cek cron service
sudo systemctl status cron
```

### Cek Ukuran Storage

```bash
# Ukuran total backup
du -sh server/scripts/backups/

# Ukuran per file
du -h server/scripts/backups/* | sort -rh
```

### Validasi Backup

Test apakah backup bisa di-restore:

```bash
# Test restore ke database dummy
mysql -u root -p -e "CREATE DATABASE test_restore"
gunzip < backup.sql.gz | mysql -u root -p test_restore
mysql -u root -p -e "DROP DATABASE test_restore"
```

## 🐛 Troubleshooting

### Error: "mysqldump: command not found"

**Solusi:**

```bash
# Install MySQL client
# Ubuntu/Debian
sudo apt-get install mysql-client

# CentOS/RHEL
sudo yum install mysql

# macOS
brew install mysql-client

# Windows
# Download MySQL installer dari mysql.com
```

### Error: "Permission denied"

**Solusi:**

```bash
# Beri permission execute
chmod +x backup_database.sh
chmod +x setup_crontab.sh

# Atau untuk semua file .sh
chmod +x *.sh
```

### Error: "Access denied for user 'root'@'localhost'"

**Solusi:**

1. Cek username & password di `backup_database.sh`
2. Test koneksi manual:
   ```bash
   mysql -u root -p -e "SELECT 1"
   ```
3. Pastikan user punya privilege:
   ```sql
   GRANT SELECT, LOCK TABLES ON pengaduan_sarpras.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Backup Tidak Jalan Otomatis

**Solusi:**

```bash
# 1. Cek cron service
sudo systemctl status cron

# 2. Restart cron
sudo systemctl restart cron

# 3. Cek log cron
grep CRON /var/log/syslog

# 4. Test manual
./backup_database.sh
```

### File Backup Terlalu Besar

**Solusi:**

- Sudah menggunakan gzip compression
- Bisa tambahkan excludes untuk table log/temporary:
  ```bash
  --ignore-table=pengaduan_sarpras.log_table
  ```

## 📝 Best Practices

1. **Security:**

   - Jangan commit password ke Git
   - Gunakan `.my.cnf` untuk kredensial:
     ```bash
     # ~/.my.cnf
     [client]
     user=root
     password=your_password
     ```

2. **Storage Management:**

   - Monitor disk space: `df -h`
   - Sesuaikan retention sesuai space
   - Pertimbangkan offsite backup (cloud)

3. **Testing:**

   - Test restore minimal 1x per bulan
   - Validasi integritas backup
   - Dokumentasikan prosedur restore

4. **Monitoring:**
   - Setup alert jika backup gagal
   - Monitor log secara berkala
   - Track backup size trends

## 🔐 Security Notes

⚠️ **PENTING:**

- File `backup_database.sh` berisi password database
- Jangan commit ke Git repository
- Tambahkan ke `.gitignore`:
  ```
  server/scripts/backup_database.sh
  server/scripts/backups/
  server/scripts/*.log
  ```

## 📞 Support

Jika ada masalah:

1. Cek log: `tail -f backup.log`
2. Test manual: `./backup_database.sh`
3. Validasi permission & kredensial
4. Cek disk space: `df -h`

---

**Dibuat:** 19 November 2025  
**Untuk:** Sistem Pengaduan Sarpras - UKK
