import { inngest } from "../../libs/inngest.js";
import { ChapterWiseImportantQuestionModel } from "../../models/chapterWiseStudy/chapterWiseImportantQuestion.model.js";
import { parseSubject, detectCategory } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";

const extractJSON = (text) => {
  if (!text) throw new Error("Empty response received from AI.");

  // Remove markdown fences safely
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");

  if (first === -1 || last === -1) {
    throw new Error("No JSON object found in AI response.");
  }

  const jsonString = cleaned.slice(first, last + 1);

  // ❌ DO NOT strip control characters
  // ❌ DO NOT touch backslashes
  // ❌ DO NOT normalize whitespace

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    throw new Error(
      "JSON parse failed. Raw extracted JSON:\n" + jsonString
    );
  }

  // 🔒 Schema validation
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !Array.isArray(parsed.questions) ||
    parsed.questions.length !== 10
  ) {
    throw new Error("Invalid JSON schema: expected exactly 10 questions.");
  }

  parsed.questions.forEach((q, i) => {
    if (!q || typeof q.question !== "string" || !q.question.trim()) {
      throw new Error(`Invalid question at index ${i}`);
    }
  });

  return parsed;
};


export const chapterWiseStudyQuestionsFn = inngest.createFunction(
  {
    name: "Generate Chapter Wise Study Questions",
    id: "chapter-wise-study-questions",
    retries: 1,
  },
  { event: "lmp/generate.chapterWiseStudyQuestions" },
  async ({ event, step }) => {
    const { className, subject, chapter } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(subject); // ✅ correct input

    const cacheKey = `lmp:studyq:${className}:${mainSubject}:${chapter}`;
    const pendingKey = `lmp:studyq:pending:${className}:${mainSubject}:${chapter}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbData = await step.run("DB Check", async () => {
        return await ChapterWiseImportantQuestionModel.findOne({
          className,
          subject: mainSubject,
          chapter,
        });
      });

      if (dbData) {
        const safeDBContent = JSON.parse(JSON.stringify(dbData.content));

        await step.run("Save Redis", async () => {
          await redis.set(cacheKey, JSON.stringify(safeDBContent), {
            EX: 60 * 60 * 24 * 2,
          });
        });

        await redis.del(pendingKey);
        return { source: "database" };
      }

      // -------------------------------------------------------------------
      // 2️⃣ PROMPT (UNCHANGED)
      // -------------------------------------------------------------------
const prompt = `
You are an API that returns ONLY valid JSON. No extra text, no explanation outside JSON.

Class: ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

TASK:
Generate EXACTLY 10 MOST FREQUENT and MOST IMPORTANT CBSE board exam questions 
STRICTLY from THIS chapter only. Questions must be exam-ready, complete, and in
the same style and rigor as NCERT back exercises and official CBSE PYQs.

LANGUAGE POLICY (ABSOLUTE — SUBJECT-LOCKED):

- Language MUST match the subject exactly.
- Cross-language output is STRICTLY FORBIDDEN.

SUBJECT → LANGUAGE MAPPING (MANDATORY):

1) If Subject is "Hindi":
   - ALL questions MUST be written ONLY in PURE, STANDARD HINDI.
   - Use formal CBSE/NCERT academic Hindi only.
   - DO NOT include any English or Sanskrit words.
   - DO NOT use Hinglish or transliterated English.

2) If Subject is "Sanskrit":
   - ALL questions MUST be written ONLY in PURE CLASSICAL SANSKRIT.
   - Use correct Sanskrit grammar, vocabulary, विभक्ति, and verb forms.
   - DO NOT use Hindi words, Hindi sentence structure, or modern phrasing.
   - DO NOT include English words or transliteration.

3) For ALL OTHER subjects (Science, Maths, SST, Physics, Chemistry, Biology, etc.):
   - ALL questions MUST be written ONLY in STANDARD ACADEMIC ENGLISH.
   - DO NOT include Hindi, Sanskrit, or any regional language.
   - DO NOT use Hinglish or translated phrases.

FORBIDDEN (ZERO TOLERANCE):

- Mixing languages in any form.
- Transliteration (e.g., "kya", "arth", "vidhya", "kathan", etc.).
- Subject-language mismatch (e.g., English questions for Hindi subject).
- Bilingual phrasing or explanations.

AUTO-REGENERATION RULE (MANDATORY):

- If ANY word, phrase, grammar pattern, or sentence structure
  violates the subject-language rule,
  → IMMEDIATELY discard and regenerate the entire output.



CHAPTER–TOPIC ISOLATION:
- Questions MUST belong strictly to the given chapter and its syllabus.
- Do NOT introduce topics or question types from other chapters or classes.
- Avoid unnecessary narrative/context unless NCERT or PYQ uses that context.

QUESTION FORMAT:
- Exactly 10 questions.
- No one-line or vague questions.
- Multi-part questions (a), (b), (c) are allowed; each sub-part MUST start on a new line.
- If numerical data is required, provide complete data within the question.

UNIVERSAL FORMULA & MATH RULES (APPLY ALWAYS)
(These rules apply regardless of subject. They are universal and mandatory.)

1) ABSOLUTE LATEX MANDATE:
- Every mathematical expression (equations, formulas, fractions, powers, subscripts,
  trigonometric functions, inequalities, derivatives, integrals, chemical equations, units)
  MUST be written using LaTeX and wrapped inside:
    • Inline math → $ ... $  OR
    • Display math → $$ ... $$
- NEVER output mathematical tokens or operators as plain text (examples below).


LATEX DELIMITER RESTRICTION (MANDATORY):

- NEVER use escaped LaTeX delimiters \\( ... \\) or \\[ ... \\].
- Inline mathematics MUST be written ONLY using:
  • $ ... $
- Display mathematics MUST be written ONLY using:
  • $$ ... $$
- Any occurrence of \\(, \\), \\[, or \\] is STRICTLY FORBIDDEN.
- If such delimiters appear, regenerate the output.


LATEX COMMAND CONTAINMENT RULE (MANDATORY):

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


2) PLAIN-TEXT MATH TOKEN BAN:
- The following tokens are STRICTLY FORBIDDEN outside LaTeX math delimiters:
  sin, cos, tan, sec, cosec, cot, sin^-1, cos^-1, tan^-1, sec^-1, cosec^-1, cot^-1,
  frac, sqrt, leq, geq, <=, >=, pi, mu, theta, degree, ^ (as plain text),
  |x|, mod, modulus, any raw backslash-commands not inside $...$ or $$...$$.
- Fractions MUST use \\frac{a}{b}; roots MUST use \\sqrt{}, trig functions must use \\sin, \\cos, etc.
- Absolute value must use \\lvert x \\rvert or \\left| x \\right| inside LaTeX.

3) INEQUALITIES & SYSTEMS:
- For a system of inequalities, use ONE display math block with each inequality on a new line:
  $$
  x + 2y \\leq 10 \\\\
  3x + y \\geq 5 \\\\
  x \\geq 0, \\; y \\geq 0
  $$

4) CHEMICAL EQUATIONS:
- ALL chemical reactions MUST be written as display math only: $$ ... $$.
- NEVER use \\( ... \\) or inline plain text for chemical equations.

5) STATISTICS / TABLES:
- If question involves statistics (mean, median, mode, variance, SD, frequency),
  → ALWAYS present data in a markdown table.
  → If data is ungrouped, FIRST convert to a frequency table.
  → After every table include exactly one blank line before the following text.

6) NEWLINES & ESCAPED CHARACTERS:
- NEVER use escaped newlines like \\n in the question text. Use real line breaks.
- Do NOT include escaped math delimiters like \\( or \\) — use $ or $$ only.

7) SUB-PARTS: (Strictly Follow if not regenerate)
- Each sub-part (a),(b),(c) MUST begin on its own line and be clearly numbered.

8) For every statistics if table is needed give markdown table if not regenerate



MARKDOWN RULE:
- Markdown is allowed only for line breaks, sub-parts and markdown tables.
- Do NOT use code blocks or headings.
- Tables MUST be proper markdown tables with each row on its own line.



FINAL SELF-VALIDATION (MANDATORY):

Before returning the JSON:
- Scan the ENTIRE output.
- If ANY backslash-command (\\mathbb, \\cap, \\emptyset, \\text, etc.)
  appears OUTSIDE $...$ or $$...$$ → REGENERATE.
- If ANY mathematical symbol appears outside LaTeX → REGENERATE.
- If ANY rule is violated → REGENERATE internally until compliant.

Return output ONLY after passing ALL checks.

OUTPUT JSON (STRICT):
Return ONLY this exact JSON structure, with exactly 10 questions:

{
  "questions": [
    { "question": "Complete CBSE-style question in markdown (math inside $...$ or $$...$$)" },
    { "question": "..." },
    { "question": "..." },
    { "question": "..." },
    { "question": "..." },
    { "question": "..." },
    { "question": "..." },
    { "question": "..." },
    { "question": "..." },
    { "question": "..." }
  ]
}

CRITICAL:
- If ANY of the above rules are violated, regenerate the output.
- NO extra fields, NO stray punctuation, NO partial math outside LaTeX.
- Output MUST be fully compatible with a Markdown+KaTeX renderer.
`;


      // -------------------------------------------------------------------
      // 3️⃣ CALL OPENAI
      // -------------------------------------------------------------------
      const aiRaw = await step.run("Call OpenAI", async () => {
        return await askOpenAI(prompt);
      });

      // -------------------------------------------------------------------
      // 4️⃣ PARSE + VALIDATE
      // -------------------------------------------------------------------
      const parsed = await step.run("Extract JSON", async () => {
        return extractJSON(aiRaw);
      });

      parsed.questions.forEach((q, idx) => {
        if (!q.question) {
          throw new Error(`Invalid question structure at index ${idx}`);
        }
      });

      const safeParsed = JSON.parse(JSON.stringify(parsed));

      // -------------------------------------------------------------------
      // 5️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await ChapterWiseImportantQuestionModel.create({
          className,
          subject: mainSubject,
          chapter,
          content: safeParsed,
        });
      });

      // -------------------------------------------------------------------
      // 6️⃣ SAVE REDIS
      // -------------------------------------------------------------------
      await step.run("Save Redis", async () => {
        await redis.set(cacheKey, JSON.stringify(safeParsed), {
          EX: 60 * 60 * 24 * 2,
        });
      });

      await redis.del(pendingKey);

      return { source: "generated" };
    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`chapterWiseStudyQuestions error: ${err.message}`);
    }
  }
);
