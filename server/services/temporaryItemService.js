import pool from "../config/dbConfig.js";

export const getAllTemporaryItems = async () => {
  const [rows] = await pool.query(`CALL GetTemporaryItems()`);
  return rows[0];
};

export const getTemporaryItemById = async (id) => {
  const [rows] = await pool.query(`CALL GetTemporaryItemById(?)`, [id]);
  return rows[0][0];
};

export const createTemporaryItem = async (nama_barang_baru, id_lokasi) => {
  const [result] = await pool.query(
    "INSERT INTO pengaduan_sarpras_temporary_item (nama_barang_baru, id_lokasi, status) VALUES (?, ?, 'Diproses')",
    [nama_barang_baru, id_lokasi || null]
  );
  return result.insertId;
};

export const updateTemporaryItem = async (id, nama_barang_baru, id_lokasi) => {
  const [result] = await pool.query(
    "UPDATE pengaduan_sarpras_temporary_item SET nama_barang_baru = ?, id_lokasi = ? WHERE id_temporary = ?",
    [nama_barang_baru, id_lokasi || null, id]
  );
  return result.affectedRows;
};

export const approveTemporaryItem = async (id, id_admin) => {
  try {
    // Call stored procedure with OUT parameters
    const [result] = await pool.query(
      "CALL sp_approve_temporary_item(?, ?, @new_item_id, @status_code, @message)",
      [id, id_admin]
    );

    // Get OUT parameters
    const [outParams] = await pool.query(
      "SELECT @new_item_id as newItemId, @status_code as statusCode, @message as message"
    );

    const { newItemId, statusCode, message } = outParams[0];

    // Handle errors based on status code
    if (statusCode === 404) {
      throw new Error(message || "Temporary item tidak ditemukan");
    } else if (statusCode === 400) {
      throw new Error(message || "Item sudah disetujui sebelumnya");
    } else if (statusCode === 500) {
      throw new Error(message || "Database error occurred");
    }

    return newItemId;
  } catch (error) {
    // If SP doesn't exist or columns missing, fallback to old method
    console.error("Error calling SP, using fallback method:", error.message);

    const [rows] = await pool.query(
      "SELECT * FROM pengaduan_sarpras_temporary_item WHERE id_temporary = ?",
      [id]
    );
    if (!rows.length) throw new Error("Temporary item tidak ditemukan");

    const tempItem = rows[0];

    // Check if already approved
    if (tempItem.status === "Disetujui") {
      throw new Error("Item sudah disetujui sebelumnya");
    }

    // Create official item
    const [ins] = await pool.query(
      "INSERT INTO pengaduan_sarpras_items (nama_item, id_lokasi) VALUES (?, ?)",
      [tempItem.nama_barang_baru, tempItem.id_lokasi]
    );
    const newItemId = ins.insertId;

    // Update temporary item status (using approved_by for id_admin and approved_at for timestamp)
    await pool.query(
      `UPDATE pengaduan_sarpras_temporary_item 
       SET status = 'Disetujui', 
           approved_by = ?,
           approved_at = NOW() 
       WHERE id_temporary = ?`,
      [id_admin, id]
    );

    // Update all related pengaduan
    await pool.query(
      "UPDATE pengaduan_sarpras_pengaduan SET id_item = ?, id_temporary = NULL WHERE id_temporary = ?",
      [newItemId, id]
    );

    return newItemId;
  }
};

export const rejectTemporaryItem = async (id, id_admin) => {
  try {
    // Call stored procedure with OUT parameters
    const [result] = await pool.query(
      "CALL sp_reject_temporary_item(?, ?, @status_code, @message)",
      [id, id_admin]
    );

    // Get OUT parameters
    const [outParams] = await pool.query(
      "SELECT @status_code as statusCode, @message as message"
    );

    const { statusCode, message } = outParams[0];

    // Handle errors based on status code
    if (statusCode === 404) {
      throw new Error(message || "Temporary item tidak ditemukan");
    } else if (statusCode === 400) {
      throw new Error(message || "Item sudah diproses sebelumnya");
    } else if (statusCode === 500) {
      throw new Error(message || "Database error occurred");
    }

    return true;
  } catch (error) {
    // If SP doesn't exist or columns missing, fallback to old method
    console.error("Error calling SP, using fallback method:", error.message);

    const [rows] = await pool.query(
      "SELECT * FROM pengaduan_sarpras_temporary_item WHERE id_temporary = ?",
      [id]
    );
    if (!rows.length) throw new Error("Temporary item tidak ditemukan");

    const tempItem = rows[0];

    // Check if already processed
    if (tempItem.status !== "Diproses") {
      throw new Error("Item sudah diproses sebelumnya");
    }

    // Update status to rejected (using approved_by for id_admin and approved_at for timestamp)
    await pool.query(
      `UPDATE pengaduan_sarpras_temporary_item 
       SET status = 'Ditolak', 
           approved_by = ?,
           approved_at = NOW() 
       WHERE id_temporary = ?`,
      [id_admin, id]
    );

    return true;
  }
};

export const deleteTemporaryItem = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM pengaduan_sarpras_temporary_item WHERE id_temporary = ?",
    [id]
  );
  return result.affectedRows;
};
