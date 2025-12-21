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


      const answer = await step.run("OpenAI Call", async () =>
        askOpenAI(prompt,"gpt-4o-mini")
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
