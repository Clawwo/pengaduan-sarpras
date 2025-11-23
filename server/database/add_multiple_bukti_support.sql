-- =============================================
-- MIGRATION: ADD MULTIPLE BUKTI IMAGES SUPPORT
-- =============================================

-- 1. Pastikan kolom gambar_bukti_selesai sudah TEXT dan bisa menyimpan JSON array
ALTER TABLE pengaduan_sarpras_pengaduan 
MODIFY COLUMN gambar_bukti_selesai TEXT NULL 
COMMENT 'JSON array of completion proof image URLs (up to 5 images)';

-- 2. Tambah kolom bukti_selesai_ids jika belum ada (ANTI ERROR & aman dijalankan berulang)
SET @col_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE LOWER(TABLE_SCHEMA) = LOWER(DATABASE())
    AND LOWER(TABLE_NAME) = LOWER('pengaduan_sarpras_pengaduan')
    AND LOWER(COLUMN_NAME) = LOWER('bukti_selesai_ids')
);

SET @sql := IF(
    @col_exists = 0,
    'ALTER TABLE pengaduan_sarpras_pengaduan ADD COLUMN bukti_selesai_ids TEXT NULL COMMENT ''JSON array of completion proof ImageKit file IDs'' AFTER file_id_bukti_selesai;',
    'SELECT ''Column bukti_selesai_ids already exists, skipping...'';'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


-- 3. Convert data lama (string) menjadi JSON array
UPDATE pengaduan_sarpras_pengaduan 
SET 
  gambar_bukti_selesai = JSON_ARRAY(gambar_bukti_selesai),
  bukti_selesai_ids = CASE 
    WHEN file_id_bukti_selesai IS NOT NULL AND file_id_bukti_selesai != '' 
    THEN JSON_ARRAY(file_id_bukti_selesai)
    ELSE bukti_selesai_ids
  END
WHERE gambar_bukti_selesai IS NOT NULL 
  AND gambar_bukti_selesai != ''
  AND JSON_VALID(gambar_bukti_selesai) = 0;

-- =============================================
-- VERIFIKASI STRUKTUR KOLOM
-- =============================================

SELECT 
  COLUMN_NAME,
  COLUMN_TYPE,
  COLUMN_COMMENT,
  IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE LOWER(TABLE_SCHEMA) = LOWER(DATABASE())
  AND LOWER(TABLE_NAME) = LOWER('pengaduan_sarpras_pengaduan')
  AND COLUMN_NAME IN ('gambar_bukti_selesai', 'file_id_bukti_selesai', 'bukti_selesai_ids')
ORDER BY ORDINAL_POSITION;

-- =============================================
-- SAMPLE DATA CHECK
-- =============================================

SELECT 
  id_pengaduan,
  nama_pengaduan,
  status,
  gambar_bukti_selesai,
  file_id_bukti_selesai,
  bukti_selesai_ids,
  CASE 
    WHEN gambar_bukti_selesai IS NOT NULL AND JSON_VALID(gambar_bukti_selesai) = 1 
    THEN JSON_LENGTH(gambar_bukti_selesai)
    ELSE 0
  END as jumlah_bukti
FROM pengaduan_sarpras_pengaduan
WHERE gambar_bukti_selesai IS NOT NULL
LIMIT 5;


-- =============================================
-- CEK JIKA ADA DATA YANG BELUM VALID JSON
-- =============================================

SELECT 
  COUNT(*) as total_belum_convert,
  GROUP_CONCAT(id_pengaduan) as id_list
FROM pengaduan_sarpras_pengaduan
WHERE gambar_bukti_selesai IS NOT NULL 
  AND gambar_bukti_selesai != ''
  AND JSON_VALID(gambar_bukti_selesai) = 0;


-- =============================================
-- ROLLBACK (Jika ingin revert ke mode single image kembali)
-- =============================================

/*
UPDATE pengaduan_sarpras_pengaduan 
SET 
  gambar_bukti_selesai = JSON_UNQUOTE(JSON_EXTRACT(gambar_bukti_selesai, '$[0]')),
  file_id_bukti_selesai = JSON_UNQUOTE(JSON_EXTRACT(bukti_selesai_ids, '$[0]'))
WHERE gambar_bukti_selesai IS NOT NULL 
  AND JSON_VALID(gambar_bukti_selesai) = 1;

ALTER TABLE pengaduan_sarpras_pengaduan 
DROP COLUMN bukti_selesai_ids;
*/
