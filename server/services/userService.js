import pool from "../config/dbConfig.js";
import bcrypt from "bcryptjs";

export const getUsers = async () => {
  const [rows] = await pool.query(
    "SELECT id_user, username, nama_pengguna, role FROM pengaduan_sarpras_user"
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
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    query += "password = ?, ";
    params.push(hashedPassword);
  }
  query = query.slice(0, -2);
  query += " WHERE id_user = ?";
  params.push(id_user);
  const [result] = await pool.query(query, params);
  return result.affectedRows;
};
