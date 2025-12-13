
import { inngest } from "../libs/inngest.js";
import { redis } from "../libs/redis.js";
import { ChapterWiseImportantQuestionModel } from "../models/chapterWiseStudy/chapterWiseImportantQuestion.model.js";
import { ChapterWiseMindMapModel } from "../models/chapterWiseStudy/chapterWiseMindMap.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { detectCategory, parseSubject } from "../utils/helper.js";
import { askOpenAI } from "../utils/OpenAI.js";

const extractJSON = (text) => {
  if (!text) throw new Error("Empty response received from AI.");

  text = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // Extract only JSON object
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("No JSON found.");

  let jsonString = text.substring(first, last + 1);

  // ❌ REMOVE THIS (breaking newlines)
  // jsonString = jsonString.replace(/\\/g, "\\\\");

  // Keep only this to clean invisible control chars
  jsonString = jsonString.replace(/[\u0000-\u001F]+/g, " ");

  return JSON.parse(jsonString);
};


const smartChapterSummary = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;

  if (!className || !subject || !chapter) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Missing class, subject or chapter"));
  }

  const { mainSubject } = parseSubject(subject);

  const cacheKey = `lmp:smartsummary:${className}:${mainSubject}:${chapter}`;
  const pendingKey = `lmp:smartsummary:pending:${className}:${mainSubject}:${chapter}`;

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
        .json(new ApiResponse(200, finalData, "Summary Ready (Redis)"));
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // -------------------------------------------------------------------
  // 2️⃣ PENDING FLAG (PREVENT DUPLICATE JOBS)
  // -------------------------------------------------------------------
  const isPending = await redis.get(pendingKey);

  if (!isPending) {
    await redis.set(pendingKey, "1", { EX: 120 });

    await inngest.send({
      name: "lmp/generate.smartChapterSummary",
      data: { className, subject, chapter },
    });
  }

  // -------------------------------------------------------------------
  // 3️⃣ QUEUED RESPONSE
  // -------------------------------------------------------------------
  return res
    .status(202)
    .json(new ApiResponse(202, null, "Smart Summary generation queued"));
});

const chapterWiseShortNotes = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;

  if (!className || !subject || !chapter) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Missing class, subject or chapter"));
  }

  const { mainSubject } = parseSubject(subject);

  const cacheKey = `lmp:shortnotes:${className}:${mainSubject}:${chapter}`;
  const pendingKey = `lmp:shortnotes:pending:${className}:${mainSubject}:${chapter}`;

  // -------------------------------------------------------------------
  // 1️⃣ REDIS FAST PATH
  // -------------------------------------------------------------------
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      const finalNotes =
        typeof redisCached === "string"
          ? redisCached
          : redisCached.shortNotes || redisCached;

      return res.status(200).json(
        new ApiResponse(
          200,
          { shortNotes: finalNotes },
          "Short Notes Ready (Redis)"
        )
      );
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // -------------------------------------------------------------------
  // 2️⃣ PENDING FLAG (PREVENT DUPLICATE JOBS)
  // -------------------------------------------------------------------
  const isPending = await redis.get(pendingKey);

  if (!isPending) {
    await redis.set(pendingKey, "1", { EX: 180 });

    await inngest.send({
      name: "lmp/generate.chapterWiseShortNotes",
      data: { className, subject, chapter },
    });
  }

  // -------------------------------------------------------------------
  // 3️⃣ QUEUED RESPONSE
  // -------------------------------------------------------------------
  return res
    .status(202)
    .json(
      new ApiResponse(202, null, "Short Notes generation queued")
    );
});


const chapterWiseMindMap = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;

  if (!className || !subject || !chapter) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Missing class, subject or chapter"));
  }

  const { mainSubject } = parseSubject(subject);

  const cacheKey = `lmp:mindmap:${className}:${mainSubject}:${chapter}`;
  const pendingKey = `lmp:mindmap:pending:${className}:${mainSubject}:${chapter}`;

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
        .json(new ApiResponse(200, finalData, "MindMap Ready (Redis)"));
    }
  } catch (err) {
    console.error("Redis GET Error:", err);
  }

  // -------------------------------------------------------------------
  // 2️⃣ PENDING FLAG (AVOID DUPLICATE JOBS)
  // -------------------------------------------------------------------
  const isPending = await redis.get(pendingKey);

  if (!isPending) {
    await redis.set(pendingKey, "1", { EX: 180 });

    await inngest.send({
      name: "lmp/generate.chapterWiseMindMap",
      data: { className, subject, chapter },
    });
  }

  // -------------------------------------------------------------------
  // 3️⃣ QUEUED RESPONSE
  // -------------------------------------------------------------------
  return res
    .status(202)
    .json(new ApiResponse(202, null, "MindMap generation queued"));
});


const chapterWiseStudyQuestions = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;

  if (!className || !subject || !chapter) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Missing class, subject or chapter"));
  }

  const { mainSubject } = parseSubject(subject);

  const cacheKey = `lmp:studyq:${className}:${mainSubject}:${chapter}`;
  const pendingKey = `lmp:studyq:pending:${className}:${mainSubject}:${chapter}`;

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
        .json(
          new ApiResponse(200, finalData, "Important Questions Ready (Redis)")
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
    await redis.set(pendingKey, "1", { EX: 180 });

    await inngest.send({
      name: "lmp/generate.chapterWiseStudyQuestions",
      data: { className, subject, chapter },
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


const chapterWiseDoubtSolver = asyncHandler(async (req, res) => {
  const { className, subject, chapter, user_doubt} = req.body;
  const { mainSubject, bookName } = parseSubject(subject);

  const prompt = `
  You are a CBSE Board exam expert. Think internally first, but DO NOT show your thinking.

Your ONLY task is to solve the student's doubt in a full-mark, topper-style answer — clean, neat, direct and exactly the way toppers write in their exam notebooks.

STRICT LANGUAGE RULE:
If the subject is Hindi → deeply read the doubt and answer ONLY in Hindi.
If the subject is Sanskrit → deeply read the doubt and answer ONLY in Sanskrit and strictly in 3 lines only (can be 2 or 3 lines but NEVER more than 3).
Otherwise → answer ONLY in English. Do NOT use Hindi for English subjects or vice-versa.
If this rule is violated, regenerate the answer.

ANSWER WRITING RULES:
- Start directly with the main concept asked — no introduction, no background story.
- Keep language simple, crisp and exam-oriented — not bookish.
- Include formulas, steps, diagrams, bullet points ONLY when they increase marks — do NOT force them.
- Bold only the MOST important keywords (2–4 only), not entire lines.
- Maintain natural notebook flow, not textbook style.
- No unnecessary theory.

Special case — Derivations / Numericals:
- Do NOT add definitions or theory.
- No introduction or conclusion.
- Only required steps and expressions that lead to the final result.
- Every formula inside $$ ... $$ must contain ONLY mathematical symbols — NO units or words inside.
- Units / explanation MUST be written outside the $$ formula $$ block on the next line.
- If using \\frac, \\sqrt, superscripts, subscripts, Greek letters → always use proper LaTeX syntax (\\alpha, \\theta, \\Delta etc.)

Output safety:
- LaTeX formulas must be wrapped ONLY in $...$ or $$...$$.
- No markdown headings (#), no backticks, no code blocks, no JSON.
- No phrases like "Final Answer:", "Explanation:", "Solution:", "According to the question", etc.
- NEVER write formulas inside normal brackets like ( V ), (Phi), (N). Mathematical symbols MUST appear only inside $$...$$.

Goal:
A topper-style doubt solving answer that is short, neat, direct and guaranteed full marks without unnecessary information.

ADDITIONAL VALIDATIONS:
✔ If the doubt has multiple parts — answer ALL parts one-by-one.
✔ Every heading must be followed by proper explanation — no empty headings.
✔ If the doubt includes “Explain / Define / List / Write properties” — provide clear points.
✔ Minimum 4 points whenever properties/advantages/characteristics are asked.
✔ Stop ONLY after the doubt is fully solved.

BEFORE sending the final answer:
🟢 Double-check the doubt is 100% solved.
🟢 Double-check language rule.
🟢 Double-check all formula safety rules.

OUTPUT: Only the topper-style answer. Nothing else.

Now solve the student's doubt:
Doubt: ${user_doubt}
Class: ${className}
Subject: ${mainSubject}
Chapter: ${chapter}
BookName: ${bookName}
`

  try {
    let output = await askOpenAI(prompt);
  

    return res
      .status(200)
      .json(new ApiResponse(200, output, "Doubt Answer Ready"));
  } catch (error) {
    console.error("Doubt generation failed:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          "Failed to solve doubt. Please try again."
        )
      );
  }
});






export {smartChapterSummary, chapterWiseStudyQuestions, chapterWiseShortNotes, chapterWiseMindMap, chapterWiseDoubtSolver}