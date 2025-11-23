-- =============================================
-- MIGRATION: ADD MULTIPLE IMAGES SUPPORT
-- =============================================
-- Menambahkan kolom untuk support multiple images
-- pada pengaduan (foto_pengaduan akan menjadi JSON array)
-- =============================================

-- 1. Tambah kolom baru untuk menyimpan array file_id
ALTER TABLE pengaduan_sarpras_pengaduan 
ADD COLUMN foto_ids TEXT NULL COMMENT 'JSON array of ImageKit file IDs for multiple images' 
AFTER file_id;

-- 2. Update kolom foto menjadi TEXT untuk JSON array URLs
ALTER TABLE pengaduan_sarpras_pengaduan 
MODIFY COLUMN foto TEXT NULL COMMENT 'JSON array of image URLs (multiple images support)';

-- 3. Update existing data: convert single image to array format
UPDATE pengaduan_sarpras_pengaduan 
SET 
  foto = JSON_ARRAY(foto),
  foto_ids = JSON_ARRAY(file_id)
WHERE foto IS NOT NULL AND foto != ''
  AND JSON_VALID(foto) = 0; -- Only update if not already JSON

-- 4. Set NULL values to empty JSON array (optional, untuk konsistensi)
UPDATE pengaduan_sarpras_pengaduan 
SET foto = JSON_ARRAY(), foto_ids = JSON_ARRAY()
WHERE foto IS NULL OR foto = '';

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Cek struktur tabel
DESCRIBE pengaduan_sarpras_pengaduan;

-- Cek data sample
SELECT 
  id_pengaduan,
  nama_pengaduan,
  foto,
  file_id,
  foto_ids,
  JSON_LENGTH(foto) as jumlah_foto
FROM pengaduan_sarpras_pengaduan
LIMIT 5;

-- =============================================
-- NOTES
-- =============================================
-- Format JSON: ["url1", "url2", "url3"]
-- Format foto_ids: ["file_id1", "file_id2", "file_id3"]
-- Max 5 images per pengaduan (divalidasi di backend)
-- 
-- Untuk multiple bukti penyelesaian:
-- Gunakan file terpisah: add_multiple_bukti_support.sql
-- =============================================
