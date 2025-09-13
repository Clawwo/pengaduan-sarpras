import pool from "../config/dbConfig.js";
import bcrypt from "bcryptjs";

export const findUserByUsername = async (username) => {
  const [rows] = await pool.query(
    "SELECT * FROM pengaduan_sarpras_user WHERE username = ?",
    [username]
  );
  return rows[0];
};

export const isUsernameExist = async (username) => {
  const [rows] = await pool.query(
    "SELECT 1 FROM pengaduan_sarpras_user WHERE username = ?",
    [username]
  );
  return rows.length > 0;
};

export const createUser = async (username, password, nama_pengguna, role) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    "INSERT INTO pengaduan_sarpras_user (username, password, nama_pengguna, role) VALUES (?,?,?,?)",
    [username, hashedPassword, nama_pengguna, role]
  );
  return result.insertId;
};

export const createPetugas = async (nama, gender, telp, id_user) => {
  await pool.query(
    "INSERT INTO pengaduan_sarpras_petugas (nama, gender, telp, id_user) VALUES (?,?,?,?)",
    [nama, gender, telp || null, id_user]
  );
};
