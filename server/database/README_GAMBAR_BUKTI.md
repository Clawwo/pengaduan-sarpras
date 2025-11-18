# Fitur Upload Gambar Bukti Penyelesaian Pengaduan

## 📋 Deskripsi

Fitur ini memungkinkan **Petugas** dan **Admin** untuk mengupload foto bukti ketika menyelesaikan pengaduan. Foto akan dikirim ke pengguna sebagai bukti bahwa pengaduan sudah ditangani.

## 🗄️ Perubahan Database

### 1. Kolom Baru di Tabel `pengaduan_sarpras_pengaduan`

```sql
- gambar_bukti_selesai (TEXT) - URL gambar dari ImageKit
- file_id_bukti_selesai (VARCHAR 255) - File ID untuk manajemen ImageKit
```

### 2. Stored Procedure Update

**File:** `update_sp_status_with_bukti.sql`

Stored procedure `sp_update_pengaduan_status` sekarang menerima 2 parameter tambahan:

- `p_gambar_bukti_selesai` - URL gambar bukti
- `p_file_id_bukti_selesai` - File ID dari ImageKit

## 🔧 Cara Instalasi

### Step 1: Jalankan SQL Fix & Schema Update

```bash
# Di MySQL Workbench atau terminal MySQL
mysql -u root -p pengaduan_sarpras < fix_trigger_short_message.sql
```

File ini akan:

- ✅ Fix trigger validasi pengaduan duplikat
- ✅ Tambah kolom `gambar_bukti_selesai`
- ✅ Tambah kolom `file_id_bukti_selesai`

### Step 2: Update Stored Procedure

```bash
mysql -u root -p pengaduan_sarpras < update_sp_status_with_bukti.sql
```

### Step 3: Restart Server Backend

```bash
cd server
npm start
```

### Step 4: Test Frontend

```bash
cd clients/web
npm run dev
```

## 🎯 Cara Penggunaan

### Untuk Petugas/Admin:

1. **Buka halaman Pengaduan**

   - Petugas: `/petugas/pengaduan`
   - Admin: `/admin/pengaduan`

2. **Pilih pengaduan yang akan diselesaikan**

   - Klik tombol "Kelola" pada pengaduan

3. **Update status menjadi "Selesai"**

   - Pilih status "Selesai" dari dropdown

4. **Upload gambar bukti** (OPSIONAL)

   - Form upload akan muncul otomatis ketika status "Selesai" dipilih
   - Klik tombol "Choose File" atau drag & drop foto
   - Preview gambar akan ditampilkan
   - Format: JPG, PNG, GIF, dll
   - Max size: 10MB (sesuai config ImageKit)

5. **Tambahkan saran (opsional)**

   - Berikan feedback untuk pengguna

6. **Simpan perubahan**
   - Klik "Simpan Perubahan"
   - Gambar akan diupload ke ImageKit folder `/Pengaduan_Sarpras/Bukti_Selesai`
   - URL gambar disimpan di database

### Untuk Pengguna:

1. **Buka halaman Riwayat Pengaduan**

   - Akses: `/pengguna/riwayat`

2. **Lihat indikator bukti foto**

   - Pengaduan dengan bukti foto akan menampilkan badge hijau "Ada Bukti Foto" di kolom Status

3. **Buka detail pengaduan**

   - Klik tombol "Detail" pada pengaduan yang memiliki bukti foto
   - Alert hijau akan muncul di bagian atas jika ada bukti foto

4. **Lihat bukti penyelesaian**
   - Scroll ke bawah pada modal detail
   - Section "Bukti Penyelesaian dari Petugas" akan menampilkan:
     - Info bahwa petugas telah mengirim bukti
     - Foto bukti penyelesaian dalam border hijau
     - Gambar dapat diklik untuk memperbesar

## 🔄 Alur Data

```
Frontend (Form Upload)
    ↓
FormData dengan file gambar
    ↓
Backend Route (pengaduanRoute.js)
    ↓
uploadImageMiddleware (Multer)
    ↓
pengaduanController.js
    ↓
uploadImage() → ImageKit
    ↓
pengaduanService.js
    ↓
sp_update_pengaduan_status(... + gambar_bukti_url + file_id)
    ↓
Database (kolom gambar_bukti_selesai & file_id_bukti_selesai)
```

## 📁 File yang Dimodifikasi

### Backend:

- ✅ `server/database/fix_trigger_short_message.sql` - Schema update
- ✅ `server/database/update_sp_status_with_bukti.sql` - SP update
- ✅ `server/controllers/pengaduanController.js` - Upload logic
- ✅ `server/services/pengaduanService.js` - Service layer
- ✅ `server/routes/pengaduanRoute.js` - Route middleware

### Frontend:

- ✅ `clients/web/src/pages/petugas/Pengaduan.jsx` - UI upload
- ✅ `clients/web/src/pages/admin/Pengaduan.jsx` - UI upload
- ✅ `clients/web/src/pages/pengguna/Riwayat.jsx` - UI view bukti foto

## ⚠️ Catatan Penting

1. **Gambar bersifat OPSIONAL** - Petugas/admin boleh menyelesaikan tanpa upload gambar
2. **Upload hanya muncul saat status "Selesai"** - Form upload conditional
3. **Foto pengaduan lama tetap dihapus** - Saat status Selesai/Ditolak, foto pengaduan original akan dihapus dari ImageKit
4. **Gambar bukti TIDAK akan dihapus** - Tetap tersimpan sebagai arsip/bukti penyelesaian
5. **Format FormData** - Backend menggunakan `multipart/form-data` untuk upload file
6. **Pengguna dapat melihat bukti** - Badge hijau "Ada Bukti Foto" muncul di tabel riwayat
7. **Alert otomatis** - Modal detail menampilkan alert hijau jika ada bukti foto

## 🧪 Testing Checklist

- [ ] Upload gambar saat status Selesai (Petugas)
- [ ] Upload gambar saat status Selesai (Admin)
- [ ] Selesaikan tanpa upload gambar (tetap berfungsi)
- [ ] Preview gambar sebelum upload
- [ ] Hapus preview gambar
- [ ] Validasi format file
- [ ] Check URL gambar tersimpan di database
- [ ] Verify gambar muncul di ImageKit dashboard
- [ ] Test dengan status selain "Selesai" (form tidak muncul)
- [ ] Pengguna melihat badge "Ada Bukti Foto" di tabel riwayat
- [ ] Pengguna melihat alert hijau di modal detail
- [ ] Pengguna dapat melihat foto bukti penyelesaian
- [ ] Foto bukti dapat diklik untuk memperbesar

## 📞 Support

Jika ada error atau pertanyaan, cek:

1. Console browser (F12) untuk error frontend
2. Terminal server untuk error backend
3. ImageKit dashboard untuk konfirmasi upload
4. Database untuk verifikasi data tersimpan

---

**Dibuat:** 18 November 2025  
**Untuk:** Presentasi UKK Pengaduan Sarpras
