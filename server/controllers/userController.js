import pool from "../config/dbConfig.js";
import bcrypt from "bcryptjs";

export const ambilSemuaPengguna = async (req, res) => {
  try {
    const [query] = await pool.query(
      "SELECT id_user, username, nama_pengguna, role FROM pengaduan_sarpras_user"
    );
    res.json(query);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const ambilPenggunaById = async (req, res) => {
  try {
    const { id_user } = req.params;
    const [query] = await pool.query(
      "SELECT id_user, username, nama_pengguna, role FROM pengaduan_sarpras_user WHERE id_user = ?",
      [id_user]
    );
    if (query.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }
    res.status(200).json(query[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const updatePengguna = async (req, res) => {
  try {
    const { id_pengguna } = req.params;
    const { username, nama_pengguna, role } = req.body;

    const [cekPengguna] = await pool.query(
      "SELECT * FROM pengaduan_sarpras_user WHERE id_user = ?",
      [id_pengguna]
    );

    if (cekPengguna.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    await pool.query(
      "UPDATE pengaduan_sarpras_user SET username = ?, nama_pengguna = ?, role = ? WHERE id_user = ?",
      [username, nama_pengguna, role, id_pengguna]
    );

    res.json({ message: "Data pengguna berhasil diperbarui" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Gagal memperbarui data pengguna" });
  }
};

export const hapusPengguna = async (req, res) => {
  try {
    const { id_pengguna } = req.params;
    const [query] = await pool.query(
      "DELETE FROM pengaduan_sarpras_user WHERE id_user = ?",
      [id_pengguna]
    );
    if (query.affectedRows === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }
    res.json({ message: "Pengguna berhasil dihapus" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Gagal menghapus pengguna" });
  }
};
