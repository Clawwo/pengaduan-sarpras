import {
  getAllLokasi as getAllLokasiService,
  getLokasiById as getLokasiByIdService,
  createLokasi as createLokasiService,
  updateLokasi as updateLokasiService,
  deleteLokasi as deleteLokasiService,
} from "../services/lokasiService.js";

// GET all lokasi
export const getAllLokasi = async (req, res) => {
  try {
    const rows = await getAllLokasiService();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET lokasi by ID
export const getLokasiById = async (req, res) => {
  try {
    const row = await getLokasiByIdService(req.params.id);
    if (!row)
      return res.status(404).json({ message: "Lokasi tidak ditemukan" });
    res.json(row);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE lokasi
export const createLokasi = async (req, res) => {
  try {
    const { nama_lokasi, id_kategori } = req.body;
    if (!nama_lokasi)
      return res.status(400).json({ message: "Nama lokasi wajib diisi" });
    if (!id_kategori)
      return res.status(400).json({ message: "Kategori lokasi wajib dipilih" });
    const id_lokasi = await createLokasiService(nama_lokasi, id_kategori);
    res.status(201).json({
      message: "Lokasi berhasil ditambahkan",
      id_lokasi,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE lokasi
export const updateLokasi = async (req, res) => {
  try {
    const { nama_lokasi, id_kategori } = req.body;
    if (!nama_lokasi)
      return res.status(400).json({ message: "Nama lokasi wajib diisi" });
    if (!id_kategori)
      return res.status(400).json({ message: "Kategori lokasi wajib dipilih" });
    const affectedRows = await updateLokasiService(req.params.id, nama_lokasi, id_kategori);
    if (affectedRows === 0)
      return res.status(404).json({ message: "Lokasi tidak ditemukan" });
    res.json({ message: "Lokasi berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE lokasi
export const deleteLokasi = async (req, res) => {
  try {
    const affectedRows = await deleteLokasiService(req.params.id);
    if (affectedRows === 0)
      return res.status(404).json({ message: "Lokasi tidak ditemukan" });
    res.json({ message: "Lokasi berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
