# 🎯 PANDUAN RESET & POPULATE DATA UNTUK PRESENTASI UKK

## 📋 PERSIAPAN SEBELUM MENJALANKAN SCRIPT

### ⚠️ PENTING! BACKUP DATABASE DULU

Sebelum menjalankan script reset, **WAJIB backup database** untuk jaga-jaga:

```bash
# Windows (Command Prompt / PowerShell)
mysqldump -u root -p pengaduan_sarpras > backup_pengaduan_sarpras_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# Linux / Mac
mysqldump -u root -p pengaduan_sarpras > backup_pengaduan_sarpras_$(date +%Y%m%d_%H%M%S).sql
```

**Atau pakai MySQL Workbench:**

1. Klik kanan database `pengaduan_sarpras`
2. Pilih **Data Export**
3. Centang semua tabel
4. Export to Self-Contained File
5. Klik **Start Export**

---

## 🚀 CARA MENJALANKAN SCRIPT

### **Metode 1: MySQL Workbench (RECOMMENDED)**

1. **Buka MySQL Workbench**
2. **Connect ke database**

   - Host: localhost
   - Username: root (atau sesuai .env)
   - Password: (sesuai .env)

3. **Buka script SQL**

   - Menu: **File** → **Open SQL Script**
   - Pilih file: `server/database/reset_and_populate_demo_data.sql`

4. **Jalankan script**

   - Klik tombol **⚡ Execute** (atau tekan `Ctrl + Shift + Enter`)
   - Tunggu sampai selesai (± 10-15 detik)

5. **Cek hasil**
   - Di bagian bawah akan muncul tabel ringkasan:
     ```
     Tabel              | Jumlah
     -------------------|-------
     USER               | 8
     PETUGAS            | 3
     KATEGORI_LOKASI    | 8
     LOKASI             | 18
     LIST_LOKASI        | 12
     ITEMS              | 25
     PENGADUAN          | 7
     RIWAYAT_AKSI       | 20
     ```

---

### **Metode 2: Command Line (Terminal)**

```bash
# 1. Masuk ke folder server
cd "d:\Developments\Tech\React\React-Projects\pengaduan-sarpras\server"

# 2. Jalankan script SQL
mysql -u root -p pengaduan_sarpras < database/reset_and_populate_demo_data.sql

# 3. Masukkan password MySQL saat diminta
# (Password: clawwo071207 sesuai .env.example)

# 4. Tunggu sampai selesai (tidak ada output = berhasil)
```

---

### **Metode 3: phpMyAdmin (Jika pakai XAMPP)**

1. Buka **http://localhost/phpmyadmin**
2. Pilih database **pengaduan_sarpras** di sidebar kiri
3. Klik tab **SQL** di atas
4. **Copy-paste** isi file `reset_and_populate_demo_data.sql`
5. Klik tombol **Go** di kanan bawah
6. Tunggu sampai muncul pesan "Query executed successfully"

---

## ✅ VERIFIKASI DATA BERHASIL

### **1. Cek Jumlah Data**

Jalankan query ini di MySQL Workbench / phpMyAdmin:

```sql
USE pengaduan_sarpras;

-- Cek semua tabel
SELECT 'USER' as Tabel, COUNT(*) as Jumlah FROM pengaduan_sarpras_user
UNION ALL
SELECT 'PETUGAS', COUNT(*) FROM pengaduan_sarpras_petugas
UNION ALL
SELECT 'PENGADUAN', COUNT(*) FROM pengaduan_sarpras_pengaduan
UNION ALL
SELECT 'ITEMS', COUNT(*) FROM pengaduan_sarpras_items
UNION ALL
SELECT 'LOKASI', COUNT(*) FROM pengaduan_sarpras_lokasi;
```

**Expected Output:**

```
Tabel       | Jumlah
------------|-------
USER        | 8
PETUGAS     | 3
PENGADUAN   | 7
ITEMS       | 25
LOKASI      | 18
```

---

### **2. Test Login Aplikasi**

**Restart backend dulu:**

```bash
cd server
pm2 restart pengaduan-backend
# atau
npm run dev
```

**Test login di frontend:**

| Username   | Password      | Role     | Nama          |
| ---------- | ------------- | -------- | ------------- |
| `admin`    | `password123` | Admin    | Administrator |
| `petugas1` | `password123` | Petugas  | Budi Santoso  |
| `siswa1`   | `password123` | Pengguna | Ahmad Fauzi   |
| `guru1`    | `password123` | Pengguna | Pak Hendra    |

**Coba login sebagai `siswa1`:**

1. Buka web/mobile app
2. Login dengan `siswa1` / `password123`
3. Harus berhasil masuk
4. Cek halaman **Pengaduanku** → Harus ada 3 pengaduan

---

### **3. Cek Pengaduan di Dashboard**

**Login sebagai Admin:**

1. Username: `admin` / Password: `password123`
2. Masuk ke halaman **Dashboard Pengaduan**
3. Harus terlihat 7 pengaduan dengan status:
   - ✅ Selesai: 2 pengaduan
   - 🔄 Diproses: 2 pengaduan
   - ⏳ Menunggu: 2 pengaduan
   - ❌ Ditolak: 1 pengaduan

---

## 🎭 SKENARIO PRESENTASI UKK

### **Skenario 1: Pengguna Buat Pengaduan Baru**

1. **Login sebagai Siswa**

   - Username: `siswa2`
   - Password: `password123`

2. **Buat Pengaduan Baru**

   - Nama: "Meja Lab Multimedia Goyang"
   - Deskripsi: "Meja di Lab Multimedia baris depan goyang, bautnya kendor"
   - Lokasi: Lab Multimedia
   - Item: Meja Siswa
   - Upload foto (optional)
   - Submit

3. **Cek Notifikasi**
   - Admin & Petugas harus dapat notifikasi
   - ✅ Admin: "📋 Pengaduan Baru Masuk"
   - ✅ Petugas: "🔧 Tugas Baru"

---

### **Skenario 2: Admin Review & Assign Petugas**

1. **Login sebagai Admin**

   - Username: `admin`
   - Password: `password123`

2. **Lihat Pengaduan Baru**

   - Masuk ke halaman **Pengaduan**
   - Lihat pengaduan "Meja Lab Multimedia Goyang" (status: Menunggu)

3. **Assign ke Petugas**

   - Klik detail pengaduan
   - Pilih petugas: **Budi Santoso**
   - Ubah status: **Menunggu** → **Diproses**
   - Klik **Update**

4. **Cek Notifikasi**
   - Petugas Budi harus dapat notifikasi
   - Siswa yang buat pengaduan juga dapat notifikasi

---

### **Skenario 3: Petugas Tangani Pengaduan**

1. **Login sebagai Petugas**

   - Username: `petugas1`
   - Password: `password123`

2. **Lihat Tugas Baru**

   - Masuk ke halaman **Pengaduan Saya**
   - Lihat pengaduan yang di-assign ke Budi Santoso

3. **Update Progress**

   - Klik pengaduan "Meja Lab Multimedia Goyang"
   - Isi **Saran Petugas**: "Meja sudah diperbaiki. Baut sudah dikencangkan. Aman digunakan kembali."
   - Ubah status: **Diproses** → **Selesai**
   - Klik **Update**

4. **Cek Notifikasi Pengguna**
   - Siswa yang buat pengaduan dapat notifikasi
   - ✅ "Pengaduan Selesai: Meja Lab Multimedia Goyang sudah ditangani"

---

### **Skenario 4: Pengguna Cek Status Pengaduan**

1. **Login kembali sebagai Siswa**

   - Username: `siswa2`
   - Password: `password123`

2. **Lihat Notifikasi**

   - Klik icon notifikasi (bell 🔔)
   - Harus ada notifikasi baru: "✅ Pengaduan Selesai"

3. **Cek Halaman Pengaduanku**
   - Masuk ke halaman **Pengaduanku**
   - Pengaduan "Meja Lab Multimedia Goyang" status: **Selesai** ✅
   - Lihat **Saran Petugas** yang sudah diisi

---

## 📊 STATISTIK DATA UNTUK PRESENTASI

### **Rangkuman Data:**

- **Total User**: 8 orang

  - 1 Admin
  - 3 Petugas
  - 4 Pengguna (2 siswa + 2 guru)

- **Total Pengaduan**: 7 pengaduan

  - Selesai: 2 (AC Lab, Kursi Patah)
  - Diproses: 2 (Proyektor, Keyboard)
  - Menunggu: 2 (Toilet, Ring Basket)
  - Ditolak: 1 (Request komputer baru)

- **Total Lokasi**: 18 lokasi

  - 4 Ruang Kelas
  - 4 Laboratorium
  - 2 Ruang Guru
  - 1 Perpustakaan
  - 2 Fasilitas Umum
  - 2 Lapangan
  - 1 Kantin
  - 2 Toilet

- **Total Item Sarana Prasarana**: 25 jenis item
  - Komputer, Monitor, Keyboard, Mouse
  - AC, Proyektor
  - Meja, Kursi
  - Ring Basket, Bola
  - Kloset, Keran Air, dll

---

## 🎤 POIN PRESENTASI YANG BISA DIJELASKAN

### **1. Sistem Multi-Role**

"Sistem ini memiliki 3 role berbeda:

- **Admin**: Kelola sistem, review pengaduan, assign petugas
- **Petugas**: Tangani pengaduan yang di-assign
- **Pengguna**: Buat pengaduan, cek status"

### **2. Workflow Pengaduan**

"Alur pengaduan dari awal sampai selesai:

1. Pengguna buat pengaduan (status: Menunggu)
2. Admin review & assign ke petugas (status: Diproses)
3. Petugas tangani & update status (status: Selesai)
4. Pengguna dapat notifikasi otomatis"

### **3. Real-time Notification**

"Sistem notifikasi real-time menggunakan Firebase FCM:

- Admin & Petugas langsung dapat notifikasi saat ada pengaduan baru
- Pengguna dapat notifikasi saat status pengaduan berubah
- Notifikasi muncul di web & mobile app"

### **4. Data Management**

"Sistem mengelola data sarana prasarana secara terstruktur:

- Master data: Lokasi, Kategori, Item
- Tracking kondisi barang: Baik, Rusak Ringan, Rusak Berat
- History tracking: Semua aksi tercatat di riwayat"

### **5. Security & Validation**

"Keamanan sistem:

- Password di-hash dengan bcrypt (tidak bisa dibaca)
- JWT authentication untuk setiap request
- Role-based access control (admin vs petugas vs pengguna)
- Input validation untuk mencegah data tidak valid"

---

## ❌ TROUBLESHOOTING

### **Error: Access denied for user**

```
Error: Access denied for user 'root'@'localhost'
```

**Solusi:**

- Cek username & password MySQL di file `.env`
- Pastikan MySQL service running
- Coba login manual: `mysql -u root -p`

---

### **Error: Database doesn't exist**

```
Error: Unknown database 'pengaduan_sarpras'
```

**Solusi:**

```sql
-- Buat database dulu
CREATE DATABASE pengaduan_sarpras;

-- Lalu jalankan script
USE pengaduan_sarpras;
SOURCE reset_and_populate_demo_data.sql;
```

---

### **Error: Table doesn't exist**

```
Error: Table 'pengaduan_sarpras.pengaduan_sarpras_user' doesn't exist
```

**Solusi:**

- Tabel belum dibuat
- Import dulu struktur tabel dari file SQL schema
- Atau restore dari backup database lama

---

### **Error: Foreign key constraint fails**

```
Error: Cannot add or update a child row: a foreign key constraint fails
```

**Solusi:**

- Script sudah ada `SET FOREIGN_KEY_CHECKS = 0;`
- Pastikan script dijalankan **SECARA LENGKAP** (jangan sebagian)
- Jangan hapus baris `SET FOREIGN_KEY_CHECKS`

---

### **Login gagal setelah reset**

```
Error: Username atau password salah
```

**Solusi:**

- Password sudah di-hash dengan bcrypt
- Gunakan password: `password123` (bukan hash-nya)
- Restart backend setelah reset database:
  ```bash
  pm2 restart pengaduan-backend
  ```

---

## 🔄 ROLLBACK (Jika Ada Masalah)

Jika setelah reset ada masalah dan mau kembali ke data lama:

```bash
# Restore dari backup
mysql -u root -p pengaduan_sarpras < backup_pengaduan_sarpras_20251117.sql

# Restart backend
cd server
pm2 restart pengaduan-backend
```

---

## 📝 CHECKLIST SEBELUM PRESENTASI

- [ ] Backup database lama
- [ ] Jalankan script reset & populate
- [ ] Verifikasi jumlah data (8 user, 7 pengaduan, dll)
- [ ] Test login semua role (admin, petugas, siswa)
- [ ] Test buat pengaduan baru
- [ ] Test update status pengaduan
- [ ] Test notifikasi (push notification)
- [ ] Test laporan pengaduan (filter)
- [ ] Restart backend
- [ ] Clear browser cache (Ctrl + Shift + R)
- [ ] Test di mobile app (jika ada)

---

## 🎯 SUMMARY

**File yang digunakan:**

- `server/database/reset_and_populate_demo_data.sql` → Script reset & populate

**Akun untuk demo:**

- Admin: `admin` / `password123`
- Petugas: `petugas1` / `password123`
- Siswa: `siswa1` / `password123`
- Guru: `guru1` / `password123`

**Data yang diisi:**

- 8 User (1 admin, 3 petugas, 4 pengguna)
- 7 Pengaduan (variasi status: Selesai, Diproses, Menunggu, Ditolak)
- 18 Lokasi (Kelas, Lab, Ruang Guru, dll)
- 25 Item Sarana Prasarana (Komputer, AC, Kursi, dll)

**Estimasi waktu:**

- Backup: 2 menit
- Reset & populate: 1 menit
- Verifikasi: 3 menit
- **Total: ± 6 menit**

---

**Semoga sukses presentasi UKK besok! 🎓🚀**

**Tips terakhir:**

- Latihan dulu alur demo (buat pengaduan → assign → update → notifikasi)
- Siapkan penjelasan teknis (JWT, bcrypt, REST API)
- Tunjukkan dokumentasi backend (`DOKUMENTASI_BACKEND_UKK.md`)
- Percaya diri! 💪
