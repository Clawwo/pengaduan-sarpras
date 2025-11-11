import { uploadImage, deleteImage } from "../helpers/imageKitHelper.js";
import {
  getAllItems as getAllItemsService,
  getItemById as getItemByIdService,
  createItem as createItemService,
  updateItem as updateItemService,
  deleteItem as deleteItemService,
  getItemFileId,
} from "../services/itemService.js";

// GET all items (with optional filter by lokasi)
export const getAllItems = async (req, res) => {
  try {
    const { id_lokasi } = req.query;
    const items = await getAllItemsService(id_lokasi);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET item by id
export const getItemById = async (req, res) => {
  try {
    const item = await getItemByIdService(req.params.id);
    if (!item) return res.status(404).json({ message: "Item tidak ditemukan" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE item
export const createItem = async (req, res) => {
  try {
    const { nama_item, deskripsi, id_lokasi } = req.body;
    if (!nama_item || !id_lokasi) {
      return res
        .status(400)
        .json({ message: "Nama item dan lokasi wajib diisi" });
    }
    let imageUrl = null;
    let fileId = null;
    if (req.file) {
      const uploadResponse = await uploadImage(
        req.file.buffer,
        req.file.originalname,
        "/Pengaduan_Sarpras/Items"
      );
      imageUrl = uploadResponse.url;
      fileId = uploadResponse.fileId;
    }
    const id_item = await createItemService(
      nama_item,
      deskripsi,
      imageUrl,
      fileId,
      id_lokasi
    );
    res.status(201).json({
      message: "Item berhasil ditambahkan",
      item: {
        id_item,
        nama_item,
        deskripsi,
        foto: imageUrl,
        file_id: fileId,
        id_lokasi,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan server", error: error.message });
  }
};

// UPDATE item
export const updateItem = async (req, res) => {
  const { id } = req.params;
  const { nama_item, deskripsi, id_lokasi } = req.body;
  try {
    const oldFileId = await getItemFileId(id);
    let imageUrl = req.body.foto;
    let fileId = oldFileId;
    if (req.file) {
      if (oldFileId) {
        try {
          await deleteImage(oldFileId);
        } catch (err) {
          console.warn("Gagal hapus foto lama:", err.message);
        }
      }
      const uploadResponse = await uploadImage(
        req.file.buffer,
        req.file.originalname,
        "/Pengaduan_Sarpras/Items"
      );
      imageUrl = uploadResponse.url;
      fileId = uploadResponse.fileId;
    }
    await updateItemService(
      id,
      nama_item,
      deskripsi,
      id_lokasi,
      imageUrl,
      fileId
    );
    res.json({
      message: "Item berhasil diperbarui",
      item: {
        id,
        nama_item,
        deskripsi,
        id_lokasi,
        foto: imageUrl,
        file_id: fileId,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal memperbarui item", error: error.message });
  }
};

// DELETE item
export const deleteItem = async (req, res) => {
  try {
    const fileId = await getItemFileId(req.params.id);
    if (!fileId) {
      return res.status(404).json({ message: "Item tidak ditemukan" });
    }
    if (fileId) {
      try {
        await deleteImage(fileId);
      } catch (err) {
        console.warn("Gagal hapus gambar di ImageKit:", err.message);
      }
    }
    const affectedRows = await deleteItemService(req.params.id);
    if (affectedRows === 0)
      return res.status(404).json({ message: "Item tidak ditemukan" });
    res.json({ message: "Item berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
