import pool from "../config/dbConfig.js";

export const getAllTemporaryItems = async () => {
  const [rows] = await pool.query(`
    SELECT ti.*, l.nama_lokasi 
    FROM pengaduan_sarpras_temporary_item ti
    LEFT JOIN pengaduan_sarpras_lokasi l ON ti.id_lokasi = l.id_lokasi`);
  return rows;
};

export const getTemporaryItemById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT ti.*, l.nama_lokasi 
    FROM pengaduan_sarpras_temporary_item ti
    LEFT JOIN pengaduan_sarpras_lokasi l ON ti.id_lokasi = l.id_lokasi
    WHERE ti.id_temporary = ?`,
    [id]
  );
  return rows[0];
};

export const createTemporaryItem = async (nama_barang_baru, id_lokasi) => {
  const [result] = await pool.query(
    "INSERT INTO pengaduan_sarpras_temporary_item (nama_barang_baru, id_lokasi) VALUES (?, ?)",
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

export const approveTemporaryItem = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM pengaduan_sarpras_temporary_item WHERE id_temporary = ?",
    [id]
  );
  if (!rows.length) return null;
  const tempItem = rows[0];
  const [ins] = await pool.query(
    "INSERT INTO pengaduan_sarpras_items (nama_item, id_lokasi) VALUES (?, ?)",
    [tempItem.nama_barang_baru, tempItem.id_lokasi]
  );
  const newItemId = ins.insertId;
  // Update all related pengaduan to reference the new official item
  await pool.query(
    "UPDATE pengaduan_sarpras_pengaduan SET id_item = ?, id_temporary = NULL WHERE id_temporary = ?",
    [newItemId, id]
  );
  await pool.query(
    "DELETE FROM pengaduan_sarpras_temporary_item WHERE id_temporary = ?",
    [id]
  );
  return true;
};

export const deleteTemporaryItem = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM pengaduan_sarpras_temporary_item WHERE id_temporary = ?",
    [id]
  );
  return result.affectedRows;
};
