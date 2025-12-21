import { inngest } from "../../libs/inngest.js";
import { ImpQuestionModel } from "../../models/ImportantQuestionsPage/impquestions.model.js";
import { detectCategory, parseSubject } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";

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

  // Remove control characters that break JSON.parse
  jsonString = jsonString.replace(/[\u0000-\u001F]+/g, " ");

  try {
    const parsed = JSON.parse(jsonString);

    // 🔒 MINIMAL structural sanity check (NOT content validation)
    if (
      typeof parsed !== "object" ||
      !parsed.chapter ||
      !parsed.importantQuestions ||
      !parsed.veryShortQuestions ||
      !parsed.longAnswerQuestions ||
      !parsed.examStrategy
    ) {
      throw new Error("Invalid Important Questions JSON structure");
    }

    return parsed;
  } catch (err) {
    throw new Error(`Failed to parse AI response: ${err.message}`);
  }
};


export const importantQuestionGeneratorFn = inngest.createFunction(
  {
    name: "Generate Important Question Set",
    id: "important-question-generator",
    retries: 0,
  },
  { event: "lmp/generate.importantQuestions" },
  async ({ event, step }) => {
    const { className, subject, chapter, index } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(subject);

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

        await redis.set(cacheKey, JSON.stringify(safeData), {
          EX: 60 * 60 * 24 * 2,
        });

        await redis.del(pendingKey);
        return { source: "database" };
      }

      // -------------------------------------------------------------------
      // 2️⃣ PRIMARY PROMPT (UNCHANGED)
      // -------------------------------------------------------------------
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

Questions must be exam-ready, complete, and in the same style and rigor as NCERT back exercises 
and official CBSE PYQs.

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

3) For ALL OTHER subjects (Science, Maths, SST, Physics, Chemistry, Biology, etc.):
   - ALL content MUST be written ONLY in STANDARD ACADEMIC ENGLISH.
   - DO NOT include Hindi, Sanskrit, or any regional language.
   - DO NOT use Hinglish or translated phrases.

FORBIDDEN (ZERO TOLERANCE):
- Mixing languages in any form
- Transliteration (e.g., "kya", "arth", "vidhya", "kathan", etc.)
- Bilingual phrasing or explanations
- Subject-language mismatch (e.g., English questions for Hindi subject)

AUTO-REGENERATION RULE (MANDATORY):
If ANY word, phrase, grammar pattern, or sentence structure violates the 
subject-language rule → IMMEDIATELY discard and regenerate the entire output.

====================================================
CHAPTER–TOPIC ISOLATION
====================================================
- Content MUST belong strictly to the given chapter and its syllabus.
- Do NOT introduce topics from other chapters or classes.
- Context allowed ONLY if NCERT or PYQs use it.
- Avoid unnecessary narrative/context unless NCERT or PYQ uses that context.

====================================================
QUESTION FORMAT
====================================================
- No one-line or vague questions.
- Multi-part questions (a), (b), (c) are allowed; each sub-part MUST start on a new line.
- Each sub-part (a),(b),(c) MUST begin on its own line and be clearly numbered.
- If numerical data is required, provide complete data within the question.

====================================================
UNIVERSAL FORMULA & MATH RULES (APPLY ALWAYS)
====================================================

ABSOLUTE LATEX MANDATE:
- EVERY mathematical expression (equations, formulas, fractions, powers, subscripts,
  trigonometric functions, inequalities, derivatives, integrals, chemical equations, units)
  MUST be written using LaTeX
- Wrap expressions ONLY in:
  • Inline math → $ ... $
  • Display math → $$ ... $$

LATEX DELIMITER RESTRICTION (MANDATORY):
- NEVER use \\( ... \\) or \\[ ... \\]
- NEVER use escaped LaTeX delimiters \\( ... \\) or \\[ ... \\]
- Inline math → $...$
- Display math → $$...$$
- Any \\(, \\), \\[, \\] → INVALID OUTPUT
- If such delimiters appear, regenerate the output

LATEX COMMAND CONTAINMENT RULE (MANDATORY):
- ANY LaTeX command starting with \\ is FORBIDDEN outside math mode
- ANY LaTeX command (a token starting with backslash \\) is FORBIDDEN outside $...$ or $$...$$
- Examples of forbidden commands outside math delimiters:
  • \\mathbb
  • \\times
  • \\to
  • \\cap
  • \\cup
  • \\in
  • \\subset
  • \\subseteq
  • \\Rightarrow
  • \\emptyset
  • \\text
- ALL such commands MUST appear ONLY inside $...$ or $$...$$.
- If any backslash-command appears outside math delimiters, regenerate the output.

PLAIN-TEXT MATH TOKEN BAN:
- The following are STRICTLY FORBIDDEN outside LaTeX:
  sin, cos, tan, sec, cosec, cot, sin^-1, cos^-1, tan^-1, sec^-1, cosec^-1, cot^-1,
  frac, sqrt, leq, geq, <=, >=, pi, mu, theta, degree, ^ (as plain text),
  |x|, mod, modulus, any raw backslash-commands not inside $...$ or $$...$$
- Fractions MUST use \\frac{a}{b}; roots MUST use \\sqrt{}, trig functions must use \\sin, \\cos, etc.
- Absolute value must use \\lvert x \\rvert or \\left| x \\right| inside LaTeX.

INEQUALITIES & SYSTEMS:
- Use ONE $$ block
- Each inequality on a new line
- For a system of inequalities, use ONE display math block with each inequality on a new line:
  $$
  x + 2y \\leq 10 \\\\
  3x + y \\geq 5 \\\\
  x \\geq 0, \\; y \\geq 0
  $$

────────────────────────────────────────
CHEMICAL FORMULAS & EQUATIONS (Chemistry/Science)
────────────────────────────────────────

CHEMICAL EQUATIONS:
- MUST be written ONLY in $$ ... $$

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

====================================================
STATISTICS / TABLES
====================================================
- If statistics involved → ALWAYS use markdown table
- If question involves statistics (mean, median, mode, variance, SD, frequency),
  → ALWAYS present data in a markdown table.
- Ungrouped data → convert to frequency table FIRST
- If data is ungrouped, FIRST convert to a frequency table.
- Leave exactly ONE blank line after every table
- After every table include exactly one blank line before the following text.
- Tables MUST be proper markdown tables with each row on its own line.

====================================================
NEWLINES & ESCAPED CHARACTERS
====================================================
- NEVER use escaped newlines like \\n in the question text when displaying to user
- Use real line breaks in markdown formatted questions
- NEVER escape math delimiters
- Do NOT include escaped math delimiters like \\( or \\) — use $ or $$ only.

====================================================
MARKDOWN RULES
====================================================
- Markdown allowed ONLY for:
  • line breaks
  • bullet points
  • markdown tables
  • sub-parts formatting
- Use markdown formatting for structure: line breaks, sub-parts, and tables.
- Each question should be properly formatted markdown text.
- NO headings (#)
- NO code blocks (\`\`\`)
- NO blockquotes (>)
- Mathematical content MUST be in LaTeX ($...$ or $$...$$), not markdown.

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

1. ✓ Check TOTAL questions = EXACTLY 10
2. ✓ Check NO extra or missing keys
3. ✓ Check language rules (subject-language match, no mixing, no transliteration)
4. ✓ Check LaTeX rules:
   - All math in $...$ or $$...$$
   - NO \\( \\) \\[ \\] delimiters
   - All backslash commands inside math mode only
   - NO plain-text math tokens
5. ✓ Check chemistry rules (if applicable):
   - All formulas in LaTeX
   - Doubled backslashes in JSON
   - No plain-text chemical formulas
6. ✓ Check logical notation (if applicable):
   - All logical symbols in LaTeX
   - Wrapped in $...$
7. ✓ Check tables (if statistics questions):
   - Proper markdown tables
   - Blank line after each table
8. ✓ Check markdown formatting:
   - No code blocks, headings, or blockquotes
   - Proper sub-part formatting
9. ✓ Check frontend safety:
   - Valid JSON structure
   - No trailing commas
   - Proper escaping
10. ✓ Scan the ENTIRE output:
    - If ANY backslash-command (\\mathbb, \\cap, \\emptyset, \\text, etc.)
      appears OUTSIDE $...$ or $$...$$ → REGENERATE
    - If ANY mathematical symbol appears outside LaTeX → REGENERATE
    - If ANY rule is violated → REGENERATE internally until compliant

Return output ONLY after passing ALL checks.

If ANY rule is violated → REGENERATE INTERNALLY.

====================================================
OUTPUT
====================================================
Return ONLY valid JSON. NOTHING ELSE.
Output MUST be fully compatible with a Markdown+KaTeX renderer.
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
      // 4️⃣ SECOND AI CALL (LaTeX VALIDATION ONLY)
      // -------------------------------------------------------------------
  
      const fixerPrompt = `
You are a STRICT JSON + LaTeX ESCAPING FIXER for IMPORTANT CBSE QUESTIONS.

The input JSON is MOSTLY CORRECT.
DO NOT regenerate.
DO NOT rewrite questions, answers, explanations, or strategies.
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
❌ Do NOT move math across fields

==============================
WHAT YOU ARE ALLOWED TO FIX
==============================

1. JSON SYNTAX ONLY:
   - Fix missing or incorrect double quotes
   - Remove trailing commas
   - Fix broken arrays or objects
   - Ensure valid JSON structure
   - Ensure JSON.parse() succeeds

2. LaTeX ESCAPING (JSON-LEVEL ONLY):
   - Ensure backslashes are correctly escaped for JSON strings
   - Preserve the SAME LaTeX commands
   - Preserve the SAME math mode ($ or $$)
   - Do NOT alter mathematical meaning

3. NEWLINES & FORMATTING:
   - Preserve REAL line breaks inside strings
   - Do NOT replace real line breaks with \\n
   - Do NOT collapse spacing or formatting

==============================
STRICTLY FORBIDDEN
==============================

- ❌ Regenerating content
- ❌ Rewriting sentences
- ❌ Changing math mode ($ ↔ $$)
- ❌ Moving LaTeX outside math delimiters
- ❌ Adding or removing questions
- ❌ Reordering arrays or fields
- ❌ Adding explanations, comments, or metadata

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


      const fixedRaw = await step.run("Call OpenAI (Fixer)", async () => {
        return await askOpenAI(fixerPrompt, "gpt-4o");
      });

      // -------------------------------------------------------------------
      // 5️⃣ PARSE + VALIDATE (UNCHANGED)
      // -------------------------------------------------------------------
     let finalQuestions;
try {
  const extracted = extractJSON(fixedRaw);
  finalQuestions = JSON.parse(JSON.stringify(extracted));

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
      // 6️⃣ SAVE DB
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
      // 7️⃣ SAVE REDIS
      // -------------------------------------------------------------------
      await redis.set(cacheKey, JSON.stringify(finalQuestions), {
        EX: 60 * 60 * 24 * 2,
      });

      await redis.del(pendingKey);
      return { source: "generated" };
    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`importantQuestionGenerator error: ${err.message}`);
    }
  }
);
