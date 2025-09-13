import {
  getPetugas as getPetugasService,
  getPetugasById as getPetugasByIdService,
  deletePetugas as deletePetugasService,
  updatePetugasProfile as updatePetugasProfileService,
} from "../services/petugasService.js";

// List petugas lengkap
export const getPetugas = async (req, res) => {
  try {
    const rows = await getPetugasService();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data petugas" });
  }
};

// Detail petugas
export const getPetugasById = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await getPetugasByIdService(id);
    if (!row)
      return res.status(404).json({ message: "Petugas tidak ditemukan" });
    res.json(row);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil detail petugas" });
  }
};

// Hapus petugas + usernya
export const deletePetugas = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deletePetugasService(id);
    if (!result)
      return res.status(404).json({ message: "Petugas tidak ditemukan" });
    res.json({ message: "Petugas berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menghapus petugas" });
  }
};

// Edit profile petugas
export const editPetugasProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, gender, telp } = req.body;
    const affectedRows = await updatePetugasProfileService(id, {
      nama,
      gender,
      telp,
    });
    if (affectedRows === 0)
      return res
        .status(404)
        .json({ message: "Petugas tidak ditemukan atau tidak ada perubahan" });
    res.json({ message: "Profil petugas berhasil diperbarui" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal memperbarui profil petugas" });
  }
};
