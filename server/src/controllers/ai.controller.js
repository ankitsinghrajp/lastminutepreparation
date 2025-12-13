import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { askOpenAI ,openai } from "../utils/OpenAI.js";
import { configDotenv } from "dotenv";
import { PyqModel } from "../models/PreviousYearQuestions/pyq.model.js";
import { parseSubject } from "../utils/helper.js";
import { McqModel } from "../models/ImportantMcqsTrueFalse/mcq.model.js";
import { ImpQuestionModel } from "../models/ImportantQuestionsPage/impquestions.model.js";

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

  // ✅ NEW VALIDATION ADDED
  if (
    (!topic || !topic.trim()) &&
    (!req.files || !req.files.image)
  ) {
    throw new ApiError(400, "Either topic or image is required!");
  }

  let extractedText = "";
  let labels = [];
  let mode = "no_image";

  // ✅ REAL IMAGE (OPTIONAL)
  if (req.files && req.files.image) {
    let fileBuffer = req.files.image[0].buffer;

    try {
      fileBuffer = await sharp(fileBuffer).png().toBuffer();
    } catch (e) {
      throw new ApiError(400, "Invalid image file");
    }

    const [textResult] = await client.textDetection({
      image: { content: fileBuffer },
    });

    extractedText = textResult.fullTextAnnotation?.text || "";

    const [labelResult] = await client.labelDetection({
      image: { content: fileBuffer },
    });

    labels = (labelResult.labelAnnotations || [])
      .map((x) => x.description)
      .slice(0, 5);

    if (extractedText.trim()) mode = "text";
    else if (!extractedText.trim() && labels.length) mode = "label_only";
    else mode = "fallback";
  }

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

  const aiData = await openai.responses.create({
    model: "gpt-4o",
    input: safePrompt,
    max_output_tokens: 800,
  });

  let cleanedOutput = aiData.output_text
    .replace(/\r/g, "")
    .replace(/[\u200B-\u200F\uFEFF]/g, "")
    .replace(/^[ \t]+$/gm, "")
    .replace(/^\s*\n/gm, "\n")
    .replace(/\n{3,}/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  return res.status(200).json(
    new ApiResponse(200, cleanedOutput, "Summary generated successfully!")
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
  const { mainSubject, bookName } = parseSubject(subject);

  if (!className || !subject || !chapter) {
    throw new ApiError(400, "className, subject and chapter are required");
  }

  const topics =
    Array.isArray(index) && index.length > 0
      ? JSON.stringify(index)
      : "All key topics";

  // REDIS CACHE KEY
  const cacheKey = `lmp:quiz:${className}:${mainSubject}:${chapter}:${topics}`;

  // 1️⃣ CHECK REDIS CACHE
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      let finalData;

      // Case 1: Already an object (Upstash sometimes returns objects)
      if (typeof redisCached === "object") {
        finalData = redisCached;
      }

      // Case 2: String → parse safely
      else if (typeof redisCached === "string") {
        try {
          finalData = JSON.parse(redisCached);
        } catch {
          console.log("Invalid JSON in Redis — ignoring cache.");
        }
      }

      if (finalData) {
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              { data: finalData },
              "Quiz (MCQ, Fillups, True/False) Ready"
            )
          );
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // 2️⃣ CHECK DATABASE
  try {
    const dbCache = await McqModel.findOne({
      className,
      subject: mainSubject,
      chapter,
    });

    if (dbCache) {
      const safeDBData = JSON.parse(JSON.stringify(dbCache.content));

      // Write to Redis (2 days)
      await redis.set(cacheKey, JSON.stringify(safeDBData), {
        ex: 60 * 60 * 24 * 2,
      });

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { data: safeDBData },
            "Quiz (MCQ, Fillups, True/False) Ready"
          )
        );
    }
  } catch (err) {
    console.error("DB Cache Error:", err);
  }

  // 3️⃣ RAW PROMPT (UNTOUCHED)
  const prompt = `
You are a CBSE Exam Expert. Generate ONLY HIGH-VALUE questions from the chapter.
Include MCQs, Fillups, and True/False with answers.

INPUT:
- Class: ${className}
- Subject: ${mainSubject}
- Chapter Name: ${chapter}
- Topics: ${topics}
- Bookname: ${bookName}

STRICT GENERATION RULES:
1. Generate 15 to 20 VERY IMPORTANT questions in total.
2. Must include all 3 types:
   - "mcq" → minimum 7
   - "fillup" → minimum 5
   - "true_false" → minimum 4

3. MCQ Rules:
   - Must contain EXACTLY 4 options.
   - "answer" must MATCH one of the options EXACTLY.

4. Fillups Rules:
   - Must use "______".
   - Answer MUST be provided.

5. True/False Rules:
   - Answer must be EXACTLY "True" or "False".

6. NO missing fields.

RETURN STRICT JSON ONLY.
`;

  // 4️⃣ CALL OPENAI
  const apiData = await askOpenAI(prompt);

  let finalQuestions;
  try {
    const cleaned = apiData
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    finalQuestions = JSON.parse(cleaned);

    // Validate minimal structure
    const requiredFields = ["class", "subject", "chapter", "questions"];
    const missingFields = requiredFields.filter((f) => !finalQuestions[f]);

    if (missingFields.length > 0) {
      throw new Error("Missing required fields: " + missingFields.join(", "));
    }

    if (
      !Array.isArray(finalQuestions.questions) ||
      finalQuestions.questions.length === 0
    ) {
      throw new Error("Questions array is empty or invalid");
    }
  } catch (err) {
    console.error("JSON Parse Error:", err);
    throw new ApiError(500, "Failed to parse AI response: " + err.message);
  }

  // 5️⃣ SAVE TO DATABASE
  await McqModel.create({
    className,
    subject: mainSubject,
    chapter,
    content: finalQuestions,
  });

  // 6️⃣ SAVE TO REDIS SAFELY
  await redis.set(cacheKey, JSON.stringify(finalQuestions), {
    ex: 60 * 60 * 24 * 2, // 2 days
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { data: finalQuestions },
      "MCQs + Fillups + True/False generated successfully 🔥"
    )
  );
});


const askAnyQuestion = asyncHandler(async (req, res) => {

  // ✅ FIX 1: CRASH-PROOF BODY ACCESS (DO NOT DESTRUCTURE)
  const question = req.body?.question || "";

  if (
    (!question.trim()) &&
    (!req.files || !req.files.image)
  ) {
    throw new ApiError(400, "Please provide a question or upload an image");
  }

  let extractedText = "";
  let labels = [];
  let mode = "no_image";

  // ✅ FIX 3: IMAGE HANDLING (COPIED FROM SUMMARIZER)
  if (req.files && req.files.image) {
    let fileBuffer = req.files.image[0].buffer;

    try {
      fileBuffer = await sharp(fileBuffer).png().toBuffer();
    } catch (e) {
      throw new ApiError(400, "Invalid image file");
    }

    const [textResult] = await client.textDetection({
      image: { content: fileBuffer },
    });

    extractedText = textResult.fullTextAnnotation?.text || "";

    const [labelResult] = await client.labelDetection({
      image: { content: fileBuffer },
    });

    labels = (labelResult.labelAnnotations || [])
      .map((x) => x.description)
      .slice(0, 5);

    if (extractedText.trim()) mode = "text";
    else if (!extractedText.trim() && labels.length) mode = "label_only";
    else mode = "fallback";
  }

  const finalQuestion =
    question.trim() ||
    extractedText ||
    labels.join(", ");

  // ✅ ✅ ✅ PROMPT IS 100% INTACT BELOW — NOT MODIFIED
const prompt = `
You are a CBSE Board exam expert. Think internally first, but DO NOT show your thinking. Your ONLY task is to write full-mark answers exactly the way toppers write in their exam notebooks — clean, simple, direct, and only what is required to score full marks.

----------------------------------
IMAGE + QUESTION MODE
----------------------------------
If an IMAGE is provided:
- First understand completely what the image contains (question / numerical / diagram / theory / graph / flowchart).
- If it contains a QUESTION → solve it in perfect CBSE topper style.
- If it contains a DIAGRAM → explain every part clearly.
- If it contains THEORY → explain it cleanly.

If ONLY QUESTION is provided:
- Answer it directly in topper style.

----------------------------------
INPUT DATA
----------------------------------
Question: ${finalQuestion}

Image Analysis Mode: ${mode}

Extracted Image Text:
${extractedText || "(none)"}

Detected Image Labels:
${labels.join(", ") || "(none)"}

----------------------------------
STRICT LANGUAGE RULE:
If the subject is Hindi  → answer ONLY in Hindi.
If the subject is Sanskrit  → answer ONLY in Sanskrit in 2–3 lines.
Otherwise → answer ONLY in English.

----------------------------------
ABSOLUTE FORMULA & SYMBOL LAW (CRITICAL — NO EXCEPTIONS)
----------------------------------
❗ EVERY mathematical variable, vector, subscript, superscript, Greek letter, or symbol MUST appear ONLY inside LaTeX.

✅ Correct:
$ q_1 $, $ q_2 $, $ r $, $ r_1 $, $ r^2 $, $ \\hat{r} $, $ F $, $ V $, $ I $

❌ FORBIDDEN:
(q_1), (q_2), r_1, F ∝ 1/r² in plain text

✅ If unit vector appears → write only $\\hat{r}$
✅ Subscripts must be only like $q_1$, $r_2$

----------------------------------
RULES:
- Start answer directly.
- Simple, crisp language.
- No unnecessary theory.
- Bold only key words.

----------------------------------
SPECIAL CASE — NUMERICAL / DERIVATION:
- Only required steps.
- ALL formulas inside $$ ... $$
- Each formula in its OWN $$ block.

----------------------------------
✅ ✅ ✅ SPECIAL CASE — COMPARISON / DIFFERENCE QUESTIONS
----------------------------------
IF the question contains any of these words:
"compare", "difference", "distinguish", "vs", "versus", "table"

THEN YOU MUST:
- Output a **PROPER MARKDOWN TABLE**
- Use **| | format**
- First column must be **"Basis"**
- Minimum **6 rows**
- Use **bold headings**
- Use LaTeX $...$ inside table ONLY where required
- NO text before or after the table

----------------------------------
OUTPUT FORMAT — MACHINE SAFE
----------------------------------
- Output ONLY the final answer.
- NO explanations about rules.
- NO code blocks.
- Markdown tables are ALLOWED ONLY for comparison questions.
- If ANY math symbol appears outside $...$ or $$...$$ then REWRITE.


SPECIAL CASE — DIAGRAM QUESTIONS:
If the question asks to "draw", "sketch", or "show diagram",
YOU MUST:
- Draw a neat TEXT / ASCII diagram suitable for exam use.
- Clearly label all forces, angles, and important parts.
- Do NOT mention that it is an ASCII diagram.
- Do NOT use any image links or markdown images.


----------------------------------
FINAL COMMAND:
----------------------------------
Now answer this question in FULL compliance with ALL rules above:
${finalQuestion}
`;


  // ✅ SAME ESCAPING LOGIC AS BEFORE
  const safePrompt = prompt.replace(/\\/g, "\\\\");

  const apiData = await askOpenAI(safePrompt, "gpt-5.1");
  
  return res.status(200).json(
    new ApiResponse(
      200,
      { answer: apiData },
      "Answer generated successfully."
    )
  );
});


// Generate PYQS
const generatePYQs = asyncHandler(async (req, res) => {
  const { className, subject, chapter, year } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);

  if (!className || !subject || !chapter || !year) {
    throw new ApiError(
      400,
      "className, subject, chapter and year are required"
    );
  }

  // REDIS CACHE KEY
  const cacheKey = `lmp:pyq:${className}:${mainSubject}:${chapter}:${year}`;

  // 1️⃣ CHECK REDIS CACHE FIRST
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      let finalData;

      // If Upstash returns an object
      if (typeof redisCached === "object") {
        finalData = redisCached;
      }

      // If Upstash returns a string → parse safely
      else if (typeof redisCached === "string") {
        try {
          finalData = JSON.parse(redisCached);
        } catch {
          console.log("Invalid JSON in Redis — ignoring.");
        }
      }

      if (finalData) {
        return res
          .status(200)
          .json(
            new ApiResponse(200, { data: finalData }, "PYQs Ready")
          );
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // 2️⃣ CHECK DATABASE CACHE
  try {
    const dbCache = await PyqModel.findOne({
      className,
      subject: mainSubject,
      chapter,
      year,
    });

    if (dbCache) {
      const safeDB = JSON.parse(JSON.stringify(dbCache.content));

      // Save to Redis (2 days)
      await redis.set(cacheKey, JSON.stringify(safeDB), {
        ex: 60 * 60 * 24 * 2,
      });

      return res
        .status(200)
        .json(
          new ApiResponse(200, { data: safeDB }, "PYQs Ready")
        );
    }
  } catch (err) {
    console.error("DB Cache Error:", err);
  }

  // 3️⃣ RAW PROMPT (UNTOUCHED)
  const prompt = `
You are a CBSE PYQ Expert. Your ONLY task is to generate synthetic but accurate
CBSE-style PYQs for ONE specific year provided by the user.

USER INPUT:
- Class: ${className}
- Subject: ${subject}
- Chapter: ${chapter}
- Year: ${year}

STRICT GENERATION RULES:
1. Generate **10 to 15 high-value PYQs** for the given year ONLY.
2. For EACH question include ALL fields:
   - "id"
   - "year" → MUST be exactly ${year}
   - "marks" → 1, 2, 3, or 5 ONLY
   - "question" → Must be meaningful and chapter-focused
3. NO repeated questions.
4. ABSOLUTELY NO missing fields.
5. NO explanation.
6. Return STRICT JSON ONLY.

FINAL OUTPUT FORMAT:
{
  "class": "${className}",
  "subject": "${subject}",
  "chapter": "${chapter}",
  "year": ${year},
  "pyqs": [
    {
      "id": 1,
      "year": ${year},
      "marks": 3,
      "question": "Explain the role of …"
    }
  ]
}
RETURN STRICT JSON ONLY.
  `;

  // 4️⃣ CALL OPENAI
  const aiResponse = await askOpenAI(prompt, "gpt-5.1");

  // 5️⃣ CLEAN & PARSE JSON
  let finalJson;
  try {
    const cleaned = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    finalJson = JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ AI JSON Error:", err);
    throw new ApiError(500, "Failed to parse PYQ JSON: " + err.message);
  }

  // 6️⃣ SAVE TO DATABASE
  await PyqModel.create({
    className,
    subject: mainSubject,
    chapter,
    year,
    content: finalJson,
  });

  // 7️⃣ SAVE TO REDIS (2 days)
  try {
    await redis.set(cacheKey, JSON.stringify(finalJson), {
      ex: 60 * 60 * 24 * 2,
    });
  } catch (err) {
    console.error("Redis SET error:", err);
  }

  return res.status(200).json(
    new ApiResponse(200, { data: finalJson }, "PYQs fetched successfully! 🎯")
  );
});



export { summarizer, topperStyleAnswer, importantQuestionGenerator, quizMcqFillupTrueFalse,askAnyQuestion, generatePYQs};