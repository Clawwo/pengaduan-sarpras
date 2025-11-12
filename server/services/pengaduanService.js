// Laporan pengaduan yang diproses petugas
export const getPengaduanReport = async ({
  status,
  id_petugas,
  startDate,
  endDate,
}) => {
  let query = `SELECT p.id_pengaduan, p.nama_pengaduan, p.status, p.tgl_pengajuan, p.tgl_selesai, 
    u.nama_pengguna AS pelapor, pt.nama AS petugas, l.nama_lokasi, i.nama_item, p.saran_petugas
    FROM pengaduan_sarpras_pengaduan p
    JOIN pengaduan_sarpras_user u ON p.id_user = u.id_user
    JOIN pengaduan_sarpras_lokasi l ON p.id_lokasi = l.id_lokasi
    LEFT JOIN pengaduan_sarpras_items i ON p.id_item = i.id_item
    LEFT JOIN pengaduan_sarpras_petugas pt ON p.id_petugas = pt.id_petugas
    WHERE 1=1`;
  const params = [];
  if (status) {
    query += " AND p.status = ?";
    params.push(status);
  }
  if (id_petugas) {
    query += " AND p.id_petugas = ?";
    params.push(id_petugas);
  }
  if (startDate) {
    query += " AND p.tgl_pengajuan >= ?";
    params.push(startDate);
  }
  if (endDate) {
    query += " AND p.tgl_pengajuan <= ?";
    params.push(endDate);
  }
  query += " ORDER BY p.tgl_pengajuan DESC";
  const [rows] = await pool.query(query, params);
  return rows;
};
import pool from "../config/dbConfig.js";

export const createPengaduan = async (data) => {
  const {
    nama_pengaduan,
    deskripsi,
    foto,
    file_id,
    id_user,
    id_item,
    id_lokasi,
    id_temporary,
  } = data;

  try {
    console.log("🔍 Creating pengaduan with data:", {
      nama_pengaduan,
      deskripsi: deskripsi ? "present" : "null",
      foto: foto ? "present" : "null",
      file_id: file_id ? "present" : "null",
      id_user,
      id_item,
      id_lokasi,
      id_temporary,
    });

    // First, let's check if we can get MySQL warnings/errors
    try {
      // Call stored procedure with OUT parameters
      const [result] = await pool.query(
        "CALL sp_create_pengaduan(?, ?, ?, ?, ?, ?, ?, ?, @new_id, @status_code, @message)",
        [
          nama_pengaduan,
          deskripsi || null,
          foto,
          file_id,
          id_user,
          id_item,
          id_lokasi,
          id_temporary || null,
        ]
      );

      console.log("✅ Stored procedure executed, result:", result);

      // Check for MySQL warnings
      const [warnings] = await pool.query("SHOW WARNINGS");
      if (warnings.length > 0) {
        console.log("⚠️ MySQL Warnings:", warnings);
      }

      // Get OUT parameters
      const [outParams] = await pool.query(
        "SELECT @new_id as newId, @status_code as statusCode, @message as message"
      );

      console.log("📊 OUT parameters:", outParams[0]);

      const { newId, statusCode, message } = outParams[0];

      // Handle errors based on status code
      if (statusCode === 500) {
        console.error("❌ Database error from SP:", message);
        throw new Error(message || "Database error occurred");
      }

      console.log("✅ Pengaduan created successfully with ID:", newId);
      return newId;
    } catch (spError) {
      // Log the actual MySQL error
      console.error("❌ MySQL Error Details:", {
        code: spError.code,
        errno: spError.errno,
        sqlState: spError.sqlState,
        sqlMessage: spError.sqlMessage,
        sql: spError.sql,
        message: spError.message,
      });
      throw spError;
    }
  } catch (error) {
    console.error("❌ Error in createPengaduan service:", error);
    throw error;
  }
};

export const getAllPengaduan = async () => {
  const [rows] = await pool.query(
    `SELECT p.*, u.nama_pengguna, l.nama_lokasi, COALESCE(i.nama_item, ti.nama_barang_baru) AS nama_item, pt.nama as nama_petugas
     FROM pengaduan_sarpras_pengaduan p
     JOIN pengaduan_sarpras_user u ON p.id_user = u.id_user
     JOIN pengaduan_sarpras_lokasi l ON p.id_lokasi = l.id_lokasi
     LEFT JOIN pengaduan_sarpras_items i ON p.id_item = i.id_item
     LEFT JOIN pengaduan_sarpras_temporary_item ti ON p.id_temporary = ti.id_temporary
     LEFT JOIN pengaduan_sarpras_petugas pt ON p.id_petugas = pt.id_petugas
     ORDER BY p.created_at DESC`
  );
  return rows;
};

export const getPengaduanByUser = async (id_user) => {
  const [rows] = await pool.query(
    `SELECT p.*, l.nama_lokasi, COALESCE(i.nama_item, ti.nama_barang_baru) AS nama_item 
     FROM pengaduan_sarpras_pengaduan p
     JOIN pengaduan_sarpras_lokasi l ON p.id_lokasi = l.id_lokasi
     LEFT JOIN pengaduan_sarpras_items i ON p.id_item = i.id_item
     LEFT JOIN pengaduan_sarpras_temporary_item ti ON p.id_temporary = ti.id_temporary
     WHERE p.id_user = ?
     ORDER BY p.created_at DESC`,
    [id_user]
  );
  return rows;
};

export const getPengaduanById = async (id_pengaduan) => {
  const [rows] = await pool.query(
    "SELECT * FROM pengaduan_sarpras_pengaduan WHERE id_pengaduan = ?",
    [id_pengaduan]
  );
  return rows[0];
};

export const updatePengaduanStatus = async (
  id_pengaduan,
  status,
  saran_petugas,
  id_petugas,
  tgl_selesai
) => {
  // Call stored procedure with OUT parameters
  const [result] = await pool.query(
    "CALL sp_update_pengaduan_status(?, ?, ?, ?, ?, @status_code, @message)",
    [id_pengaduan, status, saran_petugas || null, id_petugas, tgl_selesai]
  );

  // Get OUT parameters
  const [outParams] = await pool.query(
    "SELECT @status_code as statusCode, @message as message"
  );

  const { statusCode, message } = outParams[0];

  // Handle errors based on status code
  if (statusCode === 404) {
    throw new Error(message || "Pengaduan tidak ditemukan");
  } else if (statusCode === 500) {
    throw new Error(message || "Database error occurred");
  }

  return true;
};
