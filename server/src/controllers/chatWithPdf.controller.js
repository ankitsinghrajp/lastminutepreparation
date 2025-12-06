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
Your ONLY task is to answer strictly from the provided PDF content in topper-style exam format.

----------------------------------
PDF CONTENT
----------------------------------
${pdfDoc.extractedText}

----------------------------------
STUDENT QUESTION
----------------------------------
${question}

----------------------------------
STRICT LANGUAGE RULE:
If the subject is Hindi  → then deep read the PDF first then answer ONLY in Hindi.
If the subject is Sanskrit  → then deep read the PDF first then answer ONLY in Sanskrit and must strictly answer in 3 lines only (can be less but not more).
Otherwise → answer ONLY in English. DO NOT USE Hindi for English or any other subject.
If this rule is violated, regenerate the answer.

----------------------------------
CORE EXAM RULES:
----------------------------------
- Start the answer directly with the main concept — no introduction.
- Keep language simple, crisp, and exam-ready.
- Avoid unnecessary theory.
- Use formulas, steps, tables, bullets ONLY when required.
- Bold only very important keywords.
- Maintain natural exam notebook flow.

----------------------------------
SPECIAL CASE — MATHS / NUMERICAL / DERIVATION:
----------------------------------
- No theory or definition.
- No introduction or conclusion.
- Only required mathematical steps.
- ALL formulas must be inside $...$ or $$...$$ only.
- NO words, NO units inside formulas.
- Units/explanation must be written outside $$ on a new line.
- Every derivation equation must be in its own $$ block.
- Never place multiple formulas in one $$ block.

Correct Example:
$$\\vec{E} = \\frac{1}{4 \\pi \\epsilon_0} \\frac{q}{r^2}$$

----------------------------------
OUTPUT SAFETY:
----------------------------------
- LaTeX formulas must be wrapped only in $...$ or $$...$$
- No markdown headings
- No backticks
- No JSON
- No "Final Answer", "Explanation", etc.
- If any rule breaks → rewrite the output.

❗NEVER write formulas inside ( ), [ ], or escaped slashes.
❌ ( \\vec{E} ) ❌ [ \\vec{E} ] ❌ \\\\vec
✅ $\\vec{E}$

----------------------------------
ADDITIONAL VALIDATIONS (EXTREMELY IMPORTANT):
----------------------------------
✔ If the question has multiple parts → Answer ALL parts.
✔ Every heading must have proper explanation.
✔ Minimum 4 points for properties/advantages/characteristics.
✔ Never stop mid-answer.
✔ Every formula must follow LaTeX-only formatting.
✔ If answer is NOT found in the PDF → reply ONLY with:
"This information is not available in the provided PDF."

----------------------------------
SPECIAL CASE — DIAGRAM QUESTIONS:
----------------------------------
If the question asks to draw/sketch/show:
- Draw a neat TEXT / ASCII diagram.
- Label all forces, angles, and parts.
- Do NOT mention ASCII.
- Do NOT use image links.

----------------------------------
FINAL CHECK BEFORE SENDING:
----------------------------------
🟢 All parts answered
🟢 No empty headings
🟢 No outside information used
🟢 All formulas correctly formatted

OUTPUT: Only the topper-style exam answer. Nothing else.
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

