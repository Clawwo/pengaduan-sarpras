import {
  getUsers as getUsersService,
  getUserById as getUserByIdService,
  deleteUser as deleteUserService,
  updateProfile as updateProfileService,
} from "../services/userService.js";

// List semua user
export const getUsers = async (req, res) => {
  try {
    const rows = await getUsersService();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data user" });
  }
};

// Detail user
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await getUserByIdService(id);
    if (!row) return res.status(404).json({ message: "User tidak ditemukan" });
    res.json(row);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil detail user" });
  }
};

// Hapus user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await deleteUserService(id);
    if (affectedRows === 0)
      return res.status(404).json({ message: "User tidak ditemukan" });
    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menghapus user" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const id_user = req.user.id;
    const { nama_pengguna, username, password } = req.body;
    if (!nama_pengguna && !username && !password) {
      return res.status(400).json({ message: "Tidak ada data yang diubah" });
    }
    const affectedRows = await updateProfileService(id_user, {
      nama_pengguna,
      username,
      password,
    });
    if (affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json({ message: "Profil berhasil diperbarui" });
  } catch (error) {
    console.error("Error updateProfile:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
