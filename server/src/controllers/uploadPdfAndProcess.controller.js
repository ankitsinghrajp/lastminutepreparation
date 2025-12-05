import pdfPoppler from "pdf-poppler";
import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import fs from "fs";
import vision from "@google-cloud/vision";
import path from "path";
import { fileURLToPath } from "url";
import { PdfModel } from "../models/Pdf.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, "../../ocr-key.json"),
});

// ---------- helpers ----------
const extractTextFromPDF = async (pdfPath) => {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdfDoc = await pdfjsLib.getDocument({ data }).promise;

  let fullText = "";
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    fullText += "\n" + content.items.map(i => i.str).join(" ");
  }
  return fullText.trim();
};

const isScannedPDF = (text) => !text || text.length < 150;

const convertPdfToImages = async (pdfPath) => {
  const outputDir = path.join(process.cwd(), "uploads/pdf-pages");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  await pdfPoppler.convert(pdfPath, {
    format: "png",
    out_dir: outputDir,
    out_prefix: "page",
    page: null,
  });

  return outputDir;
};

const extractTextWithOCR = async (pdfPath) => {
  const imgDir = await convertPdfToImages(pdfPath);
  const files = fs.readdirSync(imgDir).filter(f => f.endsWith(".png"));

  let fullText = "";
  for (const file of files) {
    const imgPath = path.join(imgDir, file);
    const [result] = await client.textDetection({
      image: { content: fs.readFileSync(imgPath) },
    });
    fullText += "\n" + (result.fullTextAnnotation?.text || "");
    fs.unlinkSync(imgPath);
  }

  return fullText.trim();
};

// ---------- MAIN UPLOAD CONTROLLER ----------
export const uploadPdfAndProcess = asyncHandler(async (req, res) => {
  if (!req.file?.path) {
    throw new ApiError(400, "PDF is required");
  }

  const localPdfPath = req.file.path;

  // 1. Extract text normally
  let extractedText = await extractTextFromPDF(localPdfPath);

  // 2. OCR fallback
  if (isScannedPDF(extractedText)) {
    extractedText = await extractTextWithOCR(localPdfPath);
  }

  // 3. Delete local PDF
  fs.unlinkSync(localPdfPath);

  if (!extractedText || extractedText.length < 50) {
    throw new ApiError(400, "Unable to read PDF properly");
  }

  // 4. Save in DB
  const pdfDoc = await PdfModel.create({
    filename: req.file.originalname,
    extractedText,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        pdfId: pdfDoc._id,
      },
      "PDF processed successfully"
    )
  );
});
