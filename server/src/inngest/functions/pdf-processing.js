import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import fs from "fs";
import vision from "@google-cloud/vision";
import path from "path";
import { fileURLToPath } from "url";
import { inngest } from "../../libs/inngest.js";
import { redis } from "../../libs/redis.js";
import { PdfModel } from "../../models/Pdf.model.js";
import {User} from "../../models/user.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, "../../../ocr-key.json"),
});

// -------- HELPERS --------
const extractTextFromPDF = async (pdfPath) => {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdfDoc = await pdfjsLib.getDocument({ data }).promise;

  let text = "";
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    text += "\n" + content.items.map(i => i.str).join(" ");
  }
  return text.trim();
};

const isScannedPDF = (text) => !text || text.length < 150;

const extractTextWithOCR = async (pdfPath) => {
  const buffer = fs.readFileSync(pdfPath);
  const [result] = await client.documentTextDetection({
    image: { content: buffer },
  });
  return result.fullTextAnnotation?.text?.trim() || "";
};

// -------- INNGEST FN --------
export const pdfProcessingFn = inngest.createFunction(
  {
    id: "pdf-processing",
    name: "Process PDF Upload",
    retries:0,
  },
  { event: "lmp/generate.pdfProcessing" },
  async ({ event, step }) => {
    const { jobId, filePath, originalName, userId } = event.data;

    const cacheKey = `lmp:pdf:${jobId}`;
    const pendingKey = `lmp:pdf:pending:${jobId}`;

    try {
      let extractedText = await step.run("Extract Text" ,async () => {
        let text = await extractTextFromPDF(filePath);
        if (isScannedPDF(text)) {
          text = await extractTextWithOCR(filePath);
        }
        return text;
      });

      if (!extractedText || extractedText.length < 50) {
        throw new Error("Unreadable");
      }

      const pdfDoc = await step.run("Save DB", async () => {
        return await PdfModel.create({
          filename: originalName,
          extractedText,
        });
      });

      await step.run("Update User Count", async () => {
        const user = await User.findById(userId);
        if (user) {
          user.pdfUploadsThisMonth += 1;
          await user.save();
        }
      });

      await step.run("Save Redis", async () => {
        await redis.set(
          cacheKey,
          { pdfId: pdfDoc._id },
          { ex: 60 * 60 * 24 } // 24 hours
        );
      });

      await redis.del(pendingKey);

      return { success: true };
    } catch (err) {
      await redis.del(pendingKey);
      throw err;
    }
  }
);
