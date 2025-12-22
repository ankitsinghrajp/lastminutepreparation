
import { inngest } from "../../libs/inngest.js";
import { AiCoach } from "../../models/LastMinuteBeforeExam/aiCoach.model.js";
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

  const parsed = JSON.parse(jsonString);

  if (!parsed.steps || !Array.isArray(parsed.steps)) {
    throw new Error("Invalid structure: steps missing");
  }

  if (parsed.steps.length !== 6) {
    throw new Error(`Expected 6 steps, got ${parsed.steps.length}`);
  }

  const priorities = parsed.steps.map((s) => s.priority);
  if (new Set(priorities).size !== 6) {
    throw new Error("Duplicate priorities detected");
  }

  return parsed;
};

/* -------------------- INNGEST FUNCTION -------------------- */
export const lastNightAICoachFn = inngest.createFunction(
  {
    id: "lmp-ai-coach",
    name: "Generate LMP AI Coach",
    retries: 0,
  },
  { event: "lmp/generate.aiCoach" },
  async ({ event }) => {
    const { className, subject, chapter } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(mainSubject);

    const cacheKey = `lmp:aicoach:${className}:${mainSubject}:${chapter}`;
    const pendingKey = `lmp:aicoach:pending:${className}:${mainSubject}:${chapter}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await AiCoach.findOne({
        className,
        subject: mainSubject,
        chapter,
      });

      if (dbCache) {
        await redis.set(cacheKey, JSON.stringify(dbCache.content), {
          EX: 60 * 60 * 24 * 2,
        });
        await redis.del(pendingKey);
        return { steps: dbCache.content.steps, source: "database" };
      }

      // -------------------------------------------------------------------
      // 2️⃣ BUILD PROMPT (UNCHANGED)
      // -------------------------------------------------------------------
         const prompt = `
You are an API that returns ONLY valid JSON.
No extra text, no explanation outside JSON.

CRITICAL JSON REQUIREMENT:
This is a JSON API. ALL string values and property names MUST use DOUBLE QUOTES (").
NEVER use single quotes (') in JSON output - it will cause parsing failure.

Class: ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

TASK:
Generate EXACTLY 6 REVISION STEPS strictly from THIS chapter only.

Each step must:
- Be a high-priority revision action for CBSE board exam
- Be specific to this chapter's concepts
- Help students revise efficiently the night before exam

For EACH step:
- Give priority number (1-6)
- Give action/instruction (what to revise/practice)
- Give ONE standard CBSE formula related to that step (if applicable)

────────────────────────────────────────
LANGUAGE POLICY (ABSOLUTE — SUBJECT-LOCKED)
────────────────────────────────────────

Language MUST strictly follow the subject.
NO cross-language mixing is allowed.

1) If Subject is "Hindi":
   - ALL steps and actions MUST be written ONLY in PURE, STANDARD HINDI.
   - Use formal CBSE/NCERT academic Hindi only.
   - DO NOT include any English or Sanskrit words.
   - Formula field MUST be empty string "".

2) If Subject is "Sanskrit":
   - ALL steps and actions MUST be written ONLY in PURE CLASSICAL SANSKRIT.
   - Use correct Sanskrit grammar, vocabulary, विभक्ति, and verb forms.
   - DO NOT include English words or transliteration.
   - Formula field MUST be empty string "".

3) For ALL OTHER subjects (Physics, Chemistry, Maths, Biology, SST, etc.):
   - ALL steps and actions MUST be written ONLY in STANDARD ACADEMIC ENGLISH.
   - DO NOT include Hindi, Sanskrit, or Hinglish.
   - Formula field MUST contain relevant formula in raw LaTeX (if applicable).

FORBIDDEN (ZERO TOLERANCE):

- Mixing languages in any form.
- Transliteration.
- Subject-language mismatch.
- Bilingual phrasing.

AUTO-REGENERATION RULE (MANDATORY):

- If ANY language rule is violated,
  → IMMEDIATELY discard and regenerate the entire output.

────────────────────────────────────────
CHAPTER–TOPIC ISOLATION (STRICT)
────────────────────────────────────────

- Steps MUST belong strictly to the given chapter and its syllabus.
- DO NOT introduce topics, laws, or formulas from other chapters or classes.

────────────────────────────────────────
REVISION STEP CONTENT RULES
────────────────────────────────────────

- EXACTLY 6 steps (priority 1 to 6).
- Priority 1 = MOST IMPORTANT, Priority 6 = LEAST IMPORTANT (but still important).
- Action must be clear, specific, and exam-focused (e.g., "Revise all laws of motion and practice numerical problems").
- NO vague actions like "Study well" or "Read chapter".
- NO questions.
- NO derivations in the action field.

────────────────────────────────────────
UNIVERSAL FORMULA & MATH RULES (MANDATORY)
────────────────────────────────────────

1) LATEX IN ACTION FIELD:
- If the action contains any mathematical symbols, variables, or expressions,
  they MUST be wrapped in LaTeX delimiters.
- Inline math → $ ... $
- Display math → $$ ... $$
- Keep mathematical content in actions minimal.

────────────────────────────────────────
CHEMICAL FORMULAS & EQUATIONS (Chemistry/Science)
────────────────────────────────────────

FOR ALL CHEMICAL CONTENT IN ACTIONS:

1) SIMPLE CHEMICAL FORMULAS (in action text):
   - Use INLINE math mode with subscripts/superscripts
   - LaTeX backslashes MUST be DOUBLED in action field: \\\\
   - Examples in ACTION field:
     • Water: $H_2O$ (no backslashes needed for simple subscripts)
     • Sulfuric acid: $H_2SO_4$
     • Potassium dichromate: $K_2Cr_2O_7$
     • Permanganate ion: $MnO_4^-$
     • Hydronium: $H_3O^+$

2) CHEMICAL EQUATIONS IN ACTIONS:
   - Use INLINE math for simple reactions in action text
   - LaTeX backslashes MUST be DOUBLED: \\\\
   - Examples in ACTION field:
     • "Practice oxidation: $K_2Cr_2O_7 \\\\to products$"
     • "Revise equilibrium: $N_2 + 3H_2 \\\\rightleftharpoons 2NH_3$"

3) CHEMICAL FORMULAS IN FORMULA FIELD:
   - Use RAW LaTeX (single backslashes)
   - NO $ or $$ delimiters
   - Examples in FORMULA field:
     • "K_2Cr_2O_7"
     • "H_2SO_4"
     • "N_2 + 3H_2 \\rightleftharpoons 2NH_3"
     • "\\text{PCC: } C_5H_5NH^+CrO_3Cl^-"

4) FORBIDDEN IN CHEMISTRY:
   - NEVER write H2O, H2SO4, K2Cr2O7 as plain text
   - NEVER write subscripts/superscripts without LaTeX delimiters
   - Action field: NEVER use single backslashes (must be \\\\)
   - Formula field: NEVER use doubled backslashes or delimiters

5) COMPLETE EXAMPLES:

Example A - Chemistry revision step with formula:
{
  "priority": 1,
  "action": "Revise oxidation of alcohols using $K_2Cr_2O_7$ and understand the role of $H_2SO_4$ in the reaction mechanism.",
  "formula": "R-CH_2OH \\xrightarrow{K_2Cr_2O_7/H^+} R-COOH"
}

Example B - Organic chemistry with mild oxidizing agent:
{
  "priority": 2,
  "action": "Practice selective oxidation of primary alcohols to aldehydes using PCC, ensuring no over-oxidation to carboxylic acids.",
  "formula": "R-CH_2OH \\xrightarrow{\\text{PCC}} R-CHO"
}

Example C - Equilibrium chemistry:
{
  "priority": 3,
  "action": "Study Haber process equilibrium: $N_2 + 3H_2 \\\\rightleftharpoons 2NH_3$ and factors affecting yield.",
  "formula": "N_2 + 3H_2 \\rightleftharpoons 2NH_3"
}

Example D - Acid-base chemistry:
{
  "priority": 4,
  "action": "Revise ionization of weak acids and calculate pH using $K_a$ values for $CH_3COOH$ solutions.",
  "formula": "pH = -\\log[H^+]"
}

Note the pattern:
- ACTION field: Chemical formulas use $...$, arrows use \\\\
- FORMULA field: Raw LaTeX, single backslashes, NO delimiters



────────────────────────────────────────
CHEMISTRY VALIDATION CHECKLIST
────────────────────────────────────────

Before returning JSON with chemistry content:

1. ✓ All chemical formulas in action wrapped in $...$
2. ✓ Action field: LaTeX commands use \\\\ (doubled)
3. ✓ Formula field: LaTeX commands use \\ (single)
4. ✓ Formula field: NO $ or $$ delimiters
5. ✓ NO plain-text chemical formulas (H2O, CO2, etc.)
6. ✓ Subscripts use _ and superscripts use ^
7. ✓ Arrows use \\\\to, \\\\rightarrow, or \\\\rightleftharpoons in action
8. ✓ Arrows use \\to, \\rightarrow, or \\rightleftharpoons in formula field

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
LATEX DELIMITER RESTRICTION
────────────────────────────────────────

- NEVER use \\( ... \\) or \\[ ... \\].
- Use ONLY $...$ or $$...$$ in the action field.

────────────────────────────────────────
FORMULA FIELD RULE (VERY IMPORTANT)
────────────────────────────────────────

- Formula field MUST contain:
  ✔ ONE standard CBSE formula related to THAT step
  ✔ PURE LaTeX expression only (raw LaTeX code)
  ✔ NO delimiters (no $ or $$)
- DO NOT include:
  ✖ text
  ✖ explanations
  ✖ multiple formulas
  ✖ delimiters like $ or $$

The formula field stores RAW LaTeX code for indexing/rendering purposes.

Example (CORRECT for Newton's Second Law):
F = ma

Example (CORRECT for Quadratic Formula):
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}

Example (WRONG - has delimiters):
$F = ma$

Example (WRONG - has text):
Force equals mass times acceleration: F = ma

────────────────────────────────────────
FORMULA HARD CONSTRAINT (ABSOLUTE)
────────────────────────────────────────

- Formula MUST contain EXACTLY ONE mathematical or chemical expression.
- NEVER include definitions, labels, headings, or words inside formula.
- NEVER use \\text{}, \\quad, commas, semicolons, or explanations.
- NEVER combine multiple formulas in one field.
- If a step has multiple formulas, choose ONLY the MOST STANDARD CBSE formula.
- If no formula applies to the step, use empty string "".
- If violated → REGENERATE.

────────────────────────────────────────
KATEX COMPATIBILITY RULE (ABSOLUTE)
────────────────────────────────────────

- Formula MUST use ONLY standard, widely supported LaTeX commands.
- Allowed examples: \\lim, \\frac, \\sin, \\cos, \\tan, \\to, \\cdot, \\vec, ^, _, =, +, -
- FORBIDDEN: any invented or uncommon commands such as \\uim, \\ulim, \\ltext, \\eqn, etc.
- If any non-standard command appears → REGENERATE.

────────────────────────────────────────
NEWLINES IN JSON STRINGS
────────────────────────────────────────

- For line breaks in the action field, use the escaped newline sequence: \\n
- Example: "Step 1: Revise laws\\nStep 2: Practice problems"
- Do NOT use literal line breaks inside JSON string values
- This ensures the JSON remains valid and parseable

────────────────────────────────────────
JSON SYNTAX RULES (CRITICAL)
────────────────────────────────────────

MANDATORY JSON FORMAT RULES:

1. **String Values MUST use DOUBLE QUOTES only**
   ✓ CORRECT: "priority": 1
   ✓ CORRECT: "action": "Revise concepts"
   ✗ WRONG: "action": 'Revise concepts'
   ✗ WRONG: "action": \`Revise concepts\`

2. **Property Names MUST use DOUBLE QUOTES**
   ✓ CORRECT: "priority": 1
   ✗ WRONG: 'priority': 1

3. **No trailing commas**
   ✗ WRONG: {"priority": 1,}
   ✓ CORRECT: {"priority": 1}

4. **Numbers don't need quotes**
   ✓ CORRECT: "priority": 1
   ✗ WRONG: "priority": "1"

5. **LaTeX backslashes in JSON strings (action field)**
   ✓ CORRECT: "action": "Solve $\\\\frac{a}{b}$"
   ✗ WRONG: "action": "Solve $\\frac{a}{b}$"

6. **LaTeX in formula field (raw LaTeX, NO doubling)**
   ✓ CORRECT: "formula": "\\frac{a}{b}"
   ✗ WRONG: "formula": "\\\\frac{a}{b}"
   ✗ WRONG: "formula": "$\\frac{a}{b}$"

7. **Newlines must be escaped**
   ✓ CORRECT: "action": "Line 1\\nLine 2"
   ✗ WRONG: "action": "Line 1
   Line 2"

VALIDATION BEFORE RETURN:
- Scan entire output for single quotes around string values
- Replace any 'value' with "value"
- Verify all property names use double quotes
- Confirm valid JSON structure

────────────────────────────────────────
JSON FIELD-SPECIFIC ESCAPING RULES
────────────────────────────────────────

CRITICAL: Different fields have different escaping rules!

1. **ACTION FIELD** (contains text with optional LaTeX):
   - LaTeX backslashes MUST be DOUBLED: \\\\
   - Example: "action": "Practice $\\\\frac{dy}{dx}$ problems"

2. **FORMULA FIELD** (contains ONLY raw LaTeX):
   - LaTeX backslashes are NOT doubled: \\
   - Example: "formula": "\\frac{dy}{dx}"
   - This field stores raw LaTeX for direct rendering

3. **PRIORITY FIELD**:
   - Plain number, no quotes
   - Example: "priority": 1

────────────────────────────────────────
COMPLETE EXAMPLES OF CORRECT JSON
────────────────────────────────────────

Example 1 - Math/Science subject with formula:
{
  "priority": 1,
  "action": "Revise Newton's Second Law and practice numerical problems on force, mass, and acceleration.",
  "formula": "F = ma"
}

Example 2 - Math subject with complex formula:
{
  "priority": 2,
  "action": "Practice differentiation using chain rule for composite functions like $\\\\sin(x^2)$.",
  "formula": "\\frac{dy}{dx} = f'(g(x)) \\cdot g'(x)"
}

Example 3 - Step without specific formula:
{
  "priority": 3,
  "action": "Understand the concept of continuity and practice graph-based questions.",
  "formula": ""
}

Example 4 - Hindi subject (no formula):
{
  "priority": 1,
  "action": "पाठ के मुख्य पात्रों का चरित्र-चित्रण दोहराएँ।",
  "formula": ""
}

Note in examples above:
- Action field: LaTeX backslashes are DOUBLED (\\\\frac, \\\\sin)
- Formula field: LaTeX backslashes are SINGLE (\\frac, \\cdot)
- Priority: plain number
- All strings use double quotes

────────────────────────────────────────
FINAL SELF-VALIDATION (MANDATORY)
────────────────────────────────────────

Before returning the JSON:
1. VERIFY EXACTLY 6 steps with priority 1 to 6.
2. SCAN for ANY single quotes ('...' or '...') around string values → REGENERATE.
3. VERIFY ALL property names use double quotes ("priority", "action", "formula", "steps").
4. CHECK action field: LaTeX backslashes must be DOUBLED (\\\\).
5. CHECK formula field: LaTeX backslashes must be SINGLE (\\).
6. VERIFY formula field has NO $ or $$ delimiters.
7. VERIFY newlines use \\n not literal line breaks in JSON strings.
8. VERIFY valid JSON syntax (no trailing commas, proper brackets).
9. TEST: The output must be parseable by JSON.parse() in JavaScript.

JSON SYNTAX CHECK:
- Search for any single quotes in JSON structure → REGENERATE with double quotes
- Check priority values are plain numbers, not strings
- Verify action field has proper LaTeX escaping (\\\\)
- Verify formula field has raw LaTeX (single \\)

Return output ONLY after passing ALL checks.

────────────────────────────────────────
OUTPUT JSON (STRICT — DO NOT MODIFY)
────────────────────────────────────────

{
  "steps": [
    { "priority": 1, "action": "Revision action with optional $\\\\LaTeX$ in action", "formula": "raw_latex_here_or_empty" },
    { "priority": 2, "action": "...", "formula": "" },
    { "priority": 3, "action": "...", "formula": "" },
    { "priority": 4, "action": "...", "formula": "" },
    { "priority": 5, "action": "...", "formula": "" },
    { "priority": 6, "action": "...", "formula": "" }
  ]
}

────────────────────────────────────────
CRITICAL (NON-NEGOTIABLE)
────────────────────────────────────────

- EXACTLY 6 steps with priority 1-6
- Return ONLY valid JSON with proper syntax
- ALL string values MUST use DOUBLE QUOTES, never single quotes
- ALL property names MUST use DOUBLE QUOTES
- Action field: LaTeX backslashes DOUBLED (\\\\)
- Formula field: LaTeX backslashes SINGLE (\\), NO delimiters
- Priority field: plain numbers, no quotes
- Newlines MUST use \\n in JSON strings
- NO trailing commas
- NO extra fields
- Subject-based language compliance has HIGHEST priority
- Output MUST be valid JSON parseable by JSON.parse()
- Formula field must render correctly in KaTeX after parsing

JSON SYNTAX ERRORS ARE FATAL - the output will fail completely if:
- Single quotes are used instead of double quotes
- Property names lack double quotes
- Action field has single backslashes instead of double
- Formula field has delimiters ($ or $$) or doubled backslashes
- Priority is quoted as string instead of number
- Literal line breaks appear instead of \\n
- Any JSON syntax rule is violated

FINAL CHECK BEFORE SUBMITTING:
1. Count steps: must be exactly 6
2. Check: ALL quotes are double quotes (")
3. Check: action field LaTeX has \\\\ 
4. Check: formula field LaTeX has single \\
5. Check: priority is plain number
6. Verify JSON.parse() compatibility
7. Only then return the output
`.trim();

      // -------------------------------------------------------------------
      // 3️⃣ FIRST AI CALL (PRIMARY)
      // -------------------------------------------------------------------
      const primaryRaw = await askOpenAI(prompt, "gpt-5.1", {
        response_format: { type: "json_object" },
      });


const fixerPrompt = `
You are a JSON LaTeX escaping fixer. Fix ONLY the LaTeX backslash escaping. Do NOT change any text content.

CRITICAL ESCAPING RULES:

1. IN "action" FIELD - Double backslashes before LaTeX commands:
   Wrong: "action": "Solve $\\frac{a}{b}$"
   Correct: "action": "Solve $\\\\frac{a}{b}$"
   
   Apply to ALL LaTeX commands: \\frac, \\sin, \\cos, \\sqrt, \\log, \\lim, \\to, \\Rightarrow, etc.

2. IN "formula" FIELD - Single backslashes, NO $ delimiters:
   Wrong: "formula": "$\\frac{a}{b}$"
   Wrong: "formula": "\\\\frac{a}{b}"
   Correct: "formula": "\\frac{a}{b}"

3. JSON syntax:
   - Use double quotes (") only
   - Escape newlines as \\n
   - No trailing commas

EXAMPLES:
Action field: "Differentiate $\\\\frac{dy}{dx}$ and $\\\\sin(x)$"
Formula field: "\\frac{dy}{dx}"

INPUT JSON TO FIX:
${primaryRaw}

OUTPUT: Return the corrected JSON only, no explanation.
`.trim();

        const subjectHardness = ["physics","chemistry","mathematics","applied mathematics", "accountancy", "bio technology"];

      let secondPassModel;
      if(subjectHardness.includes(mainSubject)){
        secondPassModel = "gpt-4o";
      }
      else{
        secondPassModel = "gpt-4o-mini"
      }


      const finalRaw = await askOpenAI(fixerPrompt, secondPassModel, {
        response_format: { type: "json_object" },
      });

      // -------------------------------------------------------------------
      // 5️⃣ PARSE ONLY ONCE (FINAL OUTPUT)
      // -------------------------------------------------------------------
      const parsed = extractJSON(finalRaw);
      const safeParsed = JSON.parse(JSON.stringify(parsed));

      // -------------------------------------------------------------------
      // 6️⃣ SAVE DB
      // -------------------------------------------------------------------
      await AiCoach.create({
        className,
        subject: mainSubject,
        chapter,
        content: safeParsed,
      });

      // -------------------------------------------------------------------
      // 7️⃣ SAVE REDIS
      // -------------------------------------------------------------------
      await redis.set(cacheKey, JSON.stringify(safeParsed), {
        EX: 60 * 60 * 24 * 2,
      });

      await redis.del(pendingKey);

      return { steps: safeParsed.steps, source: "generated" };
    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`generateAICoach error: ${err.message}`);
    }
  }
);
