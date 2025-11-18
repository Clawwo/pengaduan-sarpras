-- =============================================
-- DATABASE FIXES & IMPROVEMENTS
-- =============================================
-- Dibuat: 18 November 2025
-- Fix: trigger validasi pesan <128 chars & kolom bukti selesai
-- =============================================

USE pengaduan_sarpras;

-- ======================================================
-- 1. FIX TRIGGER VALIDASI DUPLIKAT PENGADUAN (SAFE)
-- ======================================================

DROP TRIGGER IF EXISTS validatePengaduan;

DELIMITER $$

CREATE TRIGGER validatePengaduan
BEFORE INSERT ON pengaduan_sarpras_pengaduan
FOR EACH ROW
BEGIN
    DECLARE report_count INT DEFAULT 0;
    DECLARE existing_status VARCHAR(50) DEFAULT '';
    DECLARE short_message VARCHAR(128);

    SELECT 
        COUNT(*),
        LEFT(IFNULL(GROUP_CONCAT(DISTINCT status SEPARATOR ', '), ''), 30)
    INTO report_count, existing_status
    FROM pengaduan_sarpras_pengaduan
    WHERE id_lokasi = NEW.id_lokasi
      AND id_item     = NEW.id_item
      AND status IN ('Diajukan','Disetujui','Diproses')
      AND tgl_pengajuan >= DATE_SUB(CURDATE(), INTERVAL 2 DAY)
    LIMIT 1;

    IF report_count >= 1 THEN
        SET short_message = CONCAT('Duplikat laporan: ', existing_status);
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = short_message;
    END IF;

END$$

DELIMITER ;

-- ======================================================
-- 2. TAMBAH KOLOM GAMBAR BUKTI SELESAI (CROSS VERSION SAFE)
-- ======================================================

-- Tambah kolom gambar_bukti_selesai jika belum ada
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'pengaduan_sarpras_pengaduan'
    AND COLUMN_NAME = 'gambar_bukti_selesai'
) THEN
    ALTER TABLE pengaduan_sarpras_pengaduan
        ADD COLUMN gambar_bukti_selesai TEXT NULL COMMENT 'URL bukti penyelesaian';
END IF;

-- Tambah kolom file_id_bukti_selesai jika belum ada
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'pengaduan_sarpras_pengaduan'
    AND COLUMN_NAME = 'file_id_bukti_selesai'
) THEN
    ALTER TABLE pengaduan_sarpras_pengaduan
        ADD COLUMN file_id_bukti_selesai VARCHAR(255) NULL COMMENT 'File ID bukti penyelesaian';
END IF;

-- ======================================================
-- DONE
-- ======================================================
SELECT '✅ Database fixes applied successfully!' AS status;
