export const validateRegister = (req, res, next) => {
  const { username, password, nama_pengguna } = req.body;

  if (!username || username.length < 3) {
    return res.status(400).json({ message: "Username minimal 3 karakter" });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ message: "Password minimal 8 karakter" });
  }
  if (!nama_pengguna || nama_pengguna.trim() === "") {
    return res.status(400).json({ message: "Nama pengguna wajib diisi" });
  }
  next();
};

export const validatePetugas = (req, res, next) => {
  const { nama, gender } = req.body;

  if (!nama || nama.trim() === "") {
    return res.status(400).json({ message: "Nama petugas wajib diisi" });
  }
  if (!["L", "P"].includes(gender)) {
    return res.status(400).json({ message: "Gender harus L atau P" });
  }
  next();
};

export const validateLogin = (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username dan password wajib diisi" });
  }
  next();
};
