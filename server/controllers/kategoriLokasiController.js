import {
  getAllKategoriLokasi as getAllKategoriLokasiService,
  getKategoriLokasiById as getKategoriLokasiByIdService,
  getLokasiByKategori as getLokasiByKategoriService,
} from "../services/kategoriLokasiService.js";

export const getAllKategoriLokasi = async (req, res) => {
  try {
    const data = await getAllKategoriLokasiService();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error getting kategori lokasi:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Gagal mengambil data kategori lokasi",
    });
  }
};

export const getKategoriLokasiById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getKategoriLokasiByIdService(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Kategori lokasi tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error getting kategori lokasi by id:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Gagal mengambil data kategori lokasi",
    });
  }
};

export const getLokasiByKategori = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getLokasiByKategoriService(id);

    res.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error("Error getting lokasi by kategori:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Gagal mengambil data lokasi",
    });
  }
};
