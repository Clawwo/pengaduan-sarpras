# 📋 RINGKASAN RESET DATABASE - PRESENTASI UKK

**Tanggal:** 17 November 2025  
**Untuk:** Presentasi UKK 18 November 2025  
**Status:** ✅ Siap dijalankan

---

## ✅ YANG SUDAH DISIAPKAN

### 1. Script SQL Reset Database

**File:** `server/database/RESET_DATA_PRESENTASI_UKK.sql`

**Isi script:**

- ✅ Menghapus SEMUA data lama (TRUNCATE, bukan DROP)
- ✅ Struktur tabel tetap aman
- ✅ Stored procedures tidak terhapus
- ✅ Mengisi data fresh yang realistis:
  - 5 Kategori Lokasi (Lab, Kelas, Ruang Guru, Fasilitas, Outdoor)
  - 21 Lokasi SMK yang realistis
  - 28 Items (komputer, meja, kursi, AC, dll)
  - 8 User (1 admin, 2 petugas, 5 siswa)
  - 7 Pengaduan dengan berbagai status
  - 15 Riwayat aksi (history perubahan status)

### 2. Panduan Lengkap

**File:** `Dokumentasi/PANDUAN_RESET_DATABASE_UKK.md`

**Isi:**

- ✅ Langkah-langkah backup database
- ✅ Cara menjalankan script (phpMyAdmin & CLI)
- ✅ Verifikasi data
- ✅ Login credentials semua user
- ✅ Skenario demo presentasi
- ✅ Troubleshooting lengkap
- ✅ Checklist sebelum presentasi

### 3. Quick Reference Card

**File:** `Dokumentasi/QUICK_START_RESET_DATABASE.md`

**Isi:**

- ✅ Langkah cepat reset (5 menit)
- ✅ Tabel login credentials
- ✅ Tabel pengaduan yang tersedia
- ✅ Troubleshooting cepat
- ✅ Emergency contacts

---

## 🔑 KREDENSIAL LOGIN (PASSWORD SAMA SEMUA)

**⚠️ PASSWORD UNTUK SEMUA USER: `password123`**

| Role        | Username   | Nama Lengkap   | Kegunaan                |
| ----------- | ---------- | -------------- | ----------------------- |
| **Admin**   | `admin`    | Administrator  | Demo full control       |
| **Petugas** | `petugas1` | Ahmad Fauzi    | Demo update status      |
| **Petugas** | `petugas2` | Budi Santoso   | Demo petugas alternatif |
| **Siswa**   | `siswa1`   | Dani Setiawan  | Demo buat pengaduan     |
| **Siswa**   | `siswa2`   | Eka Putri      | Demo item baru          |
| **Siswa**   | `siswa3`   | Fajar Ramadhan | Demo notifikasi         |
| **Siswa**   | `siswa4`   | Gita Lestari   | Demo untuk cadangan     |
| **Siswa**   | `siswa5`   | Hendra Wijaya  | Demo untuk cadangan     |

---

## 📊 DATA YANG AKAN TERSEDIA SETELAH RESET

### Statistik:

```
✅ 8 User (1 admin + 2 petugas + 5 siswa)
✅ 21 Lokasi (Lab, Kelas, Ruang Guru, Fasilitas, Outdoor)
✅ 28 Items (Komputer, Meja, Kursi, AC, dll)
✅ 7 Pengaduan dengan status bervariasi
✅ 15 Riwayat aksi (history)
```

### Pengaduan Berdasarkan Status:

```
📋 Diajukan:  2 pengaduan (baru masuk, belum ditangani)
✔️ Disetujui: 1 pengaduan (sudah approve, menunggu petugas)
🔄 Diproses:  2 pengaduan (sedang dikerjakan petugas)
✅ Selesai:   2 pengaduan (sudah selesai dikerjakan)
```

### Detail Pengaduan untuk Demo:

1. **Komputer Lab RPL Tidak Bisa Nyala** - ✅ Selesai (7 hari lalu)
   - Untuk: Tunjukkan alur lengkap dari awal sampai selesai
2. **AC Kelas XII RPL 1 Tidak Dingin** - 🔄 Diproses (3 hari lalu)
   - Untuk: Demo update status di tengah proses
3. **Kursi Kelas Patah** - ✔️ Disetujui (2 hari lalu)
   - Untuk: Demo pengaduan yang sudah disetujui
4. **Proyektor Lab RPL Mati** - 📋 Diajukan (kemarin)
   - Untuk: Demo approve pengaduan baru
5. **Toilet Putra Wastafel Mampet** - 📋 Diajukan (hari ini)
   - Untuk: Demo pengaduan hari ini
6. **Kabel LAN Lab TKJ Putus** - 🔄 Diproses (kemarin)
   - Untuk: Demo petugas2 (Budi Santoso)
7. **Lampu Kelas Mati** - ✅ Selesai (5 hari lalu)
   - Untuk: Statistik laporan

---

## 🎬 SKENARIO DEMO YANG DIREKOMENDASIKAN

### **Skenario 1: Alur Lengkap Pengaduan** (15 menit) ⭐ UTAMA

```
STEP 1: Login sebagai Siswa (siswa1)
- Tunjukkan dashboard siswa
- Lihat pengaduan yang pernah dibuat
- Klik "Buat Pengaduan Baru"
- Isi form:
  * Nama: "Keyboard Lab RPL Huruf W Tidak Berfungsi"
  * Lokasi: Lab RPL
  * Item: Komputer PC
  * Deskripsi: "Keyboard di meja nomor 7 tombol W macet"
  * Upload foto (jika ada)
- Submit
- Tunjukkan notifikasi berhasil

STEP 2: Login sebagai Admin (admin)
- Logout dari siswa1
- Login sebagai admin
- Tunjukkan notifikasi "Pengaduan Baru Masuk"
- Klik notifikasi → Detail pengaduan
- Jelaskan role admin (bisa approve/reject)

STEP 3: Login sebagai Petugas (petugas1)
- Logout dari admin
- Login sebagai petugas1 (Ahmad Fauzi)
- Tunjukkan notifikasi "Tugas Baru"
- Buka pengaduan dari siswa1
- Update status BERTAHAP:

  Status 1: DISETUJUI
  - Klik "Update Status"
  - Pilih "Disetujui"
  - Klik "Simpan"
  - Tunjukkan notifikasi ke siswa

  Status 2: DIPROSES
  - Klik "Update Status"
  - Pilih "Diproses"
  - Isi saran: "Sedang mencari keyboard pengganti"
  - Klik "Simpan"

  Status 3: SELESAI
  - Klik "Update Status"
  - Pilih "Selesai"
  - Isi saran: "Keyboard sudah diganti dengan yang baru"
  - Klik "Simpan"

STEP 4: Kembali ke Siswa (siswa1)
- Logout dari petugas1
- Login sebagai siswa1
- Tunjukkan notifikasi "Pengaduan Selesai"
- Klik notifikasi → Lihat saran petugas
- Tunjukkan riwayat perubahan status
```

### **Skenario 2: Item Baru** (5 menit)

```
STEP 1: Siswa Ajukan Item Baru
- Login: siswa2 (Eka Putri)
- Buat pengaduan
- Pilih "Item Baru / Tidak Ada di List"
- Isi nama item baru: "Kabel HDMI"
- Submit

STEP 2: Admin Approve Item
- Login: admin
- Buka menu "Item Baru / Temporary Item"
- Lihat request item "Kabel HDMI"
- Klik "Approve"
- Item otomatis masuk ke daftar resmi
```

### **Skenario 3: Laporan** (3 menit)

```
- Login: admin
- Buka menu "Laporan"
- Filter:
  * Status: Selesai
  * Petugas: Ahmad Fauzi
  * Tanggal: 7 hari terakhir
- Tunjukkan hasil laporan
- Klik "Export PDF" atau "Print"
```

### **Skenario 4: Notifikasi Real-time** (2 menit)

```
- Buka 2 browser (Chrome & Firefox)
- Browser 1: Login siswa3
- Browser 2: Login petugas1
- Di Browser 1: Buat pengaduan baru
- Di Browser 2: Tunjukkan notifikasi muncul otomatis
- Klik notifikasi → Langsung ke detail pengaduan
```

---

## 📝 LANGKAH EKSEKUSI (UNTUK BESOK)

### **Malam Sebelum Presentasi (17 Nov 2025):**

1. ✅ **Backup database lama:**

   ```bash
   cd C:\xampp\mysql\bin
   .\mysqldump -u root pengaduan_sarpras > backup_17nov2025.sql
   ```

2. ✅ **Jalankan script reset:**

   ```bash
   .\mysql -u root pengaduan_sarpras < "D:\...\RESET_DATA_PRESENTASI_UKK.sql"
   ```

3. ✅ **Verifikasi data:**

   ```sql
   SELECT COUNT(*) FROM pengaduan_sarpras_user;      -- Harus: 8
   SELECT COUNT(*) FROM pengaduan_sarpras_pengaduan; -- Harus: 7
   ```

4. ✅ **Test login semua user:**

   - admin / password123 ✓
   - petugas1 / password123 ✓
   - siswa1 / password123 ✓

5. ✅ **Test fitur:**
   - Buat pengaduan ✓
   - Upload foto ✓
   - Update status ✓
   - Notifikasi ✓

### **Pagi Hari Presentasi (18 Nov 2025):**

1. ✅ **Start backend:**

   ```bash
   cd server
   npm run dev
   # atau
   pm2 start server.js --name pengaduan-backend
   ```

2. ✅ **Start frontend:**

   ```bash
   cd clients/web
   npm run dev
   ```

3. ✅ **Cek API:**

   - Buka: http://localhost:5000/api/health
   - Harus return: `{ status: "healthy" }`

4. ✅ **Login di browser:**
   - Tab 1: Login admin
   - Tab 2: Login petugas1
   - Tab 3: Login siswa1
   - Jangan logout, siap untuk demo!

---

## ⚠️ HAL PENTING YANG HARUS DIINGAT

### **Do's (Lakukan):**

- ✅ Backup dulu sebelum reset
- ✅ Test semua login sebelum presentasi
- ✅ Siapkan foto untuk upload (max 2MB)
- ✅ Buka semua tab browser sebelum presentasi
- ✅ Jelaskan perbedaan role dengan jelas
- ✅ Tunjukkan notifikasi real-time
- ✅ Jelaskan keamanan (JWT, bcrypt)

### **Don'ts (Hindari):**

- ❌ Jangan skip backup
- ❌ Jangan reset database saat presentasi
- ❌ Jangan login dengan password salah berkali-kali
- ❌ Jangan lupa logout sebelum ganti role
- ❌ Jangan buat pengaduan tanpa isi deskripsi
- ❌ Jangan upload foto > 2MB

---

## 🆘 TROUBLESHOOTING CEPAT

### **Login Gagal?**

```
1. Cek password: harus "password123" (lowercase semua)
2. Cek di database:
   SELECT username, password FROM pengaduan_sarpras_user WHERE username='admin';
3. Password hash harus: $2b$10$mUmnR7Uc0Rvoos3ewSznueuXx51Q/Y2XFMwjvvbQl5EqncPxXz48K
4. Jika berbeda, re-run script RESET_DATA_PRESENTASI_UKK.sql
```

### **Backend Error?**

```bash
# Restart backend
pm2 restart pengaduan-backend
# atau
Ctrl+C di terminal → npm run dev

# Cek logs
pm2 logs pengaduan-backend --lines 50
```

### **Frontend Error?**

```
1. Hard refresh: Ctrl + Shift + R
2. Clear cache: Ctrl + Shift + Delete
3. Restart: Ctrl+C → npm run dev
```

### **Notifikasi Tidak Muncul?**

```
1. Cek backend running di port 5000
2. Cek frontend CORS configuration
3. Cek FCM token (allow notification di browser)
4. Refresh browser
```

### **Worst Case Scenario?**

```bash
# Restore backup
mysql -u root pengaduan_sarpras < backup_17nov2025.sql

# Restart semua
pm2 restart pengaduan-backend
# Restart frontend
# Restart MySQL/XAMPP
```

---

## ✅ CHECKLIST FINAL SEBELUM PRESENTASI

### **Database:**

- [ ] Backup sudah dibuat (backup_17nov2025.sql)
- [ ] Script reset berhasil dijalankan
- [ ] Total user = 8 ✓
- [ ] Total pengaduan = 7 ✓
- [ ] Total lokasi = 21 ✓
- [ ] Total items = 28 ✓

### **Backend:**

- [ ] Server running (npm run dev / pm2)
- [ ] Port 5000 accessible
- [ ] API health check berhasil
- [ ] ImageKit configured
- [ ] FCM Firebase configured

### **Frontend:**

- [ ] Web app running (port 5173)
- [ ] CORS configured
- [ ] Login page accessible

### **Testing:**

- [ ] Login admin berhasil
- [ ] Login petugas1 berhasil
- [ ] Login siswa1 berhasil
- [ ] Buat pengaduan berhasil
- [ ] Upload foto berhasil (< 2MB)
- [ ] Update status berhasil
- [ ] Notifikasi muncul
- [ ] Laporan bisa dicetak

### **Browser:**

- [ ] 3 tab sudah di-login (admin, petugas, siswa)
- [ ] Foto sudah disiapkan untuk upload
- [ ] Bookmark: http://localhost:5173
- [ ] Bookmark: http://localhost:5000/api/health

---

## 🎯 POIN PENTING YANG HARUS DIJELASKAN

### **Teknis:**

1. ✅ **Arsitektur:** Node.js + Express + MySQL + React
2. ✅ **REST API:** GET, POST, PUT, PATCH, DELETE
3. ✅ **Authentication:** JWT token dengan role-based access
4. ✅ **Security:** Bcrypt password hashing, input validation
5. ✅ **Upload:** ImageKit CDN (bukan lokal server)
6. ✅ **Database:** Stored procedures, indexing, connection pool
7. ✅ **Notification:** Push notification real-time

### **Fitur:**

1. ✅ **Role Management:** Admin, Petugas, Pengguna
2. ✅ **CRUD Pengaduan:** Create, Read, Update, Delete
3. ✅ **Status Workflow:** Diajukan → Disetujui → Diproses → Selesai
4. ✅ **Item Management:** Admin approve item baru
5. ✅ **Laporan:** Filter by status, petugas, tanggal
6. ✅ **Notifikasi:** Real-time notification untuk semua role

---

## 📞 KONTAK DARURAT

**Jika ada masalah saat presentasi:**

### **Plan A: Restart**

```bash
pm2 restart pengaduan-backend
# Restart frontend (Ctrl+C → npm run dev)
# Hard refresh browser (Ctrl+Shift+R)
```

### **Plan B: Restore Backup**

```bash
mysql -u root pengaduan_sarpras < backup_17nov2025.sql
```

### **Plan C: Login Alternatif**

```
Jika admin gagal → coba petugas1
Jika petugas1 gagal → coba siswa1
Password semua sama: password123
```

### **Plan D: Browser Alternatif**

```
Jika Chrome error → buka Firefox/Edge
Tab baru → http://localhost:5173
Login ulang
```

---

## 🎓 PESAN AKHIR

**Untuk Presentasi Besok:**

1. **Tenang dan percaya diri** - Anda sudah menyiapkan semuanya dengan baik
2. **Jelaskan dengan jelas** - Gunakan bahasa yang mudah dipahami
3. **Demo step-by-step** - Jangan terburu-buru
4. **Tunjukkan fitur unggulan** - Notifikasi real-time, security, dll
5. **Siap jawab pertanyaan** - Pahami alur kerja backend

**Ingat:**

- ✅ Password semua user: `password123`
- ✅ Data sudah realistis (nama SMK, item sekolah)
- ✅ 7 pengaduan dengan status bervariasi
- ✅ Backup sudah disiapkan

**Files yang Harus Dibuka:**

1. `PANDUAN_RESET_DATABASE_UKK.md` - Panduan lengkap
2. `QUICK_START_RESET_DATABASE.md` - Quick reference (print!)
3. `RESET_DATA_PRESENTASI_UKK.sql` - Script SQL

---

**SEMOGA SUKSES PRESENTASI UKK! 🎓🚀**

**Anda sudah siap! Good luck! 💪**

---

**Dokumentasi dibuat:** 17 November 2025  
**Untuk presentasi:** 18 November 2025  
**Oleh:** GitHub Copilot
