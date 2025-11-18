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

-- Method 1: Menggunakan PROCEDURE untuk check column exists
DELIMITER $$

DROP PROCEDURE IF EXISTS AddColumnIfNotExists $$

CREATE PROCEDURE AddColumnIfNotExists(
    IN tableName VARCHAR(64),
    IN columnName VARCHAR(64),
    IN columnDefinition TEXT
)
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    SELECT COUNT(*)
    INTO column_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = tableName
      AND COLUMN_NAME = columnName;
    
    IF column_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', tableName, ' ADD COLUMN ', columnName, ' ', columnDefinition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END $$

DELIMITER ;

-- Tambah kolom menggunakan procedure
CALL AddColumnIfNotExists(
    'pengaduan_sarpras_pengaduan', 
    'gambar_bukti_selesai', 
    'TEXT NULL COMMENT ''URL bukti penyelesaian'''
);

CALL AddColumnIfNotExists(
    'pengaduan_sarpras_pengaduan', 
    'file_id_bukti_selesai', 
    'VARCHAR(255) NULL COMMENT ''File ID bukti penyelesaian'''
);

-- Hapus procedure setelah digunakan
DROP PROCEDURE IF EXISTS AddColumnIfNotExists;

-- ======================================================
-- DONE
-- ======================================================
SELECT '✅ Database fixes applied successfully!' AS status;