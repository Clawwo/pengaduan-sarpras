-- =============================================
-- FIX: Trigger Validasi Pengaduan (Short Message)
-- =============================================
-- Dibuat: 18 November 2025
-- Fix: MESSAGE_TEXT dibatasi max 128 karakter oleh MySQL
-- =============================================

USE pengaduan_sarpras;

-- Drop trigger lama
DROP TRIGGER IF EXISTS `validatePengaduan`;

-- Buat trigger baru dengan pesan singkat
DELIMITER $$

CREATE TRIGGER `validatePengaduan` BEFORE INSERT ON `pengaduan_sarpras_pengaduan` FOR EACH ROW 
BEGIN
  DECLARE report_count INT;
  DECLARE existing_status VARCHAR(50);

  -- Cek pengaduan aktif dalam 2 hari terakhir
  SELECT COUNT(*), GROUP_CONCAT(DISTINCT status SEPARATOR ', ') 
  INTO report_count, existing_status
  FROM pengaduan_sarpras_pengaduan
  WHERE id_lokasi = NEW.id_lokasi
    AND id_item = NEW.id_item
    AND status IN ('Diajukan', 'Disetujui', 'Diproses')
    AND tgl_pengajuan >= DATE_SUB(CURDATE(), INTERVAL 2 DAY);

  -- Tolak jika sudah ada pengaduan aktif
  -- MESSAGE_TEXT MAX 128 chars!
  IF report_count >= 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = CONCAT('Item sedang diproses (', existing_status, '). Tunggu selesai dulu');
  END IF;
END$$

DELIMITER ;

-- =============================================
-- Test Query
-- =============================================
-- SELECT * FROM pengaduan_sarpras_pengaduan
-- WHERE status IN ('Diajukan', 'Disetujui', 'Diproses')
--   AND tgl_pengajuan >= DATE_SUB(CURDATE(), INTERVAL 2 DAY)
-- ORDER BY tgl_pengajuan DESC;
