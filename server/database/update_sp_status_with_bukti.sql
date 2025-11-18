USE pengaduan_sarpras;

DROP PROCEDURE IF EXISTS sp_update_pengaduan_status;

DELIMITER $$

CREATE PROCEDURE sp_update_pengaduan_status(
  IN p_id_pengaduan INT,
  IN p_status VARCHAR(50),
  IN p_saran_petugas TEXT,
  IN p_id_petugas INT,
  IN p_gambar_bukti_selesai TEXT,
  IN p_file_id_bukti_selesai VARCHAR(255),
  OUT p_status_code INT,
  OUT p_message VARCHAR(255)
)
proc_block: BEGIN
  DECLARE v_exists INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    SET p_status_code = 500;
    SET p_message = 'Terjadi kesalahan database';
    ROLLBACK;
    LEAVE proc_block;
  END;

  START TRANSACTION;

  SELECT COUNT(*) INTO v_exists
  FROM pengaduan_sarpras_pengaduan
  WHERE id_pengaduan = p_id_pengaduan;

  IF v_exists = 0 THEN
    SET p_status_code = 404;
    SET p_message = 'Pengaduan tidak ditemukan';
    ROLLBACK;
    LEAVE proc_block;
  END IF;

  UPDATE pengaduan_sarpras_pengaduan
  SET 
      status = p_status,
      saran_petugas = p_saran_petugas,
      id_petugas = p_id_petugas,
      tgl_selesai = IF(p_status IN ('Selesai', 'Ditolak'), NOW(), NULL),
      gambar_bukti_selesai = p_gambar_bukti_selesai,
      file_id_bukti_selesai = p_file_id_bukti_selesai,
      updated_at = NOW()
  WHERE id_pengaduan = p_id_pengaduan;

  SET p_status_code = 200;
  SET p_message = 'Status pengaduan berhasil diperbarui';
  COMMIT;

END proc_block$$
DELIMITER ;
