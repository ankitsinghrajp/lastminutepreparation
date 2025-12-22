import { inngest } from "../../libs/inngest.js";
import { ChapterWiseImportantQuestionModel } from "../../models/chapterWiseStudy/chapterWiseImportantQuestion.model.js";
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

  // Preserve ALL backslashes for LaTeX
  jsonString = jsonString.replace(/[\u0000-\u001F]+/g, " ");

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
          EX: 60 * 60 * 24 * 2,
        });
        await redis.del(pendingKey);
        return { source: "database" };
      }

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
CHEMICAL FORMULAS & EQUATIONS (Chemistry/Science)
────────────────────────────────────────

FOR ALL CHEMICAL CONTENT IN QUESTIONS:

1) SIMPLE CHEMICAL FORMULAS (in question text):
   - Use INLINE math mode with subscripts/superscripts
   - LaTeX backslashes MUST be DOUBLED in JSON strings: \\\\\\\\
   - Examples in question text:
     • Water: $H_2O$
     • Sulfuric acid: $H_2SO_4$
     • Potassium dichromate: $K_2Cr_2O_7$
     • Permanganate ion: $MnO_4^-$
     • Hydronium: $H_3O^+$
     • Chromate: $CrO_4^{2-}$

2) CHEMICAL EQUATIONS IN QUESTIONS:
   - Use DISPLAY math mode for reactions: $$ ... $$
   - LaTeX backslashes MUST be DOUBLED: \\\\\\\\
   - Examples in question text:
     • Simple reaction:
       $$K_2Cr_2O_7 + H_2SO_4 \\\\\\\\to \\\\\\\\text{products}$$
     • Equilibrium:
       $$N_2 + 3H_2 \\\\\\\\rightleftharpoons 2NH_3$$
     • With conditions:
       $$\\\\ce{2KMnO_4 \\\\\\\\xrightarrow{\\\\\\\\Delta} K_2MnO_4 + MnO_2 + O_2}$$

3) FORBIDDEN IN CHEMISTRY:
   - NEVER write H2O, H2SO4, K2Cr2O7 as plain text without LaTeX
   - NEVER write subscripts/superscripts without math delimiters
   - NEVER use single backslashes in JSON (must be \\\\\\\\)
   - NEVER use \\( or \\) delimiters

4) CHEMISTRY VALIDATION CHECKLIST:
   - ✓ All chemical formulas wrapped in $...$ or $$...$$
   - ✓ All LaTeX backslashes are DOUBLED (\\\\\\\\)
   - ✓ NO plain-text chemical formulas (H2O, CO2, etc.)
   - ✓ Subscripts use _ and superscripts use ^
   - ✓ Arrows use \\\\\\\\to, \\\\\\\\rightarrow, or \\\\\\\\rightleftharpoons
   - ✓ Chemical reactions use display math: $$...$$
   - If ANY chemistry validation fails → REGENERATE

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
   when they appear in the question text.

2) NEVER write logical symbols as plain text.
   ❌ Wrong: not p, egp, implies, contradiction
   ✅ Correct: $\\neg p$, $p \\Rightarrow q$, $\\bot$

3) Examples (CORRECT):
   "Proof by contradiction assumes $\\neg p$ and derives $\\bot$."
   "An implication $p \\Rightarrow q$ is false only when $p$ is true and $q$ is false."

4) If logical symbols are required and not written in LaTeX → REGENERATE.

────────────────────────────────────────
STATISTICS / TABLES RULE (MANDATORY)
────────────────────────────────────────

1) If question involves statistics (mean, median, mode, variance, SD, frequency):
   → ALWAYS present data in a PROPER MARKDOWN TABLE.
   → Each row MUST be on its own line.
   → Tables MUST use markdown pipe syntax: | Header1 | Header2 |

2) Example of correct markdown table:
   | Marks | Number of Students |
   |-------|-------------------|
   | 0-10  | 5 |
   | 10-20 | 12 |
   | 20-30 | 18 |

3) After every table, include exactly one blank line before following text.

4) If statistics data is ungrouped, FIRST convert to a frequency table.

5) If table is needed but not provided → REGENERATE.

MARKDOWN RULE:
- Use markdown formatting ONLY for: line breaks, sub-parts, and tables.
- Each sub-part (a),(b),(c) MUST begin on its own line.
- Do NOT use markdown code blocks (\`\`\`), headings (#), or blockquotes (>).
- Mathematical content MUST be in LaTeX ($...$ or $$...$$), not markdown.

JSON FORMATTING RULE:
- In JSON strings, use \\n for newlines between sentences/paragraphs.
- Do NOT use literal line breaks within JSON string values.
- All strings MUST use double quotes, not single quotes.
- No trailing commas in JSON arrays/objects.

FINAL SELF-VALIDATION (MANDATORY):

Before returning the JSON, scan ENTIRE output for:
1. ✓ Exactly 10 questions
2. ✓ Language matches subject exactly
3. ✓ All math/chemical expressions in LaTeX ($...$ or $$...$$)
4. ✓ No \\(, \\), \\[, or \\] delimiters
5. ✓ All LaTeX commands inside math delimiters
6. ✓ No plain-text math/chemical tokens
7. ✓ Statistics data in proper markdown tables if applicable
8. ✓ Each sub-part on new line
9. ✓ Valid JSON structure (double quotes, no trailing commas)
10. ✓ No markdown code blocks/headings/blockquotes

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
      // 🔁 4️⃣ SECOND AI CALL (FIX ONLY — NO CONFLICT)
      // -------------------------------------------------------------------
      const fixerPrompt = `
You are a STRICT JSON + MARKDOWN + LaTeX FIXER
for CBSE CHAPTER-WISE IMPORTANT QUESTIONS.

The input JSON is MOSTLY CORRECT.
DO NOT regenerate questions.
DO NOT rewrite wording.
DO NOT change order, language, or meaning.

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

==============================
ALLOWED FIXES ONLY
==============================

✔ Fix JSON syntax errors (quotes, commas)
✔ Fix LaTeX backslash escaping inside JSON strings
✔ Ensure LaTeX commands stay INSIDE $...$ or $$...$$
✔ Fix broken $$ blocks
✔ Normalize LaTeX symbols (Phi → \\Phi, theta → \\theta, etc.)

==============================
STRICTLY FORBIDDEN
==============================

❌ Regeneration
❌ Rewriting text
❌ Language changes
❌ Adding explanations
❌ Removing sub-parts or tables

==============================
CHEMISTRY RULES
==============================

✔ Chemical equations MUST remain inside $$...$$
✔ Proper arrows only: \\to, \\rightarrow, \\rightleftharpoons
✔ NO plain-text formulas (H2O, CO2)

==============================
FINAL VALIDATION
==============================

✓ Exactly 10 questions remain
✓ Markdown tables preserved
✓ No LaTeX outside math delimiters
✓ No forbidden delimiters
✓ JSON.parse() must succeed

==============================
INPUT JSON
==============================

<<<
${primaryRaw}
>>>

Return ONLY the corrected JSON.
No explanations.
`.trim();
      
       const subjectHardness = ["physics","chemistry","mathematics","applied mathematics", "accountancy", "bio technology"];

      let secondPassModel;
      if(subjectHardness.includes(mainSubject)){
        secondPassModel = "gpt-4o";
      }
      else{
        secondPassModel = "gpt-4o-mini"
      }

      const finalRaw = await step.run("Fix JSON + LaTeX", async () => {
        return await askOpenAI(fixerPrompt, secondPassModel, {
          response_format: { type: "json_object" },
        });
      });

      // -------------------------------------------------------------------
      // 5️⃣ PARSE FINAL OUTPUT (ONCE)
      // -------------------------------------------------------------------
      const parsed = extractJSON(finalRaw);
      const safeParsed = JSON.parse(JSON.stringify(parsed));
     
      // -------------------------------------------------------------------
      // 6️⃣ SAVE DB
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
      // 7️⃣ SAVE REDIS
      // -------------------------------------------------------------------
      await redis.set(cacheKey, JSON.stringify(safeParsed), {
        EX: 60 * 60 * 24 * 2,
      });

      await redis.del(pendingKey);

      return { source: "generated" };

    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`chapterWiseStudyQuestions error: ${err.message}`);
    }
  }
);
