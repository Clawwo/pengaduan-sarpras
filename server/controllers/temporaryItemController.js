import pool from "../config/dbConfig.js";

// GET all temporary items
export const getAllTemporaryItems = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ti.*, l.nama_lokasi 
       FROM pengaduan_sarpras_temporary_item ti
       LEFT JOIN pengaduan_sarpras_lokasi l ON ti.id_lokasi = l.id_lokasi`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET temporary item by id
export const getTemporaryItemById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ti.*, l.nama_lokasi 
       FROM pengaduan_sarpras_temporary_item ti
       LEFT JOIN pengaduan_sarpras_lokasi l ON ti.id_lokasi = l.id_lokasi
       WHERE ti.id_temporary = ?`,
      [req.params.id]
    );

    if (rows.length === 0)
      return res
        .status(404)
        .json({ message: "Temporary item tidak ditemukan" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE temporary item
export const createTemporaryItem = async (req, res) => {
  try {
    const { nama_barang_baru, id_lokasi } = req.body;
    if (!nama_barang_baru)
      return res.status(400).json({ message: "Nama barang baru wajib diisi" });

    const [result] = await pool.query(
      "INSERT INTO pengaduan_sarpras_temporary_item (nama_barang_baru, id_lokasi) VALUES (?, ?)",
      [nama_barang_baru, id_lokasi || null]
    );

    res.status(201).json({
      message: "Temporary item berhasil ditambahkan",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE temporary item
export const updateTemporaryItem = async (req, res) => {
  try {
    const { nama_barang_baru, id_lokasi } = req.body;

    const [result] = await pool.query(
      "UPDATE pengaduan_sarpras_temporary_item SET nama_barang_baru = ?, id_lokasi = ? WHERE id_temporary = ?",
      [nama_barang_baru, id_lokasi || null, req.params.id]
    );

    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ message: "Temporary item tidak ditemukan" });
    res.json({ message: "Temporary item berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveTemporaryItem = async (req, res) => {
  try {
    const { id } = req.params;

    // cek apakah item ada
    const [rows] = await pool.query(
      "SELECT * FROM pengaduan_sarpras_temporary_item WHERE id_temporary = ?",
      [id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Temporary item tidak ditemukan" });
    }

    const tempItem = rows[0];

    // pindahkan ke tabel items resmi
    await pool.query(
      "INSERT INTO pengaduan_sarpras_items (nama_item, id_lokasi) VALUES (?, ?)",
      [tempItem.nama_barang_baru, tempItem.id_lokasi]
    );

    // hapus dari tabel temporary
    await pool.query(
      "DELETE FROM pengaduan_sarpras_temporary_item WHERE id_temporary = ?",
      [id]
    );

    res.json({ message: "Item berhasil dipindahkan ke items resmi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// DELETE temporary item
export const deleteTemporaryItem = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM pengaduan_sarpras_temporary_item WHERE id_temporary = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ message: "Temporary item tidak ditemukan" });
    res.json({ message: "Temporary item berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
