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

────────────────────────────────────────
LANGUAGE POLICY (ABSOLUTE — SUBJECT LOCKED)
────────────────────────────────────────

Language MUST strictly follow the subject.
NO cross-language mixing is allowed.

1) If Subject is "Hindi":
   - ALL content (question, options, explanation) MUST be ONLY in PURE, FORMAL HINDI.
   - Use CBSE / NCERT academic Hindi.
   - NO English words.
   - NO Sanskrit words.
   - NO Hinglish or transliteration.

2) If Subject is "Sanskrit":
   - ALL content MUST be ONLY in PURE CLASSICAL SANSKRIT.
   - Use correct Sanskrit grammar, vocabulary, verb forms, and case endings (विभक्ति).
   - NO Hindi words.
   - NO Hindi sentence structure.
   - NO English words.
   - NO transliteration.

   Forbidden in Sanskrit:
   • Hindi auxiliaries (है, हैं, किया, करेगा, आदि)
   • Hindi connectors (और, लेकिन, क्योंकि, आदि)
   • Modern conversational tone

   Required Sanskrit indicators (at least one must appear):
   • कथयत्, दर्शयत्, लिखत्, सिद्धं कुरुत, प्रश्नान् उत्तरत्, व्याख्यायतु
   • Proper Sanskrit verb forms and विभक्ति usage

   If ANY Hindi or English word or grammar appears → IMMEDIATELY regenerate.

3) For ALL OTHER subjects (Maths, Science, Physics, Chemistry, Biology, SST, etc.):
   - ALL content MUST be ONLY in STANDARD ACADEMIC ENGLISH.
   - NO Hindi.
   - NO Sanskrit.
   - NO Hinglish or translated phrasing.

AUTO-REGENERATION RULE:
- If ANY subject-language rule is violated, discard and regenerate completely.

────────────────────────────────────────
CHAPTER–TOPIC ISOLATION (STRICT)
────────────────────────────────────────

- MCQs MUST belong strictly to the given chapter and its syllabus.
- DO NOT introduce topics, formulas, reactions, or question styles
  from other chapters or classes.
- Avoid unnecessary narrative unless NCERT or PYQs explicitly use it.

────────────────────────────────────────
MCQ QUALITY RULES
────────────────────────────────────────

- EXACTLY ONE correct option per MCQ.
- Each MCQ must test a CORE concept, law, formula, or result.
- Options must be plausible and exam-oriented.
- Avoid trivial, vague, or guess-based questions.

────────────────────────────────────────
UNIVERSAL FORMULA & MATH RULES (MANDATORY)
────────────────────────────────────────

1) ABSOLUTE LATEX MANDATE:
- EVERY mathematical expression (equations, formulas, fractions, powers,
  subscripts, trigonometric functions, inequalities, derivatives, integrals,
  chemical equations, units) MUST be written using LaTeX.
- Inline math → $ ... $
- Display math → $$ ... $$
- NEVER output mathematical tokens or operators as plain text.

────────────────────────────────────────
LATEX DELIMITER RESTRICTION (MANDATORY)
────────────────────────────────────────

- NEVER use escaped LaTeX delimiters \\( ... \\) or \\[ ... \\].
- Inline mathematics MUST be written ONLY using:
  • $ ... $
- Display mathematics MUST be written ONLY using:
  • $$ ... $$
- Any occurrence of \\(, \\), \\[, or \\] is STRICTLY FORBIDDEN.
- If such delimiters appear, regenerate the output.

────────────────────────────────────────
LATEX COMMAND CONTAINMENT RULE (MANDATORY)
────────────────────────────────────────

- ANY LaTeX command (a token starting with backslash \\) is FORBIDDEN outside math mode.
- Examples of forbidden commands outside $...$ or $$...$$ include:
  • \\mathbb
  • \\times
  • \\to
  • \\cap
  • \\cup
  • \\in
  • \\subset
  • \\subseteq
  • \\Rightarrow
- ALL such commands MUST appear ONLY inside $...$ or $$...$$.
- If any backslash-command appears outside math delimiters, regenerate the output.

────────────────────────────────────────
PLAIN-TEXT MATH TOKEN BAN (MANDATORY)
────────────────────────────────────────

- The following tokens are STRICTLY FORBIDDEN outside LaTeX math delimiters:
  sin, cos, tan, sec, cosec, cot,
  sin^-1, cos^-1, tan^-1, sec^-1, cosec^-1, cot^-1,
  frac, sqrt, leq, geq, <=, >=,
  pi, mu, theta, degree,
  ^ (as plain text),
  |x|, mod, modulus,
  any raw backslash-commands not inside $...$ or $$...$$.

- Fractions MUST use \\frac{a}{b}.
- Roots MUST use \\sqrt{}.
- Trigonometric functions MUST use \\sin, \\cos, etc.
- Absolute value MUST use \\lvert x \\rvert or \\left| x \\right| inside LaTeX.

────────────────────────────────────────
INEQUALITIES & SYSTEMS
────────────────────────────────────────

- Inequalities MUST use LaTeX symbols only: \\leq, \\geq.
- NEVER use <= or >=.
- NEVER split equations across lines.

────────────────────────────────────────
CHEMICAL EQUATIONS
────────────────────────────────────────

- ALL chemical reactions MUST be written as DISPLAY math only:
  $$ ... $$
- NEVER use inline math or plain text.

────────────────────────────────────────
STATISTICS / DATA MCQs
────────────────────────────────────────

- If data is involved (mean, median, mode, variance, SD, frequency):
  • ALWAYS present data in a proper markdown table.
  • If data is ungrouped, FIRST convert it to a frequency table.
  • After every table, insert EXACTLY ONE blank line before text.

────────────────────────────────────────
NEWLINES & ESCAPED CHARACTERS
────────────────────────────────────────

- NEVER use escaped newlines like \\n.
- Use real line breaks only.
- NEVER include escaped math delimiters.


FINAL SELF-VALIDATION (MANDATORY):

Before returning the JSON:
- Scan the ENTIRE output.
- If ANY backslash-command (\\mathbb, \\cap, \\emptyset, \\text, etc.)
  appears OUTSIDE $...$ or $$...$$ → REGENERATE.
- If ANY mathematical symbol appears outside LaTeX → REGENERATE.
- If ANY rule is violated → REGENERATE internally until compliant.

Return output ONLY after passing ALL checks.

────────────────────────────────────────
OUTPUT JSON (STRICT — DO NOT MODIFY)
────────────────────────────────────────

{
  "mcqs": [
    {
      "question": "Complete CBSE-style MCQ question in markdown (math inside $...$ or $$...$$)",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": "Exact matching option text",
      "explanation": "Short, exam-focused explanation",
      "formula": "LaTeX formula only, WITHOUT $ or $$, or empty string"
    }
  ]
}




────────────────────────────────────────
CRITICAL (NON-NEGOTIABLE)
────────────────────────────────────────

- EXACTLY 5 MCQs
- Return ONLY valid JSON
- NO extra fields
- NO stray punctuation
- NO markdown outside JSON fields
- NO partial math outside LaTeX
- Subject-based language compliance has HIGHEST priority
- Output MUST be fully compatible with Markdown + KaTeX renderer
`;



      // -------------------------------------------------------------------
      // 3️⃣ CALL OPENAI
      // -------------------------------------------------------------------
      const aiRaw = await step.run("Call OpenAI",async () => {
        return await askOpenAI(prompt, "gpt-5.1");
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
