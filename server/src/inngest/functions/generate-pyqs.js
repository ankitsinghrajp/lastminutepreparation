import { inngest } from "../../libs/inngest.js";
import { PyqModel } from "../../models/PreviousYearQuestions/pyq.model.js";
import { detectCategory, parseSubject } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";

export const generatePYQsFn = inngest.createFunction(
  {
    name: "Generate PYQs",
    id: "generate-pyqs",
    retries: 1,
  },
  { event: "lmp/generate.pyqs" },
  async ({ event, step }) => {
    const { className, subject, chapter, year } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(subject);

    const cacheKey = `lmp:pyq:${className}:${mainSubject}:${chapter}:${year}`;
    const pendingKey = `lmp:pyq:pending:${className}:${mainSubject}:${chapter}:${year}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await step.run("DB Check", async () => {
        return await PyqModel.findOne({
          className,
          subject: mainSubject,
          chapter,
          year,
        });
      });

      if (dbCache) {
        const safeDB = JSON.parse(JSON.stringify(dbCache.content));

        await step.run("Save Redis", async () => {
          await redis.set(cacheKey, JSON.stringify(safeDB), {
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
You are a CBSE PYQ Expert. Your ONLY task is to generate synthetic but EXTREMELY ACCURATE
CBSE-style Previous Year Questions for ONE specific year provided by the user.

====================================================
USER INPUT
====================================================
- Class: ${className}
- Subject: ${mainSubject}
- Chapter: ${chapter}
- Bookname: ${bookName}
- Year: ${year}
- Stream: ${category}

====================================================
CORE PYQ INTELLIGENCE RULE (ABSOLUTE)
====================================================
You MUST mentally simulate CBSE board paper setting for the given year.

- Deeply analyze:
  • CBSE paper trends
  • NCERT emphasis
  • Weightage shifts
  • Repeated concepts across previous years
  • Chapter importance in that specific year

- Treat this as:
  “If CBSE sets the paper for ${year}, which questions from THIS chapter are MOST LIKELY to appear?”

❌ Do NOT generate:
- Timeless generic questions
- Random chapter questions
- Questions that could appear in any year

✅ Generate ONLY:
- Year-specific
- Pattern-accurate
- Examiner-predicted PYQs

====================================================
STRICT GENERATION RULES (ORIGINAL — INTACT)
====================================================
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

====================================================
LANGUAGE POLICY (ABSOLUTE — SUBJECT-LOCKED)
====================================================
Language MUST match the subject exactly.
Cross-language output is STRICTLY FORBIDDEN.

SUBJECT → LANGUAGE MAPPING (MANDATORY):

1) If Subject is "Hindi":
   - ALL questions MUST be written ONLY in PURE, STANDARD HINDI.
   - Use formal CBSE/NCERT academic Hindi only.
   - DO NOT include any English or Sanskrit words.
   - DO NOT use Hinglish or transliteration.

2) If Subject is "Sanskrit":
   - ALL questions MUST be written ONLY in PURE CLASSICAL SANSKRIT.
   - Use correct Sanskrit grammar, vocabulary, विभक्ति, and verb forms.
   - DO NOT use Hindi words, Hindi sentence structure, or modern phrasing.
   - DO NOT include English words or transliteration.

3) For ALL OTHER subjects:
   - ALL questions MUST be written ONLY in STANDARD ACADEMIC ENGLISH.
   - DO NOT include Hindi, Sanskrit, or any regional language.
   - DO NOT use Hinglish or translated phrases.

FORBIDDEN (ZERO TOLERANCE):
- Mixing languages
- Transliteration (kya, arth, vidhya, etc.)
- Bilingual phrasing
- Subject-language mismatch

AUTO-REGENERATION RULE:
If ANY word, phrase, grammar pattern, or sentence structure
violates the subject-language rule
→ IMMEDIATELY discard and regenerate the entire output.

====================================================
CHAPTER–TOPIC ISOLATION
====================================================
- Questions MUST belong strictly to the given chapter.
- Do NOT introduce topics from other chapters or classes.
- Context allowed ONLY if NCERT or PYQs use it.

====================================================
UNIVERSAL FORMULA & MATH RULES (APPLY ALWAYS)
====================================================
ABSOLUTE LATEX MANDATE:
- EVERY mathematical expression MUST be written using LaTeX
- Wrap expressions ONLY in:
  • Inline math → $ ... $
  • Display math → $$ ... $$

LATEX DELIMITER RESTRICTION:
- NEVER use \\( ... \\) or \\[ ... \\]
- Inline math → $...$
- Display math → $$...$$

LATEX COMMAND CONTAINMENT RULE:
- ANY LaTeX command starting with \\ is FORBIDDEN outside math mode
- Examples:
  \\mathbb, \\times, \\to, \\cap, \\cup, \\in, \\subset, \\subseteq, \\Rightarrow

PLAIN-TEXT MATH TOKEN BAN:
- sin, cos, tan, sec, cosec, cot,
  frac, sqrt, <=, >=, pi, mu, theta, degree, ^, |x|
  are STRICTLY FORBIDDEN outside LaTeX.

INEQUALITIES & SYSTEMS:
- Use ONE $$ block
- Each inequality on a new line

CHEMICAL EQUATIONS:
- MUST be written ONLY in $$ ... $$

====================================================
STATISTICS / TABLES
====================================================
- If statistics involved → ALWAYS use markdown table
- Ungrouped data → convert to frequency table FIRST
- Leave exactly ONE blank line after table

====================================================
NEWLINES & ESCAPED CHARACTERS
====================================================
- NEVER use escaped \\n
- Use real line breaks only
- NEVER escape math delimiters

====================================================
FINAL OUTPUT FORMAT (STRICT — UNCHANGED)
====================================================
Return ONLY this exact JSON structure:

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

====================================================
FINAL SELF-VALIDATION (MANDATORY)
====================================================
Before returning JSON:
- Check TOTAL questions = 10–15
- Check NO missing or extra fields
- Check year field is EXACTLY ${year} for every question
- Check language rules
- Check LaTeX rules
- Check chapter isolation
- Check questions feel YEAR-SPECIFIC

If ANY rule is violated → REGENERATE INTERNALLY.

====================================================
OUTPUT
====================================================
Return STRICT JSON ONLY. NOTHING ELSE.
`;


      // -------------------------------------------------------------------
      // 3️⃣ CALL OPENAI
      // -------------------------------------------------------------------
      const aiRaw = await step.run("Call OpenAI",async () => {
        return await askOpenAI(prompt, "gpt-5.1",{
           response_format: { type: "json_object" }
        });
      });

      // -------------------------------------------------------------------
      // 4️⃣ PARSE JSON
      // -------------------------------------------------------------------
      let finalJson;
      try {
        const cleaned = aiRaw
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        finalJson = JSON.parse(cleaned);
      } catch (err) {
        throw new Error("Failed to parse PYQ JSON: " + err.message);
      }

      // -------------------------------------------------------------------
      // 5️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await PyqModel.create({
          className,
          subject: mainSubject,
          chapter,
          year,
          content: finalJson,
        });
      });

      // -------------------------------------------------------------------
      // 6️⃣ SAVE REDIS
      // -------------------------------------------------------------------
      await step.run("Save Redis", async () => {
        await redis.set(cacheKey, JSON.stringify(finalJson), {
          EX: 60 * 60 * 24 * 2,
        });
      });

      await redis.del(pendingKey);

      return { source: "generated" };
    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`generatePYQs error: ${err.message}`);
    }
  }
);
