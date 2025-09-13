import {
  getAllTemporaryItems as getAllTemporaryItemsService,
  getTemporaryItemById as getTemporaryItemByIdService,
  createTemporaryItem as createTemporaryItemService,
  updateTemporaryItem as updateTemporaryItemService,
  approveTemporaryItem as approveTemporaryItemService,
  deleteTemporaryItem as deleteTemporaryItemService,
} from "../services/temporaryItemService.js";

// GET all temporary items
export const getAllTemporaryItems = async (req, res) => {
  try {
    const rows = await getAllTemporaryItemsService();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET temporary item by id
export const getTemporaryItemById = async (req, res) => {
  try {
    const row = await getTemporaryItemByIdService(req.params.id);
    if (!row)
      return res
        .status(404)
        .json({ message: "Temporary item tidak ditemukan" });
    res.json(row);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE temporary item
export const createTemporaryItem = async (req, res) => {
  try {
    const { nama_barang_baru, id_lokasi } = req.body;
    if (!nama_barang_baru)
      return res.status(400).json({ message: "Nama barang baru wajib diisi" });
    const id = await createTemporaryItemService(nama_barang_baru, id_lokasi);
    res.status(201).json({
      message: "Temporary item berhasil ditambahkan",
      id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE temporary item
export const updateTemporaryItem = async (req, res) => {
  try {
    const { nama_barang_baru, id_lokasi } = req.body;
    const affectedRows = await updateTemporaryItemService(
      req.params.id,
      nama_barang_baru,
      id_lokasi
    );
    if (affectedRows === 0)
      return res
        .status(404)
        .json({ message: "Temporary item tidak ditemukan" });
    res.json({ message: "Temporary item berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveTemporaryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await approveTemporaryItemService(id);
    if (!result)
      return res
        .status(404)
        .json({ message: "Temporary item tidak ditemukan" });
    res.json({ message: "Item berhasil dipindahkan ke items resmi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// DELETE temporary item
export const deleteTemporaryItem = async (req, res) => {
  try {
    const affectedRows = await deleteTemporaryItemService(req.params.id);
    if (affectedRows === 0)
      return res
        .status(404)
        .json({ message: "Temporary item tidak ditemukan" });
    res.json({ message: "Temporary item berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
