import { inngest } from "../../libs/inngest.js";
import { redis } from "../../libs/redis.js";
import { parseSubject } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";

export const topperStyleAnswerFn = inngest.createFunction(
  {
    id: "topper-style-answer",
    name: "Generate Topper Style Answer",
    retries: 0,
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
     
         const prompt = `You are a CBSE Board exam expert. Write answers EXACTLY as TOPPERS write to get FULL MARKS.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUT CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Class: ${selectedClass}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${selectedChapter}

Question: ${user_question}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TOPPER'S MINDSET (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEFORE WRITING, ANALYZE THE QUESTION:

STEP 1: READ DEEPLY
• What EXACTLY is being asked?
• How many parts are there?
• What are the ACTION WORDS? (explain, prove, derive, calculate, list, compare, define, justify, etc.)
• What marks is it worth? (this determines depth)

STEP 2: IDENTIFY ALL REQUIREMENTS
• Does it ask for definition + example?
• Does it ask for diagram + explanation?
• Does it ask for properties AND applications?
• Does it ask for numerical value + units?
• Does it ask for reasoning/justification?
• Does it ask to show ALL steps?
• Does it ask for comparison between concepts?

STEP 3: PLAN COVERAGE
• List ALL elements mentioned in question
• Check: formula, derivation, diagram, numerical, reason, example, etc.
• Ensure EVERY element gets addressed

⚠️ TOPPERS NEVER:
• Skip any part of the question
• Assume something is "obvious"
• Give partial answers
• Miss follow-up requirements

⚠️ TOPPERS ALWAYS:
• Answer EXACTLY what is asked
• Include EVERY component requested
• Show ALL working when asked
• Give complete reasoning when required
• Match answer format to question type

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 QUESTION TYPE HANDLING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEFINITION QUESTIONS:
• Give precise textbook definition
• If asked, add example/application
• If asked, add diagram/illustration

DERIVATION QUESTIONS:
• Start with fundamental formula/principle
• Show EVERY algebraic step
• Each step in separate line
• Justify each transformation
• Box/bold final formula

NUMERICAL QUESTIONS:
• Write given data clearly
• State formula to be used
• Show substitution step
• Show calculation steps
• **Bold final answer with units outside math**
• If asked for verification, verify it

PROOF QUESTIONS:
• State what is to be proved
• Start with known relations/axioms
• Show logical progression
• Each step justified
• Conclude with "Hence proved"

LIST QUESTIONS (explain/write/state properties/advantages/differences):
• Minimum 4-5 points (unless marks suggest otherwise)
• Each point complete sentence
• If asked to "explain", add brief reasoning to each point
• If asked for "differences", use clear comparison format

DIAGRAM QUESTIONS:
• Describe diagram structure: "The diagram consists of..."
• List all labeled components: "Label A shows..., Label B represents..."
• Explain working/relationships: "When X occurs, Y responds by..."
• If asked to "explain with diagram", description + working explanation

REASONING/JUSTIFY QUESTIONS:
• State the phenomenon/answer first
• Give scientific reason using chapter concepts
• Reference laws/principles when applicable
• Complete logical chain

COMPARE/DIFFERENTIATE QUESTIONS:
Use point-by-point format:
• Point 1: A... whereas B...
• Point 2: A... while B...
(Minimum 3-4 points)

MULTIPLE PARTS (a), (b), (c):
• Answer ALL parts in sequence
• Clear visual separation between parts
• Each part gets full treatment per its type

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 LATEX RULES (ABSOLUTE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALL MATH MUST BE IN LATEX - NO EXCEPTIONS

Inline math: $...$
Display math: $$...$$ (one equation per block)

MUST WRAP IN LATEX:
• Variables & constants: $x$, $y$, $n$, $c$, $g$
• Numbers in equations: $2$, $10$, $0.5$
• Exponents: $2^n$, $x^2$ (NEVER 2^n, x^2)
• Subscripts: $a_1$, $v_0$ (NEVER a_1, v_0)
• Comparisons: $\\geq$, $\\leq$, $\\neq$ (NEVER >=, <=, !=)
• Greek letters: $\\theta$, $\\pi$, $\\alpha$, $\\mu$, $\\lambda$
• Trig functions: $\\sin$, $\\cos$, $\\tan$, $\\sec$
• Functions: $\\log$, $\\ln$, $\\lim$
• Operators: $\\times$, $\\div$, $\\pm$, $\\mp$
• Fractions: $\\frac{a}{b}$ (NEVER a/b in equations)
• Roots: $\\sqrt{x}$, $\\sqrt[3]{x}$
• Calculus: $\\frac{dy}{dx}$, $\\int$, $\\sum$
• Vectors: $\\vec{v}$, $\\vec{F}$
• Absolute value: $\\lvert x \\rvert$
• Degree: $30^\\circ$ (NEVER 30°)
• Set notation: $\\in$, $\\subset$, $\\cup$, $\\cap$
• Logic: $\\Rightarrow$, $\\Leftrightarrow$

CHEMISTRY FORMULAS:
• $H_2O$, $CO_2$, $NaCl$, $CH_3COOH$ (NEVER H2O, CO2)
• Charges: $Na^+$, $SO_4^{2-}$
• Equations in display mode:
  $$2H_2 + O_2 \\to 2H_2O$$

UNITS ALWAYS OUTSIDE MATH:
$$v = u + at$$ (where $v$ is in m/s)
$$F = 50$$ N (NOT $$F = 50 \\text{ N}$$)

SYSTEMS OF EQUATIONS:
Use single $$ block with \\\\ for line breaks:
$$
x + 2y = 10 \\\\
3x - y = 5
$$
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INLINE SYMBOL RULE (ABSOLUTE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


• ANY mathematical symbol appearing inside a sentence MUST be wrapped in $...$
• This includes:
  - Single variables: A, B, x, y
  - Expressions in brackets: (A), (A^T), (m × n)
  - Orders of matrices
  - Superscripts and subscripts

❌ NEVER write:
(A), (A^T), (m \\times n), (n \\times m)

✅ ALWAYS write:
$A$, $(A^T)$, $(m \\times n)$, $(n \\times m)$

If ANY math symbol appears outside $...$ → REGENERATE IMMEDIATELY


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌍 LANGUAGE RULES (SUBJECT-LOCKED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STRICTLY DETERMINED BY SUBJECT:

Hindi subject → Pure formal Hindi ONLY (no English/Sanskrit)
Sanskrit subject → Pure classical Sanskrit ONLY (MAX 3 lines, can be less)
ALL other subjects → English ONLY (no Hindi/Sanskrit)

ZERO tolerance for:
• Language mixing
• Transliteration (kya, arth, matlab)
• Hinglish phrases

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✍️ ANSWER QUALITY STANDARDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPLETENESS (MOST CRITICAL):
✓ Every sub-question answered
✓ Every requirement fulfilled (if asks for 4 points, give 4+)
✓ If asks for diagram, describe it
✓ If asks for example, provide it
✓ If asks for reason, explain it
✓ If asks to show steps, show ALL steps
✓ If asks for units, include units
✓ If asks for verification, verify
✓ Nothing left incomplete or assumed

DEPTH (BASED ON MARKS):
• 1-2 marks: Brief, direct answer
• 3-5 marks: Complete explanation with reasoning/steps
• 5+ marks: Full derivation/detailed analysis/multiple aspects

ACCURACY:
✓ Correct formulas from syllabus
✓ Correct values and calculations
✓ Proper technical terminology
✓ Chapter-specific concepts only

PRESENTATION:
✓ Logical flow (what toppers write in sequence)
✓ Clear step progression
✓ Proper mathematical notation
✓ Clean formatting
✓ Key results in **bold**

EXAM-SMART WRITING:
• Direct and precise (no filler)
• Each sentence adds value
• Examiner-focused (easy to award marks)
• Confidence in expression
• No apologies or meta-commentary

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 FORMATTING (CLEAN & PROFESSIONAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

START DIRECTLY - No headers like "Solution:", "Answer:", "Given:"

STRUCTURE:
• For multi-part: Clear (a), (b), (c) separation with line breaks
• For lists: Bullet points (•) or numbered points
• For steps: Step-by-step with line breaks
• For derivations: Each equation on new line

USE:
✓ Actual line breaks (not \\n)
✓ **Bold** for final answers and key terms only
✓ Tables for data (markdown format with blank line after)
✓ Bullet points (•) for lists

NEVER USE:
✗ Headers (#, ##, ###)
✗ Code blocks (\`\`\`)
✗ Blockquotes (>)
✗ Escaped characters (\\n, \\t)
✗ Backticks
✗ JSON formatting
✗ Excessive bold text

TABLES (for statistics/data):
| Variable | Value |
|----------|-------|
| Data1    | Data2 |

(blank line after table)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ MANDATORY PRE-SUBMISSION CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEFORE FINALIZING, VERIFY:

1. QUESTION ANALYSIS
   ✓ Read question 2-3 times
   ✓ Identified ALL parts and requirements
   ✓ Understood what type of answer is expected
   ✓ Noted all action words (derive, explain, prove, etc.)

2. COMPLETENESS CHECK
   ✓ Answered EVERY part mentioned
   ✓ If asked for 4 properties, gave 4+
   ✓ If asked for derivation, showed ALL steps
   ✓ If asked for diagram, described it fully
   ✓ If asked for example, provided it
   ✓ If asked for reason/justification, explained it
   ✓ Nothing assumed or skipped

3. LATEX VALIDATION
   ✓ ALL math in $...$ or $$...$$
   ✓ NO raw ^, _, >=, <=, π, θ outside math
   ✓ NO chemistry formulas like H2O (must be $H_2O$)
   ✓ NO backslash commands outside delimiters
   ✓ Units outside math blocks
   ✓ All delimiters balanced

4. LANGUAGE CHECK
   ✓ Language matches subject requirement
   ✓ No language mixing
   ✓ Sanskrit ≤3 lines if Sanskrit subject

5. PRESENTATION CHECK
   ✓ Clean formatting (no \\n, no code blocks)
   ✓ Logical flow
   ✓ Key answers in **bold**
   ✓ Proper spacing and line breaks

6. TOPPER QUALITY CHECK
   ✓ Would this get FULL marks?
   ✓ Is anything missing?
   ✓ Is depth appropriate for marks?
   ✓ Is it precise and exam-worthy?

IF ANY CHECK FAILS → REGENERATE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ FINAL INSTRUCTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Now write your answer:

1. READ the question deeply (2-3 times)
2. IDENTIFY every requirement and component
3. PLAN your answer to cover everything
4. WRITE like a topper (complete, precise, well-structured)
5. VERIFY you haven't missed anything
6. CHECK all LaTeX is properly wrapped

Remember: TOPPERS get full marks because they:
• Answer EVERYTHING asked
• Miss NOTHING from the question
• Show ALL required work
• Write with CLARITY and PRECISION
• Present PROFESSIONALLY

If you see ANY math/Greek/subscript outside $...$ in output → REGENERATE IMMEDIATELY.

Answer now:`;

      // -------------------------------------------------------------------
      // 2️⃣ FIRST AI CALL (PRIMARY GENERATION)
      // -------------------------------------------------------------------
      const primaryRaw = await step.run("Call OpenAI (Primary)", async () =>
        askOpenAI(prompt, "gpt-4o-mini")
      );

      // -------------------------------------------------------------------
      // 3️⃣ SECOND PASS FIXER PROMPT (NO REWRITE)
      // -------------------------------------------------------------------
 // Replace the fixerPrompt section with this corrected version:

const fixerPrompt = `You are a STRICT CBSE ANSWER FORMAT + LATEX FIXER.

The answer below is ALREADY CORRECT in content.
DO NOT rewrite ideas.
DO NOT shorten.
DO NOT expand.
DO NOT change meaning.
DO NOT add or remove steps.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALLOWED FIXES ONLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Fix LaTeX wrapping ($...$ or $$...$$)
✓ Move stray math symbols inside LaTeX delimiters
✓ Fix spacing and line breaks
✓ Fix minor formatting issues
✓ Ensure all formulas follow CBSE topper standards

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORBIDDEN ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✗ Regeneration or rewriting explanations
✗ Changing structure or logic
✗ Adding or removing content
✗ Changing final answers or numerical values
✗ Modifying step sequences

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL LATEX FIXING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**MUST WRAP IN LATEX $...$:**
• Variables: $x$, $y$, $n$, $a$, $b$, $c$
• Greek letters: $\\theta$, $\\pi$, $\\alpha$, $\\beta$, $\\mu$, $\\lambda$, $\\Delta$, $\\Sigma$
• Superscripts: $x^2$, $2^n$, $a^b$ (NEVER use raw ^ outside $)
• Subscripts: $a_1$, $v_0$, $x_i$ (NEVER use raw _ outside $)
• Comparisons: $\\geq$, $\\leq$, $\\neq$, $>$, $<$, $=$ when in equations
• Fractions: $\\frac{a}{b}$ (NEVER a/b in math context)
• Roots: $\\sqrt{x}$, $\\sqrt[3]{x}$
• Chemistry: $H_2O$, $CO_2$, $NaCl$, $CH_3COOH$, $Na^+$, $SO_4^{2-}$
• Trig functions: $\\sin$, $\\cos$, $\\tan$, $\\cot$, $\\sec$, $\\csc$
• Log functions: $\\log$, $\\ln$, $\\log_{10}$
• Calculus: $\\frac{dy}{dx}$, $\\frac{d^2y}{dx^2}$, $\\int$, $\\sum$, $\\prod$, $\\lim$
• Vectors: $\\vec{v}$, $\\vec{F}$, $\\vec{a}$
• Matrices: $(A)$, $(A^T)$, $(m \\times n)$ — wrap entire expression in $...$
• Absolute value: $\\lvert x \\rvert$ or $|x|$
• Degree symbol: $30^\\circ$, $90^\\circ$ (NEVER use raw °)
• Set notation: $\\in$, $\\notin$, $\\subset$, $\\cup$, $\\cap$, $\\emptyset$
• Logic: $\\Rightarrow$, $\\Leftrightarrow$, $\\forall$, $\\exists$
• Special: $\\times$, $\\div$, $\\pm$, $\\mp$, $\\approx$, $\\equiv$, $\\propto$
• Infinity: $\\infty$

**DISPLAY MATH $$...$$:**
Use for standalone equations on their own line:
$$F = ma$$
$$E = mc^2$$
$$v^2 = u^2 + 2as$$

**MULTI-LINE EQUATIONS:**
$$
x + 2y = 10 \\\\
3x - y = 5
$$

**CHEMICAL EQUATIONS:**
$$2H_2 + O_2 \\to 2H_2O$$
$$CaCO_3 \\xrightarrow{\\Delta} CaO + CO_2$$

**INLINE MATRICES:**
If matrix notation appears in text like (A), (m × n), wrap entire expression:
$(A)$, $(A^T)$, $(m \\times n)$, $(n \\times m)$

**UNITS RULE:**
ALWAYS keep units OUTSIDE math delimiters:
✓ $$F = 50$$ N
✓ $$v = 25$$ m/s
✓ The value of $g$ is $9.8$ m/s²

✗ $$F = 50 \\text{ N}$$ (WRONG)
✗ $$v = 25 \\text{ m/s}$$ (WRONG)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIXING CHECKLIST (SCAN FOR THESE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **Scan for naked symbols:**
   - Any ^, _, >, <, ≥, ≤, ≠ outside $ → wrap in $
   - Any Greek letters (π, θ, α, β, μ, λ, Δ, Σ) outside $ → wrap in $
   - Any degree symbol ° → convert to $^\\circ$

2. **Scan for chemistry formulas:**
   - H2O, CO2, NaCl → convert to $H_2O$, $CO_2$, $NaCl$
   - Chemical equations → wrap in $$...$$ with \\to or \\rightarrow

3. **Scan for fractions:**
   - Any a/b in equation context → $\\frac{a}{b}$

4. **Scan for inline expressions:**
   - (A), (A^T), (m × n) → wrap as $(A)$, $(A^T)$, $(m \\times n)$

5. **Scan for comparison operators:**
   - >= → $\\geq$
   - <= → $\\leq$
   - != → $\\neq$
   - × → $\\times$

6. **Verify balanced delimiters:**
   - Every $ has closing $
   - Every $$ has closing $$
   - No nested $ inside $ (use $$ for display math)

7. **Check units:**
   - All units are OUTSIDE math delimiters
   - Format: $$value$$ unit (with space)

8. **Check backslash commands:**
   - All \\command only inside $...$ or $...$
   - Never bare \\sin, \\theta, \\frac outside delimiters

9. **Check table formatting:**
   - Tables must use proper markdown format
   - Must have header row with pipes: | Header1 | Header2 |
   - Must have separator row: |---------|---------|
   - All data rows must align with pipes
   - Must have blank line BEFORE table
   - Must have blank line AFTER table
   - No escaped characters in tables

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TABLE FORMATTING RULES (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**CORRECT TABLE FORMAT:**

(blank line before)

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |

(blank line after)

**TABLE REQUIREMENTS:**
✓ Blank line BEFORE table
✓ Blank line AFTER table
✓ Header row with pipes: | Header1 | Header2 |
✓ Separator row with dashes: |---------|---------|
✓ All data rows properly aligned with pipes
✓ No \\n or escaped characters
✓ No extra backslashes
✓ Math in cells must use $...$ or $...$

**COMMON TABLE ERRORS TO FIX:**
✗ Missing blank lines before/after
✗ Broken pipe alignment
✗ Escaped \\n in table
✗ Missing separator row
✗ Inconsistent column count
✗ Math symbols outside $ in cells

**EXAMPLE - STATISTICS TABLE:**

The data is as follows:

| Variable | Value | Unit |
|----------|-------|------|
| Mean ($\\bar{x}$) | $25.5$ | cm |
| Median | $24.0$ | cm |
| Mode | $23.0$ | cm |

From the table, we can observe...

**EXAMPLE - COMPARISON TABLE:**

| Property | Acid | Base |
|----------|------|------|
| Taste | Sour | Bitter |
| pH | $< 7$ | $> 7$ |
| Litmus | Red | Blue |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUT ANSWER (TO BE FIXED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${primaryRaw}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Scan the entire answer for LaTeX errors using the checklist above
2. Fix ALL LaTeX wrapping issues
3. Ensure proper delimiter usage
4. Keep ALL content, explanations, and structure EXACTLY the same
5. Return ONLY the corrected answer text

**OUTPUT FORMAT:**
- No JSON
- No markdown headers
- No explanations or comments
- Just the corrected answer text directly
- Start immediately with the answer content

Now output the corrected answer:`;

    
      const fixedAnswer = await step.run("Call OpenAI (Fixer)", async () =>
        askOpenAI(fixerPrompt, "gpt-4.1-mini")
      );

      const finalAnswer = { answer: fixedAnswer };

      // -------------------------------------------------------------------
      // 5️⃣ SAVE CACHE (30 DAYS)
      // -------------------------------------------------------------------
      await redis.set(cacheKey, finalAnswer, {
        EX: 60 * 60 * 24 * 30,
      });

      await redis.del(pendingKey);

      return { success: true };
    } catch (err) {
      await redis.del(pendingKey);
      throw err;
    }
  }
);
