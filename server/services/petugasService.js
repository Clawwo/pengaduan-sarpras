import pool from "../config/dbConfig.js";

export const getPetugas = async () => {
  const [rows] = await pool.query(`
    SELECT p.id_petugas, u.id_user, u.username, u.nama_pengguna, u.role, 
           p.nama, p.gender, p.telp
    FROM pengaduan_sarpras_petugas p
    JOIN pengaduan_sarpras_user u ON p.id_user = u.id_user
    ORDER BY p.id_petugas DESC`);
  return rows;
};

export const getPetugasById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT p.id_petugas, u.id_user, u.username, u.nama_pengguna, u.role, 
           p.nama, p.gender, p.telp
    FROM pengaduan_sarpras_petugas p
    JOIN pengaduan_sarpras_user u ON p.id_user = u.id_user
    WHERE p.id_petugas = ?`,
    [id]
  );
  return rows[0];
};

export const deletePetugas = async (id) => {
  const [rows] = await pool.query(
    "SELECT id_user FROM pengaduan_sarpras_petugas WHERE id_petugas = ?",
    [id]
  );
  if (!rows.length) return null;
  const idUser = rows[0].id_user;
  await pool.query(
    "DELETE FROM pengaduan_sarpras_petugas WHERE id_petugas = ?",
    [id]
  );
  await pool.query("DELETE FROM pengaduan_sarpras_user WHERE id_user = ?", [
    idUser,
  ]);
  return true;
};

export const updatePetugasProfile = async (
  id_petugas,
  { nama, gender, telp }
) => {
  const [result] = await pool.query(
    "UPDATE pengaduan_sarpras_petugas SET nama = ?, gender = ?, telp = ? WHERE id_petugas = ?",
    [nama, gender, telp, id_petugas]
  );
  return result.affectedRows;
};

// Helper: map id_user to id_petugas
export const getPetugasIdByUserId = async (id_user) => {
  const [rows] = await pool.query(
    "SELECT id_petugas FROM pengaduan_sarpras_petugas WHERE id_user = ?",
    [id_user]
  );
  return rows && rows[0] ? rows[0].id_petugas : null;
};
