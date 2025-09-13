import pool from "../config/dbConfig.js";

export const getAllLokasi = async () => {
  const [rows] = await pool.query("SELECT * FROM pengaduan_sarpras_lokasi");
  return rows;
};

export const getLokasiById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM pengaduan_sarpras_lokasi WHERE id_lokasi = ?",
    [id]
  );
  return rows[0];
};

export const createLokasi = async (nama_lokasi) => {
  const [result] = await pool.query(
    "INSERT INTO pengaduan_sarpras_lokasi (nama_lokasi) VALUES (?)",
    [nama_lokasi]
  );
  return result.insertId;
};

export const updateLokasi = async (id, nama_lokasi) => {
  const [result] = await pool.query(
    "UPDATE pengaduan_sarpras_lokasi SET nama_lokasi = ? WHERE id_lokasi = ?",
    [nama_lokasi, id]
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
