import pool from "../config/dbConfig.js";

// GET all list lokasi
export const getAllListLokasi = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ll.id_list, l.nama_lokasi, i.nama_item
      FROM pengaduan_sarpras_list_lokasi ll
      JOIN pengaduan_sarpras_lokasi l ON ll.id_lokasi = l.id_lokasi
      JOIN pengaduan_sarpras_items i ON ll.id_item = i.id_item
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET list lokasi by id
export const getListLokasiById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT ll.id_list, l.nama_lokasi, i.nama_item
      FROM pengaduan_sarpras_list_lokasi ll
      JOIN pengaduan_sarpras_lokasi l ON ll.id_lokasi = l.id_lokasi
      JOIN pengaduan_sarpras_items i ON ll.id_item = i.id_item
      WHERE ll.id_list = ?
      `,
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "List lokasi tidak ditemukan" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE list lokasi
export const createListLokasi = async (req, res) => {
  try {
    const { id_lokasi, id_item } = req.body;
    if (!id_lokasi || !id_item) {
      return res
        .status(400)
        .json({ message: "id_lokasi dan id_item wajib diisi" });
    }

    const [result] = await pool.query(
      "INSERT INTO pengaduan_sarpras_list_lokasi (id_lokasi, id_item) VALUES (?, ?)",
      [id_lokasi, id_item]
    );

    res.status(201).json({
      message: "List lokasi berhasil ditambahkan",
      id_list: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE list lokasi
export const updateListLokasi = async (req, res) => {
  try {
    const { id_lokasi, id_item } = req.body;

    const [result] = await pool.query(
      "UPDATE pengaduan_sarpras_list_lokasi SET id_lokasi = ?, id_item = ? WHERE id_list = ?",
      [id_lokasi, id_item, req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "List lokasi tidak ditemukan" });

    res.json({ message: "List lokasi berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE list lokasi
export const deleteListLokasi = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM pengaduan_sarpras_list_lokasi WHERE id_list = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "List lokasi tidak ditemukan" });

    res.json({ message: "List lokasi berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
