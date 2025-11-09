import multer from "multer";
import path from "path";

let fileCounter = 1; // simple counter for unique naming

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // get file extension (like .jpg, .png)
    const ext = path.extname(file.originalname);

    // generate unique name
    const uniqueName = `lastminutepreparation${fileCounter}${ext}`;
    fileCounter++;

    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });