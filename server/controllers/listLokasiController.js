import {
  getAllListLokasi as getAllListLokasiService,
  getListLokasiById as getListLokasiByIdService,
  createListLokasi as createListLokasiService,
  updateListLokasi as updateListLokasiService,
  deleteListLokasi as deleteListLokasiService,
} from "../services/listLokasiService.js";

// GET all list lokasi
export const getAllListLokasi = async (req, res) => {
  try {
    const rows = await getAllListLokasiService();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET list lokasi by id
export const getListLokasiById = async (req, res) => {
  try {
    const row = await getListLokasiByIdService(req.params.id);
    if (!row)
      return res.status(404).json({ message: "List lokasi tidak ditemukan" });
    res.json(row);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE list lokasi
export const createListLokasi = async (req, res) => {
  try {
    const { id_lokasi, id_item } = req.body;
    if (!id_lokasi || !id_item) {
      return res
        .status(400)
        .json({ message: "id_lokasi dan id_item wajib diisi" });
    }
    const id_list = await createListLokasiService(id_lokasi, id_item);
    res.status(201).json({
      message: "List lokasi berhasil ditambahkan",
      id_list,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE list lokasi
export const updateListLokasi = async (req, res) => {
  try {
    const { id_lokasi, id_item } = req.body;
    const affectedRows = await updateListLokasiService(
      req.params.id,
      id_lokasi,
      id_item
    );
    if (affectedRows === 0)
      return res.status(404).json({ message: "List lokasi tidak ditemukan" });
    res.json({ message: "List lokasi berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE list lokasi
export const deleteListLokasi = async (req, res) => {
  try {
    const affectedRows = await deleteListLokasiService(req.params.id);
    if (affectedRows === 0)
      return res.status(404).json({ message: "List lokasi tidak ditemukan" });
    res.json({ message: "List lokasi berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
