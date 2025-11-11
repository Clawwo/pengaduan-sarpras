import pool from "../config/dbConfig.js";

export const getAllLokasi = async () => {
  const [rows] = await pool.query(`
    SELECT l.*, k.nama_kategori 
    FROM pengaduan_sarpras_lokasi l
    LEFT JOIN pengaduan_sarpras_kategori_lokasi k ON l.id_kategori = k.id_kategori
    ORDER BY l.id_lokasi DESC
  `);
  return rows;
};

export const getLokasiById = async (id) => {
  const [rows] = await pool.query(
    `SELECT l.*, k.nama_kategori 
     FROM pengaduan_sarpras_lokasi l
     LEFT JOIN pengaduan_sarpras_kategori_lokasi k ON l.id_kategori = k.id_kategori
     WHERE l.id_lokasi = ?`,
    [id]
  );
  return rows[0];
};

export const createLokasi = async (nama_lokasi, id_kategori) => {
  const [result] = await pool.query(
    "INSERT INTO pengaduan_sarpras_lokasi (nama_lokasi, id_kategori) VALUES (?, ?)",
    [nama_lokasi, id_kategori]
  );
  return result.insertId;
};

export const updateLokasi = async (id, nama_lokasi, id_kategori) => {
  const [result] = await pool.query(
    "UPDATE pengaduan_sarpras_lokasi SET nama_lokasi = ?, id_kategori = ? WHERE id_lokasi = ?",
    [nama_lokasi, id_kategori, id]
  );
  return result.affectedRows;
};

export const deleteLokasi = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM pengaduan_sarpras_lokasi WHERE id_lokasi = ?",
    [id]
  );
  return result.affectedRows;
};
