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
You are an API that returns ONLY valid JSON.
No extra text, no explanation outside JSON.

Class: ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

TASK:
Generate EXACTLY 5 MOST FREQUENT, MOST IMPORTANT, and VERY HIGH-PROBABILITY
CBSE Board MCQs strictly from THIS chapter only.

These MCQs must be:
- Based on NCERT back exercises
- Based on CBSE Previous Year Questions (PYQs)
- Extremely likely (≈99%) to appear in board exams

LANGUAGE RULE:
- Hindi → questions, options, explanations ONLY in Hindi.
- Sanskrit → questions, options, explanations ONLY in Sanskrit.
- Otherwise → questions, options, explanations ONLY in English.
- Do NOT mix languages anywhere.

SANSKRIT LANGUAGE LOCK (ABSOLUTE):

- If the subject is Sanskrit:
  • ALL content MUST be written in PURE CLASSICAL SANSKRIT.
  • ONLY standard Sanskrit grammar, vocabulary, and sentence structure is allowed.
  • DO NOT use Hindi words, Hindi grammar, or modern phrasing.
  • Do NOT mix Hindi and Sanskrit under any circumstances.

- Forbidden in Sanskrit:
  • Hindi auxiliaries (है, हैं, किया, करेगा, आदि)
  • Hindi connectors (और, लेकिन, क्योंकि, आदि)

- Required Sanskrit indicators (at least one):
  • कथयत्, दर्शयत्, लिखत्, सिद्धं कुरुत, प्रश्नान् उत्तरत्, व्याख्यायतु
  • Proper Sanskrit verb forms and case endings

- If ANY Hindi word or Hindi grammar appears, REGENERATE.

CHAPTER–TOPIC ISOLATION:
- MCQs MUST belong strictly to the given chapter.
- Do NOT introduce concepts, formulas, or question types from other chapters.
- Avoid real-life stories unless explicitly required by NCERT or PYQs.

MCQ QUALITY RULES:
- Each MCQ must test a CORE concept, formula, or result from this chapter.
- Avoid trivial or guess-based questions.
- Options must be plausible and exam-oriented.
- Exactly ONE correct option per MCQ.

UNIVERSAL FORMULA & MATH RULES (MANDATORY):

1) ABSOLUTE LATEX MANDATE:
- EVERY mathematical expression MUST be written in LaTeX and wrapped inside:
  • Inline math → $ ... $
  • Display math → $$ ... $$
- NEVER write math in plain text.

2) LATEX DELIMITER RESTRICTION:
- NEVER use \\( ... \\) or \\[ ... \\].
- ONLY $...$ or $$...$$ are allowed.
- If violated, regenerate.

3) LATEX COMMAND CONTAINMENT:
- ANY LaTeX command starting with \\ is FORBIDDEN outside math mode.
- This includes:
  • \\mathbb
  • \\times
  • \\to
  • \\cap
  • \\cup
  • \\in
  • \\subset
  • \\leq
  • \\geq
- All must appear ONLY inside $...$ or $$...$$.

4) PLAIN-TEXT MATH TOKEN BAN:
- The following MUST NEVER appear outside LaTeX:
  sin, cos, tan, sec, cosec, cot,
  sin^-1, cos^-1, tan^-1,
  frac, sqrt, pi, mu, theta,
  <=, >=, leq, geq, |x|, mod

5) INEQUALITIES & EQUATIONS:
- MUST be written using LaTeX symbols only:
  • \\leq
  • \\geq
- NEVER split equations across lines.

6) CHEMICAL EQUATIONS:
- MUST be written as display math only:
  $$ ... $$

7) STATISTICS MCQs:
- If data-based:
  • Use a PROPER markdown table.
  • NEVER give raw lists.
  • Insert exactly ONE blank line after the table.

8) NEWLINES:
- NEVER use escaped \\n.
- Use real line breaks only.

OUTPUT JSON (STRICT — DO NOT MODIFY STRUCTURE):

{
  "mcqs": [
    {
      "question": "Complete CBSE-style MCQ question (markdown allowed, math inside $ or $$)",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": "Exact matching option text",
      "explanation": "Short, exam-focused explanation",
      "formula": "LaTeX formula only, WITHOUT $ or $$, or empty string"
    }
  ]
}

CRITICAL:
- EXACTLY 5 MCQs
- Return ONLY valid JSON
- NO markdown outside fields
- NO partial math outside LaTeX
- Output MUST be fully compatible with Markdown + KaTeX renderer
`;


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
