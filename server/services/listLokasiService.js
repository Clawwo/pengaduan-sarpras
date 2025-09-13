import pool from "../config/dbConfig.js";

export const getAllListLokasi = async () => {
  const [rows] = await pool.query(`
    SELECT ll.id_list, l.nama_lokasi, i.nama_item
    FROM pengaduan_sarpras_list_lokasi ll
    JOIN pengaduan_sarpras_lokasi l ON ll.id_lokasi = l.id_lokasi
    JOIN pengaduan_sarpras_items i ON ll.id_item = i.id_item
  `);
  return rows;
};

export const getListLokasiById = async (id) => {
  const [rows] = await pool.query(
    `SELECT ll.id_list, l.nama_lokasi, i.nama_item
     FROM pengaduan_sarpras_list_lokasi ll
     JOIN pengaduan_sarpras_lokasi l ON ll.id_lokasi = l.id_lokasi
     JOIN pengaduan_sarpras_items i ON ll.id_item = i.id_item
     WHERE ll.id_list = ?`,
    [id]
  );
  return rows[0];
};

export const createListLokasi = async (id_lokasi, id_item) => {
  const [result] = await pool.query(
    "INSERT INTO pengaduan_sarpras_list_lokasi (id_lokasi, id_item) VALUES (?, ?)",
    [id_lokasi, id_item]
  );
  return result.insertId;
};

export const updateListLokasi = async (id, id_lokasi, id_item) => {
  const [result] = await pool.query(
    "UPDATE pengaduan_sarpras_list_lokasi SET id_lokasi = ?, id_item = ? WHERE id_list = ?",
    [id_lokasi, id_item, id]
  );
  return result.affectedRows;
};

export const deleteListLokasi = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM pengaduan_sarpras_list_lokasi WHERE id_list = ?",
    [id]
  );
  return result.affectedRows;
};
