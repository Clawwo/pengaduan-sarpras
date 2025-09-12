import pool from "../config/dbConfig.js";
import imagekit from "../config/imageKitConfig.js";
import multer from "multer"; 

// GET all items
export const getAllItems = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.id_item, i.nama_item, i.deskripsi, i.foto, i.file_id, l.nama_lokasi
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
      SELECT i.id_item, i.nama_item, i.deskripsi, i.foto, i.file_id, l.nama_lokasi
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
export const createItem = async (req, res, next) => {
  try {
    const { nama_item, deskripsi, id_lokasi } = req.body;

    if (!nama_item || !id_lokasi) {
      return res
        .status(400)
        .json({ message: "Nama item dan lokasi wajib diisi" });
    }

    let imageUrl = null;
    let fileId = null;

    if (req.file) {
      const uploadResponse = await imagekit.upload({
        file: req.file.buffer,
        fileName: `item_${Date.now()}_${req.file.originalname}`,
        folder: "/Pengaduan_Sarpras/Items",
      });

      imageUrl = uploadResponse.url;
      fileId = uploadResponse.fileId;
    }

    const [result] = await pool.query(
      "INSERT INTO pengaduan_sarpras_items (nama_item, deskripsi, foto, file_id, id_lokasi) VALUES (?,?,?,?,?)",
      [nama_item, deskripsi || null, imageUrl, fileId, id_lokasi]
    );

    res.status(201).json({
      message: "Item berhasil ditambahkan",
      item: {
        id_item: result.insertId,
        nama_item,
        deskripsi,
        foto: imageUrl,
        file_id: fileId,
        id_lokasi,
      },
    });
  } catch (error) {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Ukuran file maksimal 2MB" });
      }
    }
    if (error.message === "Format file harus JPG atau PNG") {
      return res.status(400).json({ message: error.message });
    }

    console.error("Error createItem:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// UPDATE item
export const updateItem = async (req, res) => {
  const { id } = req.params;
  const { nama_item, deskripsi, id_lokasi } = req.body;
  const file = req.file;

  try {
    const [items] = await pool.query(
      "SELECT * FROM pengaduan_sarpras_items WHERE id_item = ?",
      [id]
    );

    if (items.length === 0) {
      return res.status(404).json({ message: "Item tidak ditemukan" });
    }

    const oldItem = items[0];
    let imageUrl = oldItem.foto;
    let fileId = oldItem.file_id;

    if (file) {
      // Hapus foto lama di ImageKit kalau ada
      if (fileId) {
        try {
          await imagekit.deleteFile(fileId);
        } catch (err) {
          console.warn("Gagal hapus foto lama:", err.message);
        }
      }

      // Upload foto baru
      const uploadResponse = await imagekit.upload({
        file: file.buffer,
        fileName: `item_${Date.now()}_${file.originalname}`,
        folder: "/Pengaduan_Sarpras/Items",
      });

      imageUrl = uploadResponse.url;
      fileId = uploadResponse.fileId;
    }

    await pool.query(
      `UPDATE pengaduan_sarpras_items 
       SET nama_item = ?, deskripsi = ?, id_lokasi = ?, foto = ?, file_id = ?
       WHERE id_item = ?`,
      [nama_item, deskripsi, id_lokasi, imageUrl, fileId, id]
    );

    res.json({
      message: "Item berhasil diperbarui",
      item: {
        id,
        nama_item,
        deskripsi,
        id_lokasi,
        foto: imageUrl,
        file_id: fileId,
      },
    });
  } catch (error) {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Ukuran file maksimal 2MB" });
      }
    }
    if (error.message === "Format file harus JPG atau PNG") {
      return res.status(400).json({ message: error.message });
    }

    console.error("Error update item:", error);
    res
      .status(500)
      .json({ message: "Gagal memperbarui item", error: error.message });
  }
};

// DELETE item
export const deleteItem = async (req, res) => {
  try {
    const [items] = await pool.query(
      "SELECT file_id FROM pengaduan_sarpras_items WHERE id_item = ?",
      [req.params.id]
    );

    if (items.length === 0) {
      return res.status(404).json({ message: "Item tidak ditemukan" });
    }

    const fileId = items[0].file_id;

    if (fileId) {
      try {
        await imagekit.deleteFile(fileId);
      } catch (err) {
        console.warn("Gagal hapus gambar di ImageKit:", err.message);
      }
    }

    const [result] = await pool.query(
      "DELETE FROM pengaduan_sarpras_items WHERE id_item = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Item tidak ditemukan" });

    res.json({ message: "Item berhasil dihapus" });
  } catch (error) {
    console.error("Error delete item:", error);
    res.status(500).json({ message: error.message });
  }
};
