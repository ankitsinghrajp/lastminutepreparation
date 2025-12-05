import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema({
  filename: String,
  extractedText: String,
  createdAt: { type: Date, default: Date.now },
});

export const PdfModel = mongoose.model("Pdf", pdfSchema);
