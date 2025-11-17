-- =============================================
-- SCRIPT RESET DATA UNTUK PRESENTASI UKK
-- =============================================
-- Dibuat: 17 November 2025
-- Fungsi: Membersihkan data lama dan mengisi data fresh untuk presentasi
-- 
-- PERHATIAN: Script ini HANYA menghapus DATA, TIDAK menghapus struktur tabel!
-- =============================================

-- STEP 1: BACKUP DULU SEBELUM HAPUS!
-- mysqldump -u root -p pengaduan_sarpras > backup_before_reset_$(date +%Y%m%d_%H%M%S).sql

USE pengaduan_sarpras;

-- =============================================
-- PART 1: HAPUS SEMUA DATA (TIDAK HAPUS TABEL)
-- =============================================

-- Disable foreign key checks untuk menghindari error dependency
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Hapus data transaksi (yang berkaitan dengan pengaduan)
TRUNCATE TABLE `pengaduan_sarpras_riwayat_aksi`;
TRUNCATE TABLE `pengaduan_sarpras_pengaduan`;
TRUNCATE TABLE `pengaduan_sarpras_temporary_item`;
TRUNCATE TABLE `notification_history`;
TRUNCATE TABLE `fcm_tokens`;

-- 2. Hapus data item (akan diisi ulang dengan data realistis)
TRUNCATE TABLE `pengaduan_sarpras_items`;

-- 3. Hapus data user & petugas (akan diisi ulang)
TRUNCATE TABLE `pengaduan_sarpras_petugas`;
TRUNCATE TABLE `pengaduan_sarpras_user`;

-- 4. Hapus data lokasi (akan diisi ulang dengan nama SMK)
TRUNCATE TABLE `pengaduan_sarpras_lokasi`;
TRUNCATE TABLE `pengaduan_sarpras_kategori_lokasi`;

-- Enable foreign key checks kembali
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- PART 2: ISI DATA FRESH UNTUK PRESENTASI
-- =============================================

-- -----------------------------------------
-- 2.1 KATEGORI LOKASI (Sesuai SMK)
-- -----------------------------------------
INSERT INTO `pengaduan_sarpras_kategori_lokasi` 
(`id_kategori`, `nama_kategori`, `deskripsi`, `created_at`) VALUES
(1, 'Laboratorium', 'Laboratorium praktik siswa', NOW()),
(2, 'Ruang Kelas', 'Ruang belajar teori', NOW()),
(3, 'Ruang Guru', 'Ruang guru dan staf', NOW()),
(4, 'Fasilitas Umum', 'Toilet, kantin, mushola, dll', NOW()),
(5, 'Outdoor', 'Lapangan, taman, parkiran', NOW());

-- -----------------------------------------
-- 2.2 LOKASI (Sesuai SMK)
-- -----------------------------------------
INSERT INTO `pengaduan_sarpras_lokasi` 
(`id_lokasi`, `nama_lokasi`, `id_kategori`) VALUES
-- Laboratorium
(1, 'Lab RPL', 1),
(2, 'Lab TKJ', 1),
(3, 'Lab Multimedia', 1),
(4, 'Lab Bahasa', 1),
(5, 'Lab Kimia', 1),

-- Ruang Kelas
(6, 'Kelas XII RPL 1', 2),
(7, 'Kelas XII RPL 2', 2),
(8, 'Kelas XII TKJ 1', 2),
(9, 'Kelas XI RPL 1', 2),
(10, 'Kelas X RPL 1', 2),

-- Ruang Guru
(11, 'Ruang Guru Utama', 3),
(12, 'Ruang BK', 3),
(13, 'Ruang Kepala Sekolah', 3),

-- Fasilitas Umum
(14, 'Toilet Putra Lt.1', 4),
(15, 'Toilet Putri Lt.1', 4),
(16, 'Kantin Sekolah', 4),
(17, 'Mushola', 4),
(18, 'Perpustakaan', 4),

-- Outdoor
(19, 'Lapangan Upacara', 5),
(20, 'Parkiran Motor Siswa', 5),
(21, 'Taman Sekolah', 5);

-- -----------------------------------------
-- 2.3 ITEMS (Barang-barang di setiap lokasi)
-- -----------------------------------------
INSERT INTO `pengaduan_sarpras_items` 
(`id_item`, `nama_item`, `deskripsi`, `foto`, `id_lokasi`, `file_id`) VALUES
-- Lab RPL
(1, 'Komputer PC', 'Komputer untuk praktik programming', NULL, 1, NULL),
(2, 'Meja Komputer', 'Meja komputer di Lab RPL', NULL, 1, NULL),
(3, 'Kursi Putar', 'Kursi untuk siswa praktik', NULL, 1, NULL),
(4, 'AC', 'AC Split Lab RPL', NULL, 1, NULL),
(5, 'Proyektor', 'Proyektor untuk presentasi', NULL, 1, NULL),

-- Lab TKJ
(6, 'Server Rack', 'Server untuk praktik jaringan', NULL, 2, NULL),
(7, 'Komputer PC', 'Komputer Lab TKJ', NULL, 2, NULL),
(8, 'Kabel LAN', 'Kabel jaringan', NULL, 2, NULL),
(9, 'Router Mikrotik', 'Router untuk praktik', NULL, 2, NULL),

-- Lab Multimedia
(10, 'Komputer Editing', 'PC spek tinggi untuk editing video', NULL, 3, NULL),
(11, 'Kamera DSLR', 'Kamera untuk praktik fotografi', NULL, 3, NULL),
(12, 'Tripod', 'Tripod kamera', NULL, 3, NULL),

-- Kelas XII RPL 1
(13, 'Meja Siswa', 'Meja belajar siswa', NULL, 6, NULL),
(14, 'Kursi Siswa', 'Kursi belajar siswa', NULL, 6, NULL),
(15, 'Papan Tulis', 'Whiteboard', NULL, 6, NULL),
(16, 'AC', 'AC ruang kelas', NULL, 6, NULL),
(17, 'Kipas Angin', 'Kipas angin dinding', NULL, 6, NULL),

-- Kelas XII RPL 2
(18, 'Meja Siswa', 'Meja belajar siswa', NULL, 7, NULL),
(19, 'Kursi Siswa', 'Kursi belajar siswa', NULL, 7, NULL),
(20, 'Papan Tulis', 'Whiteboard', NULL, 7, NULL),

-- Fasilitas Umum
(21, 'Kloset', 'Kloset toilet', NULL, 14, NULL),
(22, 'Wastafel', 'Wastafel toilet putra', NULL, 14, NULL),
(23, 'Kloset', 'Kloset toilet', NULL, 15, NULL),
(24, 'Wastafel', 'Wastafel toilet putri', NULL, 15, NULL),
(25, 'Meja Kantin', 'Meja makan kantin', NULL, 16, NULL),
(26, 'Kursi Kantin', 'Kursi kantin', NULL, 16, NULL),

-- Outdoor
(27, 'Tiang Bendera', 'Tiang bendera upacara', NULL, 19, NULL),
(28, 'Lampu Taman', 'Lampu penerangan taman', NULL, 21, NULL);

-- -----------------------------------------
-- 2.4 USER (Admin, Petugas, Pengguna)
-- -----------------------------------------
-- ⚠️ PENTING: Password untuk SEMUA user adalah "password123"
-- Hash bcrypt: $2b$10$mUmnR7Uc0Rvoos3ewSznueuXx51Q/Y2XFMwjvvbQl5EqncPxXz48K

INSERT INTO `pengaduan_sarpras_user` 
(`id_user`, `username`, `password`, `nama_pengguna`, `role`) VALUES
-- 1 Admin
(1, 'admin', '$2b$10$mUmnR7Uc0Rvoos3ewSznueuXx51Q/Y2XFMwjvvbQl5EqncPxXz48K', 'Administrator', 'admin'),

-- 2 Petugas
(2, 'petugas1', '$2b$10$mUmnR7Uc0Rvoos3ewSznueuXx51Q/Y2XFMwjvvbQl5EqncPxXz48K', 'Ahmad Fauzi', 'petugas'),
(3, 'petugas2', '$2b$10$mUmnR7Uc0Rvoos3ewSznueuXx51Q/Y2XFMwjvvbQl5EqncPxXz48K', 'Budi Santoso', 'petugas'),

-- 5 Pengguna (Siswa)
(4, 'siswa1', '$2b$10$mUmnR7Uc0Rvoos3ewSznueuXx51Q/Y2XFMwjvvbQl5EqncPxXz48K', 'Dani Setiawan', 'pengguna'),
(5, 'siswa2', '$2b$10$mUmnR7Uc0Rvoos3ewSznueuXx51Q/Y2XFMwjvvbQl5EqncPxXz48K', 'Eka Putri', 'pengguna'),
(6, 'siswa3', '$2b$10$mUmnR7Uc0Rvoos3ewSznueuXx51Q/Y2XFMwjvvbQl5EqncPxXz48K', 'Fajar Ramadhan', 'pengguna'),
(7, 'siswa4', '$2b$10$mUmnR7Uc0Rvoos3ewSznueuXx51Q/Y2XFMwjvvbQl5EqncPxXz48K', 'Gita Lestari', 'pengguna'),
(8, 'siswa5', '$2b$10$mUmnR7Uc0Rvoos3ewSznueuXx51Q/Y2XFMwjvvbQl5EqncPxXz48K', 'Hendra Wijaya', 'pengguna');

-- -----------------------------------------
-- 2.5 PETUGAS (Detail data petugas)
-- -----------------------------------------
INSERT INTO `pengaduan_sarpras_petugas` 
(`id_petugas`, `nama`, `gender`, `telp`, `id_user`) VALUES
(1, 'Ahmad Fauzi', 'L', '081234567890', 2),
(2, 'Budi Santoso', 'L', '081234567891', 3);

-- -----------------------------------------
-- 2.6 PENGADUAN SAMPLE (Berbagai status)
-- -----------------------------------------
INSERT INTO `pengaduan_sarpras_pengaduan` 
(`id_pengaduan`, `nama_pengaduan`, `deskripsi`, `foto`, `status`, `id_user`, `id_petugas`, `id_item`, `id_lokasi`, `id_temporary`, `tgl_pengajuan`, `tgl_selesai`, `saran_petugas`, `file_id`) VALUES

-- Pengaduan 1: SELESAI (untuk tunjukkan alur lengkap)
(1, 
 'Komputer Lab RPL Tidak Bisa Nyala', 
 'Komputer nomor 5 di Lab RPL tidak bisa menyala sejak kemarin. Sudah dicoba restart tetapi tetap tidak bisa.', 
 NULL, 
 'Selesai', 
 4, -- siswa1
 1, -- petugas1 (Ahmad Fauzi)
 1, -- Komputer PC
 1, -- Lab RPL
 NULL, 
 DATE_SUB(CURDATE(), INTERVAL 7 DAY), -- 7 hari lalu
 DATE_SUB(CURDATE(), INTERVAL 2 DAY), -- Selesai 2 hari lalu
 'Komputer sudah diperbaiki. Masalah pada kabel power yang longgar.',
 NULL),

-- Pengaduan 2: DIPROSES (sedang ditangani)
(2, 
 'AC Kelas XII RPL 1 Tidak Dingin', 
 'AC di kelas sudah dinyalakan dari pagi tapi ruangan tetap panas. Sepertinya freon habis.', 
 NULL, 
 'Diproses', 
 5, -- siswa2
 1, -- petugas1
 16, -- AC
 6, -- Kelas XII RPL 1
 NULL, 
 DATE_SUB(CURDATE(), INTERVAL 3 DAY), -- 3 hari lalu
 NULL, 
 'Sedang menunggu teknisi AC untuk pengecekan freon.',
 NULL),

-- Pengaduan 3: DISETUJUI (sudah disetujui, menunggu petugas)
(3, 
 'Kursi Kelas Patah', 
 'Kursi nomor 12 di kelas XII RPL 2 kakinya patah. Berbahaya kalau dipakai.', 
 NULL, 
 'Disetujui', 
 6, -- siswa3
 NULL, 
 19, -- Kursi Siswa
 7, -- Kelas XII RPL 2
 NULL, 
 DATE_SUB(CURDATE(), INTERVAL 2 DAY), -- 2 hari lalu
 NULL, 
 NULL,
 NULL),

-- Pengaduan 4: DIAJUKAN (baru masuk, belum ditangani)
(4, 
 'Proyektor Lab RPL Mati', 
 'Proyektor di Lab RPL tidak bisa nyala. Lampu indikator merah berkedip-kedip.', 
 NULL, 
 'Diajukan', 
 7, -- siswa4
 NULL, 
 5, -- Proyektor
 1, -- Lab RPL
 NULL, 
 DATE_SUB(CURDATE(), INTERVAL 1 DAY), -- Kemarin
 NULL, 
 NULL,
 NULL),

-- Pengaduan 5: DIAJUKAN (baru masuk hari ini)
(5, 
 'Toilet Putra Wastafel Mampet', 
 'Wastafel di toilet putra lantai 1 airnya tidak bisa mengalir. Sudah penuh air kotor.', 
 NULL, 
 'Diajukan', 
 8, -- siswa5
 NULL, 
 22, -- Wastafel
 14, -- Toilet Putra Lt.1
 NULL, 
 CURDATE(), -- Hari ini
 NULL, 
 NULL,
 NULL),

-- Pengaduan 6: DIPROSES (untuk demo update status)
(6, 
 'Kabel LAN Lab TKJ Putus', 
 'Kabel LAN di meja nomor 3 putus. Tidak bisa praktik jaringan.', 
 NULL, 
 'Diproses', 
 4, -- siswa1
 2, -- petugas2 (Budi Santoso)
 8, -- Kabel LAN
 2, -- Lab TKJ
 NULL, 
 DATE_SUB(CURDATE(), INTERVAL 1 DAY), -- Kemarin
 NULL, 
 'Sedang mencari kabel pengganti di gudang.',
 NULL),

-- Pengaduan 7: SELESAI (untuk statistik)
(7, 
 'Lampu Kelas Mati', 
 'Lampu neon di kelas XI RPL 1 mati 2 buah. Ruangan jadi gelap.', 
 NULL, 
 'Selesai', 
 5, -- siswa2
 1, -- petugas1
 NULL, -- Item tidak ada di list, bisa null
 9, -- Kelas XI RPL 1
 NULL, 
 DATE_SUB(CURDATE(), INTERVAL 5 DAY), -- 5 hari lalu
 DATE_SUB(CURDATE(), INTERVAL 1 DAY), -- Selesai kemarin
 'Lampu sudah diganti dengan yang baru.',
 NULL);

-- -----------------------------------------
-- 2.7 RIWAYAT AKSI (History perubahan status)
-- -----------------------------------------
INSERT INTO `pengaduan_sarpras_riwayat_aksi` 
(`id_riwayat`, `id_pengaduan`, `id_petugas`, `id_user`, `role_user`, `aksi`, `status_sebelumnya`, `status_baru`, `saran_petugas`, `created_at`) VALUES

-- Riwayat Pengaduan 1 (Komputer Lab RPL)
(1, 1, NULL, 4, 'pengguna', 'create_pengaduan', NULL, 'Diajukan', NULL, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(2, 1, 1, 2, 'petugas', 'update_status', 'Diajukan', 'Disetujui', NULL, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(3, 1, 1, 2, 'petugas', 'update_status', 'Disetujui', 'Diproses', 'Sedang mengecek komputer.', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 1, 1, 2, 'petugas', 'update_status', 'Diproses', 'Selesai', 'Komputer sudah diperbaiki. Masalah pada kabel power yang longgar.', DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Riwayat Pengaduan 2 (AC Kelas)
(5, 2, NULL, 5, 'pengguna', 'create_pengaduan', NULL, 'Diajukan', NULL, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(6, 2, 1, 2, 'petugas', 'update_status', 'Diajukan', 'Disetujui', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(7, 2, 1, 2, 'petugas', 'update_status', 'Disetujui', 'Diproses', 'Sedang menunggu teknisi AC untuk pengecekan freon.', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Riwayat Pengaduan 3 (Kursi Patah)
(8, 3, NULL, 6, 'pengguna', 'create_pengaduan', NULL, 'Diajukan', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(9, 3, 1, 2, 'petugas', 'update_status', 'Diajukan', 'Disetujui', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Riwayat Pengaduan 6 (Kabel LAN)
(10, 6, NULL, 4, 'pengguna', 'create_pengaduan', NULL, 'Diajukan', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(11, 6, 2, 3, 'petugas', 'update_status', 'Diajukan', 'Diproses', 'Sedang mencari kabel pengganti di gudang.', NOW()),

-- Riwayat Pengaduan 7 (Lampu Mati)
(12, 7, NULL, 5, 'pengguna', 'create_pengaduan', NULL, 'Diajukan', NULL, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(13, 7, 1, 2, 'petugas', 'update_status', 'Diajukan', 'Disetujui', NULL, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(14, 7, 1, 2, 'petugas', 'update_status', 'Disetujui', 'Diproses', 'Sedang mencari lampu pengganti.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(15, 7, 1, 2, 'petugas', 'update_status', 'Diproses', 'Selesai', 'Lampu sudah diganti dengan yang baru.', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- =============================================
-- PART 3: RESET AUTO INCREMENT
-- =============================================
-- Agar ID dimulai dari 1 lagi untuk data baru

ALTER TABLE `pengaduan_sarpras_kategori_lokasi` AUTO_INCREMENT = 6;
ALTER TABLE `pengaduan_sarpras_lokasi` AUTO_INCREMENT = 22;
ALTER TABLE `pengaduan_sarpras_items` AUTO_INCREMENT = 29;
ALTER TABLE `pengaduan_sarpras_user` AUTO_INCREMENT = 9;
ALTER TABLE `pengaduan_sarpras_petugas` AUTO_INCREMENT = 3;
ALTER TABLE `pengaduan_sarpras_pengaduan` AUTO_INCREMENT = 8;
ALTER TABLE `pengaduan_sarpras_riwayat_aksi` AUTO_INCREMENT = 16;
ALTER TABLE `pengaduan_sarpras_temporary_item` AUTO_INCREMENT = 1;
ALTER TABLE `notification_history` AUTO_INCREMENT = 1;
ALTER TABLE `fcm_tokens` AUTO_INCREMENT = 1;

-- =============================================
-- SELESAI!
-- =============================================

-- Cek hasil
SELECT 'Data berhasil di-reset!' AS Status;
SELECT COUNT(*) AS total_user FROM pengaduan_sarpras_user;
SELECT COUNT(*) AS total_pengaduan FROM pengaduan_sarpras_pengaduan;
SELECT COUNT(*) AS total_items FROM pengaduan_sarpras_items;
SELECT COUNT(*) AS total_lokasi FROM pengaduan_sarpras_lokasi;

-- Tampilkan ringkasan pengaduan per status
SELECT status, COUNT(*) AS jumlah 
FROM pengaduan_sarpras_pengaduan 
GROUP BY status
ORDER BY FIELD(status, 'Diajukan', 'Disetujui', 'Diproses', 'Selesai', 'Ditolak');
