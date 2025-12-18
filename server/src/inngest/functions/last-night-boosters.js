import { inngest } from "../../libs/inngest.js";
import { Booster } from "../../models/LastMinuteBeforeExam/memoryBooster.model.js";
import { parseSubject, detectCategory } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";
import { lastMinuteExtractJson as extractJSON } from "./extractJsonForFunctions/lastMinuteExtractJson.js";

export const lastNightMemoryBoosterFn = inngest.createFunction(
  {
    id: "lmp-memory-booster",
    name: "Generate LMP Memory Booster",
    retries: 1,
  },
  { event: "lmp/generate.memoryBooster" },
  async ({ event, step }) => {
    const { className, subject, chapter } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(mainSubject);

    const cacheKey = `lmp:booster:${className}:${mainSubject}:${chapter}`;
    const pendingKey = `lmp:booster:pending:${className}:${mainSubject}:${chapter}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await step.run("DB Check", async () => {
        return await Booster.findOne({
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
        return { boosters: safeDBContent.boosters, source: "database" };
      }

    const prompt = `
You are an API that returns ONLY valid JSON.
No extra text, no explanation outside JSON.

Class: ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

TASK:
Generate EXACTLY 3 MEMORY BOOSTERS strictly from THIS chapter only.

Types (EXACT):
1) acronym
2) story
3) pattern

Boosters must help students recall exam-relevant concepts quickly.

────────────────────────────────────────
LANGUAGE POLICY (ABSOLUTE — SUBJECT LOCKED)
────────────────────────────────────────

Language MUST strictly follow the subject.
NO cross-language mixing is allowed.

1) If Subject is "Hindi":
   - ALL content (content field only) MUST be ONLY in PURE, FORMAL HINDI.
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

- Boosters MUST belong strictly to the given chapter and its syllabus.
- DO NOT introduce concepts, formulas, reactions, or patterns
  from other chapters or classes.
- Avoid unnecessary narrative unless NCERT explicitly uses it.

────────────────────────────────────────
BOOSTER QUALITY RULES
────────────────────────────────────────

- EXACTLY 3 boosters.
- EXACTLY one booster of each type: acronym, story, pattern.
- Content must test or reinforce CORE concepts.
- Avoid vague, generic, motivational, or non-syllabus content.

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
STATISTICS / DATA
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

────────────────────────────────────────
FINAL SELF-VALIDATION (MANDATORY)
────────────────────────────────────────

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
  "boosters": [
    { "type": "acronym", "content": "...", "formula": "" },
    { "type": "story", "content": "...", "formula": "" },
    { "type": "pattern", "content": "...", "formula": "" }
  ]
}

────────────────────────────────────────
CRITICAL (NON-NEGOTIABLE)
────────────────────────────────────────

- EXACTLY 3 boosters
- Return ONLY valid JSON
- NO extra fields
- NO stray punctuation
- NO partial math outside LaTeX
- Subject-based language compliance has HIGHEST priority
- Output MUST be fully compatible with Markdown + KaTeX renderer
`;


      // -------------------------------------------------------------------
      // 3️⃣ CALL OPENAI
      // -------------------------------------------------------------------
      const aiRaw = await step.run("Call OpenAI", async () => {
        return await askOpenAI(prompt,"gpt-5-mini");
      });
const normalized = aiRaw.replace(/\r?\n/g, "\\n");
      const parsed = extractJSON(normalized);


      if (
        !parsed.boosters ||
        !Array.isArray(parsed.boosters) ||
        parsed.boosters.length !== 3
      ) {
        throw new Error("Invalid booster format");
      }

      const safeParsed = JSON.parse(JSON.stringify(parsed));

      // -------------------------------------------------------------------
      // 5️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await Booster.create({
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


      return { boosters: safeParsed.boosters, source: "generated" };

    } catch (err) {
      throw new Error(`generateMemoryBooster error: ${err.message}`);
    }
  }
);
