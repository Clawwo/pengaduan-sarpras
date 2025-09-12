import pool from "../config/dbConfig.js";
import imagekit from "../config/imageKitConfig.js";

export const createPengaduan = async (req, res) => {
  try {
    const { nama_pengaduan, deskripsi, id_item, id_lokasi } = req.body;
    const id_user = req.user.id;

    if (!nama_pengaduan || !id_item || !id_lokasi) {
      return res
        .status(400)
        .json({ message: "Nama pengaduan, item, dan lokasi wajib diisi" });
    }

    let imageUrl = null;
    let fileId = null;

    if (req.file) {
      const uploadResponse = await imagekit.upload({
        file: req.file.buffer,
        fileName: `pengaduan_${Date.now()}_${req.file.originalname}`,
        folder: "/Pengaduan_Sarpras/Pengaduan",
      });

      imageUrl = uploadResponse.url;
      fileId = uploadResponse.fileId;
    }

    await pool.query(
      `INSERT INTO pengaduan_sarpras_pengaduan 
        (nama_pengaduan, deskripsi, foto, file_id, id_user, id_item, id_lokasi, status, tgl_pengajuan) 
       VALUES (?,?,?,?,?,?,?, 'Diajukan', CURDATE())`,
      [
        nama_pengaduan,
        deskripsi || null,
        imageUrl,
        fileId,
        id_user,
        id_item,
        id_lokasi,
      ]
    );

    res.status(201).json({ message: "Pengaduan berhasil diajukan" });
  } catch (error) {
    console.error("Error createPengaduan:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const getAllPengaduan = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.nama_pengguna, l.nama_lokasi, i.nama_item, pt.nama as nama_petugas
       FROM pengaduan_sarpras_pengaduan p
       JOIN pengaduan_sarpras_user u ON p.id_user = u.id_user
       JOIN pengaduan_sarpras_lokasi l ON p.id_lokasi = l.id_lokasi
       JOIN pengaduan_sarpras_items i ON p.id_item = i.id_item
       LEFT JOIN pengaduan_sarpras_petugas pt ON p.id_petugas = pt.id_petugas
       ORDER BY p.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error getAllPengaduan:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const getPengaduanByUser = async (req, res) => {
  try {
    const id_user = req.user.id;
    const [rows] = await pool.query(
      `SELECT p.*, l.nama_lokasi, i.nama_item 
       FROM pengaduan_sarpras_pengaduan p
       JOIN pengaduan_sarpras_lokasi l ON p.id_lokasi = l.id_lokasi
       JOIN pengaduan_sarpras_items i ON p.id_item = i.id_item
       WHERE p.id_user = ?
       ORDER BY p.created_at DESC`,
      [id_user]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error getPengaduanByUser:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const updatePengaduanStatus = async (req, res) => {
  try {
    const { id } = req.params; // id_pengaduan
    const { status, saran_petugas } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM pengaduan_sarpras_pengaduan WHERE id_pengaduan = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Pengaduan tidak ditemukan" });
    }

    const oldData = rows[0];
    let tgl_selesai = null;

    if (["Selesai", "Ditolak"].includes(status)) {
      tgl_selesai = new Date();

      if (oldData.file_id) {
        try {
          await imagekit.deleteFile(oldData.file_id);
          console.log("Foto dihapus dari ImageKit:", oldData.file_id);
        } catch (err) {
          console.error("Gagal hapus foto dari ImageKit:", err.message);
        }
      }
    }

    // Ambil id_petugas dari token
    const id_petugas = req.user.id;

    await pool.query(
      `UPDATE pengaduan_sarpras_pengaduan 
       SET status = ?, id_petugas = ?, saran_petugas = ?, tgl_selesai = ? 
       WHERE id_pengaduan = ?`,
      [status, id_petugas, saran_petugas || null, tgl_selesai, id]
    );

    res.json({ message: "Status pengaduan berhasil diperbarui" });
  } catch (error) {
    console.error("Error updatePengaduanStatus:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
