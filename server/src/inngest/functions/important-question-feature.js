import { inngest } from "../../libs/inngest.js";
import { ImpQuestionModel } from "../../models/ImportantQuestionsPage/impquestions.model.js";
import { detectCategory, parseSubject } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";

export const importantQuestionGeneratorFn = inngest.createFunction(
  {
    name: "Generate Important Question Set",
    id: "important-question-generator",
    retries: 1,
  },
  { event: "lmp/generate.importantQuestions" },
  async ({ event, step }) => {
    const { className, subject, chapter, index } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
     const category = detectCategory(subject); // ✅ correct input
    

    const topics =
      Array.isArray(index) && index.length > 0
        ? JSON.stringify(index)
        : "All key topics";

    const cacheKey = `lmp:impQ:${className}:${mainSubject}:${chapter}:${topics}`;
    const pendingKey = `lmp:impQ:pending:${className}:${mainSubject}:${chapter}:${topics}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await step.run("DB Check", async () => {
        return await ImpQuestionModel.findOne({
          className,
          subject: mainSubject,
          chapter,
        });
      });

      if (dbCache) {
        const safeData = JSON.parse(JSON.stringify(dbCache.content));

        await step.run("Save Redis", async () => {
          await redis.set(cacheKey, JSON.stringify(safeData), {
            EX: 60 * 60 * 24 * 2,
          });
        });

        await redis.del(pendingKey);
        return { source: "database" };
      }

 // 2️⃣ PREPARE PROMPT (UNTOUCHED)
const prompt = `
You are an API that returns ONLY valid JSON. No extra text, no explanation outside JSON.

Class: ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}


====================================================
TASK
====================================================
Generate ONLY the MOST FREQUENT, MOST IMPORTANT, and MOST SCORING CBSE board exam questions
STRICTLY from THIS chapter only.

⚠️ Accuracy Requirement: 99.9999%
These questions MUST be:
- Repeated in PYQs
- NCERT-back-exercise aligned
- Teacher-predicted
- Almost guaranteed to appear in exams

❌ Do NOT generate low-probability, rare, creative, or filler questions.

====================================================
QUESTION COUNT (ABSOLUTE)
====================================================
- TOTAL questions = EXACTLY 10
- Distributed across the JSON sections logically
- Do NOT exceed or reduce count
- Missing or extra questions → INVALID OUTPUT

====================================================
DIFFICULTY LEVEL APPLICATION (MANDATORY)
====================================================
If Difficulty = Easy:
- Simple definitions, direct theory, basic numericals
- Suitable for average CBSE students

If Difficulty = Medium:
- Standard board-level questions
- Conceptual + application based

If Difficulty = Hard:
- High-weightage derivations and numericals
- Toppers-only preparation questions

⚠️ Difficulty affects ONLY:
- Depth
- Complexity
- Steps expected

⚠️ Difficulty does NOT override:
- Language rules
- JSON structure
- LaTeX rules
- Frontend rendering rules

====================================================
LANGUAGE POLICY (ABSOLUTE — SUBJECT-LOCKED)
====================================================

- Language MUST match the subject exactly.
- Cross-language output is STRICTLY FORBIDDEN.

SUBJECT → LANGUAGE MAPPING (MANDATORY):

1) If Subject is "Hindi":
   - ALL content MUST be written ONLY in PURE, STANDARD HINDI.
   - Use formal CBSE/NCERT academic Hindi only.
   - DO NOT include any English or Sanskrit words.
   - DO NOT use Hinglish or transliteration.

2) If Subject is "Sanskrit":
   - ALL content MUST be written ONLY in PURE CLASSICAL SANSKRIT.
   - Use correct Sanskrit grammar, vocabulary, विभक्ति, and verb forms.
   - DO NOT use Hindi words, Hindi sentence structure, or modern phrasing.
   - DO NOT include English words or transliteration.

3) For ALL OTHER subjects:
   - ALL content MUST be written ONLY in STANDARD ACADEMIC ENGLISH.
   - DO NOT include Hindi, Sanskrit, or any regional language.
   - DO NOT use Hinglish or translated phrases.

FORBIDDEN (ZERO TOLERANCE):
- Mixing languages
- Transliteration (kya, arth, vidhya, etc.)
- Bilingual phrasing
- Subject-language mismatch

AUTO-REGENERATION RULE:
If ANY language rule is violated → REGENERATE ENTIRE OUTPUT.

====================================================
CHAPTER–TOPIC ISOLATION
====================================================
- Content MUST belong strictly to the given chapter.
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

LATEX DELIMITER RESTRICTION (MANDATORY):
- NEVER use \\( ... \\) or \\[ ... \\]
- Inline math → $...$
- Display math → $$...$$
- Any \\(, \\), \\[, \\] → INVALID OUTPUT

LATEX COMMAND CONTAINMENT RULE:
- ANY LaTeX command starting with \\ is FORBIDDEN outside math mode
- Examples:
  \\mathbb, \\times, \\to, \\cap, \\cup, \\in, \\subset, \\subseteq, \\Rightarrow

PLAIN-TEXT MATH TOKEN BAN:
- The following are STRICTLY FORBIDDEN outside LaTeX:
  sin, cos, tan, sec, cosec, cot,
  frac, sqrt, <=, >=, pi, mu, theta, degree, ^, |x|

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
- Leave exactly ONE blank line after every table

====================================================
NEWLINES & ESCAPED CHARACTERS
====================================================
- NEVER use escaped newlines like \\n
- Use real line breaks only
- NEVER escape math delimiters

====================================================
MARKDOWN RULES
====================================================
- Markdown allowed ONLY for:
  • line breaks
  • bullet points
  • markdown tables
- NO headings
- NO code blocks

====================================================
OUTPUT JSON STRUCTURE (STRICT — DO NOT CHANGE)
====================================================

{
  "chapter": "${chapter}",
  "whyImportant": "Exactly 2 concise exam-focused lines",

  "importantQuestions": [
    {
      "question": "Most expected CBSE question",
      "marks": "1/2/3/5",
      "whyThisIsImportant": "1–2 exam-focused lines",
      "keywords": ["keyword1", "keyword2"],
      "modelAnswer": "Simple English exam-style answer"
    }
  ],

  "mustPracticeNumericals": [
    {
      "question": "High-probability numerical (only if applicable)",
      "marks": "2/3/5",
      "formulaUsed": ["formula1", "formula2"],
      "solutionSteps": "Step 1: ... Step 2: ... Step 3: ...",
      "commonMistake": "Common student mistake"
    }
  ],

  "veryShortQuestions": [
    {
      "question": "1-mark conceptual question",
      "answer": "Crisp answer",
      "keywords": ["term1"]
    }
  ],

  "longAnswerQuestions": [
    {
      "question": "Expected 5-mark / derivation question",
      "structure": "Intro → Point 1 → Point 2 → Diagram → Conclusion",
      "modelAnswer": "Full copy-ready exam answer",
      "diagramTip": "Diagram instruction if needed"
    }
  ],

  "examStrategy": {
    "howToAttempt": ["tip1", "tip2"],
    "mustRevise": ["topic1", "topic2"],
    "avoidMistakes": ["mistake1", "mistake2"]
  }
}

====================================================
FINAL SELF-VALIDATION (MANDATORY)
====================================================
Before returning JSON:
- Check TOTAL questions = EXACTLY 10
- Check NO extra or missing keys
- Check language rules
- Check LaTeX rules
- Check frontend safety
- Added table for statistics questions

If ANY rule is violated → REGENERATE INTERNALLY.

====================================================
OUTPUT
====================================================
Return ONLY valid JSON. NOTHING ELSE.
`;


      // -------------------------------------------------------------------
      // 3️⃣ CALL OPENAI
      // -------------------------------------------------------------------
      const aiRaw = await step.run("Call OpenAI",async () => {
        return await askOpenAI(prompt,"gpt-5-mini",  {
  response_format: { type: "json_object" }
     });
      });
    
      // -------------------------------------------------------------------
      // 4️⃣ PARSE + VALIDATE (UNCHANGED LOGIC)
      // -------------------------------------------------------------------
      let finalQuestions;
      try {
        const clean = aiRaw
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        finalQuestions = JSON.parse(clean);

        const required = [
          "chapter",
          "importantQuestions",
          "veryShortQuestions",
          "longAnswerQuestions",
          "examStrategy",
        ];

        const missing = required.filter((f) => !finalQuestions[f]);
        if (missing.length > 0) {
          throw new Error("Missing required fields: " + missing.join(", "));
        }
      } catch (err) {
        throw new Error("Failed to parse AI response: " + err.message);
      }

      // -------------------------------------------------------------------
      // 5️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await ImpQuestionModel.create({
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
      throw new Error(`importantQuestionGenerator error: ${err.message}`);
    }
  }
);
