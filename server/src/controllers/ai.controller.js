import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { askOpenAI ,openai } from "../utils/OpenAI.js";
import { configDotenv } from "dotenv";
import { parseSubject } from "../utils/helper.js";
import crypto from "crypto"


configDotenv();

import vision from "@google-cloud/vision";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { redis } from "../libs/redis.js";
import { inngest } from "../libs/inngest.js";

// __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vision client
const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, "../../ocr-key.json"),
});


const summarizer = asyncHandler(async (req, res) => {
  const { topic, level } = req.body;

  if (
    (!topic || !topic.trim()) &&
    (!req.files || !req.files.image)
  ) {
    throw new ApiError(400, "Either topic or image is required!");
  }

  let imageBuffer = null;

  if (req.files?.image) {
    imageBuffer = req.files.image[0].buffer;
  }

  // 🔐 DETERMINISTIC JOB ID
  const jobId = crypto
    .createHash("sha256")
    .update((topic || "") + (level || "") + (imageBuffer || ""))
    .digest("hex");

  const cacheKey = `lmp:summarizer:${jobId}`;
  const pendingKey = `lmp:summarizer:pending:${jobId}`;

  // ⚡ FAST PATH
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.status(200).json(
      new ApiResponse(200, cached, "Summary ready")
    );
  }

  // ⏳ QUEUE IF NOT PENDING
  const isPending = await redis.get(pendingKey);
  if (!isPending) {
    await redis.set(pendingKey, "1", { EX: 120 });

    await inngest.send({
      name: "lmp/generate.summarizer",
      data: {
        jobId,
        topic,
        level,
        imageBuffer: imageBuffer
          ? imageBuffer.toString("base64")
          : null,
      },
    });
  }

  return res.status(202).json(
    new ApiResponse(202, { jobId }, "Summary queued")
  );
});

const topperStyleAnswer = asyncHandler(async (req, res) => {
  const { user_question, selectedClass, selectedSubject, selectedChapter } = req.body;

  // Redis Key
  const cacheKey = `lmp:topper:${selectedClass}:${selectedSubject}:${selectedChapter}:${user_question}`;

  // 1️⃣ CHECK REDIS CACHE
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      if (typeof redisCached === "object") {
        return res
          .status(200)
          .json(new ApiResponse(200, redisCached, "Answer Ready"));
      }

      if (typeof redisCached === "string") {
        const parsed = JSON.parse(redisCached);
        return res
          .status(200)
          .json(new ApiResponse(200, parsed, "Answer Ready"));
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // 2️⃣ PROMPT — 100% UNTOUCHED (EXACT, RAW)
  const prompt = `
You are a CBSE Board exam expert. Think internally first, but DO NOT show your thinking. Your ONLY task is to write full-mark answers exactly the way toppers write in their exam notebooks — clean, simple, direct, and only what is required to score full marks.

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

SPECIAL CASE — DIAGRAM QUESTIONS:
If the question asks to "draw", "sketch", or "show diagram",
YOU MUST:
- Draw a neat TEXT / ASCII diagram suitable for exam use.
- Clearly label all forces, angles, and important parts.
- Do NOT mention that it is an ASCII diagram.
- Do NOT use any image links or markdown images.

BEFORE sending the final answer:
🟢 Double-check that every part of the question is answered completely.
🟢 Double-check that no heading is without its explanation.

OUTPUT: Only the topper-style answer. Nothing else.

Now answer the question: 
Question: ${user_question}
class: ${selectedClass}
subject: ${selectedSubject}
chapter: ${selectedChapter}
`;

  try {
    // 3️⃣ GENERATE AI ANSWER
    const safePrompt = prompt.replace(/\\/g, "\\\\");
    const apiData = await askOpenAI(safePrompt, "gpt-5.1");

    const finalAnswer = { answer: apiData };

    // 4️⃣ SAVE TO REDIS (2 DAYS)
    await redis.set(cacheKey, JSON.stringify(finalAnswer), {
      ex: 60 * 60 * 24 * 20, // 2 days
    });

    return res
      .status(200)
      .json(new ApiResponse(200, finalAnswer, "Answer generated successfully!"));
  } catch (error) {
    console.error("Topper answer generation failed:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to generate answer."));
  }
});

const importantQuestionGenerator = asyncHandler(async (req, res) => {
  const { className, subject, chapter, index } = req.body;

  if ([className, subject, chapter].some((f) => !f || f.trim() === "")) {
    throw new ApiError(400, "className, subject, chapter are required!");
  }

  const { mainSubject } = parseSubject(subject);

  const topics =
    Array.isArray(index) && index.length > 0
      ? JSON.stringify(index)
      : "All key topics";

  const cacheKey = `lmp:impQ:${className}:${mainSubject}:${chapter}:${topics}`;
  const pendingKey = `lmp:impQ:pending:${className}:${mainSubject}:${chapter}:${topics}`;

  // -------------------------------------------------------------------
  // 1️⃣ REDIS FAST PATH
  // -------------------------------------------------------------------
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      const finalData =
        typeof redisCached === "object"
          ? redisCached
          : JSON.parse(redisCached);

      return res.status(200).json(
        new ApiResponse(
          200,
          { data: finalData },
          "Important Questions Ready (Redis)"
        )
      );
    }
  } catch (err) {
    console.error("Redis GET Error:", err);
  }

  // -------------------------------------------------------------------
  // 2️⃣ PENDING FLAG (AVOID DUPLICATE JOBS)
  // -------------------------------------------------------------------
  const isPending = await redis.get(pendingKey);

  if (!isPending) {
    await redis.set(pendingKey, "1", { EX: 300 }); // 5 min safety

    await inngest.send({
      name: "lmp/generate.importantQuestions",
      data: { className, subject, chapter, index },
    });
  }

  // -------------------------------------------------------------------
  // 3️⃣ QUEUED RESPONSE
  // -------------------------------------------------------------------
  return res
    .status(202)
    .json(
      new ApiResponse(202, null, "Important questions generation queued")
    );
});

const quizMcqFillupTrueFalse = asyncHandler(async (req, res) => {
  const { className, subject, chapter, index } = req.body;

  if (!className || !subject || !chapter) {
    throw new ApiError(400, "className, subject and chapter are required");
  }

  const { mainSubject } = parseSubject(subject);

  const topics =
    Array.isArray(index) && index.length > 0
      ? JSON.stringify(index)
      : "All key topics";

  const cacheKey = `lmp:quiz:${className}:${mainSubject}:${chapter}:${topics}`;
  const pendingKey = `lmp:quiz:pending:${className}:${mainSubject}:${chapter}:${topics}`;

  // -------------------------------------------------------------------
  // 1️⃣ REDIS FAST PATH
  // -------------------------------------------------------------------
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      const finalData =
        typeof redisCached === "object"
          ? redisCached
          : JSON.parse(redisCached);

      return res.status(200).json(
        new ApiResponse(
          200,
          { data: finalData },
          "Quiz (MCQ, Fillups, True/False) Ready (Redis)"
        )
      );
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // -------------------------------------------------------------------
  // 2️⃣ PENDING FLAG (AVOID DUPLICATE JOBS)
  // -------------------------------------------------------------------
  const isPending = await redis.get(pendingKey);

  if (!isPending) {
    await redis.set(pendingKey, "1", { EX: 300 }); // 5 min safety

    await inngest.send({
      name: "lmp/generate.quizMcqFillupTrueFalse",
      data: { className, subject, chapter, index },
    });
  }

  // -------------------------------------------------------------------
  // 3️⃣ QUEUED RESPONSE
  // -------------------------------------------------------------------
  return res
    .status(202)
    .json(
      new ApiResponse(202, null, "Quiz generation queued")
    );
});

const askAnyQuestion = asyncHandler(async (req, res) => {
  const question = req.body?.question?.trim() || "";
  const hasImage = !!req.files?.image;

  if (!question && !hasImage) {
    throw new ApiError(400, "Please provide a question or upload an image");
  }

  // ---------- IMAGE PROCESSING (IF ANY) ----------
  let extractedText = "";
  let labels = [];
  let mode = "no_image";
  let imageHash = "";

  if (hasImage) {
    let buffer = req.files.image[0].buffer;
    buffer = await sharp(buffer).png().toBuffer();

    imageHash = crypto.createHash("sha256").update(buffer).digest("hex");

    const [textResult] = await client.textDetection({
      image: { content: buffer },
    });
    extractedText = textResult.fullTextAnnotation?.text || "";

    const [labelResult] = await client.labelDetection({
      image: { content: buffer },
    });
    labels = (labelResult.labelAnnotations || [])
      .map((x) => x.description)
      .slice(0, 5);

    if (extractedText.trim()) mode = "text";
    else if (labels.length) mode = "label_only";
    else mode = "fallback";
  }

  const finalQuestion =
    question || extractedText || labels.join(", ");

  // ---------- JOB ID ----------
  const jobId = crypto
    .createHash("sha256")
    .update(finalQuestion + imageHash)
    .digest("hex");

  const cacheKey = `lmp:askany:${jobId}`;
  const pendingKey = `lmp:askany:pending:${jobId}`;

  // ---------- FAST PATH ----------
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.status(200).json({
      success: true,
      status: "completed",
      jobId,
      answer: cached.answer,
    });
  }

  // ---------- QUEUE ONCE ----------
  const isPending = await redis.get(pendingKey);
  if (!isPending) {
    await redis.set(pendingKey, "1", { EX: 300 });

    await inngest.send({
      name: "lmp/generate.askAnyQuestion",
      data: {
        jobId,
        finalQuestion,
        mode,
        extractedText,
        labels,
      },
    });
  }

  return res.status(202).json({
    success: true,
    status: "processing",
    jobId,
  });
});

const generatePYQs = asyncHandler(async (req, res) => {
  const { className, subject, chapter, year } = req.body;

  if (!className || !subject || !chapter || !year) {
    throw new ApiError(
      400,
      "className, subject, chapter and year are required"
    );
  }

  const { mainSubject } = parseSubject(subject);

  const cacheKey = `lmp:pyq:${className}:${mainSubject}:${chapter}:${year}`;
  const pendingKey = `lmp:pyq:pending:${className}:${mainSubject}:${chapter}:${year}`;

  // -------------------------------------------------------------------
  // 1️⃣ REDIS FAST PATH
  // -------------------------------------------------------------------
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      const finalData =
        typeof redisCached === "object"
          ? redisCached
          : JSON.parse(redisCached);

      return res
        .status(200)
        .json(new ApiResponse(200, { data: finalData }, "PYQs Ready (Redis)"));
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // -------------------------------------------------------------------
  // 2️⃣ PENDING FLAG (AVOID DUPLICATE JOBS)
  // -------------------------------------------------------------------
  const isPending = await redis.get(pendingKey);

  if (!isPending) {
    await redis.set(pendingKey, "1", { EX: 300 }); // 5 min safety

    await inngest.send({
      name: "lmp/generate.pyqs",
      data: { className, subject, chapter, year },
    });
  }

  // -------------------------------------------------------------------
  // 3️⃣ QUEUED RESPONSE
  // -------------------------------------------------------------------
  return res
    .status(202)
    .json(new ApiResponse(202, null, "PYQs generation queued"));
});

export { summarizer, topperStyleAnswer, importantQuestionGenerator, quizMcqFillupTrueFalse,askAnyQuestion, generatePYQs};