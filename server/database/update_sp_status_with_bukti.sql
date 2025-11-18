-- =============================================
-- UPDATE STORED PROCEDURE: sp_update_pengaduan_status
-- =============================================
-- Dibuat: 18 November 2025
-- Update: Tambah parameter untuk gambar_bukti_selesai
-- =============================================

USE pengaduan_sarpras;

-- Hapus SP lama jika ada
DROP PROCEDURE IF EXISTS `sp_update_pengaduan_status`;

DELIMITER $$

CREATE PROCEDURE `sp_update_pengaduan_status`(
  IN p_id_pengaduan INT,
  IN p_status VARCHAR(50),
  IN p_saran_petugas TEXT,
  IN p_id_petugas INT,
  IN p_tgl_selesai DATETIME,
  IN p_gambar_bukti_selesai TEXT,
  IN p_file_id_bukti_selesai VARCHAR(255),
  OUT status_code INT,
  OUT message VARCHAR(255)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    SET status_code = 500;
    SET message = 'Database error occurred';
    ROLLBACK;
  END;

  START TRANSACTION;

  -- Cek apakah pengaduan ada
  IF NOT EXISTS (SELECT 1 FROM pengaduan_sarpras_pengaduan WHERE id_pengaduan = p_id_pengaduan) THEN
    SET status_code = 404;
    SET message = 'Pengaduan tidak ditemukan';
    ROLLBACK;
  ELSE
    -- Update pengaduan dengan gambar bukti (jika ada)
    UPDATE pengaduan_sarpras_pengaduan
    SET 
      status = p_status,
      saran_petugas = p_saran_petugas,
      id_petugas = p_id_petugas,
      tgl_selesai = p_tgl_selesai,
      gambar_bukti_selesai = p_gambar_bukti_selesai,
      file_id_bukti_selesai = p_file_id_bukti_selesai,
      updated_at = NOW()
    WHERE id_pengaduan = p_id_pengaduan;

    SET status_code = 200;
    SET message = 'Status pengaduan berhasil diperbarui';
    COMMIT;
  END IF;

END$$

DELIMITER ;

-- =============================================
-- SELESAI
-- =============================================
SELECT '✅ Stored Procedure sp_update_pengaduan_status berhasil diupdate!' AS status;
