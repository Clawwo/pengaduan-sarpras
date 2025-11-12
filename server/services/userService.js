import pool from "../config/dbConfig.js";
import bcrypt from "bcrypt";

export const getUsers = async () => {
  const [rows] = await pool.query(
    "SELECT id_user AS id_pengguna, username, nama_pengguna, role FROM pengaduan_sarpras_user ORDER BY id_user DESC"
  );
  return rows;
};

export const getUserById = async (id) => {
  const [rows] = await pool.query(
    "SELECT id_user, username, nama_pengguna, role FROM pengaduan_sarpras_user WHERE id_user = ?",
    [id]
  );
  return rows[0];
};

export const deleteUser = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM pengaduan_sarpras_user WHERE id_user = ?",
    [id]
  );
  return result.affectedRows;
};

export const updateProfile = async (
  id_user,
  { nama_pengguna, username, password }
) => {
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
  query = query.slice(0, -2);
  query += " WHERE id_user = ?";
  params.push(id_user);
  const [result] = await pool.query(query, params);
  return result.affectedRows;
};

export const createUser = async ({
  nama_pengguna,
  username,
  password,
  role,
}) => {
  // Check if username already exists
  const [existing] = await pool.query(
    "SELECT id_user FROM pengaduan_sarpras_user WHERE username = ?",
    [username]
  );

  if (existing.length > 0) {
    throw new Error("Username sudah terdaftar");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert new user
  const [result] = await pool.query(
    "INSERT INTO pengaduan_sarpras_user (nama_pengguna, username, password, role) VALUES (?, ?, ?, ?)",
    [nama_pengguna, username, hashedPassword, role]
  );

  return result.insertId;
};

export const updateUser = async (
  id,
  { nama_pengguna, username, password, role }
) => {
  // Check if username already exists (excluding current user)
  if (username) {
    const [existing] = await pool.query(
      "SELECT id_user FROM pengaduan_sarpras_user WHERE username = ? AND id_user != ?",
      [username, id]
    );

    if (existing.length > 0) {
      throw new Error("Username sudah terdaftar");
    }
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
  if (role) {
    query += "role = ?, ";
    params.push(role);
  }

  query = query.slice(0, -2);
  query += " WHERE id_user = ?";
  params.push(id);

  const [result] = await pool.query(query, params);
  return result.affectedRows;
};
