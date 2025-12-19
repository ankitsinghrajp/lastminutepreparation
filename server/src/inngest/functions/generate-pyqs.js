import { inngest } from "../../libs/inngest.js";
import { PyqModel } from "../../models/PreviousYearQuestions/pyq.model.js";
import { detectCategory, parseSubject } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";

export const generatePYQsFn = inngest.createFunction(
  {
    name: "Generate PYQs",
    id: "generate-pyqs",
    retries: 0,
  },
  { event: "lmp/generate.pyqs" },
  async ({ event, step }) => {
    const { className, subject, chapter, year } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(subject);

    const cacheKey = `lmp:pyq:${className}:${mainSubject}:${chapter}:${year}`;
    const pendingKey = `lmp:pyq:pending:${className}:${mainSubject}:${chapter}:${year}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await step.run("DB Check", async () => {
        return await PyqModel.findOne({
          className,
          subject: mainSubject,
          chapter,
          year,
        });
      });

      if (dbCache) {
        const safeDB = JSON.parse(JSON.stringify(dbCache.content));

        await step.run("Save Redis", async () => {
          await redis.set(cacheKey, JSON.stringify(safeDB), {
            EX: 60 * 60 * 24 * 2,
          });
        });

        await redis.del(pendingKey);
        return { source: "database" };
      }

      // -------------------------------------------------------------------
      // 2️⃣ PROMPT (UNCHANGED)
      // -------------------------------------------------------------------
 const prompt = `
You are a CBSE PYQ Expert. Your ONLY task is to generate synthetic but EXTREMELY ACCURATE
CBSE-style Previous Year Questions for ONE specific year provided by the user.

====================================================
USER INPUT
====================================================
- Class: ${className}
- Subject: ${mainSubject}
- Chapter: ${chapter}
- Bookname: ${bookName}
- Year: ${year}
- Stream: ${category}

====================================================
CORE PYQ INTELLIGENCE RULE (ABSOLUTE)
====================================================
You MUST mentally simulate CBSE board paper setting for the given year.

- Deeply analyze:
  • CBSE paper trends
  • NCERT emphasis
  • Weightage shifts
  • Repeated concepts across previous years
  • Chapter importance in that specific year

- Treat this as:
  "If CBSE sets the paper for ${year}, which questions from THIS chapter are MOST LIKELY to appear?"

❌ Do NOT generate:
- Timeless generic questions
- Random chapter questions
- Questions that could appear in any year

✅ Generate ONLY:
- Year-specific
- Pattern-accurate
- Examiner-predicted PYQs

====================================================
STRICT GENERATION RULES (ORIGINAL — INTACT)
====================================================
1. Generate **10 to 15 high-value PYQs** for the given year ONLY.
2. For EACH question include ALL fields:
   - "id"
   - "year" → MUST be exactly ${year}
   - "marks" → 1, 2, 3, or 5 ONLY
   - "question" → Must be meaningful and chapter-focused
3. NO repeated questions.
4. ABSOLUTELY NO missing fields.
5. NO explanation.
6. Return STRICT JSON ONLY.

====================================================
LANGUAGE POLICY (ABSOLUTE — SUBJECT-LOCKED)
====================================================

- Language MUST match the subject EXACTLY.
- Cross-language output is STRICTLY FORBIDDEN.
- Sanskrit and Hindi MUST NEVER be mixed.

SUBJECT → LANGUAGE MAPPING (MANDATORY):

1) If Subject is "Hindi":
   - ALL questions MUST be written ONLY in PURE, STANDARD HINDI.
   - Use formal CBSE/NCERT academic Hindi only.
   - ❌ DO NOT include Sanskrit words or Sanskrit sentence structure.
   - ❌ DO NOT include any English words.
   - ❌ DO NOT use Hinglish or transliteration.

2) If Subject is "Sanskrit":
   - ALL questions MUST be written ONLY in PURE CLASSICAL SANSKRIT.
   - Use correct Sanskrit grammar, vocabulary, विभक्ति, and verb forms.
   - ❌ DO NOT use Hindi words (जैसे: है, नहीं, किया, प्रश्न).
   - ❌ DO NOT use Hindi sentence structure.
   - ❌ DO NOT include English words or transliteration.
   - ❌ DO NOT use modern Hindi/Sanskrit mix.
   - Sanskrit MUST look like a grammar textbook, NOT Hindi.

3) For ALL OTHER subjects (Mathematics, Science, Physics, Chemistry, Biology, SST, etc.):
   - ALL questions MUST be written ONLY in STANDARD ACADEMIC ENGLISH.
   - ❌ DO NOT include Hindi, Sanskrit, or any regional language.
   - ❌ DO NOT use Hinglish or translated phrases.

FORBIDDEN (ZERO TOLERANCE):
- Mixing languages in any form
- Mixing Hindi and Sanskrit in any form
- Transliteration (e.g., "kya", "arth", "vidhya", "kathan", etc.)
- Bilingual phrasing or explanations
- Subject-language mismatch (e.g., English questions for Hindi subject)

AUTO-REGENERATION RULE (MANDATORY):
If ANY word, phrase, grammar pattern, or sentence structure violates the 
subject-language rule → IMMEDIATELY discard and regenerate the entire output.

====================================================
CHAPTER–TOPIC ISOLATION
====================================================
- Questions MUST belong strictly to the given chapter and its syllabus.
- Do NOT introduce topics from other chapters or classes.
- Context allowed ONLY if NCERT or PYQs use that context.
- Avoid unnecessary narrative/context unless NCERT or PYQ uses that context.

====================================================
QUESTION FORMAT
====================================================
- No one-line or vague questions.
- Multi-part questions (a), (b), (c) are allowed; each sub-part MUST start on a new line.
- Each sub-part (a),(b),(c) MUST begin on its own line and be clearly numbered.
- If numerical data is required, provide complete data within the question.
- Questions must be exam-ready, complete, and in the same style and rigor as NCERT back exercises and official CBSE PYQs.

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
- Inline math ONLY → $...$
- Display math ONLY → $$...$$
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
  • \\alpha
  • \\mu
  • \\vec
  • \\hat
  • \\sin
  • \\cos
  • \\frac
  • \\sqrt
- ALL such commands MUST appear ONLY inside $...$ or $$...$$.
- If any backslash-command appears outside math delimiters, regenerate the output.

PLAIN-TEXT MATH TOKEN BAN:
- The following are STRICTLY FORBIDDEN outside LaTeX:
  sin, cos, tan, sec, cosec, cot, sin^-1, cos^-1, tan^-1, sec^-1, cosec^-1, cot^-1,
  frac, sqrt, leq, geq, <=, >=, pi, mu, theta, alpha, beta, gamma, degree, ^ (as plain text),
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
   when they appear in questions or explanations.

2) NEVER write logical symbols as plain text.
   ❌ Wrong: not p, negp, implies, contradiction
   ✅ Correct: $\\neg p$, $p \\Rightarrow q$, $\\bot$

3) If a topic involves logic or proofs:
   - Use symbolic expressions ONLY inside $...$ in questions.

4) Examples (CORRECT):

   "Prove by contradiction that $\\neg p$ leads to $\\bot$."
   "Show that the implication $p \\Rightarrow q$ is false when $p$ is true and $q$ is false."

5) Examples (WRONG):

   "Assume negp and derive contradiction"
   "p implies q"
   "not p leads to bottom"

If logical symbols are required and not written in LaTeX → REGENERATE.

====================================================
STATISTICS / TABLES (CRITICAL — ENHANCED VALIDATION)
====================================================

MANDATORY RULES FOR ALL STATISTICS QUESTIONS:

1) TABLE STRUCTURE REQUIREMENTS:
   - ALWAYS use proper markdown tables with complete structure
   - EVERY cell must have a value (either a number, variable in LaTeX, or descriptive text)
   - NO incomplete cells, NO empty cells, NO missing values
   - Tables MUST have consistent column and row counts

2) FREQUENCY TABLE REQUIREMENTS (CRITICAL):
   
   If generating questions with frequency tables where one frequency is unknown:
   
   ✅ CORRECT APPROACH:
   - Create a COMPLETE table with ALL values
   - Use a descriptive variable name for the unknown frequency (like $f_1$, $f_2$, or describe it in words)
   - Make it crystal clear WHICH frequency is unknown
   - Provide enough information to solve the problem
   
   Example (CORRECT):
   "The mean of the following data is 20. Find the missing frequency $f$.\\n\\n| $x$ | 10 | 15 | 20 | 25 | 30 |\\n| $f$ | 3 | 5 | $f$ | 4 | 3 |"
   
   OR better yet:
   "The mean of the following distribution is 20. Find the value of $p$.\\n\\n| Class | 0-10 | 10-20 | 20-30 | 30-40 | 40-50 |\\n| Frequency | 5 | 8 | $p$ | 6 | 4 |"
   
   ❌ FORBIDDEN (causes rendering issues):
   - Using just "$f$" without clarifying which frequency is unknown
   - Creating tables where the header row and data row have different structures
   - Mixing variable names ($x$) in one row and frequency symbol ($f$) in another without proper alignment
   - Incomplete table structures

3) VARIABLE NAMING IN TABLES:
   - If $x$ represents the variable → write it as column header
   - If $f$ represents frequency → write it as row header
   - Use specific names for unknowns: $f_1$, $p$, $k$, etc. (NOT just bare $f$)

4) TABLE FORMATTING RULES:
   - First row = headers (bold using **header**)
   - Subsequent rows = data
   - All LaTeX variables wrapped in $...$
   - Leave exactly ONE blank line after the table

5) UNGROUPED DATA HANDLING:
   - If data is ungrouped → FIRST convert to frequency distribution table
   - Make the table complete and unambiguous

6) GROUPED DATA HANDLING:
   - Use proper class intervals: 0-10, 10-20, etc.
   - Clearly label "Class" and "Frequency" columns
   - Ensure all class boundaries are specified

7) STATISTICS QUESTION VALIDATION CHECKLIST:
   ✓ Table has proper markdown structure (| | format)
   ✓ All cells contain values (no empty cells)
   ✓ Unknown values are clearly marked with descriptive variables
   ✓ Variable vs frequency distinction is crystal clear
   ✓ Question is solvable with given information
   ✓ Table structure matches the question context

EXAMPLE PATTERNS (CORRECT):

Pattern 1 - Missing frequency in discrete data:
"Find the value of $k$ if the mean of the following data is 15:\\n\\n| $x$ | 5 | 10 | 15 | 20 | 25 |\\n| Frequency | 3 | $k$ | 6 | 4 | 2 |"

Pattern 2 - Missing frequency in grouped data:
"The mean of the following distribution is 50. Find the missing frequency $f_3$:\\n\\n| Class | 0-20 | 20-40 | 40-60 | 60-80 | 80-100 |\\n| Frequency | 17 | 28 | $f_3$ | 32 | 19 |"

Pattern 3 - Median with complete data:
"Find the median of the following distribution:\\n\\n| Marks | 0-10 | 10-20 | 20-30 | 30-40 | 40-50 |\\n| Number of Students | 5 | 12 | 20 | 9 | 4 |"

FORBIDDEN PATTERNS:

❌ "The mean is 20. Find $f$:\\n\\n| $x$ | 10 | 15 | 20 | 25 | 30 |\\n| $f$ | 3 | 5 | $f$ | 4 | 3 |"
(Reason: Using $f$ as both row label AND as unknown value is confusing)

❌ Incomplete table cells or structure

====================================================
NEWLINES & ESCAPED CHARACTERS
====================================================
- In JSON strings, use \\n for newlines (this is standard JSON escaping)
- Do NOT use escaped math delimiters like \\( or \\) — use $ or $$ only.
- NEVER escape math delimiters

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
FINAL OUTPUT FORMAT (STRICT — UNCHANGED)
====================================================
Return ONLY this exact JSON structure:

{
  "class": "${className}",
  "subject": "${mainSubject}",
  "chapter": "${chapter}",
  "year": ${year},
  "pyqs": [
    {
      "id": 1,
      "year": ${year},
      "marks": 3,
      "question": "Explain the role of …"
    }
  ]
}

IMPORTANT NOTES:
- The "pyqs" array must contain 10 to 15 question objects
- Each question object MUST have all 4 fields: id, year, marks, question
- The "year" field in each question MUST be exactly ${year}
- No extra fields allowed
- No missing fields allowed

====================================================
FINAL SELF-VALIDATION (MANDATORY)
====================================================
Before returning JSON:

1. ✓ Check TOTAL questions = 10–15
2. ✓ Check each question has ALL 4 required fields: id, year, marks, question
3. ✓ Check NO missing or extra fields
4. ✓ Check year field is EXACTLY ${year} for EVERY question
5. ✓ Check marks field is one of: 1, 2, 3, or 5 ONLY
6. ✓ Check language rules:
   - Subject-language match verified
   - No language mixing
   - No transliteration
   - Sanskrit ≠ Hindi strictly enforced
7. ✓ Check LaTeX rules:
   - All math in $...$ or $$...$$
   - NO \\( \\) \\[ \\] delimiters
   - All backslash commands inside math mode only
   - NO plain-text math tokens
8. ✓ Check chemistry rules (if applicable):
   - All formulas in LaTeX
   - Doubled backslashes in JSON (\\\\)
   - No plain-text chemical formulas
9. ✓ Check logical notation (if applicable):
   - All logical symbols in LaTeX
   - Wrapped in $...$
10. ✓ Check tables (CRITICAL - if statistics questions):
    - Proper markdown tables with | | format
    - ALL cells have values (NO empty cells)
    - Unknown frequencies use descriptive variables ($k$, $f_1$, $p$, etc.)
    - Variable vs frequency distinction is clear
    - Table structure is complete and unambiguous
    - Blank line after each table
    - Question is solvable with given data
11. ✓ Check markdown formatting:
    - No code blocks, headings, or blockquotes
    - Proper sub-part formatting
12. ✓ Check chapter isolation:
    - All questions from the given chapter only
    - No topics from other chapters
13. ✓ Check year-specific quality:
    - Questions feel appropriate for ${year}
    - Not generic timeless questions
14. ✓ Check frontend safety:
    - Valid JSON structure
    - No trailing commas
    - Proper escaping (\\n for newlines in JSON)
15. ✓ Scan the ENTIRE output:
    - If ANY backslash-command (\\mathbb, \\cap, \\emptyset, \\text, etc.)
      appears OUTSIDE $...$ or $$...$$ → REGENERATE
    - If ANY mathematical symbol appears outside LaTeX → REGENERATE
    - If ANY table has incomplete structure → REGENERATE
    - If ANY rule is violated → REGENERATE internally until compliant

Return output ONLY after passing ALL checks.

If ANY rule is violated → REGENERATE INTERNALLY.

====================================================
OUTPUT
====================================================
Return STRICT JSON ONLY. NOTHING ELSE.
Output MUST be fully compatible with a Markdown+KaTeX renderer.
`;
      // -------------------------------------------------------------------
      // 3️⃣ CALL OPENAI
      // -------------------------------------------------------------------
      const aiRaw = await step.run("Call OpenAI",async () => {
        return await askOpenAI(prompt, "gpt-5.1",{
           response_format: { type: "json_object" }
        });
      });

      // -------------------------------------------------------------------
      // 4️⃣ PARSE JSON
      // -------------------------------------------------------------------
      let finalJson;
      try {
        const cleaned = aiRaw
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        finalJson = JSON.parse(cleaned);
      } catch (err) {
        throw new Error("Failed to parse PYQ JSON: " + err.message);
      }

      // -------------------------------------------------------------------
      // 5️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await PyqModel.create({
          className,
          subject: mainSubject,
          chapter,
          year,
          content: finalJson,
        });
      });

      // -------------------------------------------------------------------
      // 6️⃣ SAVE REDIS
      // -------------------------------------------------------------------
      await step.run("Save Redis", async () => {
        await redis.set(cacheKey, JSON.stringify(finalJson), {
          EX: 60 * 60 * 24 * 2,
        });
      });

      await redis.del(pendingKey);

      return { source: "generated" };
    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`generatePYQs error: ${err.message}`);
    }
  }
);
