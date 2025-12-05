import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    // ✅ Allow image files
    if (file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }

    // ✅ Allow PDF files
    if (file.mimetype === "application/pdf") {
      return cb(null, true);
    }

    // ❌ Reject everything else
    return cb(new Error("Only image and PDF files are allowed!"), false);
  },
});
