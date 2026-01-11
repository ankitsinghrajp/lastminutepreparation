import { inngest } from "../../libs/inngest.js";
import { PredictedQuestionModel } from "../../models/LastMinuteBeforeExam/predictedQuestion.model.js";
import { parseSubject, detectCategory } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";

/* -------------------- JSON EXTRACTOR (UNCHANGED) -------------------- */
export const extractJSON = (text) => {
  if (!text) throw new Error("Empty response received from AI.");

  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) {
    throw new Error("No JSON object found in AI response.");
  }

  let jsonString = text.substring(first, last + 1);
  jsonString = jsonString.replace(/[\u0000-\u001F]+/g, " ");

  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid structure: 'questions' array not found");
    }

    if (parsed.questions.length !== 6) {
      throw new Error(`Expected exactly 6 questions, got ${parsed.questions.length}`);
    }

    parsed.questions.forEach((q, idx) => {
      if (!q.question || typeof q.question !== "string") {
        throw new Error(`Invalid or missing question at index ${idx}`);
      }
    });

    return parsed;
  } catch (err) {
    throw new Error(`Failed to parse AI response: ${err.message}`);
  }
};

/* -------------------- PRIMARY INNGEST FUNCTION -------------------- */
export const lastNightPredictedQuestionsFn = inngest.createFunction(
  {
    id: "lmp-predicted-questions",
    name: "Generate LMP Predicted Questions",
    retries: 0,
  },
  { event: "lmp/generate.predictedQuestions" },
  async ({ event, step }) => {
    const { className, subject, chapter } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(mainSubject);

    const cacheKey = `lmp:predicted:${className}:${mainSubject}:${chapter}`;
    const pendingKey = `lmp:predicted:pending:${className}:${mainSubject}:${chapter}`;
    const fixedCacheKey = `lmp:predicted:fixed:${className}:${mainSubject}:${chapter}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await step.run("DB Check", async () => {
        return await PredictedQuestionModel.findOne({
          className,
          subject: mainSubject,
          chapter,
        });
      });

      if (dbCache) {
        const safeData = JSON.parse(JSON.stringify(dbCache.content));

        await redis.set(cacheKey, JSON.stringify(safeData), {
          ex: 60 * 60 * 24 * 30,
        });
        await redis.del(pendingKey);
        return { questions: safeData.questions, source: "database" };
      }

      // -------------------------------------------------------------------
      // 2️⃣ BUILD PROMPT (UNCHANGED)
      // -------------------------------------------------------------------
      const prompt = `
You are an API that returns ONLY valid JSON. No extra text, no explanation outside JSON.

Class: ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

TASK:
Generate EXACTLY 6 MOST FREQUENT and MOST IMPORTANT CBSE board exam questions 
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
- Exactly 6 questions.
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
CHEMICAL FORMULAS & EQUATIONS (Chemistry/Science)
────────────────────────────────────────

FOR ALL CHEMICAL CONTENT IN QUESTIONS:

1) SIMPLE CHEMICAL FORMULAS (in question text):
   - Use INLINE math mode with subscripts/superscripts
   - LaTeX backslashes MUST be DOUBLED in JSON strings: \\\\
   - Examples in question text:
     • Water: $H_2O$
     • Sulfuric acid: $H_2SO_4$
     • Potassium dichromate: $K_2Cr_2O_7$
     • Permanganate ion: $MnO_4^-$
     • Hydronium: $H_3O^+$
     • Chromate: $CrO_4^{2-}$

2) CHEMICAL EQUATIONS IN QUESTIONS:
   - Use DISPLAY math mode for reactions: $$ ... $$
   - LaTeX backslashes MUST be DOUBLED: \\\\
   - Examples in question text:
     • Simple reaction:
       $$K_2Cr_2O_7 + H_2SO_4 \\\\to \\\\text{products}$$
     • Equilibrium:
       $$N_2 + 3H_2 \\\\rightleftharpoons 2NH_3$$
     • With conditions:
       $$\\ce{2KMnO_4 \\\\xrightarrow{\\\\Delta} K_2MnO_4 + MnO_2 + O_2}$$

3) FORBIDDEN IN CHEMISTRY:
   - NEVER write H2O, H2SO4, K2Cr2O7 as plain text without LaTeX
   - NEVER write subscripts/superscripts without math delimiters
   - NEVER use single backslashes in JSON (must be \\\\)
   - NEVER use \\( or \\) delimiters

4) CHEMISTRY QUESTION EXAMPLES:

Example - Chemical equation question:
"Balance the following chemical equation and identify the type of reaction:\\n\\n$$Fe + H_2O \\\\to Fe_3O_4 + H_2$$"

Example - Stoichiometry question:
"If 5.6 g of iron reacts with steam according to the equation:\\n\\n$$3Fe + 4H_2O \\\\to Fe_3O_4 + 4H_2$$\\n\\nCalculate the volume of hydrogen gas produced at STP."

Example - Chemical formula question:
"Write the chemical formula for: (a) Sodium carbonate (b) Calcium phosphate (c) Potassium permanganate"

5) JSON ESCAPING FOR CHEMISTRY:
   - All chemical formulas with subscripts: $H_2O$, $K_2Cr_2O_7$
   - Arrow commands in equations: \\\\to, \\\\rightarrow, \\\\rightleftharpoons
   - Special chemistry: \\ce{}, \\\\xrightarrow{}, \\\\Delta
   - Text in equations: \\\\text{PCC}, \\\\text{products}

PATTERN IN ALL EXAMPLES:
- Chemical formulas always wrapped in $...$ or $$...$$
- Subscripts use _
- Superscripts use ^
- LaTeX commands always have doubled backslashes: \\\\
- Reactions use display math: $$...$$

────────────────────────────────────────
CHEMISTRY VALIDATION CHECKLIST
────────────────────────────────────────

Before returning JSON with chemistry content:

1. ✓ All chemical formulas wrapped in $...$ or $$...$$
2. ✓ All LaTeX backslashes are DOUBLED (\\\\)
3. ✓ NO plain-text chemical formulas (H2O, CO2, etc.)
4. ✓ Subscripts use _ and superscripts use ^
5. ✓ Arrows use \\\\to, \\\\rightarrow, or \\\\rightleftharpoons
6. ✓ Chemical reactions use display math: $$...$$
7. ✓ All strings use double quotes, not single quotes
8. ✓ Newlines use \\n, not literal breaks
9. ✓ Valid JSON structure with no trailing commas

If ANY chemistry validation fails → REGENERATE

────────────────────────────────────────
LOGICAL & SYMBOLIC NOTATION RULE (MANDATORY)
────────────────────────────────────────

This section applies to subjects like Mathematics, Logic, Discrete Math,
Reasoning, Proofs, and Theoretical concepts.

1) Logical symbols such as:
   ¬  (negation)
   ⇒  (implies)
   ⇔  (if and only if)
   ⊥  (contradiction)
   ∀  (for all)
   ∃  (there exists)
   ∈, ∉, ⊆, ⊂

   MUST ALWAYS be written in LaTeX form and MUST be wrapped in $...$ 
   when they appear in the explanation field.

2) NEVER write logical symbols as plain text.
   ❌ Wrong: not p, negp, implies, contradiction
   ✅ Correct: $\\neg p$, $p \\Rightarrow q$, $\\bot$

3) If a topic involves logic or proofs:
   - Use symbolic expressions ONLY inside $...$ in explanation.
   - Do NOT place logical expressions in the formula field.
   - The formula field should be "" unless the chapter explicitly
     defines a standard formula.

4) Examples (CORRECT):

   Explanation:
   "Proof by contradiction assumes $\\neg p$ and derives $\\bot$."

   Explanation:
   "An implication $p \\Rightarrow q$ is false only when $p$ is true and $q$ is false."

5) Examples (WRONG):

   "Assume negp and derive contradiction"
   "p implies q"
   "not p leads to bottom"

If logical symbols are required and not written in LaTeX → REGENERATE.

5) STATISTICS / TABLES:
- If question involves statistics (mean, median, mode, variance, SD, frequency),
  → ALWAYS present data in a markdown table.
  → If data is ungrouped, FIRST convert to a frequency table.
  → After every table include exactly one blank line before the following text.

6) NEWLINES (JSON + MARKDOWN SAFE):

- Inside markdown tables, line breaks MAY be represented using \\n
  if required for valid JSON encoding.
- Table structure MUST remain intact:
  | header | header |
  |--------|--------|
  | value  | value  |

- Outside tables, use real line breaks.
- Do NOT collapse table rows into a single line.

7) SUB-PARTS:
- Each sub-part (a),(b),(c) MUST begin on its own line and be clearly numbered.

MARKDOWN RULE:
- Use markdown formatting for structure: line breaks, sub-parts, and tables.
- Each question should be properly formatted markdown text.
- Do NOT use markdown code blocks (\`\`\`), headings (#), or blockquotes (>).
- Tables MUST be proper markdown tables with each row on its own line.
- Mathematical content MUST be in LaTeX ($...$ or $$...$$), not markdown.

FINAL SELF-VALIDATION (MANDATORY):

Before returning the JSON:
- Scan the ENTIRE output.
- If ANY backslash-command (\\mathbb, \\cap, \\emptyset, \\text, etc.)
  appears OUTSIDE $...$ or $$...$$ → REGENERATE.
- If ANY mathematical symbol appears outside LaTeX → REGENERATE.
- If ANY rule is violated → REGENERATE internally until compliant.

Return output ONLY after passing ALL checks.

OUTPUT JSON (STRICT):
Return ONLY this exact JSON structure, with exactly 6 questions:

{
  "questions": [
    { "question": "Complete CBSE-style question in markdown with math in LaTeX ($...$ or $$...$$)" },
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

        // 🚀 IMMEDIATELY CACHE PRIMARY RESPONSE
        await redis.set(cacheKey, JSON.stringify(primaryQuestions), {
          ex: 60 * 60 * 24 * 30, 
        });

    await PredictedQuestionModel.findOneAndUpdate(
    { className, subject:mainSubject, chapter },
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
          ex: 60 * 60 * 24 * 30,
        });

        await redis.del(pendingKey);
      } catch (err) {
        throw new Error("Failed to parse primary AI response: " + err.message);
      }

      // -------------------------------------------------------------------
      // 5️⃣ TRIGGER BACKGROUND FIXER (NON-BLOCKING)
      // -------------------------------------------------------------------
      let fixerRunId = null;
      try {
        const fixerEvent = await step.sendEvent("trigger-fixer", {
          name: "lmp/fix.predictedQuestions",
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
        questions: primaryQuestions.questions,
        source: "generated",
        status: "primary",
        fixerRunId: fixerRunId,
        cacheKey: cacheKey,
        message: "Primary response cached, fixing in background"
      };

    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`generatePredictedQuestions error: ${err.message}`);
    } finally {
      await redis.del(pendingKey);
    }
  }
);

/* -------------------- BACKGROUND FIXER FUNCTION -------------------- */
export const predictedQuestionsFixerFn = inngest.createFunction(
  {
    name: "Fix Predicted Questions LaTeX",
    id: "predicted-questions-fixer",
    retries: 1,
  },
  { event: "lmp/fix.predictedQuestions" },
  async ({ event, step }) => {
    const { className, subject, chapter, primaryRaw, cacheKey, fixedCacheKey } = event.data;

    try {
      const fixerPrompt = `
You are a STRICT JSON + LaTeX ESCAPING FIXER for PREDICTED QUESTIONS.

The input JSON is MOSTLY CORRECT.
DO NOT regenerate.
DO NOT rewrite questions.
DO NOT change wording, meaning, order, or structure.

==============================
ABSOLUTE RULES (MATCH FIRST PROMPT)
==============================

- Inline math $...$ is ALLOWED
- Display math $$...$$ is ALLOWED and MUST be preserved
- Markdown formatting and REAL line breaks MUST be preserved
- LaTeX commands MUST remain inside existing math delimiters

❌ Do NOT remove $$...$$
❌ Do NOT convert display math to inline
❌ Do NOT introduce \\( \\) or \\[ \\]

==============================
WHAT YOU ARE ALLOWED TO FIX
==============================

1. JSON SYNTAX ONLY:
   - Fix missing or incorrect double quotes
   - Remove trailing commas
   - Ensure valid JSON structure
   - Ensure JSON.parse() succeeds

2. LaTeX ESCAPING (JSON-LEVEL ONLY):
   - Ensure backslashes are correctly escaped for JSON strings
   - Preserve the SAME LaTeX commands, SAME math mode ($ or $$)
   - Do NOT change math content

3. NEWLINES:
   - Preserve REAL line breaks inside question strings
   - Do NOT replace real line breaks with \\n
   - Do NOT collapse formatting

==============================
STRICTLY FORBIDDEN
==============================

- ❌ Regenerating questions
- ❌ Rewriting sentences
- ❌ Changing math mode ($ ↔ $$)
- ❌ Moving LaTeX outside math delimiters
- ❌ Adding or removing questions
- ❌ Reordering questions
- ❌ Adding explanations or comments

==============================
INPUT JSON TO FIX
==============================

<<<
${primaryRaw}
>>>

==============================
OUTPUT
==============================

Return ONLY the corrected JSON.
NO explanation.
NO markdown.
NO extra text.
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
      const fixedRaw = await step.run("Call OpenAI (Fixer)", async () => {
        return await askOpenAI(fixerPrompt, secondPassModel, {
          response_format: { type: "json_object" },
        });
      });

      // Parse fixed response
      let fixedQuestions;
      try {
        const extracted = extractJSON(fixedRaw);
        fixedQuestions = JSON.parse(JSON.stringify(extracted));
      } catch (err) {
        // If fixer fails, keep the primary version
        console.error("Fixer failed, keeping primary version:", err.message);
        return { status: "fixer_failed", kept: "primary" };
      }

      // Save fixed version to DB
      await step.run("Save Fixed to DB", async () => {
        await PredictedQuestionModel.findOneAndUpdate(
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
        ex: 60 * 60 * 24 * 30, // 2 days
      });

      // Update status marker
      await redis.set(`${cacheKey}:status`, JSON.stringify({
        version: "fixed",
        fixedAt: new Date().toISOString(),
        isFixed: true
      }), {
        ex: 60 * 60 * 24 * 30,
      });

      // Also store in fixed cache key for reference
      await redis.set(fixedCacheKey, JSON.stringify(fixedQuestions), {
        ex: 60 * 60 * 24 * 30,
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