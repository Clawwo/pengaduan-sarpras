import pool from "../config/dbConfig.js";

// GET all lokasi
export const getAllLokasi = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM pengaduan_sarpras_lokasi");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET lokasi by ID
export const getLokasiById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM pengaduan_sarpras_lokasi WHERE id_lokasi = ?",
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Lokasi tidak ditemukan" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE lokasi
export const createLokasi = async (req, res) => {
  try {
    const { nama_lokasi } = req.body;
    if (!nama_lokasi)
      return res.status(400).json({ message: "Nama lokasi wajib diisi" });

    const [result] = await pool.query(
      "INSERT INTO pengaduan_sarpras_lokasi (nama_lokasi) VALUES (?)",
      [nama_lokasi]
    );

    res.status(201).json({
      message: "Lokasi berhasil ditambahkan",
      id_lokasi: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE lokasi
export const updateLokasi = async (req, res) => {
  try {
    const { nama_lokasi } = req.body;

    const [result] = await pool.query(
      "UPDATE pengaduan_sarpras_lokasi SET nama_lokasi = ? WHERE id_lokasi = ?",
      [nama_lokasi, req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Lokasi tidak ditemukan" });

    res.json({ message: "Lokasi berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE lokasi
export const deleteLokasi = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM pengaduan_sarpras_lokasi WHERE id_lokasi = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Lokasi tidak ditemukan" });

    res.json({ message: "Lokasi berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
