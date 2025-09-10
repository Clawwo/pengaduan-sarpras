import pool from "../config/dbConfig.js";

// GET all items
export const getAllItems = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.id_item, i.nama_item, i.deskripsi, i.foto, l.nama_lokasi
      FROM pengaduan_sarpras_items i
      LEFT JOIN pengaduan_sarpras_lokasi l ON i.id_lokasi = l.id_lokasi
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET item by id
export const getItemById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT i.id_item, i.nama_item, i.deskripsi, i.foto, l.nama_lokasi
      FROM pengaduan_sarpras_items i
      LEFT JOIN pengaduan_sarpras_lokasi l ON i.id_lokasi = l.id_lokasi
      WHERE i.id_item = ?
      `,
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Item tidak ditemukan" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE item
export const createItem = async (req, res) => {
  try {
    const { nama_item, deskripsi, foto, id_lokasi } = req.body;

    if (!nama_item) {
      return res.status(400).json({ message: "Nama item wajib diisi" });
    }

    const [result] = await pool.query(
      "INSERT INTO pengaduan_sarpras_items (nama_item, deskripsi, foto, id_lokasi) VALUES (?,?,?,?)",
      [nama_item, deskripsi || null, foto || null, id_lokasi || null]
    );

    res.status(201).json({
      message: "Item berhasil ditambahkan",
      id_item: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE item
export const updateItem = async (req, res) => {
  try {
    const { nama_item, deskripsi, foto, id_lokasi } = req.body;

    const [result] = await pool.query(
      "UPDATE pengaduan_sarpras_items SET nama_item=?, deskripsi=?, foto=?, id_lokasi=? WHERE id_item=?",
      [nama_item, deskripsi, foto, id_lokasi, req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Item tidak ditemukan" });

    res.json({ message: "Item berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE item
export const deleteItem = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM pengaduan_sarpras_items WHERE id_item = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Item tidak ditemukan" });

    res.json({ message: "Item berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
