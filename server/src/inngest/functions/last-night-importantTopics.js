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
       return  `
You are a CBSE Board exam expert.
Think internally first, but DO NOT show your thinking.
You are an API that returns ONLY valid JSON. No extra text, no explanation outside JSON.

Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}
Stream: ${category}

────────────────────────────────────────────────────────
LANGUAGE POLICY (ABSOLUTE — SUBJECT-LOCKED)
────────────────────────────────────────────────────────

- Language of topics and explanations is STRICTLY determined by the subject.
- Language MUST match the subject exactly.
- Cross-language output is STRICTLY FORBIDDEN.

SUBJECT → LANGUAGE MAPPING (MANDATORY):

1) If Subject is "Hindi":
   - ALL topics and explanations MUST be written ONLY in PURE, STANDARD HINDI.
   - Use formal CBSE/NCERT academic Hindi only.
   - DO NOT include any English or Sanskrit words.
   - DO NOT use Hinglish or transliterated English.

2) If Subject is "Sanskrit":
   - ALL topics and explanations MUST be written ONLY in PURE CLASSICAL SANSKRIT.
   - Use correct Sanskrit grammar, vocabulary, विभक्ति, and verb forms.
   - DO NOT use Hindi words, Hindi sentence structure, or modern phrasing.
   - DO NOT include English words or transliteration.

3) For ALL OTHER subjects (Science, Maths, SST, Physics, Chemistry, Biology, etc.):
   - ALL topics and explanations MUST be written ONLY in STANDARD ACADEMIC ENGLISH.
   - DO NOT include Hindi, Sanskrit, or any regional language.
   - DO NOT use Hinglish or translated phrases.

AUTO-REGENERATION RULE (MANDATORY):
- If ANY word, phrase, grammar pattern, or sentence structure
  violates the subject-language rule,
  → IMMEDIATELY discard and regenerate the entire output.

────────────────────────────────────────────────────────
TASK
────────────────────────────────────────────────────────

Select EXACTLY 6 MOST IMPORTANT, HIGH-SCORING, and FREQUENTLY ASKED
CBSE Board exam topics STRICTLY from THIS chapter only.

────────────────────────────────────────────────────────
CONTENT RULES
────────────────────────────────────────────────────────

- EXACTLY 6 topics (strict)
- Explanation must be 1–2 lines only
- Write like a topper: direct, exam-focused
- No introductions, no background theory
- No subtopic lists inside topic names


────────────────────────────────────────────────────────
FORMULA-SUBJECTS FOR CLASSES 9–12 (DEEP-SYLLABUS CHECK)
────────────────────────────────────────────────────────

For CBSE Classes 9 through 12, ONLY the following subjects are considered
formula-subjects and MUST have a non-empty "formula" field (when subject
matches exactly):

- Mathematics
- Physics
- Chemistry
- Accountancy
- Economics

Rules:
1. If the "Subject" (case-sensitive match) equals one of the five above,
   → FORCE a non-empty LaTeX "formula" for EVERY one of the 6 topics (no exceptions).
2. If the "Subject" is any other CBSE subject (English, Hindi, Sanskrit,
   Biology, Computer Science, Informatics Practices, Business Studies,
   History, Geography, Political Science, Physical Education, etc.) →
   DO NOT force formulas. For language subjects, formula MUST be "".
3. Biology is treated as a non-formula subject by default. ONLY include a
   formula for Biology if the chapter explicitly contains a standard
   symbolic expression or equation that CBSE commonly expects (e.g.,
   a clearly textbook-listed symbolic relation). If such a formula is absent,
   return formula as "".
4. If the subject equals one of the five formula-subjects but a topic has
   genuinely no symbolic representation in NCERT/CBSE, still provide the
   most basic standard notation possible — do NOT return empty string.
5. After generation, STRICTLY validate:
   - If Subject is in the five-formula list → confirm all 6 topics have non-empty "formula".
   - If any topic lacks a formula → REGENERATE until compliant.
────────────────────────────────────────────────────────


ALLOWED FORMULA TYPES (USE AT LEAST ONE PER TOPIC):
- Definitions written symbolically
- Laws or principles in equation form
- Standard NCERT / CBSE expressions
- Identities, relations, inequalities
- Set notation, functional notation
- Chemical equations
- Physics relations
- Biology symbolic representations (if standard)

If a topic has NO obvious formula:
- Use the MOST BASIC standard representation used in CBSE answers.
- It may be simple, repetitive, or foundational.
- DO NOT skip.

────────────────────────────────────────────────────────
UNIVERSAL LATEX RULE (STRICT)
────────────────────────────────────────────────────────

- Use ONLY pure LaTeX syntax inside the "formula" field.
- DO NOT use $ or $$ inside the formula field.
- DO NOT use markdown.
- ONLY LaTeX expressions.

FORBIDDEN:
- Plain-text math
- Escaped delimiters \\( \\)
- Any backslash-command outside LaTeX context

────────────────────────────────────────────────────────
FORMULA SEPARATION RULE (STRICT)
────────────────────────────────────────────────────────

- NEVER write formulas, symbols, or equations in the "explanation" field.
- ALL mathematical content MUST appear ONLY in the "formula" field.
- Explanation must be purely verbal text.
- If violated → REGENERATE.

────────────────────────────────────────────────────────
OUTPUT FORMAT (STRICT JSON ONLY)
────────────────────────────────────────────────────────

{
  "topics": [
    {
      "topic": "High probability CBSE topic name",
      "explanation": "1–2 line crisp, scoring-oriented explanation",
      "formula": "COMPULSORY for non-language subjects"
    }
  ]
}

────────────────────────────────────────────────────────
FINAL SELF-VALIDATION (MANDATORY)
────────────────────────────────────────────────────────

Before returning the JSON:
- Confirm EXACTLY 6 topics
- Confirm ALL non-language topics have NON-EMPTY formulas
- Confirm NO formula appears in explanation
- Confirm LaTeX correctness
- If ANY rule is violated → REGENERATE internally

CRITICAL:
- Output ONLY JSON
- NO extra text
- NO missing formulas
- Must be 100% compatible with Markdown + KaTeX renderer
`;
;

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
