# 📁 DATABASE SCRIPTS - PENGADUAN SARPRAS

Folder ini berisi script SQL dan PowerShell untuk mengelola database presentasi UKK.

---

## 📂 DAFTAR FILE

### **1. reset_and_populate_demo_data.sql** ⭐ (MAIN SCRIPT)

Script utama untuk reset database dan mengisi dengan data presentasi UKK.

**Isi:**

- ✅ Hapus semua data (TRUNCATE)
- ✅ Reset AUTO_INCREMENT ke 1
- ✅ Insert 8 user (1 admin, 3 petugas, 4 pengguna)
- ✅ Insert 7 pengaduan (variasi status)
- ✅ Insert 18 lokasi (Kelas, Lab, Ruang Guru, dll)
- ✅ Insert 25 item sarana prasarana
- ✅ Insert 20 riwayat aksi

**Kapan digunakan:**

- Sebelum presentasi UKK (untuk data fresh & realistis)
- Setelah testing (untuk reset ke kondisi awal)

**Cara pakai:**

```bash
# Metode 1: MySQL Workbench
File → Open SQL Script → reset_and_populate_demo_data.sql → Execute

# Metode 2: Command Line
mysql -u root -p pengaduan_sarpras < reset_and_populate_demo_data.sql
```

---

### **2. PANDUAN_RESET_DATA_UKK.md** 📖 (DOCUMENTATION)

Panduan lengkap step-by-step untuk reset & populate database.

**Isi:**

- 📋 Persiapan (backup database)
- 🚀 Cara menjalankan script (3 metode)
- ✅ Verifikasi data berhasil
- 🎭 Skenario presentasi UKK (4 skenario)
- 📊 Statistik data
- ❌ Troubleshooting

**Kapan digunakan:**

- Baca dulu sebelum reset database
- Panduan lengkap untuk presentasi

---

### **3. backup_database.ps1** 💾 (BACKUP SCRIPT)

Script PowerShell untuk backup database otomatis.

**Fungsi:**

- Backup database ke file `.sql`
- Auto generate nama file dengan timestamp
- Simpan di folder `backup/`

**Cara pakai:**

```powershell
cd server/database
.\backup_database.ps1
# Masukkan password MySQL saat diminta
```

**Output:**

```
backup/pengaduan_sarpras_20251117_023045.sql
```

**⚠️ PENTING:** Jalankan backup SEBELUM reset database!

---

### **4. restore_database.ps1** 🔄 (RESTORE SCRIPT)

Script PowerShell untuk restore database dari backup.

**Fungsi:**

- List semua file backup
- Pilih file mana yang mau di-restore
- Restore ke database

**Cara pakai:**

```powershell
cd server/database
.\restore_database.ps1
# Pilih nomor file backup
# Konfirmasi (y/n)
# Masukkan password MySQL
```

**Kapan digunakan:**

- Jika ada masalah setelah reset
- Mau kembali ke data lama

---

### **5. fix_stuck_notifications.sql** 🔔

Script untuk fix notifikasi yang stuck / tidak bisa dihapus.

**Fungsi:**

- Check notifikasi yang stuck
- Find orphaned notifications
- Clean up old notifications

**Kapan digunakan:**

- Jika notifikasi tidak hilang setelah di-read
- Jika ada notifikasi lama (> 7 hari) yang masih muncul

---

### **6. fix_roles.sql** 🔐

Script untuk normalisasi role user (lowercase).

**Fungsi:**

- Update semua role jadi lowercase
- Check role yang salah

**Kapan digunakan:**

- Jika ada error "Akses ditolak" padahal role benar
- Sudah diterapkan di `reset_and_populate_demo_data.sql`

---

### **7. NOTIFICATION_BUG_FIX.md** 🐛

Dokumentasi bug fix notifikasi system.

**Isi:**

- Bug 1: Petugas tidak terima notifikasi
- Bug 2: Notifikasi stuck di count 6
- Solusi yang sudah diterapkan

---

## 🎯 WORKFLOW UNTUK PRESENTASI UKK

### **Step 1: Backup Database Lama**

```powershell
cd server/database
.\backup_database.ps1
```

**Output:** `backup/pengaduan_sarpras_20251117_023045.sql`

---

### **Step 2: Reset & Populate Data Presentasi**

**Metode A: MySQL Workbench (RECOMMENDED)**

1. Buka MySQL Workbench
2. File → Open SQL Script
3. Pilih `reset_and_populate_demo_data.sql`
4. Klik Execute (⚡)
5. Tunggu 10-15 detik
6. Cek output: Harus ada 8 user, 7 pengaduan, dll

**Metode B: Command Line**

```bash
mysql -u root -p pengaduan_sarpras < reset_and_populate_demo_data.sql
```

---

### **Step 3: Verifikasi Data**

```sql
-- Jalankan di MySQL Workbench / phpMyAdmin
USE pengaduan_sarpras;

SELECT 'USER' as Tabel, COUNT(*) as Jumlah FROM pengaduan_sarpras_user
UNION ALL
SELECT 'PENGADUAN', COUNT(*) FROM pengaduan_sarpras_pengaduan;
```

**Expected:**

- USER: 8
- PENGADUAN: 7

---

### **Step 4: Test Login**

```
Username: admin
Password: password123

Username: siswa1
Password: password123
```

Semua akun pakai password yang sama: `password123`

---

### **Step 5: Restart Backend**

```bash
cd server
pm2 restart pengaduan-backend
# atau
npm run dev
```

---

### **Step 6: Clear Browser Cache**

```
Tekan: Ctrl + Shift + R
Atau: F12 → Application → Clear Storage
```

---

### **Step 7: Test Buat Pengaduan**

1. Login sebagai `siswa1`
2. Klik **Tambah Pengaduan**
3. Isi form
4. Submit
5. ✅ Harus berhasil

---

### **Step 8: Test Notifikasi**

1. Login sebagai `admin` di tab lain
2. Harus ada notifikasi: "📋 Pengaduan Baru Masuk"
3. Klik notifikasi
4. ✅ Redirect ke detail pengaduan

---

## 🆘 JIKA ADA MASALAH

### **Problem: Login gagal setelah reset**

**Solusi:**

```bash
# 1. Restart backend
pm2 restart pengaduan-backend

# 2. Clear browser cache
Ctrl + Shift + R

# 3. Test login lagi
Username: admin
Password: password123
```

---

### **Problem: Notifikasi tidak muncul**

**Solusi:**

```bash
# 1. Cek backend log
pm2 logs pengaduan-backend

# 2. Cek browser console (F12)
# Look for error Firebase / FCM

# 3. Allow notification di browser
Settings → Site Settings → Notifications → Allow
```

---

### **Problem: Database error saat run script**

**Solusi:**

```bash
# 1. Cek MySQL service
services.msc → MySQL → Start

# 2. Test koneksi
mysql -u root -p
# Jika bisa login, koneksi OK

# 3. Cek database ada
SHOW DATABASES;
# Harus ada 'pengaduan_sarpras'

# 4. Cek .env config
cat .env | grep DB_
# Harus sama dengan MySQL config
```

---

### **Problem: Mau kembali ke data lama**

**Solusi:**

```powershell
# Restore dari backup
cd server/database
.\restore_database.ps1
# Pilih file backup terakhir
# Konfirmasi (y)
```

---

## 📊 STATISTIK DATA PRESENTASI

Setelah run `reset_and_populate_demo_data.sql`:

| Tabel               | Jumlah | Keterangan                                   |
| ------------------- | ------ | -------------------------------------------- |
| **User**            | 8      | 1 admin, 3 petugas, 4 pengguna               |
| **Petugas**         | 3      | Budi, Siti, Andi                             |
| **Kategori Lokasi** | 8      | Kelas, Lab, Ruang Guru, dll                  |
| **Lokasi**          | 18     | Lab Komputer, Kelas RPL, dll                 |
| **List Lokasi**     | 12     | PC 01, PC 02, Meja, Kursi, dll               |
| **Items**           | 25     | Komputer, AC, Proyektor, dll                 |
| **Pengaduan**       | 7      | 2 Selesai, 2 Diproses, 2 Menunggu, 1 Ditolak |
| **Riwayat Aksi**    | 20     | History semua aksi pengaduan                 |

---

## 🔐 AKUN LOGIN

Semua password: `password123`

| Username   | Role     | Nama          |
| ---------- | -------- | ------------- |
| `admin`    | Admin    | Administrator |
| `petugas1` | Petugas  | Budi Santoso  |
| `petugas2` | Petugas  | Siti Rahma    |
| `petugas3` | Petugas  | Andi Wijaya   |
| `siswa1`   | Pengguna | Ahmad Fauzi   |
| `siswa2`   | Pengguna | Dewi Lestari  |
| `guru1`    | Pengguna | Pak Hendra    |
| `guru2`    | Pengguna | Bu Nina       |

---

## 📝 CHECKLIST SEBELUM PRESENTASI

- [ ] Backup database lama (`backup_database.ps1`)
- [ ] Run script reset (`reset_and_populate_demo_data.sql`)
- [ ] Verifikasi data (8 user, 7 pengaduan)
- [ ] Test login semua role
- [ ] Test buat pengaduan baru
- [ ] Test update status
- [ ] Test notifikasi
- [ ] Restart backend (`pm2 restart`)
- [ ] Clear browser cache (Ctrl + Shift + R)
- [ ] Charge laptop (minimal 80%)

---

## 🎓 TIPS PRESENTASI

1. **Latihan dulu** alur demo (3-5x)
2. **Siapkan tab browser** (Admin, Petugas, Pengguna)
3. **Highlight keamanan** (JWT, bcrypt, role-based)
4. **Tunjukkan dokumentasi** (`DOKUMENTASI_BACKEND_UKK.md`)
5. **Percaya diri!** 💪

---

## 📞 QUICK HELP

**File terpenting untuk presentasi:**

1. ⭐ `reset_and_populate_demo_data.sql` - Script utama
2. 📖 `PANDUAN_RESET_DATA_UKK.md` - Panduan lengkap
3. 🎯 `QUICK_REFERENCE_UKK.md` - Cheat sheet presentasi

**Jika ada error:**

1. Cek `pm2 logs pengaduan-backend`
2. Cek browser console (F12)
3. Test koneksi MySQL (`mysql -u root -p`)
4. Restart everything:
   ```bash
   pm2 restart all
   sudo systemctl restart mysql  # Linux
   net stop MySQL80 && net start MySQL80  # Windows
   ```

---

**Last Update:** 17 November 2025  
**Status:** ✅ READY FOR UKK

**Good luck! 🎓🚀**
