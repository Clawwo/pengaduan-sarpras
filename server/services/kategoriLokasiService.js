import pool from "../config/dbConfig.js";

export const getAllKategoriLokasi = async () => {
  const [rows] = await pool.query(`
    SELECT k.*, COUNT(l.id_lokasi) as jumlah_lokasi
    FROM pengaduan_sarpras_kategori_lokasi k
    LEFT JOIN pengaduan_sarpras_lokasi l ON k.id_kategori = l.id_kategori
    GROUP BY k.id_kategori
    ORDER BY k.nama_kategori
  `);
  return rows;
};

export const getKategoriLokasiById = async (id) => {
  const [rows] = await pool.query(
    `SELECT k.*, COUNT(l.id_lokasi) as jumlah_lokasi
     FROM pengaduan_sarpras_kategori_lokasi k
     LEFT JOIN pengaduan_sarpras_lokasi l ON k.id_kategori = l.id_kategori
     WHERE k.id_kategori = ?
     GROUP BY k.id_kategori`,
    [id]
  );
  return rows[0];
};

export const getLokasiByKategori = async (id_kategori) => {
  const [rows] = await pool.query(
    `SELECT l.*, COUNT(DISTINCT i.id_item) as jumlah_item
     FROM pengaduan_sarpras_lokasi l
     LEFT JOIN pengaduan_sarpras_items i ON l.id_lokasi = i.id_lokasi
     WHERE l.id_kategori = ?
     GROUP BY l.id_lokasi
     ORDER BY l.nama_lokasi`,
    [id_kategori]
  );
  return rows;
};
