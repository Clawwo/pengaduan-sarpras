import pool from "../config/dbConfig.js";

/**
 * Mencatat riwayat aksi petugas/admin terhadap pengaduan
 * @param {Object} data - Data riwayat aksi
 * @param {number} data.id_pengaduan - ID pengaduan
 * @param {number|null} data.id_petugas - ID petugas (null jika admin)
 * @param {number} data.id_user - ID user yang melakukan aksi
 * @param {string} data.role_user - Role user ('petugas' atau 'admin')
 * @param {string} data.aksi - Deskripsi aksi yang dilakukan
 * @param {string|null} data.status_sebelumnya - Status sebelum diubah
 * @param {string} data.status_baru - Status setelah diubah
 * @param {string|null} data.saran_petugas - Saran dari petugas
 */
export const createRiwayatAksi = async (data) => {
  const {
    id_pengaduan,
    id_petugas,
    id_user,
    role_user,
    aksi,
    status_sebelumnya,
    status_baru,
    saran_petugas,
  } = data;

  try {
    const [result] = await pool.query(
      `INSERT INTO pengaduan_sarpras_riwayat_aksi 
        (id_pengaduan, id_petugas, id_user, role_user, aksi, status_sebelumnya, status_baru, saran_petugas)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_pengaduan,
        id_petugas,
        id_user,
        role_user,
        aksi,
        status_sebelumnya,
        status_baru,
        saran_petugas,
      ]
    );
    return result.insertId;
  } catch (error) {
    console.error("Error creating riwayat aksi:", error);
    throw error;
  }
};

/**
 * Mendapatkan semua riwayat aksi dengan filter (untuk admin)
 * @param {Object} filters - Filter options
 * @param {number} filters.id_petugas - Filter by petugas
 * @param {string} filters.startDate - Filter tanggal mulai
 * @param {string} filters.endDate - Filter tanggal akhir
 * @param {string} filters.status - Filter by status
 * @param {string} filters.search - Search keyword
 * @param {number} filters.page - Halaman (default: 1)
 * @param {number} filters.limit - Jumlah per halaman (default: 20)
 */
export const getAllRiwayatAksi = async (filters = {}) => {
  const {
    id_petugas,
    startDate,
    endDate,
    status,
    search,
    page = 1,
    limit = 20,
  } = filters;

  let query = `
    SELECT 
      r.*,
      p.nama_pengaduan,
      p.status as status_pengaduan_sekarang,
      pt.nama as nama_petugas,
      u.nama_pengguna as nama_user,
      u.username as username_user,
      l.nama_lokasi,
      COALESCE(i.nama_item, ti.nama_barang_baru) AS nama_item
    FROM pengaduan_sarpras_riwayat_aksi r
    JOIN pengaduan_sarpras_pengaduan p ON r.id_pengaduan = p.id_pengaduan
    JOIN pengaduan_sarpras_user u ON r.id_user = u.id_user
    LEFT JOIN pengaduan_sarpras_petugas pt ON r.id_petugas = pt.id_petugas
    LEFT JOIN pengaduan_sarpras_lokasi l ON p.id_lokasi = l.id_lokasi
    LEFT JOIN pengaduan_sarpras_items i ON p.id_item = i.id_item
    LEFT JOIN pengaduan_sarpras_temporary_item ti ON p.id_temporary = ti.id_temporary
    WHERE 1=1
  `;

  const params = [];

  // Filter by petugas
  if (id_petugas) {
    query += " AND r.id_petugas = ?";
    params.push(id_petugas);
  }

  // Filter by date range
  if (startDate) {
    query += " AND DATE(r.created_at) >= ?";
    params.push(startDate);
  }
  if (endDate) {
    query += " AND DATE(r.created_at) <= ?";
    params.push(endDate);
  }

  // Filter by status baru
  if (status) {
    query += " AND r.status_baru = ?";
    params.push(status);
  }

  // Search in nama pengaduan, nama petugas, atau aksi
  if (search) {
    query += ` AND (
      p.nama_pengaduan LIKE ? OR 
      pt.nama LIKE ? OR 
      r.aksi LIKE ? OR
      r.saran_petugas LIKE ?
    )`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  // Order by terbaru
  query += " ORDER BY r.created_at DESC";

  // Hitung total untuk pagination
  const countQuery = query.replace(
    /SELECT.*FROM/s,
    "SELECT COUNT(*) as total FROM"
  );
  const [countResult] = await pool.query(countQuery, params);
  const total = countResult[0]?.total || 0;

  // Pagination
  const offset = (page - 1) * limit;
  query += " LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const [rows] = await pool.query(query, params);

  return {
    data: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Mendapatkan riwayat aksi untuk satu pengaduan tertentu
 * @param {number} id_pengaduan - ID pengaduan
 */
export const getRiwayatAksiByPengaduan = async (id_pengaduan) => {
  const [rows] = await pool.query(
    `SELECT 
      r.*,
      pt.nama as nama_petugas,
      u.nama_pengguna as nama_user,
      u.username as username_user
    FROM pengaduan_sarpras_riwayat_aksi r
    JOIN pengaduan_sarpras_user u ON r.id_user = u.id_user
    LEFT JOIN pengaduan_sarpras_petugas pt ON r.id_petugas = pt.id_petugas
    WHERE r.id_pengaduan = ?
    ORDER BY r.created_at DESC`,
    [id_pengaduan]
  );
  return rows;
};

/**
 * Mendapatkan statistik riwayat aksi
 */
export const getRiwayatAksiStatistics = async () => {
  const [stats] = await pool.query(`
    SELECT 
      COUNT(*) as total_aksi,
      COUNT(DISTINCT id_pengaduan) as total_pengaduan_ditangani,
      COUNT(DISTINCT id_petugas) as total_petugas_aktif,
      SUM(CASE WHEN status_baru = 'Selesai' THEN 1 ELSE 0 END) as total_selesai,
      SUM(CASE WHEN status_baru = 'Ditolak' THEN 1 ELSE 0 END) as total_ditolak,
      SUM(CASE WHEN status_baru = 'Diproses' THEN 1 ELSE 0 END) as total_diproses,
      SUM(CASE WHEN role_user = 'petugas' THEN 1 ELSE 0 END) as aksi_oleh_petugas,
      SUM(CASE WHEN role_user = 'admin' THEN 1 ELSE 0 END) as aksi_oleh_admin
    FROM pengaduan_sarpras_riwayat_aksi
  `);
  return stats[0] || {};
};

/**
 * Mendapatkan riwayat aksi per petugas (untuk ranking/leaderboard)
 */
export const getRiwayatAksiPerPetugas = async () => {
  const [rows] = await pool.query(`
    SELECT 
      pt.id_petugas,
      pt.nama as nama_petugas,
      COUNT(*) as total_aksi,
      SUM(CASE WHEN r.status_baru = 'Selesai' THEN 1 ELSE 0 END) as total_selesai,
      SUM(CASE WHEN r.status_baru = 'Ditolak' THEN 1 ELSE 0 END) as total_ditolak,
      SUM(CASE WHEN r.status_baru = 'Diproses' THEN 1 ELSE 0 END) as total_diproses,
      MAX(r.created_at) as aksi_terakhir
    FROM pengaduan_sarpras_riwayat_aksi r
    JOIN pengaduan_sarpras_petugas pt ON r.id_petugas = pt.id_petugas
    WHERE r.id_petugas IS NOT NULL
    GROUP BY pt.id_petugas, pt.nama
    ORDER BY total_aksi DESC
  `);
  return rows;
};
