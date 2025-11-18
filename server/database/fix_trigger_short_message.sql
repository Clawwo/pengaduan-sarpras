-- =============================================
-- DATABASE FIXES & IMPROVEMENTS
-- =============================================
-- Dibuat: 18 November 2025
-- Catatan: 
-- 1. Fix trigger validasi pengaduan (pesan <128 chars)
-- 2. Tambah kolom gambar_bukti_selesai untuk bukti penyelesaian
-- =============================================

USE pengaduan_sarpras;

-- =============================================
-- 1. FIXED TRIGGER: Validasi Pengaduan
-- =============================================

-- Hapus trigger jika sudah ada
DROP TRIGGER IF EXISTS `validatePengaduan`;

DELIMITER $$

CREATE TRIGGER `validatePengaduan`
BEFORE INSERT ON `pengaduan_sarpras_pengaduan`
FOR EACH ROW
BEGIN
  DECLARE report_count INT DEFAULT 0;
  DECLARE existing_status VARCHAR(50) DEFAULT '';

  -- Ambil jumlah laporan aktif & statusnya
  SELECT 
      COUNT(*),
      LEFT(GROUP_CONCAT(DISTINCT status SEPARATOR ', '), 40) -- dibatasi agar pendek
  INTO report_count, existing_status
  FROM pengaduan_sarpras_pengaduan
  WHERE id_lokasi = NEW.id_lokasi
    AND id_item = NEW.id_item
    AND status IN ('Diajukan', 'Disetujui', 'Diproses')
    AND tgl_pengajuan >= DATE_SUB(CURDATE(), INTERVAL 2 DAY);

  -- Jika sudah ada yang aktif → tolak
  IF report_count >= 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = CONCAT('Pengaduan sudah ada & ', existing_status, ' - tunggu selesai');
  END IF;

END$$

DELIMITER ;

-- =============================================
-- 2. TAMBAH KOLOM GAMBAR BUKTI SELESAI
-- =============================================

-- Tambah kolom untuk URL gambar bukti penyelesaian
ALTER TABLE `pengaduan_sarpras_pengaduan`
ADD COLUMN IF NOT EXISTS `gambar_bukti_selesai` TEXT NULL COMMENT 'URL gambar bukti dari ImageKit' AFTER `file_id`;

-- Tambah kolom untuk file_id gambar bukti dari ImageKit
ALTER TABLE `pengaduan_sarpras_pengaduan`
ADD COLUMN IF NOT EXISTS `file_id_bukti_selesai` VARCHAR(255) NULL COMMENT 'ImageKit file ID untuk bukti selesai' AFTER `gambar_bukti_selesai`;

-- =============================================
-- SELESAI
-- =============================================
SELECT '✅ Database fixes applied successfully!' AS status;
