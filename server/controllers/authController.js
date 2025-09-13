import bcrypt from "bcryptjs";
import { generateToken } from "../helpers/jwtHelper.js";
import {
  findUserByUsername,
  isUsernameExist,
  createUser,
  createPetugas,
} from "../services/authService.js";

const sendError = (res, status, message) =>
  res.status(status).json({ message });

export const register = async (req, res) => {
  try {
    const { username, password, nama_pengguna } = req.body;
    if (await isUsernameExist(username))
      return sendError(res, 400, "Username sudah terdaftar");
    await createUser(username, password, nama_pengguna, "pengguna");
    res.status(201).json({ message: "Registrasi berhasil" });
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Terjadi kesalahan server");
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await findUserByUsername(username);
    if (!user) return sendError(res, 400, "Username atau password salah");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(res, 400, "Username atau password salah");
    const token = generateToken({ id: user.id_user, role: user.role });
    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id_user,
        username: user.username,
        nama_pengguna: user.nama_pengguna,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Terjadi kesalahan server");
  }
};

export const registerPetugas = async (req, res) => {
  try {
    const { username, password, nama_pengguna, nama, gender, telp } = req.body;
    if (await isUsernameExist(username))
      return sendError(res, 400, "Username sudah terdaftar");
    const id_user = await createUser(
      username,
      password,
      nama_pengguna,
      "petugas"
    );
    await createPetugas(nama, gender, telp, id_user);
    res.status(201).json({ message: "Petugas berhasil ditambahkan" });
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Terjadi kesalahan server");
  }
};
