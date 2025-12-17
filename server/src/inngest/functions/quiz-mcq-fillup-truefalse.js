import { inngest } from "../../libs/inngest.js";
import { McqModel } from "../../models/ImportantMcqsTrueFalse/mcq.model.js"; 
import { detectCategory, parseSubject } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";

export const quizMcqFillupTrueFalseFn = inngest.createFunction(
  {
    name: "Generate Quiz (MCQ, Fillups, True/False)",
    id: "quiz-mcq-fillup-truefalse",
    retries:1,
  },
  { event: "lmp/generate.quizMcqFillupTrueFalse" },
  async ({ event, step }) => {
    const { className, subject, chapter, index } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(mainSubject);

    const topics =
      Array.isArray(index) && index.length > 0
        ? JSON.stringify(index)
        : "All key topics";

    const cacheKey = `lmp:quiz:${className}:${mainSubject}:${chapter}:${topics}`;
    const pendingKey = `lmp:quiz:pending:${className}:${mainSubject}:${chapter}:${topics}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await step.run("DB Check", async () => {
        return await McqModel.findOne({
          className,
          subject: mainSubject,
          chapter,
        });
      });

      if (dbCache) {
        const safeDBData = JSON.parse(JSON.stringify(dbCache.content));

        await step.run("Save Redis", async () => {
          await redis.set(cacheKey, JSON.stringify(safeDBData), {
            EX: 60 * 60 * 24 * 2,
          });
        });

        await redis.del(pendingKey);
        return { source: "database" };
      }

     // 3️⃣ RAW PROMPT (UNTOUCHED)
 const prompt = `
You are an API that returns ONLY valid JSON. No extra text, no explanation outside JSON.

Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}
Stream: ${category}

====================================================
TASK (ABSOLUTE)
====================================================
Generate ONLY the MOST FREQUENT, MOST IMPORTANT, and MOST SCORING CBSE BOARD QUESTIONS
STRICTLY from THIS chapter only.

⚠️ Accuracy Requirement: 99.9999%
Questions MUST be:
- Repeated in PYQs
- NCERT-aligned
- Teacher-predicted
- Almost guaranteed to appear in exams

❌ Do NOT generate rare, creative, or low-probability questions.

====================================================
QUESTION COUNT
====================================================
- Generate questions exactly as required by the current system.
- Do NOT change JSON structure.
- Do NOT add or remove keys.
- Do NOT add extra objects or fields.

====================================================
DIFFICULTY LEVEL APPLICATION (MANDATORY)
====================================================
If Difficulty = Easy:
- Direct questions
- Basic concepts
- Simple logic

If Difficulty = Medium:
- Standard CBSE board-level depth
- Concept + application

If Difficulty = Hard:
- High-rigor, exam-trap questions
- Multi-step thinking

⚠️ Difficulty affects ONLY:
- Depth
- Complexity

⚠️ Difficulty MUST NOT affect:
- Language rules
- JSON structure
- LaTeX rules
- Frontend rendering rules

====================================================
LANGUAGE POLICY (ABSOLUTE — SUBJECT-LOCKED)
====================================================

- Language MUST match the subject EXACTLY.
- Cross-language output is STRICTLY FORBIDDEN.
- Sanskrit and Hindi MUST NEVER be mixed.

SUBJECT → LANGUAGE MAPPING (MANDATORY):

1) If Subject is "Hindi":
   - ALL content MUST be written ONLY in PURE, STANDARD HINDI.
   - Use formal CBSE/NCERT academic Hindi only.
   - ❌ DO NOT include Sanskrit words or Sanskrit sentence structure.
   - ❌ DO NOT include English words.
   - ❌ DO NOT use Hinglish or transliteration.

2) If Subject is "Sanskrit":
   - ALL content MUST be written ONLY in PURE CLASSICAL SANSKRIT.
   - Use correct Sanskrit grammar, vocabulary, विभक्ति, and verb forms.
   - ❌ DO NOT use Hindi words (जैसे: है, नहीं, किया, प्रश्न).
   - ❌ DO NOT use Hindi sentence structure.
   - ❌ DO NOT include English words or transliteration.
   - ❌ DO NOT use modern Hindi/Sanskrit mix.
   - Sanskrit MUST look like a grammar textbook, NOT Hindi.

3) For ALL OTHER subjects (Mathematics, Science, Physics, Chemistry, Biology, SST, etc.):
   - ALL content MUST be written ONLY in STANDARD ACADEMIC ENGLISH.
   - ❌ DO NOT include Hindi or Sanskrit words.
   - ❌ DO NOT use Hinglish or translated phrases.

FORBIDDEN (ZERO TOLERANCE):
- Mixing Hindi and Sanskrit in any form.
- Transliteration (kya, arth, vidhya, etc.).
- Subject-language mismatch.
- Bilingual phrasing.

AUTO-REGENERATION RULE:
If ANY word, phrase, grammar pattern, or sentence structure
violates the subject-language rule
→ IMMEDIATELY discard and regenerate the entire output.

====================================================
QUESTION TYPE RULES (STRONG — SUBJECT-AWARE)
====================================================
- type MUST be one of: "mcq", "fillup", "true_false"

MCQ RULES:
- options field is REQUIRED ONLY for "mcq"
- options MUST NOT appear for fillup or true_false
- Exactly ONE correct option
- Options language MUST follow subject language strictly

TRUE/FALSE ANSWER VOCABULARY (MANDATORY):

If Subject is "English / Maths / Science / SST":
- answer MUST be EXACTLY one of:
  "True" or "False"

If Subject is "Hindi":
- answer MUST be EXACTLY one of:
  "सत्य" or "असत्य"

If Subject is "Sanskrit":
- answer MUST be EXACTLY one of:
  "आम्" or "न"

❌ Do NOT use:
- true / false (lowercase)
- हाँ / नहीं
- Yes / No
- Any mixed-language form

FILLUP RULES:
- answer MUST be a single word or short phrase
- Must follow subject language strictly

====================================================
UNIVERSAL FORMULA & FRONTEND RENDERING RULES
====================================================

ABSOLUTE LATEX MANDATE:
- EVERY mathematical expression MUST be written using LaTeX
- Wrap ONLY in:
  • Inline math → $ ... $
  • Display math → $$ ... $$

LATEX DELIMITER RESTRICTION:
- NEVER use \\( ... \\) or \\[ ... \\]
- Inline math ONLY → $...$
- Display math ONLY → $$...$$

LATEX COMMAND CONTAINMENT RULE:
- ANY LaTeX command starting with \\ is FORBIDDEN outside math mode

====================================================
QUESTION COUNT & DISTRIBUTION (ABSOLUTE)
====================================================
- mcq → 7
- fillup → 4
- true_false → 4
- TOTAL questions = EXACTLY 15
- questions array MUST contain exactly 15 objects
- If count mismatches → REGENERATE

====================================================
OUTPUT JSON STRUCTURE (STRICT — DO NOT CHANGE)
====================================================

{
  "chapter": "<chapter name>",
  "class": "<class name>",
  "subject": "<subject name>",
  "questions": [
    {
      "id": 1,
      "type": "mcq | fillup | true_false",
      "question": "<question text>",
      "options": ["A", "B", "C", "D"],
      "answer": "<correct answer>"
    }
  ]
}

====================================================
FINAL SELF-VALIDATION (MANDATORY)
====================================================
Before returning JSON:
- Check JSON validity
- Check NO extra keys
- Check Sanskrit ≠ Hindi strictly
- Check true/false vocabulary per subject
- Check LaTeX safety
- Check question type vs options rule

If ANY rule is violated → REGENERATE INTERNALLY.

====================================================
OUTPUT
====================================================
Return ONLY valid JSON. NOTHING ELSE.
`;



      // -------------------------------------------------------------------
      // 3️⃣ CALL OPENAI
      // -------------------------------------------------------------------
      const aiRaw = await step.run("Call OpenAI", async () => {
        return await askOpenAI(prompt, "gpt-5.1", {
  response_format: { type: "json_object" }
     });
      });

      // -------------------------------------------------------------------
      // 4️⃣ PARSE + VALIDATE (UNCHANGED)
      // -------------------------------------------------------------------
      let finalQuestions;
      try {
        const cleaned = aiRaw
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        finalQuestions = JSON.parse(cleaned);

        const requiredFields = ["questions"];
        const missingFields = requiredFields.filter(
          (f) => !finalQuestions[f]
        );

        if (missingFields.length > 0) {
          throw new Error(
            "Missing required fields: " + missingFields.join(", ")
          );
        }

        if (
          !Array.isArray(finalQuestions.questions) ||
          finalQuestions.questions.length === 0
        ) {
          throw new Error("Questions array is empty or invalid");
        }
      } catch (err) {
        throw new Error("Failed to parse AI response: " + err.message);
      }

      // -------------------------------------------------------------------
      // 5️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await McqModel.create({
          className,
          subject: mainSubject,
          chapter,
          content: finalQuestions,
        });
      });

      // -------------------------------------------------------------------
      // 6️⃣ SAVE REDIS
      // -------------------------------------------------------------------
      await step.run("Save Redis", async () => {
        await redis.set(cacheKey, JSON.stringify(finalQuestions), {
          EX: 60 * 60 * 24 * 2,
        });
      });

      await redis.del(pendingKey);

      return { source: "generated" };
    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`quizMcqFillupTrueFalse error: ${err.message}`);
    }
  }
);
