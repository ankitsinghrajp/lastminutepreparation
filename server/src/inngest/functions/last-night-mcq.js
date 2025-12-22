

import { inngest } from "../../libs/inngest.js";
import { LastMinuteMCQModel } from "../../models/LastMinuteBeforeExam/lastMinuteMcq.model.js";
import { parseSubject, detectCategory } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";

/* -------------------- JSON EXTRACTOR (UNCHANGED) -------------------- */
const extractJSON = (text) => {
  if (!text) throw new Error("Empty response received from AI.");

  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("No JSON found.");

  let jsonString = text.substring(first, last + 1);

  // Remove control chars but PRESERVE backslashes for LaTeX
  jsonString = jsonString.replace(/[\u0000-\u001F]+/g, " ");

  return JSON.parse(jsonString);
};

/* -------------------- INNGEST FUNCTION -------------------- */
export const lastNightMCQsFn = inngest.createFunction(
  {
    id: "lmp-mcqs",
    name: "Generate LMP MCQs",
    retries: 0,
  },
  { event: "lmp/generate.mcqs" },
  async ({ event, step }) => {
    const { className, subject, chapter } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(mainSubject);

    const cacheKey = `lmp:mcqs:${className}:${mainSubject}:${chapter}`;
    const pendingKey = `lmp:mcqs:pending:${className}:${mainSubject}:${chapter}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await step.run("DB Check", async () => {
        return await LastMinuteMCQModel.findOne({
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
        return { mcqs: safeDBContent.mcqs, source: "database" };
      }

       const prompt = `
You are an API that returns ONLY valid JSON.
No extra text, no explanation outside JSON.

Class: ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

TASK:
Generate EXACTLY 5 MOST FREQUENT, MOST IMPORTANT, and VERY HIGH-PROBABILITY
CBSE Board MCQs strictly from THIS chapter only.

These MCQs must be:
- Based on NCERT back exercises
- Based on CBSE Previous Year Questions (PYQs)
- Extremely likely (≈99%) to appear in board exams

────────────────────────────────────────
LANGUAGE POLICY (ABSOLUTE — SUBJECT LOCKED)
────────────────────────────────────────

Language MUST strictly follow the subject.
NO cross-language mixing is allowed.

1) If Subject is "Hindi":
   - ALL content (question, options, explanation) MUST be ONLY in PURE, FORMAL HINDI.
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

- MCQs MUST belong strictly to the given chapter and its syllabus.
- DO NOT introduce topics, formulas, reactions, or question styles
  from other chapters or classes.
- Avoid unnecessary narrative unless NCERT or PYQs explicitly use it.

────────────────────────────────────────
MCQ QUALITY RULES
────────────────────────────────────────

- EXACTLY ONE correct option per MCQ.
- Each MCQ must test a CORE concept, law, formula, or result.
- Options must be plausible and exam-oriented.
- Avoid trivial, vague, or guess-based questions.

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
- Inline mathematics MUST be written ONLY using: $ ... $
- Display mathematics MUST be written ONLY using: $$ ... $$
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
- NEVER use <= or >= as plain text.
- For systems of inequalities or equations, use display math with line breaks:
  $$
  x + 2y \\leq 10 \\\\
  3x + y \\geq 5
  $$

──────────────────────────────────────────
CHEMICAL FORMULAS & EQUATIONS (Chemistry/Science)
──────────────────────────────────────────

FOR ALL CHEMICAL CONTENT:

1) SIMPLE CHEMICAL FORMULAS (in text/options):
   - Use INLINE math mode with subscripts/superscripts
   - Examples:
     • Water: $H_2O$
     • Sulfuric acid: $H_2SO_4$
     • Potassium dichromate: $K_2Cr_2O_7$
     • Permanganate ion: $MnO_4^-$
     • Chromate ion: $CrO_4^{2-}$
     
2) CHEMICAL EQUATIONS/REACTIONS:
   - Use DISPLAY math mode ($$...$$) ONLY
   - Use proper arrow notation with LaTeX:
     • $$ \\ce{A + B -> C + D} $$
     • $$ \\ce{A <=> B} $$ (equilibrium)
   - Example:
     $$ \\ce{K_2Cr_2O_7 + H_2SO_4 -> products} $$

3) FORBIDDEN IN CHEMISTRY:
   - NEVER write H2O, H2SO4, K2Cr2O7 as plain text
   - NEVER write subscripts/superscripts without LaTeX
   - NEVER use escaped delimiters \\( or \\)
   
4) WHEN TO USE INLINE vs DISPLAY:
   - Inline ($...$): Chemical formulas in question text or options
   - Display ($$...$$): Complete chemical reactions/equations

EXAMPLE MCQ WITH CHEMISTRY:
{
  "question": "Which reagent selectively oxidizes primary alcohols to aldehydes without forming carboxylic acids?",
  "options": [
    "Concentrated $HNO_3$",
    "$K_2Cr_2O_7$/dilute $H_2SO_4$ with heat",
    "PCC (Pyridinium chlorochromate)",
    "Neutral $KMnO_4$ with heat"
  ],
  "correct": "PCC (Pyridinium chlorochromate)",
  "explanation": "PCC is a mild oxidizing agent that stops at the aldehyde stage, preventing over-oxidation to carboxylic acid.",
  "formula": "R-CH_2OH \\xrightarrow{PCC} R-CHO"
}


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
   ❌ Wrong: not p, egp, implies, contradiction
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

   "Assume egp and derive contradiction"
   "p implies q"
   "not p leads to bottom"

If logical symbols are required and not written in LaTeX → REGENERATE.


────────────────────────────────────────
STATISTICS / DATA MCQs
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


FINAL SELF-VALIDATION (MANDATORY):

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
  "mcqs": [
    {
      "question": "Complete CBSE-style MCQ question in markdown (math inside $...$ or $$...$$)",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": "Exact matching option text",
      "explanation": "Short, exam-focused explanation (math inside $...$ or $$...$$)",
      "formula": "Primary formula as raw LaTeX code WITHOUT delimiters, or empty string if not applicable"
    }
  ]
}

FORMULA FIELD CLARIFICATION:
- The "formula" field is for storing the RAW LaTeX code of the primary formula used.
- This field is used for formula indexing/tagging purposes only.
- Write ONLY the LaTeX commands WITHOUT the $ or $$ delimiters.
- Example: If the formula is $E = mc^2$, the formula field should contain: "E = mc^2"
- Example: If the formula is $\\frac{a}{b}$, the formula field should contain: "\\frac{a}{b}"
- If no single primary formula applies, use empty string "".
- This does NOT violate the LaTeX mandate—it's a special metadata field.




────────────────────────────────────────
CRITICAL (NON-NEGOTIABLE)
────────────────────────────────────────

- EXACTLY 5 MCQs
- Return ONLY valid JSON
- NO extra fields
- NO stray punctuation
- NO markdown outside JSON fields
- NO partial math outside LaTeX (except in the formula metadata field)
- Subject-based language compliance has HIGHEST priority
- Output MUST be fully compatible with Markdown + KaTeX renderer
`;
      // -------------------------------------------------------------------
      // 3️⃣ FIRST AI CALL (PRIMARY)
      // -------------------------------------------------------------------
      const primaryRaw = await step.run("Call OpenAI (Primary)", async () => {
        return await askOpenAI(prompt);
      });

      // -------------------------------------------------------------------
      // 🔁 4️⃣ SECOND AI CALL (FIX ONLY — SAFE)
      // -------------------------------------------------------------------
      const fixerPrompt = `
You are a STRICT JSON + LaTeX ESCAPING FIXER for CBSE MCQs.

The input JSON is MOSTLY CORRECT.
DO NOT regenerate MCQs.
DO NOT rewrite questions, options, explanations, or formulas.
DO NOT change meaning, language, order, or formatting.

==============================
ABSOLUTE ALIGNMENT WITH FIRST PROMPT
==============================

- Inline math $...$ is ALLOWED
- Display math $$...$$ is ALLOWED and REQUIRED where present
- Markdown formatting and REAL line breaks MUST be preserved
- LaTeX commands MUST remain inside math delimiters

❌ Do NOT remove $$...$$
❌ Do NOT convert $$ to $
❌ Do NOT introduce \\( \\) or \\[ \\]
❌ Do NOT introduce escaped newlines (\\n)

==============================
ALLOWED FIXES ONLY
==============================

1) Fix JSON syntax (quotes, commas, structure)
2) Fix JSON-level LaTeX backslash escaping
3) Ensure JSON.parse() succeeds

==============================
FIELD RULES
==============================

• question / options / explanation:
  - Preserve markdown
  - Preserve $...$ and $$...$$

• formula field:
  - RAW LaTeX ONLY
  - NO $ or $$ delimiters
  - Single backslashes only
  - Keep "" if empty

==============================
STRICTLY FORBIDDEN
==============================

- ❌ Regeneration
- ❌ Rewriting
- ❌ Reordering
- ❌ Changing correct option
- ❌ Changing language
- ❌ Adding/removing MCQs

==============================
INPUT JSON
==============================

<<<
${primaryRaw}
>>>

Return ONLY the corrected JSON.
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

      parsed.mcqs.forEach((mcq, idx) => {
        if (!mcq.question || !mcq.correct || !mcq.options) {
          throw new Error(`Invalid MCQ structure at index ${idx}`);
        }

        if (!Array.isArray(mcq.options) || mcq.options.length !== 4) {
          throw new Error(`MCQ ${idx} must contain exactly 4 options`);
        }

        if (!mcq.options.includes(mcq.correct)) {
          throw new Error(`Correct option mismatch at MCQ ${idx}`);
        }
      });

      const safeParsed = JSON.parse(JSON.stringify(parsed));

      // -------------------------------------------------------------------
      // 6️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await LastMinuteMCQModel.create({
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

      return { mcqs: safeParsed.mcqs, source: "generated" };

    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`generateMCQs error: ${err.message}`);
    }
  }
);
