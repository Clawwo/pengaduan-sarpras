import { uploadImage, deleteImage } from "../helpers/imageKitHelper.js";
import {
  createTemporaryItem as createTemporaryItemService,
  approveTemporaryItem as approveTemporaryItemService,
} from "../services/temporaryItemService.js";
import { getPetugasIdByUserId as getPetugasIdByUserIdService } from "../services/petugasService.js";
import {
  createPengaduan as createPengaduanService,
  getAllPengaduan as getAllPengaduanService,
  getPengaduanByUser as getPengaduanByUserService,
  getPengaduanById as getPengaduanByIdService,
  updatePengaduanStatus as updatePengaduanStatusService,
  getPengaduanReport as getPengaduanReportService,
} from "../services/pengaduanService.js";
import { createRiwayatAksi as createRiwayatAksiService } from "../services/riwayatAksiService.js";
import {
  notifyAdmins,
  notifyPetugas,
  notifyUser,
} from "./notificationController.js";

export const createPengaduan = async (req, res) => {
  try {
    const { nama_pengaduan, deskripsi, id_item, id_lokasi, nama_item_baru } =
      req.body;
    const id_user = req.user.id;

    // Get id_temporary from body if provided (already created by client)
    let id_temporary_from_body = req.body.id_temporary || null;

    if (!nama_pengaduan || !id_lokasi) {
      return res
        .status(400)
        .json({ message: "Nama pengaduan dan lokasi wajib diisi" });
    }
    // Require either existing item, new item name, or temporary item id
    if (!id_item && !nama_item_baru && !id_temporary_from_body) {
      return res.status(400).json({ message: "Pilih item atau isi item baru" });
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

    // If user proposes a new item via nama_item_baru, create a temporary item entry
    let final_id_temporary = id_temporary_from_body;
    if (!id_item && !final_id_temporary && nama_item_baru) {
      try {
        final_id_temporary = await createTemporaryItemService(
          nama_item_baru,
          id_lokasi
        );
      } catch (err) {
        console.error("Gagal membuat temporary item:", err);
        return res
          .status(500)
          .json({ message: "Gagal membuat item baru sementara" });
      }
    }

    await createPengaduanService({
      nama_pengaduan,
      deskripsi,
      foto: imageUrl,
      file_id: fileId,
      id_user,
      // Pass null when item is proposed and awaiting approval
      id_item: id_item || null,
      id_lokasi,
      id_temporary: final_id_temporary,
    });

    // 🔔 Kirim notifikasi ke admin dan petugas dengan pesan berbeda
    try {
      // Notif untuk Admin: Fokus ke tindakan review
      await notifyAdmins(
        {
          title: "📋 Pengaduan Baru Masuk",
          body: `${nama_pengaduan} memerlukan peninjauan Anda`,
        },
        {
          url: "/admin/pengaduan",
          type: "new_pengaduan",
          role_target: "admin",
        }
      );

      // Notif untuk Petugas: Fokus ke tindakan penanganan
      await notifyPetugas(
        {
          title: "🔧 Tugas Baru",
          body: `${nama_pengaduan} perlu ditangani`,
        },
        {
          url: "/petugas/pengaduan",
          type: "new_pengaduan",
          role_target: "petugas",
        }
      );

      console.log("✅ Notifikasi terkirim ke admin & petugas");
    } catch (notifError) {
      console.error("⚠️ Gagal kirim notifikasi:", notifError);
      // Jangan blok pengaduan jika notifikasi gagal
    }

    res.status(201).json({ message: "Pengaduan berhasil diajukan" });
  } catch (error) {
    console.error("Error createPengaduan:", error);

    // Handle MySQL trigger error (SQLSTATE 45000)
    if (error.sqlState === "45000" || error.code === "ER_SIGNAL_EXCEPTION") {
      const triggerMessage =
        error.sqlMessage || error.message || "Pengaduan tidak dapat diajukan";

      // Expand short message from trigger for better UX
      let userMessage = triggerMessage;
      if (triggerMessage.includes("sedang diproses")) {
        userMessage = `Pengaduan untuk item ini sudah ada dan sedang dalam penanganan. ${triggerMessage}`;
      }

      return res.status(400).json({
        message: userMessage,
      });
    }

    // Handle duplicate entry or other validation errors
    if (
      error.message &&
      (error.message.includes("sudah disetujui") ||
        error.message.includes("sedang diproses") ||
        error.message.includes("dalam 2 hari terakhir"))
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    // Log MySQL error details for debugging
    if (error.errno) {
      console.error("MySQL Error Details:", {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan server",
      detail:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
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

    console.log("📨 Update status request:", { id, status, saran_petugas });

    const oldData = await getPengaduanByIdService(id);
    if (!oldData) {
      return res.status(404).json({ message: "Pengaduan tidak ditemukan" });
    }

    let gambar_bukti_url = null;
    let gambar_bukti_fileId = null;

    // 🔥 HAPUS bagian set tgl_selesai manual - biarkan trigger yang handle
    if (status === "Selesai" && req.file) {
      try {
        const uploadResponse = await uploadImage(
          req.file.buffer,
          req.file.originalname,
          "/Pengaduan_Sarpras/Bukti_Selesai"
        );
        gambar_bukti_url = uploadResponse.url;
        gambar_bukti_fileId = uploadResponse.fileId;
        console.log(
          "✅ Gambar bukti selesai berhasil diupload:",
          uploadResponse.url
        );
      } catch (err) {
        console.error("⚠️ Gagal upload gambar bukti:", err.message);
        return res
          .status(500)
          .json({ message: "Gagal upload gambar bukti penyelesaian" });
      }
    }

    // Hapus foto pengaduan lama dari ImageKit jika status Selesai/Ditolak
    if (["Selesai", "Ditolak"].includes(status) && oldData.file_id) {
      try {
        await deleteImage(oldData.file_id);
        console.log("Foto pengaduan dihapus dari ImageKit:", oldData.file_id);
      } catch (err) {
        console.error("Gagal hapus foto dari ImageKit:", err.message);
      }
    }

    // Petugas: catat id_petugas berdasarkan token. Admin: izinkan tanpa keharusan menjadi petugas,
    // gunakan id_petugas yang sudah tercatat (tetap) agar tidak merubah penugasannya.
    let id_petugas = oldData.id_petugas || null;
    if (req.user?.role === "petugas") {
      const id_user = req.user.id;
      const mapped = await getPetugasIdByUserIdService(id_user);
      if (!mapped) {
        return res
          .status(403)
          .json({ message: "Akun ini bukan petugas terdaftar" });
      }
      id_petugas = mapped;
    }

    // 🔥 PANGGIL SERVICE DENGAN PARAMETER YANG BENAR - TANPA tgl_selesai
    const result = await updatePengaduanStatusService(
      parseInt(id), // id_pengaduan
      status, // status
      saran_petugas || null, // saran_petugas
      id_petugas, // id_petugas
      gambar_bukti_url, // gambar_bukti_selesai (parameter 5)
      gambar_bukti_fileId // file_id_bukti_selesai (parameter 6)
    );

    // 🔔 Kirim notifikasi ke user pemilik pengaduan dengan pesan yang jelas
    try {
      const statusMessages = {
        Selesai: {
          title: "✅ Pengaduan Selesai",
          body: `"${oldData.nama_pengaduan}" telah selesai ditangani`,
        },
        Diproses: {
          title: "🔄 Pengaduan Sedang Ditangani",
          body: `"${oldData.nama_pengaduan}" sedang dalam proses penanganan`,
        },
        Ditinjau: {
          title: "👁️ Pengaduan Sedang Ditinjau",
          body: `"${oldData.nama_pengaduan}" sedang ditinjau oleh petugas`,
        },
        Ditolak: {
          title: "❌ Pengaduan Ditolak",
          body: `"${oldData.nama_pengaduan}" tidak dapat diproses`,
        },
        Menunggu: {
          title: "⏳ Pengaduan Menunggu",
          body: `"${oldData.nama_pengaduan}" menunggu penanganan`,
        },
      };

      const message = statusMessages[status] || {
        title: "📋 Status Pengaduan Diperbarui",
        body: `"${oldData.nama_pengaduan}" - ${status}`,
      };

      await notifyUser(oldData.id_user, message, {
        url: "/dashboard/riwayat",
        type: "status_update",
        role_target: "pengguna",
        pengaduan_id: id,
        status: status,
      });
      console.log("✅ Notifikasi ke user terkirim");
    } catch (notifError) {
      console.error("⚠️ Gagal kirim notifikasi:", notifError);
    }

    // Catat riwayat aksi petugas/admin
    try {
      await createRiwayatAksiService({
        id_pengaduan: id,
        id_petugas: id_petugas,
        id_user: req.user.id,
        role_user: req.user.role,
        aksi: `Update Status ke ${status}`,
        status_sebelumnya: oldData.status,
        status_baru: status,
        saran_petugas: saran_petugas,
      });
    } catch (logError) {
      // Log error tapi tidak menggagalkan update status
      console.error("Gagal mencatat riwayat aksi:", logError);
    }

    res.json({
      success: true,
      message: result.message || "Status pengaduan berhasil diperbarui",
      data: {
        id_pengaduan: id,
        status,
        // tgl_selesai akan diisi OTOMATIS oleh trigger
      },
    });
  } catch (error) {
    console.error("Error updatePengaduanStatus:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan server",
    });
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
