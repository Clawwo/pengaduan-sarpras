# 🎯 PANDUAN RESET DATABASE UNTUK PRESENTASI UKK

**Tanggal:** 17 November 2025  
**Tujuan:** Membersihkan data lama dan mengisi dengan data fresh realistis untuk presentasi  
**Waktu Eksekusi:** ~5 menit

---

## 📋 DAFTAR ISI

1. [Persiapan](#1-persiapan)
2. [Backup Database](#2-backup-database-wajib)
3. [Jalankan Script Reset](#3-jalankan-script-reset)
4. [Verifikasi Data](#4-verifikasi-data)
5. [Login Credentials](#5-login-credentials)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. PERSIAPAN

### ✅ Yang Dibutuhkan:

- MySQL/MariaDB sudah running
- phpMyAdmin atau MySQL CLI
- File script: `RESET_DATA_PRESENTASI_UKK.sql`
- Akses root MySQL

### ⚠️ PENTING - Baca Ini Dulu!

**Script ini akan:**

- ✅ **HAPUS SEMUA DATA** di database (pengaduan, user, item, dll)
- ✅ **TIDAK HAPUS TABEL** (struktur tetap aman)
- ✅ **TIDAK HAPUS STORED PROCEDURES** (tetap ada)
- ✅ Mengisi data fresh dengan nama SMK yang realistis

**Script ini TIDAK akan:**

- ❌ Drop database
- ❌ Drop tables
- ❌ Menghapus stored procedures

---

## 2. BACKUP DATABASE (⚠️ WAJIB!)

### Cara 1: Menggunakan phpMyAdmin

```
1. Buka phpMyAdmin (http://localhost/phpmyadmin)
2. Pilih database "pengaduan_sarpras"
3. Klik tab "Export"
4. Pilih "Quick" method
5. Format: SQL
6. Klik "Go"
7. Simpan file sebagai: backup_before_reset_17nov2025.sql
```

### Cara 2: Menggunakan Command Line (Lebih Cepat)

**Windows (PowerShell):**

```powershell
cd "C:\xampp\mysql\bin"

# Dengan password
.\mysqldump -u root -p pengaduan_sarpras > "D:\Developments\Tech\React\React-Projects\pengaduan-sarpras\backup_before_reset_17nov2025.sql"

# Tanpa password (jika root tidak ada password)
.\mysqldump -u root pengaduan_sarpras > "D:\Developments\Tech\React\React-Projects\pengaduan-sarpras\backup_before_reset_17nov2025.sql"
```

**Linux/Mac:**

```bash
mysqldump -u root -p pengaduan_sarpras > ~/backup_before_reset_17nov2025.sql
```

### ✅ Cek Backup Berhasil:

```
- File backup harus berukuran > 50 KB
- Buka dengan text editor, cek ada "INSERT INTO" di dalamnya
```

---

## 3. JALANKAN SCRIPT RESET

### Opsi A: Menggunakan phpMyAdmin (Mudah)

```
1. Buka phpMyAdmin
2. Pilih database "pengaduan_sarpras"
3. Klik tab "SQL"
4. Klik tombol "Choose File" / "Browse"
5. Pilih file: RESET_DATA_PRESENTASI_UKK.sql
6. Klik "Go"
7. Tunggu sampai muncul pesan "Query berhasil"
```

**Screenshot Contoh:**

```
┌─────────────────────────────────────┐
│ phpMyAdmin - SQL                    │
├─────────────────────────────────────┤
│ Import files                        │
│ [Choose File] RESET_DATA_PRES...sql │
│                                     │
│ [ Go ]                              │
└─────────────────────────────────────┘
```

### Opsi B: Menggunakan MySQL CLI (Lebih Cepat)

**Windows (PowerShell):**

```powershell
cd "C:\xampp\mysql\bin"

# Dengan password
.\mysql -u root -p pengaduan_sarpras < "D:\Developments\Tech\React\React-Projects\pengaduan-sarpras\server\database\RESET_DATA_PRESENTASI_UKK.sql"

# Tanpa password
.\mysql -u root pengaduan_sarpras < "D:\Developments\Tech\React\React-Projects\pengaduan-sarpras\server\database\RESET_DATA_PRESENTASI_UKK.sql"
```

**Linux/Mac:**

```bash
mysql -u root -p pengaduan_sarpras < ./server/database/RESET_DATA_PRESENTASI_UKK.sql
```

### ✅ Tanda Script Berhasil:

```sql
+---------------------------+
| Status                    |
+---------------------------+
| Data berhasil di-reset!   |
+---------------------------+

+-------------+
| total_user  |
+-------------+
|          8  |
+-------------+

+------------------+
| total_pengaduan  |
+------------------+
|               7  |
+------------------+
```

---

## 4. VERIFIKASI DATA

### Cek di phpMyAdmin:

**1. Cek User (harus ada 8 user):**

```sql
SELECT id_user, username, nama_pengguna, role
FROM pengaduan_sarpras_user
ORDER BY id_user;
```

**Hasil yang diharapkan:**

```
+----------+----------+------------------+----------+
| id_user  | username | nama_pengguna    | role     |
+----------+----------+------------------+----------+
|        1 | admin    | Administrator    | admin    |
|        2 | petugas1 | Ahmad Fauzi      | petugas  |
|        3 | petugas2 | Budi Santoso     | petugas  |
|        4 | siswa1   | Dani Setiawan    | pengguna |
|        5 | siswa2   | Eka Putri        | pengguna |
|        6 | siswa3   | Fajar Ramadhan   | pengguna |
|        7 | siswa4   | Gita Lestari     | pengguna |
|        8 | siswa5   | Hendra Wijaya    | pengguna |
+----------+----------+------------------+----------+
```

**2. Cek Pengaduan (harus ada 7 pengaduan berbagai status):**

```sql
SELECT id_pengaduan, nama_pengaduan, status, tgl_pengajuan
FROM pengaduan_sarpras_pengaduan
ORDER BY id_pengaduan;
```

**Hasil yang diharapkan:**

```
+--------------+----------------------------------+-----------+----------------+
| id_pengaduan | nama_pengaduan                   | status    | tgl_pengajuan  |
+--------------+----------------------------------+-----------+----------------+
|            1 | Komputer Lab RPL Tidak Bisa...   | Selesai   | 2025-11-10     |
|            2 | AC Kelas XII RPL 1 Tidak Dingin  | Diproses  | 2025-11-14     |
|            3 | Kursi Kelas Patah                | Disetujui | 2025-11-15     |
|            4 | Proyektor Lab RPL Mati           | Diajukan  | 2025-11-16     |
|            5 | Toilet Putra Wastafel Mampet     | Diajukan  | 2025-11-17     |
|            6 | Kabel LAN Lab TKJ Putus          | Diproses  | 2025-11-16     |
|            7 | Lampu Kelas Mati                 | Selesai   | 2025-11-12     |
+--------------+----------------------------------+-----------+----------------+
```

**3. Cek Statistik Pengaduan:**

```sql
SELECT status, COUNT(*) AS jumlah
FROM pengaduan_sarpras_pengaduan
GROUP BY status
ORDER BY FIELD(status, 'Diajukan', 'Disetujui', 'Diproses', 'Selesai');
```

**Hasil yang diharapkan:**

```
+-----------+--------+
| status    | jumlah |
+-----------+--------+
| Diajukan  |      2 |
| Disetujui |      1 |
| Diproses  |      2 |
| Selesai   |      2 |
+-----------+--------+
```

**4. Cek Lokasi (harus ada 21 lokasi SMK):**

```sql
SELECT COUNT(*) AS total_lokasi FROM pengaduan_sarpras_lokasi;
SELECT id_lokasi, nama_lokasi, id_kategori
FROM pengaduan_sarpras_lokasi
LIMIT 10;
```

**5. Cek Items (harus ada 28 item):**

```sql
SELECT COUNT(*) AS total_items FROM pengaduan_sarpras_items;
```

---

## 5. LOGIN CREDENTIALS

### 🔑 Akun untuk Login Presentasi

**⚠️ PASSWORD UNTUK SEMUA USER: `password123`**

### Admin:

```
Username: admin
Password: password123
Role: Administrator
Akses: Full control (kelola user, petugas, approve item, laporan)
```

### Petugas:

```
Username: petugas1
Password: password123
Nama: Ahmad Fauzi
Akses: Update status pengaduan, lihat semua pengaduan

Username: petugas2
Password: password123
Nama: Budi Santoso
Akses: Update status pengaduan, lihat semua pengaduan
```

### Pengguna (Siswa):

```
Username: siswa1
Password: password123
Nama: Dani Setiawan
Akses: Buat pengaduan, lihat pengaduan sendiri

Username: siswa2
Password: password123
Nama: Eka Putri
Akses: Buat pengaduan, lihat pengaduan sendiri

Username: siswa3
Password: password123
Nama: Fajar Ramadhan
Akses: Buat pengaduan, lihat pengaduan sendiri

Username: siswa4
Password: password123
Nama: Gita Lestari
Akses: Buat pengaduan, lihat pengaduan sendiri

Username: siswa5
Password: password123
Nama: Hendra Wijaya
Akses: Buat pengaduan, lihat pengaduan sendiri
```

---

## 6. SKENARIO DEMO PRESENTASI

### 📌 Skenario 1: Alur Lengkap Pengaduan (15 menit)

**1. Login sebagai Siswa (siswa1)**

```
- Buka aplikasi web
- Login: siswa1 / password123
- Lihat daftar pengaduan sendiri
- Tunjukkan pengaduan yang sudah selesai
```

**2. Buat Pengaduan Baru**

```
- Klik "Tambah Pengaduan"
- Pilih lokasi: Lab RPL
- Pilih item: Keyboard
- Isi nama pengaduan: "Keyboard Lab RPL Huruf W Tidak Berfungsi"
- Isi deskripsi: "Keyboard di meja nomor 7 tombol W nya macet"
- Upload foto (jika ada)
- Submit
- Tunjukkan notifikasi berhasil
```

**3. Login sebagai Admin (admin)**

```
- Logout dari siswa1
- Login: admin / password123
- Lihat dashboard admin
- Cek notifikasi pengaduan baru masuk
- Lihat detail pengaduan dari siswa1
```

**4. Login sebagai Petugas (petugas1)**

```
- Logout dari admin
- Login: petugas1 / password123
- Lihat notifikasi tugas baru
- Buka pengaduan yang baru dibuat siswa1
- Update status:
  * Diajukan → Disetujui (approve)
  * Disetujui → Diproses (mulai kerjakan)
  * Isi saran: "Sedang mencari keyboard pengganti"
  * Diproses → Selesai (selesai dikerjakan)
  * Isi saran: "Keyboard sudah diganti dengan yang baru"
```

**5. Kembali ke siswa1**

```
- Logout dari petugas1
- Login: siswa1 / password123
- Cek notifikasi pengaduan selesai
- Lihat detail pengaduan dengan saran petugas
```

---

### 📌 Skenario 2: Kelola Item Baru (5 menit)

**1. Siswa mengajukan item baru**

```
- Login: siswa2 / password123
- Buat pengaduan dengan item "Kabel HDMI" (item baru)
- Submit
```

**2. Admin approve item baru**

```
- Login: admin / password123
- Buka menu "Item Baru / Temporary Item"
- Approve item "Kabel HDMI"
- Item otomatis masuk ke daftar item resmi
```

---

### 📌 Skenario 3: Laporan Pengaduan (3 menit)

**1. Admin buka laporan**

```
- Login: admin / password123
- Buka menu "Laporan"
- Filter berdasarkan:
  * Status: Selesai
  * Petugas: Ahmad Fauzi
  * Tanggal: 7 hari terakhir
- Export/Print laporan
```

---

### 📌 Skenario 4: Notifikasi Real-time (2 menit)

**1. Demo notifikasi**

```
- Buka 2 browser (Chrome & Firefox)
- Browser 1: Login sebagai siswa3
- Browser 2: Login sebagai petugas1
- Di browser 1: Buat pengaduan baru
- Di browser 2: Tunjukkan notifikasi muncul real-time
- Klik notifikasi, langsung ke detail pengaduan
```

---

## 7. DATA YANG TERSEDIA

### Kategori Lokasi (5):

```
1. Laboratorium (Lab RPL, Lab TKJ, Lab Multimedia, Lab Bahasa, Lab Kimia)
2. Ruang Kelas (XII RPL 1, XII RPL 2, XII TKJ 1, XI RPL 1, X RPL 1)
3. Ruang Guru (Ruang Guru Utama, Ruang BK, Ruang Kepala Sekolah)
4. Fasilitas Umum (Toilet, Kantin, Mushola, Perpustakaan)
5. Outdoor (Lapangan Upacara, Parkiran, Taman)
```

### Lokasi (21):

```
Lab RPL, Lab TKJ, Lab Multimedia, Lab Bahasa, Lab Kimia,
Kelas XII RPL 1, Kelas XII RPL 2, Kelas XII TKJ 1, Kelas XI RPL 1, Kelas X RPL 1,
Ruang Guru Utama, Ruang BK, Ruang Kepala Sekolah,
Toilet Putra Lt.1, Toilet Putri Lt.1, Kantin Sekolah, Mushola, Perpustakaan,
Lapangan Upacara, Parkiran Motor Siswa, Taman Sekolah
```

### Items (28):

```
Komputer PC, Meja Komputer, Kursi Putar, AC, Proyektor,
Server Rack, Kabel LAN, Router Mikrotik,
Kamera DSLR, Tripod,
Meja Siswa, Kursi Siswa, Papan Tulis, Kipas Angin,
Kloset, Wastafel, Meja Kantin, Kursi Kantin,
Tiang Bendera, Lampu Taman
```

### Pengaduan (7):

```
1. Komputer Lab RPL Tidak Bisa Nyala - SELESAI (7 hari lalu)
2. AC Kelas XII RPL 1 Tidak Dingin - DIPROSES (3 hari lalu)
3. Kursi Kelas Patah - DISETUJUI (2 hari lalu)
4. Proyektor Lab RPL Mati - DIAJUKAN (kemarin)
5. Toilet Putra Wastafel Mampet - DIAJUKAN (hari ini)
6. Kabel LAN Lab TKJ Putus - DIPROSES (kemarin)
7. Lampu Kelas Mati - SELESAI (5 hari lalu)
```

---

## 8. TROUBLESHOOTING

### ❌ Error: "Access denied for user 'root'@'localhost'"

**Solusi:**

```sql
-- Cek user MySQL
mysql -u root

-- Jika tidak bisa, gunakan user lain
mysql -u clawwo -p
```

### ❌ Error: "Table doesn't exist"

**Solusi:**

```
Database structure belum di-import. Import dulu file: pengaduan_sarpras.sql
```

### ❌ Error: "Cannot add or update a child row: a foreign key constraint fails"

**Solusi:**

```sql
-- Pastikan foreign key checks disabled di awal script
SET FOREIGN_KEY_CHECKS = 0;
-- ... queries ...
SET FOREIGN_KEY_CHECKS = 1;
```

### ❌ Error: "Out of range value for column 'id_pengaduan'"

**Solusi:**

```sql
-- Reset auto increment dulu
ALTER TABLE pengaduan_sarpras_pengaduan AUTO_INCREMENT = 1;
```

### ❌ Login gagal dengan password "password123"

**Solusi:**

```
1. Cek di database, password hash harus: $2b$10$mUmnR7Uc0Rvoos3ewSznueuXx51Q/Y2XFMwjvvbQl5EqncPxXz48K
2. Jika berbeda, re-run script RESET_DATA_PRESENTASI_UKK.sql
3. Jika tetap gagal, generate hash baru:
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('password123', 10));"
```

---

## 9. RESTORE BACKUP (Jika Ada Masalah)

### Jika ingin kembali ke data lama:

**Menggunakan phpMyAdmin:**

```
1. Pilih database pengaduan_sarpras
2. Klik tab "Import"
3. Pilih file backup: backup_before_reset_17nov2025.sql
4. Klik "Go"
```

**Menggunakan MySQL CLI:**

```bash
mysql -u root -p pengaduan_sarpras < backup_before_reset_17nov2025.sql
```

---

## 10. CHECKLIST SEBELUM PRESENTASI

### ✅ Database:

- [ ] Data lama sudah di-backup
- [ ] Script reset berhasil dijalankan
- [ ] Total user = 8
- [ ] Total pengaduan = 7
- [ ] Total lokasi = 21
- [ ] Total items = 28
- [ ] Login admin berhasil
- [ ] Login petugas berhasil
- [ ] Login siswa berhasil

### ✅ Backend:

- [ ] Server running (pm2 status / npm run dev)
- [ ] Port 5000 bisa diakses
- [ ] API health check: http://localhost:5000/api/health
- [ ] CORS sudah dikonfigurasi untuk frontend

### ✅ Frontend:

- [ ] Web app running (npm run dev)
- [ ] Mobile app running (expo start)
- [ ] Login berhasil di web
- [ ] Login berhasil di mobile
- [ ] Notifikasi muncul

### ✅ Fitur:

- [ ] Buat pengaduan berhasil
- [ ] Upload foto berhasil (ImageKit)
- [ ] Notifikasi real-time berfungsi
- [ ] Update status berhasil
- [ ] Laporan bisa dicetak
- [ ] Approve item baru berhasil

---

## 11. TIPS PRESENTASI

### 🎯 Do's (Lakukan):

- ✅ Jelaskan alur pengaduan dari awal sampai selesai
- ✅ Tunjukkan perbedaan role (admin, petugas, siswa)
- ✅ Demo notifikasi real-time
- ✅ Tunjukkan laporan pengaduan
- ✅ Jelaskan keamanan (JWT, bcrypt)
- ✅ Siapkan backup browser jika ada error

### ❌ Don'ts (Hindari):

- ❌ Login dengan password salah berkali-kali
- ❌ Buat pengaduan tanpa isi deskripsi
- ❌ Lupa logout sebelum ganti role
- ❌ Upload foto terlalu besar (max 2MB)
- ❌ Buka terlalu banyak tab (lambat)

---

## 12. KONTAK DARURAT

**Jika ada masalah saat presentasi:**

1. **Backend error:**

   - Restart backend: `pm2 restart pengaduan-backend`
   - Cek logs: `pm2 logs pengaduan-backend`

2. **Frontend error:**

   - Hard refresh: `Ctrl + Shift + R`
   - Clear cache: `Ctrl + Shift + Delete`

3. **Database error:**

   - Restart MySQL: `sudo service mysql restart` (Linux)
   - Restart XAMPP (Windows)

4. **Worst case scenario:**
   - Restore backup
   - Restart semua service
   - Login dengan user lain

---

## ✅ SELESAI!

**Data sudah siap untuk presentasi UKK!**

**Semoga sukses! 🎓🚀**

---

**Dokumentasi ini dibuat pada:** 17 November 2025  
**Oleh:** GitHub Copilot  
**Untuk:** Presentasi UKK Sistem Pengaduan Sarana & Prasarana
