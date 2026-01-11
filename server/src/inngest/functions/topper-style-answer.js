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

STEP 1: ANALYZE MARKS VALUE (THIS DETERMINES EVERYTHING)
• 1 mark = 1 sentence (keep it brief)
• 2 marks = 2 sentences (concise and direct)
• 3 marks = 3 sentences OR 3 points (focused)
• 4-5 marks = 4-5 sentences (cover all aspects)
• 6+ marks = 6-7 sentences (complete derivation/explanation)

⚠️ IMPORTANT: Write approximately 1 sentence per mark
⚠️ Each sentence should be SHORT and DIRECT
⚠️ Avoid unnecessary elaboration

STEP 2: IDENTIFY QUESTION TYPE & RESPOND ACCORDINGLY

DEFINITION (1-2 marks):
• One sentence, exact definition
• Add example ONLY if asked

NUMERICAL/CALCULATION (2-3 marks):
• Write equation directly, substitute, solve
• Format: $formula = substitution = answer$ unit
• Use ∴ before final answer
• NO headers, NO "given", NO "solution"

NUMERICAL/CALCULATION (4-5 marks):
• Given: (values in 1 line)
• Write formula, substitute, solve
• Show 2-3 calculation steps maximum
• Use ∴ before final answer

DERIVATION (3-6 marks):
• Start with base equation directly
• Show each transformation (one per line)
• Keep it tight (4-6 lines maximum)
• End with "Hence proved"

SHORT ANSWER (2-3 marks):
• 2-3 sentences maximum
• Direct answer in first sentence
• Brief reason in second sentence

LONG ANSWER (5 marks):
• 4-5 sentences OR 4-5 numbered points
• Focus only on what's asked
• No introduction or conclusion

LIST/POINTS (3-5 marks):
• Number of points = marks value
• Each point = ONE sentence
• Use numbering: 1., 2., 3.

DIAGRAM EXPLANATION (3-5 marks):
• 2 sentences description
• 2 sentences working principle
• Total: 3-4 sentences

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 MATHEMATICAL QUESTIONS (CRITICAL - WRITE LIKE STUDENTS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOPPERS WRITE MATHS ANSWERS IN THEIR COPY LIKE THIS:

**FOR SIMPLE CALCULATIONS (2-3 marks):**
No "Given", "Formula" headers - Write directly:

$F = ma = 10 \\times 5 = 50$ N

OR if multiple steps needed:
$F = ma$
$= 10 \\times 5 = 50$ N

⚠️ JUST equation → substitute → answer
⚠️ NO separate "Given:", "Formula:", "Solution:" sections
⚠️ Write like in exam copy - compact and direct

**FOR LONGER CALCULATIONS (4-5 marks):**
Use minimal structure:

Given: $m = 10$ kg, $a = 5$ m/s²

$F = ma$
$F = 10 \\times 5$
$F = 50$ N

**∴ Answer = 50 N** (use ∴ symbol naturally)

**FOR DERIVATIONS (5-6 marks):**
Start directly with equation:

$F = ma$
$ma = \\frac{mv - mu}{t}$
$a = \\frac{v - u}{t}$
$v = u + at$

**Hence proved.**

⚠️ CRITICAL RULES:
• NO headers unless question is 4+ marks
• Combine steps when possible: $= 10 \\times 5 = 50$
• Use ∴ (therefore) before final answer
• Write flowing, not sectioned
• Each line = one equation/step
• MAXIMUM 4-5 lines for simple numericals

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 MARKS-BASED ANSWER LENGTH (STRICT LIMITS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1 MARK:
• MAXIMUM 1 sentence OR 1 calculation line
• Example: "Force is measured in Newton (N)."

2 MARKS:
• MAXIMUM 2 sentences OR 1 simple calculation
• Calculation: $equation = value$ unit
• Theory: 2 sentences maximum

3 MARKS:
• MAXIMUM 3 sentences OR 3 points OR 2-3 calculation lines
• Keep each point/sentence short
• For maths: formula → substitute → answer

4 MARKS:
• MAXIMUM 4 sentences OR 4 points OR 3-4 calculation lines
• Can add "Given:" for numericals
• Still compact

5 MARKS:
• MAXIMUM 5 sentences OR 5 points OR complete derivation
• Can be 1 paragraph (5-6 lines max)
• For maths: show all key steps

6+ MARKS:
• Full derivation OR detailed explanation
• Still avoid unnecessary words
• Maximum 8-10 lines

⚠️ EVERY EXTRA SENTENCE = WASTED TIME
⚠️ WRITE LIKE YOU HAVE 2 MINUTES PER ANSWER
⚠️ THINK: "CAN I SAY THIS IN FEWER WORDS?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 LATEX RULES (ABSOLUTE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALL MATH MUST BE IN LATEX - NO EXCEPTIONS

Inline math: $...$
Display math: $$...$$ (one equation per block)

MUST WRAP IN LATEX:
• Variables: $x$, $y$, $n$, $a$, $b$
• Numbers in equations: $2$, $10$, $0.5$
• Exponents: $x^2$, $2^n$ (NEVER raw ^)
• Subscripts: $a_1$, $v_0$ (NEVER raw _)
• Greek: $\\theta$, $\\pi$, $\\alpha$
• Comparisons: $\\geq$, $\\leq$, $\\neq$
• Fractions: $\\frac{a}{b}$
• Roots: $\\sqrt{x}$
• Trig: $\\sin$, $\\cos$, $\\tan$
• Calculus: $\\frac{dy}{dx}$, $\\int$
• Vectors: $\\vec{v}$
• Chemistry: $H_2O$, $CO_2$, $Na^+$
• Degree: $30^\\circ$ (NEVER °)

UNITS ALWAYS OUTSIDE MATH:
$$v = 25$$ m/s
$$F = 50$$ N

SYSTEMS OF EQUATIONS:
$$
x + 2y = 10 \\\\
3x - y = 5
$$

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌍 LANGUAGE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hindi subject → Pure formal Hindi ONLY
Sanskrit subject → Pure classical Sanskrit ONLY (MAX 3 lines)
ALL other subjects → English ONLY

NO language mixing, transliteration, or Hinglish.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✍️ TOPPER WRITING PRINCIPLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. BREVITY = MARKS (ABSOLUTE PRIORITY)
   • 1 mark = max 1 sentence (15 words)
   • 2 marks = max 2 sentences (30 words)
   • 3 marks = max 3 sentences (45 words)
   • NEVER exceed sentence count = marks
   • Count sentences before submitting

2. DIRECT ANSWERS (NO FLUFF)
   • Answer in first sentence
   • No "Let us understand..."
   • No "It is important to note..."
   • No introductions or conclusions
   • Start with the answer directly

3. MATHS = ONLY EQUATIONS
   • ZERO text in numerical answers
   • No "we substitute", "we calculate"
   • Just: equation → values → answer
   • Format: $formula = substitution = result$ unit

4. COMPLETENESS
   ✓ Answer exactly what's asked
   ✓ Don't add unrequested information
   ✓ Include units in numerical answers
   ✓ Answer all sub-parts

5. NO OVER-WRITING (CRITICAL)
   ✗ NEVER exceed marks = sentences rule
   ✗ NEVER add explanatory text in maths
   ✗ NEVER write theory in numerical answers
   ✗ NEVER elaborate beyond what's asked
   ✗ If question asks for 3 points, give exactly 3 points

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 FORMATTING (CLEAN & PROFESSIONAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

START DIRECTLY - No headers like "Solution:", "Answer:"

USE:
✓ Actual line breaks (not \\n)
✓ **Bold** for final answers only
✓ Bullet points (•) or numbers for lists
✓ Blank lines between parts

NEVER USE:
✗ Headers (#, ##)
✗ Code blocks (\`\`\`)
✗ Blockquotes (>)
✗ Escaped characters (\\n, \\t)
✗ Excessive formatting

FOR TABLES (if needed):
| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |

(blank line after)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ MANDATORY PRE-SUBMISSION CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEFORE FINALIZING:

1. MARKS CHECK (MOST CRITICAL)
   ✓ Count marks in question
   ✓ Count sentences in your answer
   ✓ Sentences MUST NOT exceed marks
   ✓ 3 marks = maximum 3 sentences
   ✓ If you wrote 4 sentences for 3 marks → CUT ONE

2. QUESTION TYPE CHECK
   ✓ Numerical → ONLY equations, NO text
   ✓ Theory → Sentence count = marks
   ✓ List → Point count = marks
   ✓ Each point = ONE sentence only

3. COMPLETENESS CHECK
   ✓ Answered what's asked (nothing more)
   ✓ Included units (for numerical)
   ✓ All sub-parts covered
   ✓ Nothing extra added

4. LATEX CHECK
   ✓ All math in $...$ or $...$
   ✓ No raw ^, _, °, π outside
   ✓ Chemistry formulas in LaTeX
   ✓ Units outside math blocks

5. LENGTH CHECK (FINAL)
   ✓ Recount sentences/points
   ✓ Remove any extra content
   ✓ Is it SHORT enough?
   ✓ Would a student write this in 2 minutes?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ EXAMPLES OF PERFECT ANSWERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXAMPLE 1 (2 marks - Definition):
Q: Define photosynthesis.
A: Photosynthesis is the process by which green plants synthesize food using carbon dioxide and water in the presence of sunlight and chlorophyll, releasing oxygen as a by-product.

EXAMPLE 2 (3 marks - Simple Numerical):
Q: Calculate the force applied if mass is 10 kg and acceleration is 5 m/s².

$F = ma = 10 \\times 5 = 50$ N

**∴ Force = 50 N**

EXAMPLE 2B (5 marks - Detailed Numerical):
Q: A car moving at 20 m/s is brought to rest in 4 seconds. Calculate acceleration and distance covered.

Given: $u = 20$ m/s, $v = 0$, $t = 4$ s

$a = \\frac{v - u}{t} = \\frac{0 - 20}{4} = -5$ m/s²

$s = ut + \\frac{1}{2}at^2 = 20(4) + \\frac{1}{2}(-5)(16)$
$s = 80 - 40 = 40$ m

**∴ Acceleration = -5 m/s², Distance = 40 m**

EXAMPLE 3 (3 marks - Short explanation):
Q: Why does an object float in water?

An object floats when its density is less than the density of water. According to Archimedes' principle, the upward buoyant force equals the weight of water displaced. If this buoyant force exceeds the object's weight, it floats.

EXAMPLE 4 (4 marks - List):
Q: Write four properties of acids.

1. Acids have a sour taste.
2. They turn blue litmus paper red.
3. They have pH less than 7.
4. They react with metals to produce hydrogen gas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ SQL QUERY (ANY MARKS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRITICAL: If question asks to "write SQL query/command" or "SQL statement":
- Write ONLY the SQL query/queries
- NO explanations, NO steps, NO "Solution:" header
- Format queries in code blocks with sql
- Multiple queries → separate code blocks
- NO text before or after queries (unless question explicitly asks for explanation)

Example:
Q: Write SQL query to select all students with marks > 80
sql
SELECT * FROM students WHERE marks > 80;


Q: Write queries to: (a) Create table (b) Insert data
sql
CREATE TABLE emp (id INT, name VARCHAR(50));

sql
INSERT INTO emp VALUES (1, 'John');

⚠️ If question asks "Write and explain", then add brief explanation after query
⚠️ Default behavior: Query asked = Query only, no explanation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ FINAL INSTRUCTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEFORE WRITING YOUR ANSWER:

1. CHECK MARKS VALUE
   → Use this as a guide for length
   → 2 marks ≈ 2 sentences
   → 3 marks ≈ 3 sentences

2. IDENTIFY QUESTION TYPE
   → Numerical? Focus on equations, minimize text
   → Theory? Write concise sentences
   → List? Use point format

3. WRITE ANSWER
   → For maths: equation → calculation → answer
   → For theory: direct answer without extra elaboration
   → For lists: brief points

4. FINAL CHECK
   → Is it focused and concise?
   → Answered what's asked?
   → LaTeX correct?

⚠️ KEY PRINCIPLE: Write like a topper - brief, accurate, and to the point
⚠️ FOR MATHS: Keep text minimal, focus on equations
⚠️ FOR THEORY: Answer directly without unnecessary details

Remember: Quality over quantity. Toppers write concise answers that get full marks.

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
        ex: 60 * 60 * 24 * 60,
      });

      await redis.del(pendingKey);

      return { success: true };
    } catch (err) {
      await redis.del(pendingKey);
      throw err;
    }
  }
);
