import {
  getAllRiwayatAksi as getAllRiwayatAksiService,
  getRiwayatAksiByPengaduan as getRiwayatAksiByPengaduanService,
  getRiwayatAksiStatistics as getRiwayatAksiStatisticsService,
  getRiwayatAksiPerPetugas as getRiwayatAksiPerPetugasService,
} from "../services/riwayatAksiService.js";

/**
 * Mendapatkan semua riwayat aksi dengan filter (Admin only)
 */
export const getAllRiwayatAksi = async (req, res) => {
  try {
    const {
      id_petugas,
      startDate,
      endDate,
      status,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const filters = {
      id_petugas: id_petugas ? parseInt(id_petugas) : undefined,
      startDate,
      endDate,
      status,
      search,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const result = await getAllRiwayatAksiService(filters);
    res.json(result);
  } catch (error) {
    console.error("Error getAllRiwayatAksi:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

/**
 * Mendapatkan riwayat aksi untuk satu pengaduan tertentu
 */
export const getRiwayatAksiByPengaduan = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await getRiwayatAksiByPengaduanService(id);
    res.json(rows);
  } catch (error) {
    console.error("Error getRiwayatAksiByPengaduan:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

/**
 * Mendapatkan statistik riwayat aksi
 */
export const getRiwayatAksiStatistics = async (req, res) => {
  try {
    const stats = await getRiwayatAksiStatisticsService();
    res.json(stats);
  } catch (error) {
    console.error("Error getRiwayatAksiStatistics:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

/**
 * Mendapatkan riwayat aksi per petugas (leaderboard)
 */
export const getRiwayatAksiPerPetugas = async (req, res) => {
  try {
    const rows = await getRiwayatAksiPerPetugasService();
    res.json(rows);
  } catch (error) {
    console.error("Error getRiwayatAksiPerPetugas:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
