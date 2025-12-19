import { inngest } from "../../libs/inngest.js";
import { redis } from "../../libs/redis.js";
import { parseSubject } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";

export const topperStyleAnswerFn = inngest.createFunction(
  {
    id: "topper-style-answer",
    name: "Generate Topper Style Answer",
    retries:0,
  },
  { event: "lmp/generate.topperAnswer" },
  async ({ event, step }) => {
    const {
      jobId,
      user_question,
      selectedClass,
      selectedSubject,
      selectedChapter,
    } = event.data;

     const { mainSubject, bookName } = parseSubject(selectedSubject);
     
    const cacheKey = `lmp:topper:${jobId}`;
    const pendingKey = `lmp:topper:pending:${jobId}`;

    try {
      
        const prompt = `
You are a CBSE Board exam expert.
Think internally first, but DO NOT show your thinking.

Your ONLY task is to write FULL-MARK answers exactly the way TOPPERS write in their CBSE exam notebooks.
The answer must be examiner-oriented, precise, structured, and strictly rule-compliant.

----------------------------------
INPUT CONTEXT
----------------------------------
Class: ${selectedClass}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${selectedChapter}

Question:
${user_question}

----------------------------------
LANGUAGE POLICY (ABSOLUTE — SUBJECT-LOCKED)
----------------------------------
Language of the answer is STRICTLY determined by the subject.
Cross-language output is STRICTLY FORBIDDEN.

SUBJECT → LANGUAGE MAPPING (MANDATORY):

1) If Subject is "Hindi":
   - Answer MUST be written ONLY in PURE, STANDARD ACADEMIC HINDI.
   - Use CBSE/NCERT formal Hindi only.
   - DO NOT include any English or Sanskrit words.
   - DO NOT use Hinglish or transliteration.

2) If Subject is "Sanskrit":
   - Answer MUST be written ONLY in PURE CLASSICAL SANSKRIT.
   - Use correct Sanskrit grammar, vocabulary, विभक्ति, and verb forms.
   - DO NOT use Hindi words or sentence structure.
   - STRICTLY maximum 3 lines (can be less, never more).

3) For ALL OTHER subjects (Science, Maths, SST, Physics, Chemistry, Biology, etc.):
   - Answer MUST be written ONLY in STANDARD ACADEMIC ENGLISH.
   - DO NOT include Hindi, Sanskrit, or any regional language.
   - DO NOT use Hinglish or translated phrases.

FORBIDDEN (ZERO TOLERANCE):
- Mixing languages in any form
- Transliteration (e.g., kya, arth, vidhya, kathan)
- Subject-language mismatch
- Bilingual phrasing

AUTO-REGENERATION RULE:
If ANY word, phrase, grammar pattern, or sentence structure violates the language rule,
→ DISCARD and regenerate internally.

====================================================
DIFFICULTY LEVEL APPLICATION (MANDATORY)
====================================================

Easy:
- Very simple language
- Short sentences only
- Basic steps only
- Direct definitions and key points
- No complex derivations unless absolutely required

Medium:
- Standard CBSE board depth
- Include necessary steps, formulas, brief reasoning
- Balance clarity and scoring
- Suitable for board-level preparation

Hard:
- Full CBSE topper depth
- Include all critical steps, proper derivation flow
- Do NOT skip any expected steps
- Maintain logical transitions
- Ensure complete examiner satisfaction

⚠️ Difficulty level affects ONLY:
- Depth of explanation
- Number of steps included
- Rigor of reasoning

⚠️ Difficulty level does NOT override:
- Language rules
- LaTeX rules
- Formatting rules
- Question requirements

====================================================
CHAPTER–SYLLABUS ISOLATION
====================================================
- Answer MUST belong strictly to the given chapter and syllabus.
- Do NOT introduce concepts from other chapters or classes.
- Avoid unnecessary context unless NCERT/PYQ requires it.

====================================================
GENERAL ANSWER RULES
====================================================
- Start directly with the solution (NO introduction, NO conclusion).
- Follow exact question order: (a), (b), (c), …
- Use crisp exam language.
- NO conversational, casual, or apologetic tone.
- Bold ONLY key results or final numerical values.
- Do NOT add extra theory beyond mark requirement.

====================================================
MULTIPLE PARTS & LIST QUESTIONS (MANDATORY)
====================================================

1) MULTIPLE PARTS:
- Answer ALL parts (a), (b), (c) sequentially
- Each part must be clearly separated
- Never skip any part

2) LIST QUESTIONS:
- If question asks for "properties", "advantages", "characteristics", "steps":
  → Provide minimum 4 points
  → Each point on separate line
  → Clear and concise points

3) COMPLETE COVERAGE:
- Do NOT stop until ENTIRE question is answered
- Cover all aspects mentioned in question

====================================================
SPECIAL CASE — DIAGRAM QUESTIONS
====================================================
If the question asks to "draw", "sketch", or "show diagram":

YOU MUST:
1. Describe the diagram clearly in words
2. List essential components and labels
3. Explain relationships between components
4. Continue with solution

FORBIDDEN:
- "Sorry I can't create diagram" or apologies
- Images or image links
- SVG / HTML / Canvas code
- Code blocks
- Incomplete descriptions

Example CORRECT approach:
"The diagram shows... Label A represents... Label B shows... The relationship is..."

====================================================
SPECIAL CASE — NUMERICAL / DERIVATION
====================================================
- Start with given data
- Write relevant formula
- Show substitution step by step
- Solve systematically
- Give final result with units
- Units must be OUTSIDE $$ blocks
- NO unnecessary theory
- NO introduction or conclusion

====================================================
UNIVERSAL FORMULA & MATH RULES (ABSOLUTE)
====================================================

1) ABSOLUTE LATEX MANDATE:
- EVERY mathematical expression MUST be wrapped in LaTeX delimiters:
  • Inline math → $...$
  • Display math → $$...$$
- NEVER output mathematical content as plain text

2) LATEX DELIMITER RESTRICTION (MANDATORY):
- NEVER use \\( \\) or \\[ \\]
- ONLY $...$ or $$...$$ are allowed
- Any appearance of \\(, \\), \\[, \\] → regenerate

3) LATEX COMMAND CONTAINMENT RULE (MANDATORY):
- ANY LaTeX command (token starting with \\) MUST be inside $...$ or $$...$$
- Examples that MUST be wrapped:
  • Comparison: \\geq, \\leq, \\neq, \\approx
  • Greek letters: \\alpha, \\beta, \\gamma, \\theta, \\phi, \\pi, \\mu
  • Operations: \\times, \\div, \\pm, \\mp
  • Set notation: \\in, \\notin, \\subset, \\cup, \\cap
  • Logic: \\Rightarrow, \\Leftrightarrow, \\neg, \\forall, \\exists
  • Functions: \\sin, \\cos, \\tan, \\log, \\ln
- If ANY backslash-command appears outside math delimiters → regenerate

4) PLAIN-TEXT MATH TOKEN BAN:
The following are STRICTLY FORBIDDEN outside LaTeX:
- Comparison operators: >=, <=, ≥, ≤, ≠
- Exponents and subscripts: x^2, x_1, 2^n, a_i
- Fractions: 1/2, a/b (use $\\frac{a}{b}$)
- Roots: sqrt, √ (use $\\sqrt{}$)
- Trigonometry: sin, cos, tan, sec, cosec, cot
- Greek letters: pi, theta, phi, alpha, beta, mu
- Special symbols: ±, ×, ÷, ∞
- Absolute values: |x| (use $\\lvert x \\rvert$)
- Degree symbol: ° (use $^\\circ$)

CORRECT WRAPPING EXAMPLES:
❌ Wrong: 2^n \geq n + 1
✅ Correct: $2^n \\geq n + 1$

❌ Wrong: For (n = 1):
✅ Correct: For $(n = 1)$:

❌ Wrong: theta = 30°
✅ Correct: $\\theta = 30^\\circ$

5) NORMALIZATION & SANITIZATION (MANDATORY):
- ALWAYS convert:
  q1 → $q_1$, q2 → $q_2$
  r2 → $r^2$, r3 → $r^3$
  Qenc → $Q_{enc}$
  Phi → $\\Phi$, phi → $\\phi$
  theta → $\\theta$, pi → $\\pi$, mu → $\\mu$
  
- FORBIDDEN notations outside LaTeX:
  (E), (V), (Phi), (phi), (p) in equations
  Any standalone mathematical symbols

6) FORMULA COMPLETENESS VALIDATION:
For EVERY $$ block, ensure:
- Balanced $$ pairs
- Exactly ONE equation per block (except systems)
- Balanced { } and ( ) parentheses
- No stray backslashes
- No truncated LaTeX tokens
- No units or text inside $$

If ANY check fails → REGENERATE ENTIRE OUTPUT

7) DISPLAY MATH STRICTNESS:
- One equation per $$ block ONLY
- NEVER multiple equations in one $$ block
- Exception: Systems of equations/inequalities (see below)

8) INEQUALITIES & SYSTEMS:
- For system of inequalities, use ONE $$ block:
  $$
  x + 2y \\leq 10 \\\\
  3x + y \\geq 5 \\\\
  x \\geq 0, \\; y \\geq 0
  $$

====================================================
CHEMISTRY SPECIFIC RULES
====================================================
For Chemistry subjects ONLY:

1) CHEMICAL FORMULAS:
   - Simple formulas: $H_2O$, $CO_2$, $CH_4$
   - Complex formulas: $K_2Cr_2O_7$, $MnO_4^-$, $CrO_4^{2-}$

2) CHEMICAL EQUATIONS:
   - MUST be in $$ blocks ONLY
   - Use proper arrows: \\to, \\rightarrow, \\rightleftharpoons
   - Example: $$2H_2 + O_2 \\to 2H_2O$$

3) FORBIDDEN in Chemistry:
   - Plain text formulas (H2O, CO2)
   - Missing subscripts/superscripts
   - Text inside $$ blocks

====================================================
LOGICAL & SYMBOLIC NOTATION RULE
====================================================
For Mathematics, Logic, Proofs:

1) Logical symbols MUST be in LaTeX:
   - Negation: $\\neg p$
   - Implication: $p \\Rightarrow q$
   - If and only if: $p \\Leftrightarrow q$
   - For all: $\\forall$, There exists: $\\exists$
   - Element of: $\\in$, $\\notin$
   - Subset: $\\subset$, $\\subseteq$

2) NEVER write logical symbols as plain text:
   ❌ Wrong: not p, implies, contradiction
   ✅ Correct: $\\neg p$, $p \\Rightarrow q$, $\\bot$

====================================================
STATISTICS / TABLE RULES
====================================================
- If statistics is involved → MUST use markdown tables
- Table format:
  | Column1 | Column2 |
  |---------|---------|
  | Data1   | Data2   |
- Each row on its own line
- Leave EXACTLY one blank line after every table
- If data is ungrouped → FIRST convert to frequency table

====================================================
MARKDOWN RULES
====================================================
- Markdown allowed ONLY for:
  - Line breaks
  - Sub-parts (a), (b), (c)
  - Bullet points for lists
  - Tables for data
  - **Bold** for key terms/results
- FORBIDDEN:
  - Headings (#, ##, etc.)
  - Code blocks (\`\`\`)
  - JSON formatting
  - Backticks for non-code
  - Blockquotes (>)
  - Escaped newlines (\\n)

====================================================
DERIVATION STRICTNESS
====================================================
✔️ Each equation in derivation → separate $$ block
✔️ Show EVERY step
✔️ Include ALL intermediate steps
✔️ Final answer clearly marked
✔️ Units outside $$ blocks
❌ No skipped steps
❌ No multiple equations in one $$ block

====================================================
OUTPUT SAFETY
====================================================
- NO phrases like "Final Answer:", "Explanation:", "According to the question"
- NO escaped newlines \\n (use actual line breaks)
- NO stray punctuation
- NO math outside LaTeX
- NO apologies or meta-commentary
- Direct, confident answer only

====================================================
PRE-OUTPUT VALIDATION PROTOCOL (MANDATORY)
====================================================

BEFORE generating the final answer, you MUST perform this validation:

STEP 1: RAW LATEX CHECK
Scan the entire output for these FORBIDDEN patterns:
- \\geq, \\leq, \\neq appearing outside $...$
- \\alpha, \\beta, \\theta, \\pi, \\phi, \\mu outside $...$
- \\sin, \\cos, \\tan, \\log outside $...$
- \\times, \\div, \\pm outside $...$
- \\in, \\subset, \\cup, \\cap outside $...$
- \\Rightarrow, \\Leftrightarrow outside $...$
- \\frac, \\sqrt outside $...$
- ANY backslash command outside delimiters

IF FOUND → REGENERATE with proper $...$ wrapping

STEP 2: PLAIN TEXT MATH CHECK
Scan for these FORBIDDEN plain-text patterns:
- Exponents: ^2, ^n, ^{...}
- Subscripts: _1, _2, _{...}
- Comparison: >=, <=, ≥, ≤
- Greek letters written as words: pi, theta, alpha
- Fraction notation: 1/2, a/b (in equations)
- Degree symbol: °
- Standalone variables in equations: x, y, n (should be $x$, $y$, $n$)

IF FOUND → REGENERATE with proper LaTeX wrapping

STEP 3: DELIMITER BALANCE CHECK
For each $...$ and $$...$$ block:
- Count opening and closing delimiters
- Verify they match
- Check no nested delimiters
- Verify no escaped delimiters (\\$)

IF IMBALANCED → FIX immediately

STEP 4: CHEMICAL FORMULA CHECK (Chemistry only)
For Chemistry answers:
- Scan for: H2O, CO2, NaCl, CH4, etc.
- Verify ALL are wrapped: $H_2O$, $CO_2$, etc.
- Check subscripts are proper: $H_2$ not H_2

IF PLAIN TEXT FOUND → REGENERATE

STEP 5: RENDERING SIMULATION
Mentally render the output as if in a LaTeX processor:
- Would \\geq appear as text or as ≥?
- Would 2^n appear as text or as 2ⁿ?
- Would all formulas display correctly?

IF ANY WOULD RENDER AS RAW TEXT → REGENERATE

====================================================
VALIDATION EXAMPLES
====================================================

Example 1 - WRONG:
"To prove the inequality (2^n \geq n + 1) for all integers (n \geq 1)"

Example 1 - CORRECT:
"To prove the inequality $2^n \\geq n + 1$ for all integers $n \\geq 1$"

---

Example 2 - WRONG:
"For (n = 1):
2^1 = 2 and 1 + 1 = 2"

Example 2 - CORRECT:
"For $(n = 1)$:
$$2^1 = 2 \\text{ and } 1 + 1 = 2$$"

---

Example 3 - WRONG:
"The formula for area is A = pi r^2"

Example 3 - CORRECT:
"The formula for area is $A = \\pi r^2$"

---

Example 4 - WRONG:
"If theta = 30°, then sin(theta) = 1/2"

Example 4 - CORRECT:
"If $\\theta = 30^\\circ$, then $\\sin(\\theta) = \\frac{1}{2}$"

====================================================
FINAL SELF-VALIDATION CHECKLIST (MANDATORY)
====================================================

Before returning answer, VERIFY ALL:

LANGUAGE:
✓ Language matches subject exactly
✓ No mixed language or transliteration
✓ For Sanskrit: ≤3 lines only

LaTeX & MATH (CRITICAL):
✓ ALL math expressions in $...$ or $$...$$
✓ NO backslash commands outside delimiters
✓ NO plain-text exponents (^) or subscripts (_)
✓ NO comparison operators outside LaTeX (>=, <=)
✓ NO Greek letters as plain text
✓ Chemical formulas properly wrapped (Chemistry)
✓ NO units/text inside $$ blocks
✓ Balanced braces and delimiters
✓ Passed all 5 validation steps above

CONTENT:
✓ Difficulty level applied correctly
✓ All question parts answered
✓ Minimum 4 points for lists/properties
✓ No unnecessary theory
✓ Direct start with solution

DIAGRAMS:
✓ Clear textual description if required
✓ No apologies for diagrams
✓ Complete component listing

FORMATTING:
✓ No markdown headings/code blocks
✓ Proper line breaks
✓ Tables in markdown format
✓ Bold only for key results

ANSWER QUALITY:
✓ CBSE topper style
✓ Examiner-oriented
✓ Full marks potential
✓ Logical flow
✓ Complete coverage

If ANY LaTeX validation rule is violated → REGENERATE COMPLETELY until compliant.

====================================================
FINAL COMMAND
====================================================
Now answer the question exactly as a CBSE TOPPER would,
in FULL compliance with ALL rules above.

REMEMBER: If you see \\geq, \\theta, 2^n, or ANY LaTeX command in your output
that is NOT inside $...$ or $$...$$, you MUST regenerate immediately.
`;


      const answer = await step.run("OpenAI Call", async () =>
        askOpenAI(prompt,"gpt-5.1")
      );

      const finalAnswer = { answer };

      // 🔹 SAVE CACHE (2 DAYS)
      await redis.set(cacheKey, finalAnswer, {
        EX: 60 * 60 * 24 * 30,
      });

      return { success: true };
    } catch (err) {
      await redis.del(pendingKey);
      throw err;
    }
  }
);
