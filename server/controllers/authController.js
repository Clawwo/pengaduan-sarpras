import jwt from "jsonwebtoken";
import pool from "../config/dbConfig.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    const { username, password, nama_pengguna } = req.body;

    // Validasi input
    if (!username || username.length < 3) {
      return res.status(400).json({ message: "Username minimal 3 karakter" });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password minimal 8 karakter" });
    }
    if (!nama_pengguna || nama_pengguna.trim() === "") {
      return res.status(400).json({ message: "Nama pengguna wajib diisi" });
    }

    const [checkUser] = await pool.query(
      "SELECT * FROM pengaduan_sarpras_user WHERE username = ?",
      [username]
    );
    if (checkUser.length > 0) {
      return res.status(400).json({ message: "Username sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO pengaduan_sarpras_user (username, password, nama_pengguna, role) VALUES (?,?,?,?)",
      [username, hashedPassword, nama_pengguna, "pengguna"]
    );

    res.status(201).json({ message: "Registrasi berhasil" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username dan password wajib diisi" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM pengaduan_sarpras_user WHERE username = ?",
      [username]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: "Username atau password salah" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Username atau password salah" });
    }

    const token = jwt.sign(
      { id: user.id_user, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id_user,
        username: user.username,
        nama_pengguna: user.nama_pengguna,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const registerPetugas = async (req, res) => {
  try {
    const { username, password, nama_pengguna } = req.body;

    // Validasi input
    if (!username || username.length < 3) {
      return res.status(400).json({ message: "Username minimal 3 karakter" });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password minimal 8 karakter" });
    }
    if (!nama_pengguna || nama_pengguna.trim() === "") {
      return res.status(400).json({ message: "Nama pengguna wajib diisi" });
    }

    const [checkUser] = await pool.query(
      "SELECT * FROM pengaduan_sarpras_user WHERE username = ?",
      [username]
    );
    if (checkUser.length > 0) {
      return res.status(400).json({ message: "Username sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO pengaduan_sarpras_user (username, password, nama_pengguna, role) VALUES (?,?,?,?)",
      [username, hashedPassword, nama_pengguna, "petugas"]
    );

    res.status(201).json({ message: "Petugas berhasil ditambahkan" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
