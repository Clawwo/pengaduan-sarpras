import multer from "multer";

const storage = multer.memoryStorage();
const MAX_SIZE = 2 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format file harus JPG atau PNG"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});

const uploadImage = (fieldName, maxCount = 1) => {
  return (req, res, next) => {
    const uploadHandler =
      maxCount === 1
        ? upload.single(fieldName)
        : upload.array(fieldName, maxCount);

    uploadHandler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(400)
            .json({ message: "Ukuran file maksimal 2MB per gambar" });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res
            .status(400)
            .json({ message: `Maksimal ${maxCount} gambar` });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};

export default uploadImage;
