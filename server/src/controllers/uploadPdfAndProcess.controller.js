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

// ✅ Google Vision Client
const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, "../../ocr-key.json"),
});

// ---------- HELPERS ----------

// ✅ Extract text from NORMAL (non-scanned) PDF
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

// ✅ Detect scanned PDF
const isScannedPDF = (text) => !text || text.length < 150;

// ✅ OCR directly on PDF (NO image conversion, Linux-safe)
const extractTextWithOCR = async (pdfPath) => {
  const fileBuffer = fs.readFileSync(pdfPath);

  const [result] = await client.documentTextDetection({
    image: { content: fileBuffer },
  });

  return result.fullTextAnnotation?.text?.trim() || "";
};

// ---------- ✅ MAIN UPLOAD CONTROLLER ----------
export const uploadPdfAndProcess = asyncHandler(async (req, res) => {
  if (!req.file?.path) {
    throw new ApiError(400, "PDF is required");
  }

  const localPdfPath = req.file.path;

  // 1. Try normal text extraction
  let extractedText = await extractTextFromPDF(localPdfPath);

  // 2. OCR fallback for scanned PDFs
  if (isScannedPDF(extractedText)) {
    extractedText = await extractTextWithOCR(localPdfPath);
  }

  // 3. Delete local PDF safely
  if (fs.existsSync(localPdfPath)) {
    fs.unlinkSync(localPdfPath);
  }

  if (!extractedText || extractedText.length < 50) {
    throw new ApiError(400, "Unable to read PDF properly");
  }

  // 4. Save in DB
  const pdfDoc = await PdfModel.create({
    filename: req.file.originalname,
    extractedText,
  });

  req.user.pdfUploadsThisMonth += 1;
  await req.user.save();

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