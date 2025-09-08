import pool from "../config/dbConfig.js";

// List petugas lengkap
export const getPetugas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id_petugas, u.id_user, u.username, u.nama_pengguna, u.role, 
              p.nama, p.gender, p.telp
       FROM pengaduan_sarpras_petugas p
       JOIN pengaduan_sarpras_user u ON p.id_user = u.id_user`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data petugas" });
  }
};

// Detail petugas
export const getPetugasById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT p.id_petugas, u.id_user, u.username, u.nama_pengguna, u.role, 
              p.nama, p.gender, p.telp
       FROM pengaduan_sarpras_petugas p
       JOIN pengaduan_sarpras_user u ON p.id_user = u.id_user
       WHERE p.id_petugas = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Petugas tidak ditemukan" });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil detail petugas" });
  }
};

// Hapus petugas + usernya
export const deletePetugas = async (req, res) => {
  try {
    const { id } = req.params;

    // Ambil id_user
    const [rows] = await pool.query(
      "SELECT id_user FROM pengaduan_sarpras_petugas WHERE id_petugas = ?",
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Petugas tidak ditemukan" });

    const idUser = rows[0].id_user;

    // Hapus petugas & user
    await pool.query(
      "DELETE FROM pengaduan_sarpras_petugas WHERE id_petugas = ?",
      [id]
    );
    await pool.query("DELETE FROM pengaduan_sarpras_user WHERE id_user = ?", [
      idUser,
    ]);

    res.json({ message: "Petugas berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menghapus petugas" });
  }
};
