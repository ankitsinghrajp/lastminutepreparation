import multer from "multer";

// ----------------------------
// Memory Storage Multer Setup
// ----------------------------
const storage = multer.memoryStorage(); // store files in RAM, not on disk

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // max 5 MB per file
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});
