// uploadMiddleware.js
import multer from "multer";

// simpan di memory
const storage = multer.memoryStorage();

// maksimal 2MB
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

export default upload;
