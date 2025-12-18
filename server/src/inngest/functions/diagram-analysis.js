import vision from "@google-cloud/vision";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import { inngest } from "../../libs/inngest.js";
import { redis } from "../../libs/redis.js";
import { openai } from "../../utils/OpenAI.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, "../../../ocr-key.json"),
});

export const diagramImageAnalysisFn = inngest.createFunction(
  {
    id: "diagram-image-analysis",
    name: "Generate Diagram Image Analysis",
    retries: 1,
  },
  { event: "lmp/generate.diagramAnalysis" },
  async ({ event, step }) => {
    const { jobId, imageBuffer } = event.data;

    const cacheKey = `lmp:diagram:${jobId}`;
    const pendingKey = `lmp:diagram:pending:${jobId}`;

    try {
      // Decode buffer
      const buffer = Buffer.from(imageBuffer, "base64");
      const pngBuffer = await sharp(buffer).png().toBuffer();

      // 1️⃣ OCR
      const [textResult] = await step.run("Vision Text Detection", async () =>
        client.textDetection({ image: { content: pngBuffer } })
      );
      const extractedText = textResult.fullTextAnnotation?.text || "";

      // 2️⃣ Labels
      const [labelResult] = await step.run("Vision Label Detection", async () =>
        client.labelDetection({ image: { content: pngBuffer } })
      );
      const labels = (labelResult.labelAnnotations || [])
        .map((l) => l.description)
        .slice(0, 5);

      let mode = "text";
      if (!extractedText.trim() && labels.length > 0) mode = "label_only";
      else if (!extractedText.trim()) mode = "fallback";

      // 3️⃣ PROMPT (UNCHANGED)
  const prompt = `
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

--------------------------------------------------
🚨 HARD REJECTION RULES (ABSOLUTE — NO EXCEPTIONS)
--------------------------------------------------

❌ FORBIDDEN OUTPUT PATTERNS (IF ANY APPEAR → REGENERATE ENTIRE ANSWER):

1) ANY heading-style labels such as:
   - "Electric Field:"
   - "Area:"
   - "Angle:"
   - "Flux Formula:"
   - "Exam Outcome:"
   Headings are STRICTLY FORBIDDEN.

2) ANY label written in the form:
   Label (math):
   Example:
   ❌ Electric Field (\\vec{E}):
   ❌ Angle (\\theta):
   ❌ Flux (\\Phi = EA\\cos(\\theta)):

3) ANY mathematical symbol appearing outside $...$ or $$...$$.
   This includes \\vec{E}, \\theta, \\Phi, \\cos, subscripts, superscripts.

4) ANY paragraph-style explanation.
   Every explanatory line MUST be a bullet point.
   Notes-style writing is STRICTLY FORBIDDEN.

5) ANY output that looks like classroom notes instead of exam bullets.
   If the explanation does not look like something a student can directly copy in the exam → REGENERATE.

6) ANY excessive blank lines or visual gaps between points.
   Output must be compact, continuous, and tightly packed.

--------------------------------------------------
BEFORE SENDING FINAL ANSWER:
--------------------------------------------------
🟢 Re-check language rule.
🟢 Re-check bullet-only structure.
🟢 Re-check that NO label-style headings exist.
🟢 Re-check that ALL math is inside LaTeX.
🟢 Ensure explanation is short, crisp, topper-style, and memorable.
🟢 Memory trick + revision line MUST be included.

If ANY rule above is violated, DISCARD the answer and REGENERATE internally until FULLY COMPLIANT.

OUTPUT: Only the topper-style diagram explanation. Nothing else.
`;




      // 4️⃣ OpenAI
      const ai = await step.run("OpenAI Call",async () =>
        openai.responses.create({
          model: "gpt-5-mini",
          input: prompt,
          max_output_tokens: 800,
        })
      );

      const cleanedOutput = ai.output_text
        .replace(/\r/g, "")
        .replace(/[\u200B-\u200F\uFEFF]/g, "")
        .replace(/\n{3,}/g, "\n")
        .trim();

      // 5️⃣ Save Redis
      await step.run("Save Redis", async () => {
        await redis.set(
          cacheKey,
          {
            aiResponse: cleanedOutput,
            mode_used: mode,
            labels,
            extractedText,
          },
          { EX: 60 * 60 * 24 }
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
