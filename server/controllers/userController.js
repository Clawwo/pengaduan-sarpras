import pool from "../config/dbConfig.js";
import bcrpyt from "bcryptjs";

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

export const updateProfile = async (req, res) => {
  try {
    const id_user = req.user.id;
    const { nama_pengguna, username, password } = req.body;

    // Validasi input
    if (!nama_pengguna && !username && !password) {
      return res.status(400).json({ message: "Tidak ada data yang diubah" });
    }

    let query = "UPDATE pengaduan_sarpras_user SET ";
    let params = [];

    if (nama_pengguna) {
      query += "nama_pengguna = ?, ";
      params.push(nama_pengguna);
    }

    if (username) {
      query += "username = ?, ";
      params.push(username);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += "password = ?, ";
      params.push(hashedPassword);
    }

    // hapus koma terakhir
    query = query.slice(0, -2);

    query += " WHERE id_user = ?";
    params.push(id_user);

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({ message: "Profil berhasil diperbarui" });
  } catch (error) {
    console.error("Error updateProfile:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
