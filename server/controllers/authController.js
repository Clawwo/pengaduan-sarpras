import jwt from "jsonwebtoken";
import pool from "../config/dbConfig.js";
import bcrypt from "bcryptjs";

const sendError = (res, status, message) =>
  res.status(status).json({ message });

export const register = async (req, res) => {
  try {
    const { username, password, nama_pengguna } = req.body;

    const [checkUser] = await pool.query(
      "SELECT 1 FROM pengaduan_sarpras_user WHERE username = ?",
      [username]
    );
    if (checkUser.length)
      return sendError(res, 400, "Username sudah terdaftar");

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO pengaduan_sarpras_user (username, password, nama_pengguna, role) VALUES (?,?,?,?)",
      [username, hashedPassword, nama_pengguna, "pengguna"]
    );

    res.status(201).json({ message: "Registrasi berhasil" });
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Terjadi kesalahan server");
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM pengaduan_sarpras_user WHERE username = ?",
      [username]
    );
    if (!rows.length)
      return sendError(res, 400, "Username atau password salah");

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(res, 400, "Username atau password salah");

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
    sendError(res, 500, "Terjadi kesalahan server");
  }
};

export const registerPetugas = async (req, res) => {
  try {
    const { username, password, nama_pengguna, nama, gender, telp } = req.body;

    const [checkUser] = await pool.query(
      "SELECT 1 FROM pengaduan_sarpras_user WHERE username = ?",
      [username]
    );
    if (checkUser.length)
      return sendError(res, 400, "Username sudah terdaftar");

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await pool.query(
      "INSERT INTO pengaduan_sarpras_user (username, password, nama_pengguna, role) VALUES (?,?,?,?)",
      [username, hashedPassword, nama_pengguna, "petugas"]
    );

    await pool.query(
      "INSERT INTO pengaduan_sarpras_petugas (nama, gender, telp, id_user) VALUES (?,?,?,?)",
      [nama, gender, telp || null, userResult.insertId]
    );

    res.status(201).json({ message: "Petugas berhasil ditambahkan" });
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Terjadi kesalahan server");
  }
};
