import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { askOpenAI } from "../utils/OpenAI.js";
import { PdfModel } from "../models/Pdf.model.js";

export const chatWithPdf = asyncHandler(async (req, res) => {
  const { pdfId, question } = req.body;

  if (!pdfId || !question?.trim()) {
    throw new ApiError(400, "pdfId and question are required");
  }

  const pdfDoc = await PdfModel.findById(pdfId);
  if (!pdfDoc) {
    throw new ApiError(404, "PDF not found");
  }

  const prompt = `
You are a CBSE Board exam expert. Think internally first, but DO NOT show your thinking. 
Your ONLY task is to answer strictly from the provided PDF content.

----------------------------------
PDF CONTENT
----------------------------------
${pdfDoc.extractedText}

----------------------------------
STUDENT QUESTION
----------------------------------
${question}

----------------------------------
STRICT RULES
----------------------------------
- Answer ONLY from the PDF content.
- Do NOT add outside information.
- If answer is not in PDF → say "This information is not available in the provided PDF."
- Use topper-style CBSE format.
- Formulas ONLY inside $...$ or $$...$$
- No markdown headings
- No explanations of rules
- Direct exam-ready answer only
`;

  const apiData = await askOpenAI(prompt.replace(/\\/g, "\\\\"), "gpt-5.1");

  const cleanedOutput = apiData
    .replace(/\r/g, "")
    .replace(/[\u200B-\u200F\uFEFF]/g, "")
    .replace(/\n{3,}/g, "\n")
    .trim();

  return res.status(200).json(
    new ApiResponse(200, { answer: cleanedOutput }, "Answer generated")
  );
});
