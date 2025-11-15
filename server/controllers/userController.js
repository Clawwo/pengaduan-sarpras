import {
  getUsers as getUsersService,
  getUserById as getUserByIdService,
  deleteUser as deleteUserService,
  updateProfile as updateProfileService,
  createUser as createUserService,
  updateUser as updateUserService,
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
    if (error.message.includes("sudah terdaftar")) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Create new user (admin only)
export const createUser = async (req, res) => {
  try {
    const { nama_pengguna, username, password, role } = req.body;

    if (!nama_pengguna || !username || !password || !role) {
      return res.status(400).json({
        message: "Nama pengguna, username, password, dan role wajib diisi",
      });
    }

    const userId = await createUserService({
      nama_pengguna,
      username,
      password,
      role,
    });

    res.status(201).json({
      message: "User berhasil ditambahkan",
      id_pengguna: userId,
    });
  } catch (error) {
    console.error("Error createUser:", error);
    if (error.message.includes("sudah terdaftar")) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Update user by ID (admin only)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_pengguna, username, password, role } = req.body;

    if (!nama_pengguna && !username && !password && !role) {
      return res.status(400).json({ message: "Tidak ada data yang diubah" });
    }

    const affectedRows = await updateUserService(id, {
      nama_pengguna,
      username,
      password,
      role,
    });

    if (affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({ message: "User berhasil diperbarui" });
  } catch (error) {
    console.error("Error updateUser:", error);
    if (error.message.includes("sudah terdaftar")) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
