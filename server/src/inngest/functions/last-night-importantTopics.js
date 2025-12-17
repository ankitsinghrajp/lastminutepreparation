import { inngest } from "../../libs/inngest.js";
import { ImpTopicsModel } from "../../models/LastMinuteBeforeExam/impTopics.model.js";
import { parseSubject, detectCategory } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";
import { lastMinuteExtractJson as extractJSON } from "./extractJsonForFunctions/lastMinuteExtractJson.js";
export const lastNightImportantTopicsFn = inngest.createFunction(
  { name: "Generate LMP Important Topics",
    id: "last-night-important-topics",
    retries:1,
   },
  { event: "lmp/generate.importantTopics" },
  async ({ event, step }) => {
    try {
      const { className, subject, chapter } = event.data;
      const { mainSubject, bookName } = parseSubject(subject);
      const category = detectCategory(mainSubject);

      const cacheKey = `lmp:imptopics:${className}:${mainSubject}:${chapter}`;
      const pendingKey = `lmp:imptopics:pending:${className}:${mainSubject}:${chapter}`;

      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await step.run("DB Check", async () => {
        return await ImpTopicsModel.findOne({
          className,
          subject: mainSubject,
          chapter,
        });
      });

      if (dbCache) {
        const safeDBContent = JSON.parse(JSON.stringify(dbCache.content));

        await step.run("Save Redis", async () => {
          await redis.set(cacheKey, JSON.stringify(safeDBContent), {
            EX: 60 * 60 * 24 * 2,
          });
        });

        await redis.del(pendingKey);
        return { topics: safeDBContent, source: "database" };
      }

      // -------------------------------------------------------------------
      // 2️⃣ BUILD PROMPT (UNCHANGED)
      // -------------------------------------------------------------------
      const prompt = await step.run("Build Prompt", async () => {
      return `
You are an API that returns ONLY valid JSON.
No extra text, no explanation outside JSON.

Class: ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

TASK:
Generate EXACTLY 6 MOST FREQUENT and MOST IMPORTANT
CBSE Board exam IMPORTANT TOPICS strictly from THIS chapter only.

Each topic must:
- Be a syllabus-defined Physics concept
- Be frequently asked or high-weightage in CBSE exams
- Represent a concept students revise the night before exam

For EACH topic:
- Give the topic name
- Give a short definition (1–2 lines)
- Give ONE standard CBSE formula directly related to that topic

────────────────────────────────────────
LANGUAGE POLICY (ABSOLUTE — SUBJECT-LOCKED)
────────────────────────────────────────

- Language of topics and explanations is STRICTLY determined by the subject.
- Language MUST match the subject exactly.
- Cross-language output is STRICTLY FORBIDDEN.

SUBJECT → LANGUAGE MAPPING (MANDATORY):

1) If Subject is "Hindi":
   - ALL topics and explanations MUST be written ONLY in PURE, STANDARD HINDI.
   - Use formal CBSE/NCERT academic Hindi only.
   - DO NOT include any English or Sanskrit words.
   - Formula MUST be empty string "".

2) If Subject is "Sanskrit":
   - ALL topics and explanations MUST be written ONLY in PURE CLASSICAL SANSKRIT.
   - Use correct Sanskrit grammar, vocabulary, विभक्ति, and verb forms.
   - DO NOT include English words or transliteration.
   - Formula MUST be empty string "".

3) For ALL OTHER subjects (Physics, Chemistry, Maths, etc.):
   - ALL topics and explanations MUST be written ONLY in STANDARD ACADEMIC ENGLISH.
   - DO NOT include Hindi, Sanskrit, or Hinglish.

FORBIDDEN (ZERO TOLERANCE):

- Mixing languages in any form.
- Transliteration.
- Subject-language mismatch.
- Bilingual phrasing.

AUTO-REGENERATION RULE (MANDATORY):

- If ANY language rule is violated,
  → IMMEDIATELY discard and regenerate the entire output.

────────────────────────────────────────
CHAPTER–TOPIC ISOLATION (STRICT)
────────────────────────────────────────

- Topics MUST belong strictly to the given chapter and its syllabus.
- DO NOT introduce topics, laws, or formulas from other chapters or classes.

────────────────────────────────────────
TOPIC CONTENT RULES
────────────────────────────────────────

- EXACTLY 6 topics.
- Topic name must be short and precise (e.g., "Electric Flux").
- Explanation must be a definition or meaning (1–2 lines only).
- NO questions.
- NO derivations.
- NO examples.
- NO extra theory.

────────────────────────────────────────
UNIVERSAL FORMULA & MATH RULES (MANDATORY)
────────────────────────────────────────

1) ABSOLUTE LATEX MANDATE:
- EVERY mathematical or physical expression MUST be written using LaTeX.
- Inline math → $ ... $
- Display math → $$ ... $$

────────────────────────────────────────
LATEX DELIMITER RESTRICTION
────────────────────────────────────────

- NEVER use \\( ... \\) or \\[ ... \\].
- Use ONLY $...$ or $$...$$.

────────────────────────────────────────
FORMULA SEPARATION RULE (STRICT)
────────────────────────────────────────

- NEVER write formulas or symbols in the "explanation" field.
- ALL formulas MUST appear ONLY inside the "formula" field.

────────────────────────────────────────
FORMULA FIELD RULE (VERY IMPORTANT)
────────────────────────────────────────

- Formula field MUST contain:
  ✔ ONE standard CBSE formula related to THAT topic
  ✔ PURE LaTeX expression only
- DO NOT include:
  ✖ text
  ✖ explanations
  ✖ multiple formulas
- DO NOT use $ or $$ inside the formula field.

Example (CORRECT for Electric Flux):
\\Phi_E = \\vec{E} \\cdot \\vec{A}

Example (WRONG):
Electric flux is given by Φ = E·A



FORMULA HARD CONSTRAINT (ABSOLUTE):

- Formula MUST contain EXACTLY ONE mathematical or chemical expression.
- NEVER include definitions, labels, headings, or words inside formula.
- NEVER use \\text{}, \\quad, commas, semicolons, or explanations.
- NEVER combine multiple formulas in one field.
- If a topic has multiple cases, choose ONLY the MOST STANDARD CBSE formula.
- If violated → REGENERATE.


KATEX COMPATIBILITY RULE (ABSOLUTE):

- Formula MUST use ONLY standard, widely supported LaTeX commands.
- Allowed examples: \\lim, \\frac, \\sin, \\cos, \\tan, \\to, \\cdot, ^, _, =, +, -
- FORBIDDEN: any invented or uncommon commands such as \\uim, \\ulim, \\ltext, \\eqn, etc.
- If any non-standard command appears → REGENERATE.


────────────────────────────────────────
FINAL SELF-VALIDATION (MANDATORY)
────────────────────────────────────────

Before returning JSON:
- Confirm EXACTLY 6 topics
- Confirm explanation is definition-style
- Confirm formula belongs to the topic
- Confirm no formula appears in explanation
- Confirm LaTeX correctness

Return output ONLY after passing ALL checks.

────────────────────────────────────────
OUTPUT JSON (STRICT)
────────────────────────────────────────

{
  "topics": [
    {
      "topic": "Topic name",
      "explanation": "1–2 line definition of the topic",
      "formula": "Pure LaTeX formula related to the topic"
    }
  ]
}

────────────────────────────────────────
CRITICAL
────────────────────────────────────────

- EXACTLY 6 topics
- Output ONLY valid JSON
- NO extra fields
- NO extra text
- Must render correctly in Markdown + KaTeX
`;



      });

      // -------------------------------------------------------------------
      // 3️⃣ CALL OPENAI
      // -------------------------------------------------------------------
      const aiRaw = await step.run("Call OpenAI" ,async () => {
        return await askOpenAI(prompt,"gpt-5.1");
      });

      // -------------------------------------------------------------------
      // 4️⃣ EXTRACT JSON
      // -------------------------------------------------------------------
      const parsed = await step.run("Extract JSON", async () => {
        return extractJSON(aiRaw);
      });

      if (!parsed.topics || !Array.isArray(parsed.topics)) {
        throw new Error("Invalid topics format");
      }

      const safeParsed = JSON.parse(JSON.stringify(parsed));

      // -------------------------------------------------------------------
      // 5️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await ImpTopicsModel.create({
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

      return { topics: safeParsed.topics, source: "generated" };


    } catch (err) {
      throw new Error(`generateImportantTopics error: ${err.message}`);
    }
  }
);
