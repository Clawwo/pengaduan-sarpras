import pool from "../config/dbConfig.js";

// List semua user
export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_user, username, nama_pengguna, role FROM pengaduan_sarpras_user"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data user" });
  }
};

// Detail user
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT id_user, username, nama_pengguna, role FROM pengaduan_sarpras_user WHERE id_user = ?",
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan" });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil detail user" });
  }
};

// Hapus user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM pengaduan_sarpras_user WHERE id_user = ?", [
      id,
    ]);
    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menghapus user" });
  }
};
