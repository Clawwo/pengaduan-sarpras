import { uploadImage, deleteImage } from "../helpers/imageKitHelper.js";
import {
  createPengaduan as createPengaduanService,
  getAllPengaduan as getAllPengaduanService,
  getPengaduanByUser as getPengaduanByUserService,
  getPengaduanById as getPengaduanByIdService,
  updatePengaduanStatus as updatePengaduanStatusService,
  getPengaduanReport as getPengaduanReportService,
} from "../services/pengaduanService.js";

export const createPengaduan = async (req, res) => {
  try {
    const { nama_pengaduan, deskripsi, id_item, id_lokasi } = req.body;
    const id_user = req.user.id;

    if (!nama_pengaduan || !id_item || !id_lokasi) {
      return res
        .status(400)
        .json({ message: "Nama pengaduan, item, dan lokasi wajib diisi" });
    }

    let imageUrl = null;
    let fileId = null;

    if (req.file) {
      const uploadResponse = await uploadImage(
        req.file.buffer,
        req.file.originalname,
        "/Pengaduan_Sarpras/Pengaduan"
      );
      imageUrl = uploadResponse.url;
      fileId = uploadResponse.fileId;
    }

    await createPengaduanService({
      nama_pengaduan,
      deskripsi,
      foto: imageUrl,
      file_id: fileId,
      id_user,
      id_item,
      id_lokasi,
    });

    res.status(201).json({ message: "Pengaduan berhasil diajukan" });
  } catch (error) {
    console.error("Error createPengaduan:", error);
    if (error.sqlState === "45000") {
      return res.status(400).json({ message: error.sqlMessage });
    }
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const getAllPengaduan = async (req, res) => {
  try {
    const rows = await getAllPengaduanService();
    res.json(rows);
  } catch (error) {
    console.error("Error getAllPengaduan:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const getPengaduanByUser = async (req, res) => {
  try {
    const id_user = req.user.id;
    const rows = await getPengaduanByUserService(id_user);
    res.json(rows);
  } catch (error) {
    console.error("Error getPengaduanByUser:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const updatePengaduanStatus = async (req, res) => {
  try {
    const { id } = req.params; // id_pengaduan
    const { status, saran_petugas } = req.body;

    const oldData = await getPengaduanByIdService(id);
    if (!oldData) {
      return res.status(404).json({ message: "Pengaduan tidak ditemukan" });
    }
    let tgl_selesai = null;
    if (["Selesai", "Ditolak"].includes(status)) {
      tgl_selesai = new Date();
      if (oldData.file_id) {
        try {
          await deleteImage(oldData.file_id);
          console.log("Foto dihapus dari ImageKit:", oldData.file_id);
        } catch (err) {
          console.error("Gagal hapus foto dari ImageKit:", err.message);
        }
      }
    }
    const id_petugas = req.user.id;
    await updatePengaduanStatusService(
      id,
      status,
      saran_petugas,
      id_petugas,
      tgl_selesai
    );
    res.json({ message: "Status pengaduan berhasil diperbarui" });
  } catch (error) {
    console.error("Error updatePengaduanStatus:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const getPengaduanReport = async (req, res) => {
  try {
    const report = await getPengaduanReportService();
    res.json(report);
  } catch (error) {
    console.error("Error getPengaduanReport:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
