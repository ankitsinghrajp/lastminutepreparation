import vision from "@google-cloud/vision";
import { openai } from "../utils/OpenAI.js";
import path from "path";
import { fileURLToPath } from "url";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APIError.js";
import sharp from "sharp";

// __dirname fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vision client
const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, "../../ocr-key.json"),
});

export const diagramImageAnalysis = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.image) {
    throw new ApiError(400, "Please upload image first!");
  }

  let fileBuffer = req.files.image[0].buffer;

  try {
    fileBuffer = await sharp(fileBuffer).png().toBuffer();
  } catch (e) {
    throw new ApiError(400, "Unable to process image. Please upload a valid image file.");
  }

  try {
    const [textResult] = await client.textDetection({
      image: { content: fileBuffer },
    });

    const extractedText = textResult.fullTextAnnotation?.text || "";

    const [labelResult] = await client.labelDetection({
      image: { content: fileBuffer },
    });

    const labels = (labelResult.labelAnnotations || [])
      .map((x) => x.description)
      .slice(0, 5);

    let mode = "text";

    if (!extractedText.trim() && labels.length > 0) mode = "label_only";
    else if (!extractedText.trim() && labels.length === 0) mode = "fallback";

    const finalPrompt = {
     text: `
You are a CBSE Board exam expert. Think internally first, but DO NOT show your thinking. Your ONLY task is to explain the uploaded diagram exactly the way toppers understand diagrams — clean, simple, direct, and only what is required to score full marks in **50–70 words only**.

STRICT LANGUAGE RULE:
If the subject is Hindi → explain ONLY in Hindi, in simple short points.
If the subject is Sanskrit → explain ONLY in Sanskrit, strictly 2–3 lines maximum.
Otherwise → explain ONLY in English.
If this rule is violated, regenerate the answer.

Image Analysis Mode: ${
  mode === "text"
    ? "Using extracted text"
    : mode === "label_only"
    ? "Using labels only"
    : "Visual fallback mode"
}

Extracted Text:
${extractedText || "(none)"}

Detected Labels:
${labels.join(", ") || "(none)"}

RULES FOR DIAGRAM EXPLANATION:
- Start directly by identifying the diagram (name + chapter concept). No intro lines.
- Explain in **short, crisp bullet points only**.
- No long paragraphs.
- Keep language extremely clean and exam-friendly.
- Bold only the MOST important keywords (not full lines).
- Do NOT add any theory not visible or related to the diagram.
- Do NOT guess anything not supported by the image/text/labels.
- Explain only the **essential parts** of the diagram.
- Total length MUST stay between **50–70 words**.

MEMORY & LEARNING RULES:
- MUST give 1 short trick to remember the diagram (mnemonic / pattern / visualization).
- MUST give 1 one-line quick revision summary.

FORMULA & SYMBOL VALIDATION (IF ANY FORMULA APPEARS IN DIAGRAM):
- ALL formulas MUST be inside $...$ or $$...$$ only.
- NEVER write formulas inside normal brackets like (V), (Phi), (Vs).
- Do NOT escape slashes like \\vec or \\alpha.
- If formula includes fractions, roots, subscripts, or Greek letters → MUST use LaTeX (\\alpha, \\theta, etc).
- NEVER write multiple formulas inside a single $$ block.
- Units must be outside the $$ formula $$.

OUTPUT SAFETY:
- No markdown headings (#)
- No JSON, no code blocks, no backticks
- No phrases like "Explanation:" or "As per the question"
- Only clean points + memory trick + revision line

ADDITIONAL VALIDATIONS:
✔ If the diagram has multiple parts, YOU MUST explain all major parts.
✔ For flowcharts/process diagrams → MUST describe steps in sequence.
✔ For graphs/maps → MUST explain axes or regions.
✔ No empty headings — every point must have meaning.
✔ Never add irrelevant content.

BEFORE SENDING FINAL ANSWER:
🟢 Re-check language rule.
🟢 Re-check formula formatting.
🟢 Ensure explanation is short, crisp, topper-style, and complete.
🟢 Memory trick + revision line MUST be included.

OUTPUT: Only the topper-style diagram explanation. Nothing else.
`,};

    const aiResponse = await openai.responses.create({
      model: "gpt-4o",
      input: finalPrompt.text,
      max_output_tokens: 800,
    });

   let cleanedOutput = aiResponse.output_text
  .replace(/\r/g, "")
  .replace(/[\u200B-\u200F\uFEFF]/g, "")
  .replace(/^[ \t]+$/gm, "")
  .replace(/^\s*\n/gm, "\n")
  .replace(/\n{3,}/g, "\n")
  .replace(/\n{2,}/g, "\n")
  .replace(/[ \t]+\n/g, "\n")
  .trim();         

    return res.status(200).json({
      success: true,
      message: "Image analyzed successfully",
      mode_used: mode,
      extractedText,
      labels,
      aiResponse: cleanedOutput, // send cleaned output
    });
  } catch (error) {
    console.error("Image analysis error:", error);
    throw new ApiError(500, error.message);
  }
});
