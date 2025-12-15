import cron from "node-cron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// uploads folder path
const UPLOADS_DIR = path.join(__dirname, "../../uploads");

// 5 minutes in milliseconds
const MAX_FILE_AGE = 2 * 60 * 1000;

// runs every 1 minute
cron.schedule("* * * * *", () => {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) return;

    const files = fs.readdirSync(UPLOADS_DIR);

    const now = Date.now();

    files.forEach((file) => {
      const filePath = path.join(UPLOADS_DIR, file);

      // safety check
      if (!fs.existsSync(filePath)) return;

      const stats = fs.statSync(filePath);

      // skip directories
      if (!stats.isFile()) return;

      const fileAge = now - stats.mtimeMs;

      // delete only if 5 min old or more
      if (fileAge >= MAX_FILE_AGE) {
        fs.unlinkSync(filePath);
      }
    });
  } catch (err) {
    console.error("❌ Upload cleanup cron error:", err.message);
  }
});
