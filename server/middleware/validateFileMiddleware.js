import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.match(/^image\/(jpeg|png|jpg)$/)) {
    return cb(new Error("Format file harus JPG atau PNG"), false);
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter,
});
