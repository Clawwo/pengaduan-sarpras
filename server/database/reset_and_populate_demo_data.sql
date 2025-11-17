-- ====================================================================
-- RESET & POPULATE DATA UNTUK PRESENTASI UKK
-- ====================================================================
-- Tujuan: Membersihkan data lama dan mengisi dengan data realistis
-- Tanggal: 17 November 2025
-- 
-- CATATAN PENTING:
-- 1. Script ini akan MENGHAPUS SEMUA DATA (tapi struktur tabel tetap)
-- 2. Backup database dulu sebelum menjalankan!
-- 3. Jalankan script ini di MySQL Workbench atau command line
-- ====================================================================

USE pengaduan_sarpras;

-- ====================================================================
-- STEP 1: DISABLE FOREIGN KEY CHECKS (Agar bisa delete tanpa error)
-- ====================================================================
SET FOREIGN_KEY_CHECKS = 0;

-- ====================================================================
-- STEP 2: HAPUS SEMUA DATA DARI SEMUA TABEL
-- ====================================================================

-- Tabel notifikasi & FCM
TRUNCATE TABLE notification_history;
TRUNCATE TABLE fcm_tokens;

-- Tabel riwayat aksi
TRUNCATE TABLE pengaduan_sarpras_riwayat_aksi;

-- Tabel pengaduan
TRUNCATE TABLE pengaduan_sarpras_pengaduan;

-- Tabel item & lokasi
TRUNCATE TABLE pengaduan_sarpras_items;
TRUNCATE TABLE pengaduan_sarpras_temporary_item;
TRUNCATE TABLE pengaduan_sarpras_list_lokasi;
TRUNCATE TABLE pengaduan_sarpras_lokasi;
TRUNCATE TABLE pengaduan_sarpras_kategori_lokasi;

-- Tabel petugas & user (PALING TERAKHIR karena ada FK dari tabel lain)
TRUNCATE TABLE pengaduan_sarpras_petugas;
TRUNCATE TABLE pengaduan_sarpras_user;

-- ====================================================================
-- STEP 3: RESET AUTO_INCREMENT KE 1
-- ====================================================================

ALTER TABLE pengaduan_sarpras_user AUTO_INCREMENT = 1;
ALTER TABLE pengaduan_sarpras_petugas AUTO_INCREMENT = 1;
ALTER TABLE pengaduan_sarpras_kategori_lokasi AUTO_INCREMENT = 1;
ALTER TABLE pengaduan_sarpras_lokasi AUTO_INCREMENT = 1;
ALTER TABLE pengaduan_sarpras_list_lokasi AUTO_INCREMENT = 1;
ALTER TABLE pengaduan_sarpras_items AUTO_INCREMENT = 1;
ALTER TABLE pengaduan_sarpras_temporary_item AUTO_INCREMENT = 1;
ALTER TABLE pengaduan_sarpras_pengaduan AUTO_INCREMENT = 1;
ALTER TABLE pengaduan_sarpras_riwayat_aksi AUTO_INCREMENT = 1;
ALTER TABLE notification_history AUTO_INCREMENT = 1;
ALTER TABLE fcm_tokens AUTO_INCREMENT = 1;

-- ====================================================================
-- STEP 4: ENABLE FOREIGN KEY CHECKS
-- ====================================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================================
-- STEP 5: INSERT DATA PRESENTASI (REALISTIS UNTUK DEMO UKK)
-- ====================================================================

-- ===========================
-- A. USER & PETUGAS
-- ===========================

-- Password untuk semua user: "password123" (sudah di-hash dengan bcrypt)
-- Hash di-generate dengan bcrypt salt rounds = 10

INSERT INTO pengaduan_sarpras_user (username, password, nama_pengguna, role) VALUES
-- Admin
('admin', '$2b$10$/ro79Zw6YoSCmRUR0QbsR.e0/tH739t1eMxpQofzMnudAnimY926G', 'Administrator', 'admin'),

-- Petugas (3 orang)
('petugas1', '$2b$10$7ayPwjO5CJTu7mIXipKFEu1CHMq3hgRTzsQ/167COLjirxbyODQPW', 'Budi Santoso', 'petugas'),
('petugas2', '$2b$10$1MT0nSSnVXb3omqbCkQt1.LgT200D/rN.ZQeIOsrbr3ZO2T3qVmFW', 'Siti Rahma', 'petugas'),
('petugas3', '$2b$10$27D4fq1GMAB1qTZHP2B/Pe5rFVvrKR2QjLWSNXc7uK7gYf4hScKwC', 'Andi Wijaya', 'petugas'),

-- Pengguna (Siswa/Guru)
('siswa1', '$2b$10$Hjb3kPRVqgSsO9lCnfl9VOMnzdsF6MVr04rZ6glqx9xAaXD0rpRVC', 'Ahmad Fauzi', 'pengguna'),
('siswa2', '$2b$10$2uKwwubppisMyigUzf9Yiu2rR/gXG3cBBahZnc.pLQp2M/Xe3fl5G', 'Dewi Lestari', 'pengguna'),
('guru1', '$2b$10$yRaniZNZGKorbQkh.IeFF.Ro7so7EVe6tN8ExCqPhvvNwsfu.Px02', 'Pak Hendra', 'pengguna'),
('guru2', '$2b$10$8ceTMkEWg87eauZ8yhNYLOjAFxqkacGLyDdspr9UzXOKZ8xo3zk7y', 'Bu Nina', 'pengguna');

-- Data Petugas (detail)
INSERT INTO pengaduan_sarpras_petugas (nama, gender, telp, id_user) VALUES
('Budi Santoso', 'L', '081234567801', 2),
('Siti Rahma', 'P', '081234567802', 3),
('Andi Wijaya', 'L', '081234567803', 4);

-- ===========================
-- B. KATEGORI LOKASI
-- ===========================

INSERT INTO pengaduan_sarpras_kategori_lokasi (nama_kategori_lokasi) VALUES
('Ruang Kelas'),
('Laboratorium'),
('Ruang Guru'),
('Perpustakaan'),
('Fasilitas Umum'),
('Lapangan & Olahraga'),
('Kantin'),
('Toilet');

-- ===========================
-- C. LOKASI
-- ===========================

INSERT INTO pengaduan_sarpras_lokasi (nama_lokasi, id_kategori_lokasi) VALUES
-- Ruang Kelas (id_kategori: 1)
('Kelas X RPL 1', 1),
('Kelas X RPL 2', 1),
('Kelas XI RPL 1', 1),
('Kelas XII RPL 1', 1),

-- Laboratorium (id_kategori: 2)
('Lab Komputer 1', 2),
('Lab Komputer 2', 2),
('Lab Jaringan', 2),
('Lab Multimedia', 2),

-- Ruang Guru (id_kategori: 3)
('Ruang Guru Produktif', 3),
('Ruang Guru Normatif', 3),

-- Perpustakaan (id_kategori: 4)
('Perpustakaan Lantai 1', 4),

-- Fasilitas Umum (id_kategori: 5)
('Masjid Sekolah', 5),
('Aula Serbaguna', 5),

-- Lapangan (id_kategori: 6)
('Lapangan Basket', 6),
('Lapangan Futsal', 6),

-- Kantin (id_kategori: 7)
('Kantin Utama', 7),

-- Toilet (id_kategori: 8)
('Toilet Siswa Lantai 1', 8),
('Toilet Guru Lantai 2', 8);

-- ===========================
-- D. LIST LOKASI (Sub-lokasi)
-- ===========================

INSERT INTO pengaduan_sarpras_list_lokasi (nama_list_lokasi, id_lokasi) VALUES
-- Lab Komputer 1
('PC 01', 5),
('PC 02', 5),
('PC 03', 5),
('Proyektor', 5),
('AC', 5),

-- Lab Komputer 2
('PC 01', 6),
('PC 02', 6),
('PC 03', 6),

-- Kelas X RPL 1
('Meja Siswa Depan', 1),
('Kursi Belakang', 1),
('Papan Tulis', 1),
('Kipas Angin', 1);

-- ===========================
-- E. ITEMS (Sarana Prasarana)
-- ===========================

INSERT INTO pengaduan_sarpras_items (nama_item, id_lokasi, kondisi, jumlah) VALUES
-- Lab Komputer 1 (id_lokasi: 5)
('Komputer Dell Optiplex 7010', 5, 'Baik', 30),
('Mouse Logitech', 5, 'Baik', 28),
('Keyboard Logitech', 5, 'Rusak Ringan', 25),
('Monitor LG 22 inch', 5, 'Baik', 29),
('Proyektor Epson EB-X41', 5, 'Baik', 1),
('AC Daikin 2 PK', 5, 'Rusak Berat', 2),

-- Lab Komputer 2 (id_lokasi: 6)
('Komputer Lenovo ThinkCentre', 6, 'Baik', 25),
('Mouse', 6, 'Rusak Ringan', 23),
('Keyboard', 6, 'Baik', 25),

-- Kelas X RPL 1 (id_lokasi: 1)
('Meja Siswa', 1, 'Rusak Ringan', 32),
('Kursi Siswa', 1, 'Rusak Ringan', 30),
('Papan Tulis Whiteboard', 1, 'Baik', 1),
('Spidol Whiteboard', 1, 'Baik', 5),

-- Kelas XI RPL 1 (id_lokasi: 3)
('Meja Siswa', 3, 'Baik', 32),
('Kursi Siswa', 3, 'Baik', 32),
('Proyektor', 3, 'Rusak Berat', 1),

-- Perpustakaan (id_lokasi: 11)
('Rak Buku Besi', 11, 'Baik', 20),
('Meja Baca', 11, 'Rusak Ringan', 10),
('Kursi Baca', 11, 'Baik', 40),

-- Lapangan Basket (id_lokasi: 14)
('Ring Basket', 14, 'Rusak Ringan', 2),
('Bola Basket', 14, 'Baik', 5),

-- Toilet Siswa (id_lokasi: 17)
('Kloset Duduk', 17, 'Rusak Berat', 3),
('Keran Air', 17, 'Rusak Ringan', 4),
('Cermin', 17, 'Baik', 2);

-- ===========================
-- F. PENGADUAN (Data Presentasi)
-- ===========================

INSERT INTO pengaduan_sarpras_pengaduan 
(nama_pengaduan, deskripsi, foto, file_id, status, tgl_pengajuan, tgl_selesai, id_user, id_item, id_lokasi, id_petugas, saran_petugas, catatan_admin) 
VALUES

-- 1. PENGADUAN SELESAI (Untuk demo bahwa sistem berhasil handle)
(
    'AC Lab Komputer 1 Mati Total',
    'AC di Lab Komputer 1 sudah tidak dingin sama sekali. Ruangan jadi panas dan siswa tidak nyaman saat praktikum. Sudah dicoba dihidupkan ulang tapi tetap tidak dingin.',
    'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/ac-rusak.jpg',
    'file_ac_001',
    'Selesai',
    '2025-11-10 08:30:00',
    '2025-11-15 14:00:00',
    5, -- Ahmad Fauzi (siswa1)
    6, -- AC Daikin 2 PK
    5, -- Lab Komputer 1
    1, -- Budi Santoso (petugas1)
    'AC sudah diperbaiki. Freon sudah diisi ulang dan filter dibersihkan. Ruangan sudah kembali dingin.',
    'Pengaduan valid. Approved untuk perbaikan.'
),

-- 2. PENGADUAN DIPROSES (Untuk demo workflow sedang berjalan)
(
    'Proyektor Kelas XI RPL 1 Tidak Bisa Tampil',
    'Proyektor di kelas XI RPL 1 tidak menampilkan gambar. Lampu indikator menyala tapi layar hitam. Sudah dicoba ganti kabel HDMI tapi tetap tidak bisa.',
    'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/proyektor-rusak.jpg',
    'file_proyektor_001',
    'Diproses',
    '2025-11-14 09:15:00',
    NULL,
    7, -- Pak Hendra (guru1)
    16, -- Proyektor
    3, -- Kelas XI RPL 1
    2, -- Siti Rahma (petugas2)
    'Sedang dalam pemeriksaan. Kemungkinan lampu proyektor sudah habis masa pakainya. Akan dilakukan penggantian lampu.',
    NULL
),

-- 3. PENGADUAN MENUNGGU (Baru masuk, belum ditangani)
(
    'Kloset Toilet Siswa Lantai 1 Mampet',
    'Kloset di toilet siswa lantai 1 (bilik paling ujung) mampet. Air tidak bisa turun dan sudah meluber. Sangat mengganggu karena bau dan tidak bisa dipakai.',
    'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/toilet-mampet.jpg',
    'file_toilet_001',
    'Menunggu',
    '2025-11-16 13:45:00',
    NULL,
    6, -- Dewi Lestari (siswa2)
    25, -- Kloset Duduk
    17, -- Toilet Siswa Lantai 1
    NULL,
    NULL,
    NULL
),

-- 4. PENGADUAN DITOLAK (Untuk demo validasi admin)
(
    'Request Tambah Komputer Baru',
    'Mohon ditambahkan 5 unit komputer baru di Lab Komputer 2 karena saat praktikum sering kekurangan komputer.',
    NULL,
    NULL,
    'Ditolak',
    '2025-11-12 10:00:00',
    '2025-11-13 11:00:00',
    5, -- Ahmad Fauzi (siswa1)
    NULL,
    6, -- Lab Komputer 2
    NULL,
    NULL,
    'Pengaduan ditolak. Untuk pengadaan barang baru harus melalui proposal anggaran, bukan melalui sistem pengaduan sarana prasarana.'
),

-- 5. PENGADUAN SELESAI (Perbaikan cepat)
(
    'Kursi Kelas X RPL 1 Kakinya Patah',
    'Kursi di barisan belakang kelas X RPL 1 kakinya patah. Berbahaya karena bisa jatuh saat diduduki.',
    'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/kursi-patah.jpg',
    'file_kursi_001',
    'Selesai',
    '2025-11-13 14:20:00',
    '2025-11-14 08:30:00',
    8, -- Bu Nina (guru2)
    11, -- Kursi Siswa
    1, -- Kelas X RPL 1
    3, -- Andi Wijaya (petugas3)
    'Kursi sudah diperbaiki. Kaki kursi sudah dilas dan sudah dikencangkan bautnya. Aman digunakan kembali.',
    'Approved. Perbaikan urgent karena menyangkut keselamatan siswa.'
),

-- 6. PENGADUAN MENUNGGU (Baru hari ini)
(
    'Ring Basket Lapangan Outdoor Miring',
    'Ring basket di lapangan outdoor sudah miring ke kiri. Net juga sudah putus. Siswa ekstrakurikuler basket kesulitan latihan.',
    'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/ring-basket.jpg',
    'file_basket_001',
    'Menunggu',
    '2025-11-17 07:00:00',
    NULL,
    5, -- Ahmad Fauzi (siswa1)
    22, -- Ring Basket
    14, -- Lapangan Basket
    NULL,
    NULL,
    NULL
),

-- 7. PENGADUAN DIPROSES (Sedang menunggu sparepart)
(
    'Keyboard Lab Komputer 1 Banyak Yang Rusak',
    'Dari 30 keyboard di Lab Komputer 1, sekitar 5 keyboard tombolnya ada yang tidak berfungsi (huruf A, spasi, enter). Mengganggu praktikum coding.',
    'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/keyboard-rusak.jpg',
    'file_keyboard_001',
    'Diproses',
    '2025-11-15 10:30:00',
    NULL,
    7, -- Pak Hendra (guru1)
    3, -- Keyboard Logitech
    5, -- Lab Komputer 1
    1, -- Budi Santoso (petugas1)
    'Sudah dilakukan pengecekan. 5 keyboard memang rusak. Sedang dalam proses pengadaan keyboard pengganti. Estimasi selesai minggu depan.',
    'Approved. Budget tersedia untuk pembelian keyboard.'
);

-- ===========================
-- G. RIWAYAT AKSI (Auto-generated dari pengaduan)
-- ===========================

INSERT INTO pengaduan_sarpras_riwayat_aksi (id_pengaduan, id_user, aksi, detail, waktu_aksi) VALUES

-- Pengaduan 1 (AC Lab Komputer 1 - SELESAI)
(1, 5, 'create_pengaduan', 'Pengaduan dibuat oleh Ahmad Fauzi', '2025-11-10 08:30:00'),
(1, 1, 'assign_petugas', 'Ditugaskan ke Budi Santoso', '2025-11-10 09:00:00'),
(1, 1, 'update_status', 'Status diubah dari Menunggu → Diproses', '2025-11-10 09:00:00'),
(1, 2, 'add_comment', 'Petugas: Sudah dicek, AC memang tidak dingin. Freon habis.', '2025-11-10 10:30:00'),
(1, 2, 'update_status', 'Status diubah dari Diproses → Selesai', '2025-11-15 14:00:00'),

-- Pengaduan 2 (Proyektor - DIPROSES)
(2, 7, 'create_pengaduan', 'Pengaduan dibuat oleh Pak Hendra', '2025-11-14 09:15:00'),
(2, 1, 'assign_petugas', 'Ditugaskan ke Siti Rahma', '2025-11-14 10:00:00'),
(2, 1, 'update_status', 'Status diubah dari Menunggu → Diproses', '2025-11-14 10:00:00'),
(2, 3, 'add_comment', 'Petugas: Sedang diperiksa. Kemungkinan lampu proyektor sudah mati.', '2025-11-14 11:00:00'),

-- Pengaduan 3 (Toilet - MENUNGGU)
(3, 6, 'create_pengaduan', 'Pengaduan dibuat oleh Dewi Lestari', '2025-11-16 13:45:00'),

-- Pengaduan 4 (Request Komputer - DITOLAK)
(4, 5, 'create_pengaduan', 'Pengaduan dibuat oleh Ahmad Fauzi', '2025-11-12 10:00:00'),
(4, 1, 'update_status', 'Status diubah dari Menunggu → Ditolak', '2025-11-13 11:00:00'),

-- Pengaduan 5 (Kursi Patah - SELESAI)
(5, 8, 'create_pengaduan', 'Pengaduan dibuat oleh Bu Nina', '2025-11-13 14:20:00'),
(5, 1, 'assign_petugas', 'Ditugaskan ke Andi Wijaya', '2025-11-13 15:00:00'),
(5, 1, 'update_status', 'Status diubah dari Menunggu → Diproses', '2025-11-13 15:00:00'),
(5, 4, 'update_status', 'Status diubah dari Diproses → Selesai', '2025-11-14 08:30:00'),

-- Pengaduan 6 (Ring Basket - MENUNGGU)
(6, 5, 'create_pengaduan', 'Pengaduan dibuat oleh Ahmad Fauzi', '2025-11-17 07:00:00'),

-- Pengaduan 7 (Keyboard - DIPROSES)
(7, 7, 'create_pengaduan', 'Pengaduan dibuat oleh Pak Hendra', '2025-11-15 10:30:00'),
(7, 1, 'assign_petugas', 'Ditugaskan ke Budi Santoso', '2025-11-15 11:00:00'),
(7, 1, 'update_status', 'Status diubah dari Menunggu → Diproses', '2025-11-15 11:00:00'),
(7, 2, 'add_comment', 'Admin: Approved. Budget tersedia untuk pembelian keyboard.', '2025-11-15 12:00:00');

-- ====================================================================
-- SELESAI! DATA PRESENTASI SUDAH SIAP
-- ====================================================================

-- Cek jumlah data yang berhasil diinsert
SELECT 'USER' as Tabel, COUNT(*) as Jumlah FROM pengaduan_sarpras_user
UNION ALL
SELECT 'PETUGAS', COUNT(*) FROM pengaduan_sarpras_petugas
UNION ALL
SELECT 'KATEGORI_LOKASI', COUNT(*) FROM pengaduan_sarpras_kategori_lokasi
UNION ALL
SELECT 'LOKASI', COUNT(*) FROM pengaduan_sarpras_lokasi
UNION ALL
SELECT 'LIST_LOKASI', COUNT(*) FROM pengaduan_sarpras_list_lokasi
UNION ALL
SELECT 'ITEMS', COUNT(*) FROM pengaduan_sarpras_items
UNION ALL
SELECT 'PENGADUAN', COUNT(*) FROM pengaduan_sarpras_pengaduan
UNION ALL
SELECT 'RIWAYAT_AKSI', COUNT(*) FROM pengaduan_sarpras_riwayat_aksi;

-- ====================================================================
-- INFORMASI AKUN UNTUK LOGIN
-- ====================================================================
-- 
-- Username      | Password     | Role
-- --------------|--------------|----------
-- admin         | password123  | admin
-- petugas1      | password123  | petugas
-- petugas2      | password123  | petugas
-- petugas3      | password123  | petugas
-- siswa1        | password123  | pengguna
-- siswa2        | password123  | pengguna
-- guru1         | password123  | pengguna
-- guru2         | password123  | pengguna
-- 
-- ====================================================================
-- SUMMARY PENGADUAN UNTUK PRESENTASI:
-- ====================================================================
-- 
-- Status      | Jumlah | Keterangan
-- ------------|--------|------------------------------------------
-- Selesai     |   2    | AC Lab & Kursi Patah (sudah diperbaiki)
-- Diproses    |   2    | Proyektor & Keyboard (sedang ditangani)
-- Menunggu    |   2    | Toilet & Ring Basket (baru masuk)
-- Ditolak     |   1    | Request komputer baru (bukan pengaduan)
-- 
-- Total: 7 pengaduan (variasi status untuk demo workflow)
-- 
-- ====================================================================
-- CATATAN PRESENTASI:
-- ====================================================================
-- 
-- 1. DATA REALISTIS:
--    ✅ Nama user realistis (Ahmad, Dewi, Pak Hendra, dll)
--    ✅ Deskripsi pengaduan detail & masuk akal
--    ✅ Timeline logis (dari 10 Nov - 17 Nov 2025)
--    ✅ Item sarana prasarana sesuai sekolah (komputer, AC, kursi, dll)
-- 
-- 2. WORKFLOW LENGKAP:
--    ✅ Ada pengaduan yang SELESAI (tunjukkan sistem berhasil)
--    ✅ Ada pengaduan yang DIPROSES (tunjukkan alur kerja)
--    ✅ Ada pengaduan yang MENUNGGU (tunjukkan pengaduan baru)
--    ✅ Ada pengaduan yang DITOLAK (tunjukkan validasi admin)
-- 
-- 3. ROLE LENGKAP:
--    ✅ 1 Admin (untuk kelola sistem)
--    ✅ 3 Petugas (untuk tangani pengaduan)
--    ✅ 4 Pengguna (2 siswa + 2 guru)
-- 
-- 4. SKENARIO DEMO:
--    a. Login sebagai SISWA1 → Buat pengaduan baru
--    b. Login sebagai ADMIN → Lihat pengaduan masuk → Assign ke petugas
--    c. Login sebagai PETUGAS1 → Update status pengaduan
--    d. Login sebagai SISWA1 lagi → Lihat notifikasi & status terupdate
-- 
-- ====================================================================
