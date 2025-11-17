# 🎯 QUICK REFERENCE - PRESENTASI UKK

## 📌 AKUN LOGIN (SEMUA PASSWORD: `password123`)

| Username | Role | Nama | Untuk Demo |
|----------|------|------|------------|
| `admin` | Admin | Administrator | Kelola sistem, review pengaduan |
| `petugas1` | Petugas | Budi Santoso | Tangani pengaduan AC & Keyboard |
| `petugas2` | Petugas | Siti Rahma | Tangani pengaduan Proyektor |
| `petugas3` | Petugas | Andi Wijaya | Tangani pengaduan Kursi |
| `siswa1` | Pengguna | Ahmad Fauzi | Buat pengaduan baru |
| `siswa2` | Pengguna | Dewi Lestari | Buat pengaduan toilet |
| `guru1` | Pengguna | Pak Hendra | Buat pengaduan proyektor |
| `guru2` | Pengguna | Bu Nina | Buat pengaduan kursi |

---

## 📊 RINGKASAN DATA

- **Total User**: 8 (1 admin, 3 petugas, 4 pengguna)
- **Total Pengaduan**: 7
  - ✅ Selesai: 2
  - 🔄 Diproses: 2
  - ⏳ Menunggu: 2
  - ❌ Ditolak: 1
- **Total Lokasi**: 18 (Kelas, Lab, Ruang Guru, Perpus, dll)
- **Total Item**: 25 jenis sarana prasarana

---

## 🎭 SKENARIO DEMO (5 MENIT)

### **DEMO 1: Pengguna Buat Pengaduan (1 menit)**
1. Login: `siswa1` / `password123`
2. Klik **Tambah Pengaduan**
3. Isi form:
   - Nama: "Mouse Lab Komputer 1 Tidak Berfungsi"
   - Deskripsi: "Mouse PC 05 di Lab Komputer 1 kursor tidak bergerak"
   - Lokasi: Lab Komputer 1
   - Item: Mouse Logitech
4. Upload foto (optional)
5. **Submit**
6. ✅ Berhasil, muncul notifikasi sukses

### **DEMO 2: Admin Review & Assign (1.5 menit)**
1. Logout → Login: `admin` / `password123`
2. Lihat notifikasi: "📋 Pengaduan Baru Masuk"
3. Masuk ke **Dashboard Pengaduan**
4. Klik pengaduan "Mouse Lab Komputer 1..."
5. Assign ke: **Budi Santoso** (petugas1)
6. Ubah status: **Menunggu** → **Diproses**
7. **Update**
8. ✅ Petugas dapat notifikasi

### **DEMO 3: Petugas Tangani Pengaduan (1.5 menit)**
1. Logout → Login: `petugas1` / `password123`
2. Lihat notifikasi: "🔧 Tugas Baru"
3. Masuk ke **Pengaduan Saya**
4. Klik pengaduan yang di-assign
5. Isi **Saran Petugas**:
   - "Mouse sudah diganti dengan yang baru. PC 05 sudah bisa digunakan kembali."
6. Ubah status: **Diproses** → **Selesai**
7. **Update**
8. ✅ Pengguna dapat notifikasi

### **DEMO 4: Pengguna Cek Status (1 menit)**
1. Logout → Login kembali: `siswa1` / `password123`
2. Lihat notifikasi: "✅ Pengaduan Selesai"
3. Masuk ke **Pengaduanku**
4. Lihat status: **Selesai** ✅
5. Baca saran petugas
6. ✅ Pengaduan berhasil diselesaikan

---

## 🗣️ POIN PENJELASAN TEKNIS

### **1. Arsitektur Backend (30 detik)**
"Backend menggunakan **Node.js** dengan framework **Express.js** dan database **MySQL**. Struktur kode mengikuti pola **MVC** (Model-View-Controller) dengan pemisahan layer:
- **Routes**: Definisi endpoint API
- **Middleware**: Validasi & autentikasi
- **Controller**: Logika bisnis
- **Service**: Query database"

### **2. Keamanan (30 detik)**
"Sistem keamanan yang diterapkan:
- **JWT Authentication**: Token untuk verifikasi setiap request
- **Bcrypt**: Password di-hash, tidak bisa dibaca plain text
- **Role-Based Access Control**: Admin, Petugas, Pengguna punya akses berbeda
- **Input Validation**: Mencegah SQL injection & data tidak valid"

### **3. Real-time Notification (30 detik)**
"Notifikasi menggunakan **Firebase Cloud Messaging (FCM)**:
- Pengguna buat pengaduan → Admin & Petugas langsung dapat notifikasi
- Petugas update status → Pengguna langsung dapat notifikasi
- Notifikasi muncul di web & mobile app secara real-time"

### **4. Database Optimization (30 detik)**
"Database dioptimasi dengan:
- **Stored Procedures**: Query kompleks dijalankan di server MySQL (lebih cepat)
- **Indexing**: Kolom yang sering di-search diberi index
- **Connection Pooling**: Koneksi database di-reuse, tidak buat baru setiap request"

### **5. API RESTful (30 detik)**
"API mengikuti standar REST:
- **GET**: Ambil data
- **POST**: Buat data baru
- **PUT/PATCH**: Update data
- **DELETE**: Hapus data

Response format JSON dengan status code HTTP standar:
- 200 OK, 201 Created, 400 Bad Request, 403 Forbidden, 404 Not Found, 500 Server Error"

---

## 💡 JAWABAN PERTANYAAN UMUM

### **Q: Kenapa pakai JWT, bukan session?**
**A**: "JWT stateless, lebih cocok untuk REST API. Server tidak perlu simpan session, lebih scalable. Token disimpan di client (localStorage), bisa dipakai di web & mobile app."

### **Q: Bagaimana cara handle notifikasi real-time?**
**A**: "Pakai Firebase Cloud Messaging (FCM). Setiap user simpan FCM token di database. Saat ada event (pengaduan baru, status update), backend kirim push notification ke semua token yang relevan berdasarkan role."

### **Q: Kenapa password di-hash, tidak dienkripsi?**
**A**: "Hash bersifat one-way, tidak bisa di-decrypt. Jadi walau database bocor, password asli tetap aman. Saat login, password yang diinput di-hash lagi lalu dibandingkan dengan hash di database."

### **Q: Bagaimana cara scaling jika user banyak?**
**A**: "Bisa diterapkan:
- Horizontal scaling: Tambah server (load balancer)
- Caching: Pakai Redis untuk data yang sering diakses
- Database replication: Master-slave untuk baca/tulis
- CDN: Upload gambar ke ImageKit, bukan lokal server"

### **Q: Bagaimana cara backup data?**
**A**: "Ada 2 cara:
- Manual: `mysqldump` setiap hari, simpan di cloud storage
- Automated: Cron job di server yang auto backup setiap malam
- Best practice: Simpan backup 3 tempat (lokal, cloud, external drive)"

---

## 📸 FITUR YANG BISA DITUNJUKKAN

### ✅ **Sudah Ada:**
- [x] Login multi-role (Admin, Petugas, Pengguna)
- [x] CRUD Pengaduan (Create, Read, Update)
- [x] Upload foto pengaduan (ImageKit CDN)
- [x] Assign pengaduan ke petugas
- [x] Update status (Menunggu → Diproses → Selesai)
- [x] Notifikasi real-time (FCM)
- [x] Filter laporan pengaduan
- [x] Riwayat aksi (history tracking)
- [x] Dashboard statistik
- [x] Master data (Lokasi, Item, Kategori)

### 💡 **Improvement yang Bisa Dijelaskan:**
- [ ] Export laporan ke PDF/Excel
- [ ] Chart statistik (grafik pengaduan per bulan)
- [ ] Rating & feedback dari pengguna
- [ ] Email notification (selain push notif)
- [ ] QR Code untuk lokasi sarana prasarana
- [ ] Mobile app dengan Expo React Native

---

## 🚨 TROUBLESHOOTING LIVE DEMO

### **Login gagal**
- Cek: Backend running? `pm2 status`
- Restart: `pm2 restart pengaduan-backend`
- Cek console browser: Ada error CORS?

### **Notifikasi tidak muncul**
- Cek: Browser allow notification?
- Cek: FCM token tersimpan di database?
- Cek console: Ada error Firebase?

### **Upload foto gagal**
- Cek: File size > 2MB? (maksimal 2MB)
- Cek: Format JPG/PNG? (tidak support GIF/WEBP)
- Cek: ImageKit API key masih valid?

### **Database error**
- Cek: MySQL service running?
- Cek: `.env` config benar?
- Test koneksi: `mysql -u root -p`

---

## ⏱️ TIME MANAGEMENT PRESENTASI

| Waktu | Aktivitas |
|-------|-----------|
| 0:00 - 0:30 | Opening: Perkenalan & overview sistem |
| 0:30 - 2:00 | Penjelasan arsitektur & fitur |
| 2:00 - 7:00 | **LIVE DEMO** (4 skenario) |
| 7:00 - 8:00 | Penjelasan teknis (keamanan, database, API) |
| 8:00 - 10:00 | Q&A |

---

## 🎤 OPENING SCRIPT (30 DETIK)

"Assalamualaikum, selamat pagi/siang Bapak/Ibu penguji.

Saya **[Nama Anda]** dari kelas **[Kelas Anda]**, akan mempresentasikan project UKK saya dengan judul:

**'Sistem Informasi Pengaduan Sarana & Prasarana Berbasis Web & Mobile'**

Sistem ini bertujuan untuk memudahkan siswa, guru, dan staff sekolah dalam melaporkan kerusakan atau masalah sarana prasarana, serta mempermudah admin dan petugas dalam mengelola dan menangani pengaduan secara digital dan real-time.

Tech stack yang digunakan:
- **Backend**: Node.js, Express.js, MySQL
- **Frontend Web**: React.js, TailwindCSS
- **Mobile**: React Native dengan Expo
- **Notification**: Firebase Cloud Messaging

Langsung saya demo sistemnya ya Pak/Bu."

---

## 🏁 CLOSING SCRIPT (30 DETIK)

"Jadi begitu Pak/Bu, sistem pengaduan sarana prasarana ini.

**Kelebihan sistem:**
1. Real-time notification untuk semua role
2. Multi-platform (web & mobile)
3. Keamanan terjamin (JWT, bcrypt, role-based access)
4. Database teroptimasi (stored procedures, indexing)
5. Workflow jelas: Pengaduan → Review → Penanganan → Selesai

**Future improvement:**
- Export laporan PDF/Excel
- Chart statistik pengaduan
- Rating & feedback system
- Email notification

Sekian presentasi dari saya. Terima kasih atas perhatiannya.

Siap menjawab pertanyaan Bapak/Ibu."

---

## 📝 CHECKLIST TERAKHIR

### **Sebelum Presentasi:**
- [ ] Backup database
- [ ] Run script `reset_and_populate_demo_data.sql`
- [ ] Test login semua akun (admin, petugas, siswa)
- [ ] Test buat pengaduan baru
- [ ] Test update status
- [ ] Test notifikasi
- [ ] Clear browser cache (Ctrl + Shift + R)
- [ ] Restart backend (`pm2 restart`)
- [ ] Charge laptop (minimal 80%)
- [ ] Koneksi internet stabil
- [ ] Browser bookmark tab (Admin, Petugas, Pengguna)

### **Saat Presentasi:**
- [ ] Tenang & percaya diri
- [ ] Bicara jelas & lantang
- [ ] Tunjukkan code penting (authMiddleware, jwtHelper)
- [ ] Jelaskan alur dari user perspective
- [ ] Highlight keamanan sistem
- [ ] Jawab pertanyaan dengan yakin

---

## 🎯 KEY TAKEAWAYS

1. **Sistem ini solve real problem**: Pengaduan sarana prasarana manual (kertas) → Digital & real-time
2. **Security first**: JWT, bcrypt, role-based access, input validation
3. **Scalable architecture**: MVC pattern, REST API, connection pooling
4. **Modern tech stack**: Node.js, React, Firebase, MySQL
5. **Real-time notification**: FCM untuk web & mobile

---

**Good luck! Kamu pasti bisa! 💪🎓🚀**

_"Kesuksesan adalah ketika persiapan bertemu dengan kesempatan."_

---

**Last Update:** 17 November 2025, 02:30 WIB  
**Status:** ✅ READY FOR PRESENTATION
