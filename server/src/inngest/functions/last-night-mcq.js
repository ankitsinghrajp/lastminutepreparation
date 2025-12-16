import { inngest } from "../../libs/inngest.js";
import { LastMinuteMCQModel } from "../../models/LastMinuteBeforeExam/lastMinuteMcq.model.js";
import { parseSubject, detectCategory } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";
import { lastMinuteExtractJson as extractJSON } from "./extractJsonForFunctions/lastMinuteExtractJson.js";
export const lastNightMCQsFn = inngest.createFunction(
  {
    id: "lmp-mcqs",
    name: "Generate LMP MCQs",
    retries:1,
  },
  { event: "lmp/generate.mcqs" },
  async ({ event, step }) => {
    const { className, subject, chapter } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(mainSubject);

    const cacheKey = `lmp:mcqs:${className}:${mainSubject}:${chapter}`;
    const pendingKey = `lmp:mcqs:pending:${className}:${mainSubject}:${chapter}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await step.run("DB Check", async () => {
        return await LastMinuteMCQModel.findOne({
          className,
          subject: mainSubject,
          chapter,
        });
      });

      if (dbCache) {
        const safeDBContent = JSON.parse(JSON.stringify(dbCache.content));

        await redis.set(cacheKey, JSON.stringify(safeDBContent), {
          EX: 60 * 60 * 24 * 2,
        });

        await redis.del(pendingKey);
        return { mcqs: safeDBContent.mcqs, source: "database" };
      }

      // -------------------------------------------------------------------
      // 2️⃣ BUILD PROMPT (UNCHANGED)
      // -------------------------------------------------------------------
  const prompt = `
You are an API. Output ONLY valid JSON.
NO markdown, NO backticks, NO extra text.

Class ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

STRICT LANGUAGE RULE:
- If subject is Hindi → write question and explanation ONLY in Hindi.
- If subject is Sanskrit → write question and explanation ONLY in Sanskrit.
- Otherwise → write ONLY in English.
- Do NOT mix languages.

FORMULA RULE (STRICT SEPARATION):
- ALL mathematical formulas, equations, algebraic expressions, or symbols MUST appear ONLY in the "formula" field.
- NEVER write formulas inside:
  • question
  • options
  • explanation
- The "question" and "explanation" fields must contain ONLY plain verbal text.
- If a formula is needed for the MCQ, place it ONLY in the "formula" field.
- If no formula is required, use empty string "".


CRITICAL LATEX & SYMBOL RULE (MANDATORY):

- NEVER write any mathematical expression, LaTeX command, or symbol in plain text.
  This includes (but is not limited to): \\frac, \\sqrt, powers, subscripts, superscripts,
  Greek symbols, units, or algebraic expressions.

- EVERY mathematical expression MUST be written using proper LaTeX syntax
  AND MUST be wrapped inside LaTeX math delimiters:
    • Inline math → $ ... $
    • Display math → $$ ... $$

- NEVER write symbols like pi, theta, alpha, beta, cm^3, m^2, etc. in plain text.
  ALWAYS use proper LaTeX commands:
    • pi → \\pi
    • theta → \\theta
    • alpha → \\alpha
    • beta → \\beta
    • cm^3 → \\text{ cm}^3

- Examples (CORRECT):
    ✔️ $2\\pi rh$
    ✔️ $A = 2\\pi r(h + r)$
    ✔️ $12\\pi \\text{ cm}^3$
    ✔️ $\\frac{n}{2}(2a + (n - 1)d)$

- If ANY mathematical content appears outside $...$ or $$...$$,
  or any symbol is written in plain text,
  the output is INVALID and MUST be regenerated.



For questions, options, and explanations:
- If mathematical expressions are required, write them ONLY using standard LaTeX wrapped in $...$ or $$...$$.
- Do NOT write raw expressions like x^2 or b^2 - 4ac without LaTeX.
- The "formula" field must still contain the main formula separately.


CBSE PYQ PRIORITY RULE (VERY IMPORTANT):
- Generate MCQs ONLY from CBSE Previous Year Questions (PYQs), sample papers, and repeatedly asked board exam patterns.
- Each MCQ must represent a concept that has a VERY HIGH PROBABILITY (≈99%) of appearing in the exam.
- Avoid rare, tricky, or non-board-oriented questions.
- Prefer questions commonly asked for 1 mark in CBSE board exams.
- Think like a CBSE paper setter, not a coaching test creator.


TASK:
Generate EXACTLY 5 MCQs strictly based on the chapter.
- Questions must be CBSE board level.
- Options must be clear and unambiguous.
- Explanation must be short and exam-oriented.
- Do NOT repeat the formula in explanation or question.

OUTPUT FORMAT (JSON MUST REMAIN EXACTLY SAME):
{
  "mcqs":[
    {
      "question":"...",
      "options":["...","...","...","..."],
      "correct":"...",
      "explanation":"...",
      "formula":""
    }
  ]
}

CRITICAL:
- Output ONLY the JSON object
- EXACTLY 5 MCQs
- NEVER duplicate formulas outside the formula field
`.trim();

      // -------------------------------------------------------------------
      // 3️⃣ CALL OPENAI
      // -------------------------------------------------------------------
      const aiRaw = await step.run("Call OpenAI",async () => {
        return await askOpenAI(prompt);
      });

      // -------------------------------------------------------------------
      // 4️⃣ EXTRACT JSON
      // -------------------------------------------------------------------
      const parsed = extractJSON(aiRaw);

      parsed.mcqs.forEach((mcq, idx) => {
        if (!mcq.question || !mcq.correct || !mcq.options)
          throw new Error(`Invalid MCQ structure at ${idx}`);

        if (!Array.isArray(mcq.options) || mcq.options.length !== 4)
          throw new Error(`MCQ ${idx} must contain exactly 4 options`);

        if (!mcq.options.includes(mcq.correct))
          throw new Error(`Correct answer mismatch in MCQ ${idx}`);
      });

      const safeParsed = JSON.parse(JSON.stringify(parsed));

      // -------------------------------------------------------------------
      // 5️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await LastMinuteMCQModel.create({
          className,
          subject: mainSubject,
          chapter,
          content: safeParsed,
        });
      });

      // -------------------------------------------------------------------
      // 6️⃣ SAVE REDIS
      // -------------------------------------------------------------------
      await redis.set(cacheKey, JSON.stringify(safeParsed), {
        EX: 60 * 60 * 24 * 2,
      });

      await redis.del(pendingKey);

      return { mcqs: safeParsed.mcqs, source: "generated" };

    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`generateMCQs error: ${err.message}`);
    }
  }
);
