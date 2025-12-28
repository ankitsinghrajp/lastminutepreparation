import { inngest } from "../../libs/inngest.js";
import { Booster } from "../../models/LastMinuteBeforeExam/memoryBooster.model.js";
import { parseSubject, detectCategory } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";

// Dedicated extraction function
const extractMemoryBoosterJSON = (text) => {
  if (!text) throw new Error("Empty response received from AI.");

  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("No JSON found.");

  let jsonString = text.substring(first, last + 1);
  jsonString = jsonString.replace(/[\u0000-\u001F]+/g, " ");

  return JSON.parse(jsonString);
};

export const lastNightMemoryBoosterFn = inngest.createFunction(
  {
    id: "lmp-memory-booster",
    name: "Generate LMP Memory Booster",
    retries: 0,
  },
  { event: "lmp/generate.memoryBooster" },
  async ({ event }) => {
    const { className, subject, chapter } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(mainSubject);

    const cacheKey = `lmp:booster:${className}:${mainSubject}:${chapter}`;
    const pendingKey = `lmp:booster:pending:${className}:${mainSubject}:${chapter}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await Booster.findOne({
        className,
        subject: mainSubject,
        chapter,
      });

      if (dbCache) {
        await redis.set(cacheKey, JSON.stringify(dbCache.content), {
          ex: 60 * 60 * 24 * 2,
        });
        await redis.del(pendingKey);
        return { boosters: dbCache.content.boosters, source: "database" };
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

   Required Sanskrit characteristics:
   • Proper Sanskrit vocabulary and grammar
   • Correct verb forms and विभक्ति usage
   • Classical Sanskrit sentence structure

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
CHEMICAL FORMULAS & EQUATIONS (Chemistry/Science)
────────────────────────────────────────

FOR ALL CHEMICAL CONTENT IN BOOSTERS:

1) SIMPLE CHEMICAL FORMULAS (in content text):
   - Use INLINE math mode with subscripts/superscripts
   - LaTeX backslashes MUST be DOUBLED in JSON strings: \\\\
   - Examples in content field:
     • Water: $H_2O$
     • Sulfuric acid: $H_2SO_4$
     • Potassium dichromate: $K_2Cr_2O_7$
     • Permanganate ion: $MnO_4^-$
     • Hydronium: $H_3O^+$
     • Chromate: $CrO_4^{2-}$

2) CHEMICAL EQUATIONS IN CONTENT:
   - Use DISPLAY math mode for reactions: $$ ... $$
   - LaTeX backslashes MUST be DOUBLED: \\\\
   - Examples in content field:
     • Simple reaction:
       $$K_2Cr_2O_7 + H_2SO_4 \\\\to \\\\text{products}$$
     • Equilibrium:
       $$N_2 + 3H_2 \\\\rightleftharpoons 2NH_3$$
     • With conditions:
       $$\\\\ce{2KMnO_4 \\\\xrightarrow{\\\\Delta} K_2MnO_4 + MnO_2 + O_2}$$

3) FORBIDDEN IN CHEMISTRY:
   - NEVER write H2O, H2SO4, K2Cr2O7 as plain text without LaTeX
   - NEVER write subscripts/superscripts without math delimiters
   - NEVER use single backslashes in JSON (must be \\\\)
   - NEVER use \\( or \\) delimiters

4) CHEMISTRY-SPECIFIC BOOSTER EXAMPLES:

Example A - Acronym for oxidizing agents:
{
  "type": "acronym",
  "content": "KPCD: Remember strong oxidizing agents\\n\\nK = $K_2Cr_2O_7$ (Potassium dichromate)\\nP = $KMnO_4$ (Potassium permanganate)\\nC = Concentrated $H_2SO_4$\\nD = Dilute $HNO_3$"
}

Example B - Story with chemical reaction:
{
  "type": "story",
  "content": "Imagine a primary alcohol $R-CH_2OH$ meeting PCC at a party. PCC is a 'gentle oxidizer' who stops at aldehydes:\\n\\n$$R-CH_2OH \\\\xrightarrow{\\\\text{PCC}} R-CHO$$\\n\\nBut if the alcohol meets $K_2Cr_2O_7$ in acidic $H_2SO_4$, it's 'over-oxidized' all the way to carboxylic acid:\\n\\n$$R-CH_2OH \\\\xrightarrow{K_2Cr_2O_7/H^+} R-COOH$$"
}

Example C - Pattern for pH calculations:
{
  "type": "pattern",
  "content": "pH Pattern for weak acids:\\n\\nStep 1: Write ionization: $CH_3COOH \\\\rightleftharpoons CH_3COO^- + H^+$\\nStep 2: Use $K_a$ expression: $K_a = \\\\frac{[H^+][CH_3COO^-]}{[CH_3COOH]}$\\nStep 3: Calculate $[H^+]$\\nStep 4: Apply: $pH = -\\\\log[H^+]$"
}

Example D - Acronym with ion formulas:
{
  "type": "acronym",
  "content": "MNCS: Common polyatomic ions\\n\\nM = $MnO_4^-$ (Permanganate)\\nN = $NO_3^-$ (Nitrate)\\nC = $CrO_4^{2-}$ (Chromate)\\nS = $SO_4^{2-}$ (Sulfate)"
}

5) JSON ESCAPING FOR CHEMISTRY:
   - All chemical formulas with subscripts: $H_2O$, $K_2Cr_2O_7$
   - Arrow commands in equations: \\\\to, \\\\rightarrow, \\\\rightleftharpoons
   - Special chemistry: \\\\ce{}, \\\\xrightarrow{}, \\\\Delta
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
All logical expressions MUST be written as valid LaTeX and MUST remain
unchanged until rendered by KaTeX. Do NOT rely on post-processing.


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

────────────────────────────────────────
CHEMICAL EQUATIONS (applies to Science subjects)
────────────────────────────────────────

- ALL chemical reactions MUST be written as DISPLAY math only: $$ ... $$
- NEVER use inline math or plain text for chemical equations.

────────────────────────────────────────
NEWLINES IN JSON STRINGS
────────────────────────────────────────

- For line breaks in the content field, use the escaped newline sequence: \\n
- Example: "Line 1\\nLine 2\\nLine 3"
- Do NOT use literal line breaks inside JSON string values
- This ensures the JSON remains valid and parseable

────────────────────────────────────────
JSON SYNTAX RULES (CRITICAL)
────────────────────────────────────────

MANDATORY JSON FORMAT RULES:

1. **String Values MUST use DOUBLE QUOTES only**
   ✓ CORRECT: "type": "acronym"
   ✗ WRONG: "type": 'acronym'
   ✗ WRONG: "type": \`acronym\`

2. **Property Names MUST use DOUBLE QUOTES**
   ✓ CORRECT: "content": "..."
   ✗ WRONG: 'content': "..."

3. **No trailing commas**
   ✗ WRONG: {"type": "acronym",}
   ✓ CORRECT: {"type": "acronym"}

4. **LaTeX backslashes in JSON strings**
   ✓ CORRECT: "$\\\\frac{a}{b}$"
   ✗ WRONG: "$\\frac{a}{b}$"
   
   When writing LaTeX inside JSON strings, backslashes must be escaped:
   - Write \\\\frac not \\frac
   - Write \\\\sin not \\sin
   - Write \\\\to not \\to

5. **Newlines must be escaped**
   ✓ CORRECT: "Line 1\\nLine 2"
   ✗ WRONG: "Line 1
   Line 2"

6. **Quotes inside strings must be escaped**
   ✓ CORRECT: "He said \\"hello\\""
   ✗ WRONG: "He said "hello""

VALIDATION BEFORE RETURN:
- Scan entire output for single quotes around string values
- Replace any 'value' with "value"
- Verify all property names use double quotes
- Confirm valid JSON structure

────────────────────────────────────────
JSON ESCAPING EXAMPLES (CRITICAL)
────────────────────────────────────────

CORRECT way to write LaTeX in JSON:

{
  "content": "Formula: $\\\\frac{a}{b}$"
}

{
  "content": "Limit: $\\\\lim_{x \\\\to 0} f(x)$"
}

{
  "content": "Derivative:\\n$$\\\\frac{dy}{dx} = 2x$$"
}

WRONG way (will cause parsing errors):

{
  "content": "Formula: $\\frac{a}{b}$"
}

{
  "content": "Limit: $\\lim_{x \\to 0} f(x)$"
}

All LaTeX commands starting with backslash must have the backslash doubled in JSON.

────────────────────────────────────────
SPECIAL LATEX COMMANDS - ESCAPING REQUIRED
────────────────────────────────────────

When writing these LaTeX commands in JSON strings, DOUBLE the backslash:

- \\displaystyle → \\\\displaystyle
- \\lim → \\\\lim
- \\to → \\\\to
- \\frac → \\\\frac
- \\dfrac → \\\\dfrac
- \\neq → \\\\neq
- \\cdot → \\\\cdot
- \\Rightarrow → \\\\Rightarrow
- \\sin → \\\\sin
- \\cos → \\\\cos
- \\tan → \\\\tan
- \\sqrt → \\\\sqrt
- \\big → \\\\big
- \\Big → \\\\Big
- \\left → \\\\left
- \\right → \\\\right
- \\limits → \\\\limits

────────────────────────────────────────
FINAL SELF-VALIDATION (MANDATORY)
────────────────────────────────────────

Before returning the JSON:
1. SCAN for ANY backslash-command appearing OUTSIDE $...$ or $$...$$ → REGENERATE.
2. SCAN for ANY mathematical symbol appearing outside LaTeX → REGENERATE.
3. SCAN for ANY single quotes ('...' or '...') around string values → REGENERATE.
4. VERIFY ALL property names use double quotes ("type", "content", "boosters").
5. VERIFY ALL LaTeX backslashes in JSON strings are DOUBLED (\\\\).
6. VERIFY newlines use \\n not literal line breaks in JSON strings.
7. VERIFY valid JSON syntax (no trailing commas, proper brackets).
8. TEST: The output must be parseable by JSON.parse() in JavaScript.

JSON SYNTAX CHECK:
- Search for patterns like: 'acronym', 'story', 'pattern'
- These MUST appear as: "acronym", "story", "pattern"
- Search for property patterns like: 'type': or 'content':
- These MUST appear as: "type": or "content":
- If ANY single quotes found in JSON structure → REGENERATE with double quotes

LATEX ESCAPING CHECK:
- Search for patterns like: "$\\lim" or "$\\frac" in JSON strings
- These MUST appear as: "$\\\\lim" and "$\\\\frac"
- Count backslashes: LaTeX commands need 2 backslashes in JSON, not 1
- If single backslashes found in JSON strings → REGENERATE with proper escaping

Return output ONLY after passing ALL checks.

────────────────────────────────────────
OUTPUT JSON (STRICT — DO NOT MODIFY)
────────────────────────────────────────

{
  "boosters": [
    { "type": "acronym", "content": "..." },
    { "type": "story", "content": "..." },
    { "type": "pattern", "content": "..." }
  ]
}

COMPLETE EXAMPLE OF VALID JSON:

{
  "boosters": [
    {
      "type": "acronym",
      "content": "CPQI: Chain-Product-Quotient-Inverse\\n\\nC for Chain rule: if $y = f(g(x))$, then $y' = f'(g(x)) \\\\cdot g'(x)$."
    },
    {
      "type": "story",
      "content": "Imagine a train track. The derivative is:\\n$$\\\\frac{dy}{dx} = \\\\lim_{h \\\\to 0} \\\\frac{f(x+h) - f(x)}{h}$$"
    },
    {
      "type": "pattern",
      "content": "Power rule: if $y = x^n$, then $y' = nx^{n-1}$."
    }
  ]
}

Note how in the example above:
- All strings use double quotes
- LaTeX backslashes are doubled: \\\\frac, \\\\lim, \\\\cdot
- Newlines use \\n
- No trailing commas

────────────────────────────────────────
CRITICAL (NON-NEGOTIABLE)
────────────────────────────────────────

- EXACTLY 3 boosters
- Return ONLY valid JSON with proper syntax
- ALL string values MUST use DOUBLE QUOTES, never single quotes
- ALL property names MUST use DOUBLE QUOTES
- ALL LaTeX backslashes MUST be doubled in JSON strings (\\\\)
- Newlines MUST use \\n in JSON strings
- NO trailing commas
- NO extra fields
- NO stray punctuation
- NO partial math outside LaTeX
- Subject-based language compliance has HIGHEST priority
- Output MUST be valid JSON parseable by JSON.parse()
- Output MUST be fully compatible with Markdown + KaTeX renderer after parsing

JSON SYNTAX ERRORS ARE FATAL - the output will fail completely if:
- Single quotes are used instead of double quotes
- Property names lack double quotes
- LaTeX backslashes are not doubled
- Literal line breaks appear in JSON strings instead of \\n
- Any JSON syntax rule is violated

FINAL CHECK BEFORE SUBMITTING:
1. Copy your entire output
2. Verify it passes JSON.parse() mentally
3. Check: ALL quotes are double quotes (")
4. Check: ALL LaTeX backslashes are doubled (\\\\)
5. Check: Line breaks use \\n
6. Only then return the output
`;

      // -------------------------------------------------------------------
      // 3️⃣ FIRST AI CALL (PRIMARY)
      // -------------------------------------------------------------------
      const primaryRaw = await askOpenAI(prompt,"gpt-5.1",{
  response_format: { type: "json_object" }
     });

      // -------------------------------------------------------------------
      // 🔁 4️⃣ SECOND AI CALL (DIRECT — NO CHECKS)
      // -------------------------------------------------------------------
 // Replace your regenPrompt with this improved version:

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



      const finalRaw = await askOpenAI(fixerPrompt, secondPassModel,{
  response_format: { type: "json_object" }
     });


      // -------------------------------------------------------------------
      // 5️⃣ PARSE ONLY ONCE (FINAL OUTPUT)
      // -------------------------------------------------------------------
      const parsed = extractMemoryBoosterJSON(finalRaw);
      const safeParsed = JSON.parse(JSON.stringify(parsed));

      // -------------------------------------------------------------------
      // 6️⃣ SAVE DB
      // -------------------------------------------------------------------
      await Booster.create({
        className,
        subject: mainSubject,
        chapter,
        content: safeParsed,
      });

      // -------------------------------------------------------------------
      // 7️⃣ SAVE REDIS
      // -------------------------------------------------------------------
      await redis.set(cacheKey, JSON.stringify(safeParsed), {
        ex: 60 * 60 * 24 * 2,
      });

      await redis.del(pendingKey);

      return { boosters: safeParsed.boosters, source: "generated" };

    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`generateMemoryBooster error: ${err.message}`);
    }
    finally{
      await redis.del(pendingKey);
    }
  }
);
