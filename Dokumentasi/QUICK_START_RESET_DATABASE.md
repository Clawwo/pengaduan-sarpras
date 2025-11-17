# ⚡ QUICK START - RESET DATABASE UNTUK PRESENTASI UKK

**Tanggal:** 17 November 2025  
**Tujuan:** Reset data lama & isi dengan data presentasi yang realistis

---

## 🚀 LANGKAH CEPAT (5 MENIT)

### **1. BACKUP DATABASE LAMA** (1 menit) ⚠️ WAJIB!

**Windows PowerShell:**
```powershell
cd "d:\Developments\Tech\React\React-Projects\pengaduan-sarpras\server\database"
.\backup_database.ps1
```

**Atau manual via MySQL Workbench:**
- Klik kanan database → Data Export → Export to Self-Contained File

---

### **2. RESET & POPULATE DATA** (2 menit)

**Metode A: MySQL Workbench** ⭐ RECOMMENDED
```
1. Buka MySQL Workbench
2. File → Open SQL Script
3. Pilih: server/database/reset_and_populate_demo_data.sql
4. Klik Execute (⚡)
5. Tunggu selesai (10-15 detik)
```

**Metode B: Command Line**
```bash
cd "d:\Developments\Tech\React\React-Projects\pengaduan-sarpras\server"
mysql -u root -p pengaduan_sarpras < database/reset_and_populate_demo_data.sql
# Masukkan password: clawwo071207
```

---

### **3. RESTART BACKEND** (30 detik)

```bash
cd "d:\Developments\Tech\React\React-Projects\pengaduan-sarpras\server"
pm2 restart pengaduan-backend
# atau
npm run dev
```

---

### **4. TEST LOGIN** (1 menit)

**Buka browser:** http://localhost:5173

| Username | Password | Role |
|----------|----------|------|
| `admin` | `password123` | Admin |
| `siswa1` | `password123` | Pengguna |
| `petugas1` | `password123` | Petugas |

**Test:**
- ✅ Login berhasil
- ✅ Dashboard muncul
- ✅ Ada data pengaduan (7 pengaduan)

---

### **5. CLEAR BROWSER CACHE** (30 detik)

```
Tekan: Ctrl + Shift + R
Atau: F12 → Application → Clear Storage → Clear site data
```

---

## ✅ VERIFIKASI BERHASIL

**Jalankan query ini di MySQL Workbench:**
```sql
USE pengaduan_sarpras;

SELECT 'USER' as Tabel, COUNT(*) as Jumlah FROM pengaduan_sarpras_user
UNION ALL
SELECT 'PENGADUAN', COUNT(*) FROM pengaduan_sarpras_pengaduan;
```

**Expected Result:**
```
Tabel       | Jumlah
------------|-------
USER        | 8
PENGADUAN   | 7
```

**Jika sesuai → ✅ SUKSES!**

---

## 📊 DATA YANG TERSEDIA

### **8 User:**
- 1 Admin: `admin`
- 3 Petugas: `petugas1`, `petugas2`, `petugas3`
- 4 Pengguna: `siswa1`, `siswa2`, `guru1`, `guru2`

### **7 Pengaduan:**
- ✅ 2 Selesai: AC Lab, Kursi Patah
- 🔄 2 Diproses: Proyektor, Keyboard
- ⏳ 2 Menunggu: Toilet, Ring Basket
- ❌ 1 Ditolak: Request Komputer Baru

### **18 Lokasi:**
- 4 Ruang Kelas (X RPL 1, X RPL 2, XI RPL 1, XII RPL 1)
- 4 Laboratorium (Lab Komputer 1, 2, Lab Jaringan, Lab Multimedia)
- 2 Ruang Guru
- 1 Perpustakaan
- 2 Fasilitas Umum (Masjid, Aula)
- 2 Lapangan (Basket, Futsal)
- 1 Kantin
- 2 Toilet

### **25 Item Sarana Prasarana:**
- Komputer, Monitor, Keyboard, Mouse
- AC, Proyektor, Kipas Angin
- Meja Siswa, Kursi Siswa
- Ring Basket, Bola
- Kloset, Keran Air, Cermin
- dll.

---

## 🎭 SKENARIO DEMO PRESENTASI

### **DEMO 1: Buat Pengaduan (Siswa)**
```
1. Login: siswa1 / password123
2. Klik "Tambah Pengaduan"
3. Isi:
   - Nama: "Mouse Lab Komputer 1 Rusak"
   - Deskripsi: "Mouse PC 05 tidak berfungsi"
   - Lokasi: Lab Komputer 1
   - Item: Mouse Logitech
4. Submit
5. ✅ Notifikasi ke Admin & Petugas
```

### **DEMO 2: Review Pengaduan (Admin)**
```
1. Login: admin / password123
2. Lihat notifikasi: "📋 Pengaduan Baru Masuk"
3. Klik detail pengaduan
4. Assign ke: Budi Santoso (petugas1)
5. Ubah status: Menunggu → Diproses
6. Update
7. ✅ Petugas dapat notifikasi
```

### **DEMO 3: Tangani Pengaduan (Petugas)**
```
1. Login: petugas1 / password123
2. Lihat notifikasi: "🔧 Tugas Baru"
3. Klik pengaduan
4. Isi Saran Petugas: "Mouse sudah diganti"
5. Ubah status: Diproses → Selesai
6. Update
7. ✅ Siswa dapat notifikasi
```

### **DEMO 4: Cek Status (Siswa)**
```
1. Login kembali: siswa1 / password123
2. Lihat notifikasi: "✅ Pengaduan Selesai"
3. Masuk ke "Pengaduanku"
4. Status: Selesai ✅
5. Baca saran petugas
```

---

## ❌ TROUBLESHOOTING CEPAT

### **Login gagal**
```bash
# Restart backend
pm2 restart pengaduan-backend

# Clear cache
Ctrl + Shift + R
```

### **Notifikasi tidak muncul**
```
1. Allow notification di browser
2. Cek console (F12) → Error Firebase?
3. Restart backend
```

### **Database error**
```bash
# Cek MySQL running
services.msc → MySQL → Start

# Test koneksi
mysql -u root -p
```

### **Mau kembali ke data lama**
```powershell
cd server/database
.\restore_database.ps1
```

---

## 📚 DOKUMENTASI LENGKAP

| File | Deskripsi |
|------|-----------|
| 📖 `PANDUAN_RESET_DATA_UKK.md` | Panduan lengkap step-by-step |
| 🎯 `QUICK_REFERENCE_UKK.md` | Cheat sheet presentasi |
| 📊 `DOKUMENTASI_BACKEND_UKK.md` | Dokumentasi backend lengkap |
| 📁 `README.md` | Overview semua script database |

---

## ⏱️ TIME ESTIMATE

- Backup: 1 menit
- Reset & Populate: 2 menit
- Restart Backend: 30 detik
- Test Login: 1 menit
- Clear Cache: 30 detik

**Total: ± 5 menit** ⚡

---

## 📋 CHECKLIST SEBELUM PRESENTASI

- [ ] ✅ Backup database lama
- [ ] ✅ Run script reset & populate
- [ ] ✅ Restart backend
- [ ] ✅ Test login semua role
- [ ] ✅ Test buat pengaduan
- [ ] ✅ Test notifikasi
- [ ] ✅ Clear browser cache
- [ ] ✅ Charge laptop (80%+)
- [ ] ✅ Siapkan tab browser (Admin, Petugas, Siswa)

---

## 🎯 POIN PRESENTASI

1. **Multi-Role System**: Admin, Petugas, Pengguna
2. **Real-time Notification**: FCM push notification
3. **Security**: JWT, bcrypt, role-based access
4. **Workflow**: Pengaduan → Review → Penanganan → Selesai
5. **Modern Tech**: Node.js, React, MySQL, Firebase

---

## 📞 AKUN LOGIN UNTUK DEMO

**Semua password:** `password123`

- 👤 Admin: `admin`
- 🔧 Petugas: `petugas1`, `petugas2`, `petugas3`
- 👨‍🎓 Siswa: `siswa1`, `siswa2`
- 👨‍🏫 Guru: `guru1`, `guru2`

---

**Status:** ✅ READY  
**Good luck besok! 🎓🚀**

_"Persiapan yang matang adalah separuh dari kesuksesan."_
