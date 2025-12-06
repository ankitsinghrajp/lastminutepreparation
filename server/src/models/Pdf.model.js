import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },

    extractedText: {
      type: String,
      required: true,
    },

    // ✅ This field is used by MongoDB TTL
    createdAt: {
      type: Date,
      default: Date.now,
      index: true, // required for TTL
    },
  },
  { timestamps: false } // IMPORTANT: do not use timestamps with TTL here
);

//  AUTO DELETE AFTER 2 HOURS (7200 seconds)
pdfSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7200 });

export const PdfModel = mongoose.models.PdfModel || mongoose.model("Pdf", pdfSchema);
