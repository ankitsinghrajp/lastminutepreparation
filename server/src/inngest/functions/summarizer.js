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

export const summarizerFn = inngest.createFunction(
  {
    id: "summarizer-job",
    name: "Generate Topic Summary",
    retries:1,
  },
  { event: "lmp/generate.summarizer" },
  async ({ event, step }) => {
    const { jobId, topic, level, imageBuffer } = event.data;

    const cacheKey = `lmp:summarizer:${jobId}`;
    const pendingKey = `lmp:summarizer:pending:${jobId}`;

    try {
      let extractedText = "";
      let labels = [];
      let mode = "no_image";

      // 🖼️ IMAGE PROCESSING (optional)
      if (imageBuffer) {
        const buffer = Buffer.from(imageBuffer, "base64");
        const pngBuffer = await sharp(buffer).png().toBuffer();

        const [textResult] = await step.run("OCR", async () =>
          client.textDetection({ image: { content: pngBuffer } })
        );
        extractedText = textResult.fullTextAnnotation?.text || "";

        const [labelResult] = await step.run("LABELS", async () =>
          client.labelDetection({ image: { content: pngBuffer } })
        );
        labels = (labelResult.labelAnnotations || [])
          .map((l) => l.description)
          .slice(0, 5);

        if (extractedText.trim()) mode = "text";
        else if (labels.length) mode = "label_only";
        else mode = "fallback";
      }

      // 🧠 PROMPT (UNCHANGED LOGIC)
  const prompt = `
You are a CBSE Board exam expert. Think internally first, but DO NOT show your thinking. Your ONLY task is to write full-mark answers exactly the way toppers write in their exam notebooks — clean, simple, direct, and only what is required to score full marks.

----------------------------------
IMAGE + TOPIC MODE
----------------------------------
If an IMAGE is provided:
- First understand completely what the image contains (question / numerical / diagram / theory / graph / flowchart).
- If it contains a QUESTION → solve it in perfect CBSE topper style.
- If it contains a DIAGRAM → explain every part clearly.
- If it contains THEORY → explain it cleanly.
- Use the selected Length Type: ${level}.
- The student must fully understand after reading.

If ONLY TOPIC is provided:
- Explain the topic in CBSE classroom teacher style.
- Use the selected Length Type: ${level}.

----------------------------------
INPUT DATA
----------------------------------
Topic: ${topic || "From Image"}
Length Type: ${level}

Image Analysis Mode: ${mode}

Extracted Image Text:
${extractedText || "(none)"}

Detected Image Labels:
${labels.join(", ") || "(none)"}

----------------------------------
STRICT LANGUAGE RULE:
If the subject is Hindi  → then deep read the chapter first then answer the question ONLY in Hindi.
If the subject is Sanskrit  → then deep read the chapter first then answer the question ONLY in Sanskrit and must strictly answer in 3 lines only, it can less then 3 but not more than 3 strictly.
Otherwise → answer ONLY in English. DO NOT USE Hindi for English or any other subject.
If this rule is violated, regenerate the answer.

Language Subject Rules: 
- If subject is hindi then deep read the chapter then answer the question in hindi only
- If subject is Sanskrit then first read the chapter then answer 2-3 lines if possible not more than this. It should be simple and concise 

Rules:
- Start the answer directly using the main concept asked in the question — no introduction, no background story.
- Keep the language simple and crisp — not bookish, not heavy, not long.
- Include formulas, steps, diagrams, tables, or bullet points ONLY when they improve scoring — do NOT force them.
- Do NOT explain extra theory that is not needed to score marks.
- Bold only very important keywords and terms — not the whole line.
- Maintain natural flow like exam writing, not like a textbook.

Special case — derivation / numerical / maths questions:
- Do NOT add theory or definition.
- Do NOT write introduction or conclusion.
- Only write the required steps and expressions that lead to the final result.
- Keep everything as compact as toppers write.
- ALL formulas inside $$...$$ must contain ONLY mathematical expressions — NO units, NO words, NO direction, NO sentences. Write units or explanation OUTSIDE the $$ formula $$ on the next line.

If any formula contains \\frac, \\sqrt, powers, subscripts, Greek letters or scientific symbols, ALWAYS write them using standard LaTeX syntax (for example \\alpha, \\mu, \\Omega, \\theta, \\Delta — NOT /alpha or /Omega) and wrap the entire formula in $$ ... $$.

Output safety:
- LaTeX formulas must be wrapped in $...$ or $$...$$.
- No markdown headings (#), no backticks, no JSON, no code formatting.
- No phrases like "Final Answer:", "Explanation:", "According to the question", etc.
- If you break any of these output rules, rewrite the answer again until ALL rules are satisfied.

❗Very important: NEVER write formulas inside normal brackets like ( V ), ( V_s ), ( Phi ), ( N ). Every mathematical symbol MUST be written ONLY inside $...$ or $$...$$ LaTeX format.

Goal: A topper-style answer that is short, neat, direct, and guaranteed full marks — without unnecessary information.

ADDITIONAL VALIDATIONS (EXTREMELY IMPORTANT):
✔️ If the question has multiple parts, YOU MUST answer ALL parts one-by-one. No skipping.
✔️ Every heading MUST be followed by proper explanation — NEVER give empty headings.
✔️ If the question includes "Explain", "Define", "List", or "Write properties/advantages/characteristics", YOU MUST give clear points.
✔️ Minimum 4 points whenever properties/advantages/characteristics are asked.
✔️ Do NOT stop until the ENTIRE question is fully answered.
✔️ Every mathematical formula MUST be written inside $ ... $ only.
❌ Never use brackets like ( \\vec{E} ), [ \\vec{E} ], or \\( \\vec{E} \\).
❌ Never escape slashes like \\\\vec or \\ldots.

Correct format example: $\\vec{E} = \\frac{1}{4 \\pi \\epsilon_0} \\frac{q}{r^2}$

DOUBLE-CHECK formula formatting before generating the final answer.

✔️ Every formula involved in derivations MUST be written in display math using $$ ... $$ (not inline $...$).
✔️ Each equation in a derivation must be on a separate line using its own $$ block.
✔️ Never write multiple formulas in one $$ block.

BEFORE sending the final answer:
🟢 Double-check that every part of the question is answered completely.
🟢 Double-check that no heading is without its explanation.

OUTPUT: Only the topper-style answer. Nothing else.
`;

      const safePrompt = prompt.replace(/\\/g, "\\\\");

      const ai = await step.run("OpenAI", async () =>
        openai.responses.create({
          model: "gpt-5.1",
          input: safePrompt,
          max_output_tokens: 800,
        })
      );

      const cleanedOutput = ai.output_text
        .replace(/\r/g, "")
        .replace(/[\u200B-\u200F\uFEFF]/g, "")
        .replace(/\n{3,}/g, "\n")
        .trim();

      // 💾 SAVE RESULT (TTL = 24 HOURS)
      await step.run("Save Redis", async () => {
        await redis.set(
          cacheKey,
          { summary: cleanedOutput },
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
