import pool from "../config/dbConfig.js";

export const getAllItems = async () => {
  const [rows] = await pool.query(`
    SELECT i.id_item, i.nama_item, i.deskripsi, i.foto, i.file_id, l.nama_lokasi
    FROM pengaduan_sarpras_items i
    LEFT JOIN pengaduan_sarpras_lokasi l ON i.id_lokasi = l.id_lokasi
  `);
  return rows;
};

export const getItemById = async (id) => {
  const [rows] = await pool.query(
    `SELECT i.id_item, i.nama_item, i.deskripsi, i.foto, i.file_id, l.nama_lokasi
     FROM pengaduan_sarpras_items i
     LEFT JOIN pengaduan_sarpras_lokasi l ON i.id_lokasi = l.id_lokasi
     WHERE i.id_item = ?`,
    [id]
  );
  return rows[0];
};

export const createItem = async (
  nama_item,
  deskripsi,
  imageUrl,
  fileId,
  id_lokasi
) => {
  const [result] = await pool.query(
    "INSERT INTO pengaduan_sarpras_items (nama_item, deskripsi, foto, file_id, id_lokasi) VALUES (?,?,?,?,?)",
    [nama_item, deskripsi || null, imageUrl, fileId, id_lokasi]
  );
  return result.insertId;
};

export const updateItem = async (
  id,
  nama_item,
  deskripsi,
  id_lokasi,
  imageUrl,
  fileId
) => {
  await pool.query(
    `UPDATE pengaduan_sarpras_items 
     SET nama_item = ?, deskripsi = ?, id_lokasi = ?, foto = ?, file_id = ?
     WHERE id_item = ?`,
    [nama_item, deskripsi, id_lokasi, imageUrl, fileId, id]
  );
};

export const deleteItem = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM pengaduan_sarpras_items WHERE id_item = ?",
    [id]
  );
  return result.affectedRows;
};

export const getItemFileId = async (id) => {
  const [items] = await pool.query(
    "SELECT file_id FROM pengaduan_sarpras_items WHERE id_item = ?",
    [id]
  );
  return items[0]?.file_id;
};
