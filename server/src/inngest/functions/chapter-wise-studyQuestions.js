import { inngest } from "../../libs/inngest.js";
import { ChapterWiseImportantQuestionModel } from "../../models/chapterWiseStudy/chapterWiseImportantQuestion.model.js";
import { parseSubject, detectCategory } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";

/* -------------------- ROBUST JSON EXTRACTOR -------------------- */
export const extractJSON = (text) => {
  if (!text) throw new Error("Empty response received from AI.");

  // Remove markdown fences if present
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  // Extract JSON boundaries
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) {
    throw new Error("No JSON object found in AI response.");
  }

  let jsonString = text.substring(first, last + 1);

  // Remove control characters EXCEPT newlines and tabs that are part of valid JSON strings
  // Only remove characters that are definitely invalid in JSON
  jsonString = jsonString.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, "");

  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid structure: 'questions' array missing");
    }

    parsed.questions.forEach((q, idx) => {
      if (!q.question || typeof q.question !== "string") {
        throw new Error(`Invalid question at index ${idx}`);
      }
    });

    return parsed;
  } catch (err) {
    // If JSON.parse fails, try to provide more context
    console.error("JSON Parse Error Details:", {
      error: err.message,
      position: err.message.match(/position (\d+)/)?.[1],
      preview: jsonString.substring(0, 200) + "..."
    });
    throw new Error(`Failed to parse AI response: ${err.message}`);
  }
};

/* -------------------- INNGEST FUNCTION -------------------- */
export const chapterWiseStudyQuestionsFn = inngest.createFunction(
  {
    name: "Generate Chapter Wise Study Questions",
    id: "chapter-wise-study-questions",
    retries: 0,
  },
  { event: "lmp/generate.chapterWiseStudyQuestions" },
  async ({ event, step }) => {
    const { className, subject, chapter } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(subject);

    const cacheKey = `lmp:studyq:${className}:${mainSubject}:${chapter}`;
    const pendingKey = `lmp:studyq:pending:${className}:${mainSubject}:${chapter}`;
    const fixedCacheKey = `lmp:studyq:fixed:${className}:${mainSubject}:${chapter}`;
    let lockReleased = false;

    const releaseLock = async () => {
      if (lockReleased) return;
      lockReleased = true;
      await redis.del(pendingKey);
    };

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
        await redis.set(cacheKey, JSON.stringify(dbData.content), {
          ex: 60 * 60 * 24 * 2,
        });
        await releaseLock();
        return { source: "database" };
      }

      // -------------------------------------------------------------------
      // 2️⃣ PRIMARY PROMPT (UNCHANGED)
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

- Language of questions is STRICTLY determined by the subject.
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
    • Inline math → $ ... $
    • Display math → $$ ... $$
- NEVER output mathematical tokens or operators as plain text (examples below).

LATEX DELIMITER RESTRICTION (MANDATORY):

- NEVER use escaped LaTeX delimiters \\( ... \\) or \\[ ... \\].
- Inline mathematics MUST be written ONLY using: $ ... $
- Display mathematics MUST be written ONLY using: $$ ... $$
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

────────────────────────────────────────
JSON ESCAPING RULES (CRITICAL)
────────────────────────────────────────

INSIDE JSON STRINGS YOU MUST PROPERLY ESCAPE:

1) BACKSLASHES:
   - Single backslash in LaTeX → DOUBLE backslash in JSON
   - Example: \\frac → \\\\frac in JSON string
   - Example: \\theta → \\\\theta in JSON string

2) QUOTES:
   - Double quotes inside strings → escape as \\"
   - Example: "He said \\"hello\\"" 

3) NEWLINES:
   - Use \\n for line breaks in JSON strings
   - NOT literal line breaks

4) OTHER SPECIAL CHARS:
   - Tab: \\t
   - Carriage return: \\r
   - Backspace: \\b
   - Form feed: \\f

CRITICAL: Every backslash in LaTeX MUST be doubled when inside JSON strings!

────────────────────────────────────────
CHEMICAL FORMULAS & EQUATIONS (Chemistry/Science)
────────────────────────────────────────

FOR ALL CHEMICAL CONTENT IN QUESTIONS:

1) SIMPLE CHEMICAL FORMULAS (in question text):
   - Use INLINE math mode with subscripts/superscripts
   - LaTeX backslashes MUST be DOUBLED in JSON strings: \\\\
   - Examples in JSON:
     • Water: "$H_2O$"
     • Sulfuric acid: "$H_2SO_4$"
     • Arrow in equation: "$$K_2Cr_2O_7 \\\\to products$$"

2) CHEMICAL EQUATIONS IN QUESTIONS:
   - Use DISPLAY math mode for reactions: $$ ... $$
   - LaTeX backslashes MUST be DOUBLED: \\\\
   - Examples in JSON:
     • Simple reaction: "$$K_2Cr_2O_7 + H_2SO_4 \\\\to \\\\text{products}$$"
     • Equilibrium: "$$N_2 + 3H_2 \\\\rightleftharpoons 2NH_3$$"

3) FORBIDDEN IN CHEMISTRY:
   - NEVER write H2O, H2SO4, K2Cr2O7 as plain text without LaTeX
   - NEVER write subscripts/superscripts without math delimiters
   - NEVER use single backslashes in JSON (must be \\\\)
   - NEVER use \\( or \\) delimiters

────────────────────────────────────────
LOGICAL & SYMBOLIC NOTATION RULE (MANDATORY)
────────────────────────────────────────

1) Logical symbols MUST be in LaTeX with DOUBLED backslashes in JSON:
   - "$\\\\neg p$" for negation
   - "$p \\\\Rightarrow q$" for implication
   - "$\\\\bot$" for contradiction

────────────────────────────────────────
STATISTICS / TABLES RULE (MANDATORY)
────────────────────────────────────────

1) If question involves statistics:
   → ALWAYS present data in a PROPER MARKDOWN TABLE.
   
2) Example in JSON string:
   "| Marks | Students |\\n|-------|----------|\\n| 0-10  | 5 |\\n| 10-20 | 12 |"

3) After every table, include \\n\\n (blank line) before following text.

MARKDOWN RULE:
- Use markdown formatting ONLY for: line breaks, sub-parts, and tables.
- Each sub-part (a),(b),(c) MUST begin on its own line using \\n.
- Mathematical content MUST be in LaTeX ($...$ or $$...$$), not markdown.

JSON FORMATTING RULE:
- In JSON strings, use \\n for newlines between sentences/paragraphs.
- Do NOT use literal line breaks within JSON string values.
- All strings MUST use double quotes, not single quotes.
- No trailing commas in JSON arrays/objects.
- ALL backslashes in LaTeX MUST be doubled.

FINAL SELF-VALIDATION (MANDATORY):

Before returning the JSON, scan ENTIRE output for:
1. ✓ Exactly 10 questions
2. ✓ Language matches subject exactly
3. ✓ All math/chemical expressions in LaTeX ($...$ or $$...$$)
4. ✓ All backslashes in LaTeX are DOUBLED (\\\\frac, \\\\theta, etc.)
5. ✓ No \\(, \\), \\[, or \\] delimiters
6. ✓ All LaTeX commands inside math delimiters
7. ✓ No plain-text math/chemical tokens
8. ✓ Statistics data in proper markdown tables if applicable
9. ✓ Each sub-part on new line (using \\n)
10. ✓ Valid JSON structure (double quotes, no trailing commas)
11. ✓ Proper JSON escaping for all special characters

If ANY violation → REGENERATE COMPLETELY.

OUTPUT JSON (STRICT):
Return ONLY this exact JSON structure, with exactly 10 questions:

{
  "questions": [
    { "question": "Complete CBSE-style question with math in $...$ or $$...$$\\nMulti-part on separate lines\\nMarkdown tables if needed" },
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
- If ANY rule is violated, regenerate the ENTIRE output.
- NO extra fields, NO stray punctuation.
- Output MUST be valid JSON and compatible with Markdown+KaTeX renderer.
- Remember: ALL backslashes in LaTeX must be DOUBLED in JSON strings!
`;

      // -------------------------------------------------------------------
      // 3️⃣ FIRST AI CALL (PRIMARY GENERATION)
      // -------------------------------------------------------------------
      const primaryRaw = await step.run("Call OpenAI (Primary)", async () => {
        return await askOpenAI(prompt, "gpt-5.1", {
          response_format: { type: "json_object" },
        });
      });

      // -------------------------------------------------------------------
      // 4️⃣ PARSE PRIMARY RESPONSE & CACHE IMMEDIATELY
      // -------------------------------------------------------------------
      let primaryQuestions;
      try {
        const extracted = extractJSON(primaryRaw);
        primaryQuestions = JSON.parse(JSON.stringify(extracted));

        // Validate structure
        if (!primaryQuestions.questions || !Array.isArray(primaryQuestions.questions)) {
          throw new Error("Missing required 'questions' array");
        }

        if (primaryQuestions.questions.length !== 10) {
          console.warn(`Expected 10 questions, got ${primaryQuestions.questions.length}. Proceeding anyway.`);
        }

        // 🚀 IMMEDIATELY CACHE PRIMARY RESPONSE
        await redis.set(cacheKey, JSON.stringify(primaryQuestions), {
          ex: 60 * 60 * 24 * 2, // 2 days
        });

        // Save to DB
        await ChapterWiseImportantQuestionModel.findOneAndUpdate(
          { className, subject: mainSubject, chapter },
          {
            $set: {
              content: primaryQuestions,
            },
          },
          {
            upsert: true,
            new: true,
          }
        );

        // Store status in separate key
        await redis.set(`${cacheKey}:status`, JSON.stringify({
          version: "primary",
          generatedAt: new Date().toISOString(),
          isFixed: false
        }), {
          ex: 60 * 60 * 24 * 2,
        });

        await releaseLock();
      } catch (err) {
        // Log the raw response for debugging
        console.error("Primary Response Parse Error:", {
          error: err.message,
          rawPreview: primaryRaw?.substring(0, 500)
        });
        throw new Error("Failed to parse primary AI response: " + err.message);
      }

      // -------------------------------------------------------------------
      // 5️⃣ TRIGGER BACKGROUND FIXER (NON-BLOCKING)
      // -------------------------------------------------------------------
      let fixerRunId = null;
      try {
        const fixerEvent = await step.sendEvent("trigger-fixer", {
          name: "lmp/fix.chapterWiseStudyQuestions",
          data: {
            className,
            subject: mainSubject,
            chapter,
            primaryRaw,
            cacheKey,
            fixedCacheKey,
          },
        });
        
        // Capture the fixer run ID
        if (fixerEvent && fixerEvent.ids && fixerEvent.ids.length > 0) {
          fixerRunId = fixerEvent.ids[0];
        }
      } catch (err) {
        console.error("Failed to trigger fixer:", err.message);
        // Don't throw - we already have primary response cached
      }

      // -------------------------------------------------------------------
      // 6️⃣ RETURN IMMEDIATELY WITH PRIMARY RESPONSE
      // -------------------------------------------------------------------
      return { 
        source: "generated",
        status: "primary",
        fixerRunId: fixerRunId,
        cacheKey: cacheKey,
        message: "Primary response cached, fixing in background"
      };

    } catch (err) {
      await releaseLock();
      throw new Error(`chapterWiseStudyQuestions error: ${err.message}`);
    }
  }
);

// -------------------------------------------------------------------
// BACKGROUND FIXER FUNCTION
// -------------------------------------------------------------------
export const chapterWiseStudyQuestionsFixerFn = inngest.createFunction(
  {
    name: "Fix Chapter Wise Study Questions LaTeX",
    id: "chapter-wise-study-questions-fixer",
    retries: 1,
  },
  { event: "lmp/fix.chapterWiseStudyQuestions" },
  async ({ event, step }) => {
    const { className, subject, chapter, primaryRaw, cacheKey, fixedCacheKey } = event.data;

    try {
      const fixerPrompt = `
You are a STRICT JSON + MARKDOWN + LaTeX FIXER
for CBSE CHAPTER-WISE IMPORTANT QUESTIONS.

The input JSON is MOSTLY CORRECT.
DO NOT regenerate questions.
DO NOT rewrite wording.
DO NOT change order, language, or meaning.

==============================
CRITICAL JSON ESCAPING RULE
==============================

ALL backslashes in LaTeX MUST be DOUBLED in JSON strings:
- \\frac → \\\\frac
- \\theta → \\\\theta  
- \\to → \\\\to
- \\Rightarrow → \\\\Rightarrow

This is NON-NEGOTIABLE for valid JSON.

==============================
ABSOLUTE ALIGNMENT RULES
==============================

✔ Inline math $...$ is ALLOWED
✔ Display math $$...$$ is ALLOWED
✔ Markdown formatting MUST be preserved
✔ JSON string newlines MUST remain \\n

❌ NEVER introduce \\( \\) or \\[ \\]
❌ NEVER remove existing $$ blocks
❌ NEVER convert $$ to $
❌ NEVER add or remove questions
❌ NEVER use single backslashes in JSON (must be doubled)

==============================
ALLOWED FIXES ONLY
==============================

✔ Fix JSON syntax errors (quotes, commas, escaping)
✔ Fix LaTeX backslash escaping (single → double)
✔ Ensure LaTeX commands stay INSIDE $...$ or $$...$$
✔ Fix broken $$ blocks
✔ Normalize LaTeX symbols (Phi → \\\\Phi, theta → \\\\theta, etc.)
✔ Fix improperly escaped special characters

==============================
STRICTLY FORBIDDEN
==============================

❌ Regeneration
❌ Rewriting text
❌ Language changes
❌ Adding explanations
❌ Removing sub-parts or tables
❌ Changing mathematical meaning

==============================
CHEMISTRY RULES
==============================

✔ Chemical equations MUST remain inside $$...$$
✔ Proper arrows with DOUBLED backslashes: \\\\to, \\\\rightarrow, \\\\rightleftharpoons
✔ NO plain-text formulas (H2O, CO2)

==============================
FINAL VALIDATION
==============================

✓ Exactly 10 questions remain
✓ Markdown tables preserved
✓ No LaTeX outside math delimiters
✓ No forbidden delimiters
✓ ALL backslashes in LaTeX are DOUBLED
✓ JSON.parse() must succeed
✓ Proper JSON escaping throughout

==============================
INPUT JSON
==============================

<<<
${primaryRaw}
>>>

Return ONLY the corrected JSON.
No explanations.
No markdown code blocks.
`.trim();

      const subjectHardness = [
        "physics",
        "chemistry",
        "mathematics",
        "applied mathematics",
        "accountancy",
        "bio technology"
      ];

      let secondPassModel;
      if (subjectHardness.includes(subject.toLowerCase())) {
        secondPassModel = "gpt-4o";
      } else {
        secondPassModel = "gpt-4o-mini";
      }

      // Call fixer AI
      const fixedRaw = await step.run("Fix JSON + LaTeX", async () => {
        return await askOpenAI(fixerPrompt, secondPassModel, {
          response_format: { type: "json_object" },
        });
      });

      // Parse fixed response
      let fixedQuestions;
      try {
        const extracted = extractJSON(fixedRaw);
        fixedQuestions = JSON.parse(JSON.stringify(extracted));

        // Validate structure
        if (!fixedQuestions.questions || !Array.isArray(fixedQuestions.questions)) {
          throw new Error("Missing required 'questions' array in fixed version");
        }

        if (fixedQuestions.questions.length !== 10) {
          console.warn(`Expected 10 questions in fixed version, got ${fixedQuestions.questions.length}`);
        }
      } catch (err) {
        // If fixer fails, keep the primary version
        console.error("Fixer failed, keeping primary version:", err.message);
        return { status: "fixer_failed", kept: "primary" };
      }

      // Save fixed version to DB
      await step.run("Save Fixed to DB", async () => {
        await ChapterWiseImportantQuestionModel.findOneAndUpdate(
          {
            className,
            subject,
            chapter,
          },
          {
            content: fixedQuestions,
          },
          {
            upsert: true,
          }
        );
      });

      // Update Redis cache with fixed version
      await redis.set(cacheKey, JSON.stringify(fixedQuestions), {
        ex: 60 * 60 * 24 * 2, // 2 days
      });

      // Update status marker
      await redis.set(`${cacheKey}:status`, JSON.stringify({
        version: "fixed",
        fixedAt: new Date().toISOString(),
        isFixed: true
      }), {
        ex: 60 * 60 * 24 * 2,
      });

      // Also store in fixed cache key for reference
      await redis.set(fixedCacheKey, JSON.stringify(fixedQuestions), {
        ex: 60 * 60 * 24 * 2,
      });

      return { 
        status: "fixed",
        message: "LaTeX fixed and cached"
      };

    } catch (err) {
      console.error(`Background fixer error: ${err.message}`);
      return { 
        status: "error",
        error: err.message,
        kept: "primary"
      };
    }
  }
);