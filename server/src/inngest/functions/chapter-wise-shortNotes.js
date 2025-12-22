import { inngest } from "../../libs/inngest.js";
import { ChapterWiseShortNotesModel } from "../../models/chapterWiseStudy/chapterWiseShortNotes.model.js";
import { parseSubject } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";

export const chapterWiseShortNotesFn = inngest.createFunction(
  {
    name: "Generate Chapter Wise Short Notes",
    id: "chapter-wise-short-notes",
    retries: 0,
  },
  { event: "lmp/generate.chapterWiseShortNotes" },
  async ({ event, step }) => {
    const { className, subject, chapter } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);

    const cacheKey = `lmp:shortnotes:${className}:${mainSubject}:${chapter}`;
    const pendingKey = `lmp:shortnotes:pending:${className}:${mainSubject}:${chapter}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbNotes = await step.run("DB Check", async () => {
        return await ChapterWiseShortNotesModel.findOne({
          className,
          subject: mainSubject,
          chapter,
        });
      });

      if (dbNotes) {
        await redis.set(cacheKey, dbNotes.content, {
          EX: 60 * 60 * 24 * 2,
        });
        await redis.del(pendingKey);
        return { source: "database" };
      }

   const prompt = `
You are an API that returns ONLY valid Markdown.
No explanations, no meta text, no thinking output.

You are a CBSE Board exam expert.
Think internally but DO NOT show your thinking.

Your ONLY task is to generate CHAPTER-WISE SHORT NOTES
in a STRICT CONCEPT-WISE FORMAT exactly like toppers write.

====================================================
MANDATORY CONTENT STRUCTURE (ABSOLUTE)
====================================================

Every topic MUST follow this EXACT pattern:

**Concept Name**
1-2 short explanatory lines (definition/meaning/key idea)
[Blank line if formula exists]
$$ [formula] $$
[Blank line after formula]

THEN repeat for next concept:

**Next Concept Name**
1-2 short explanatory lines
[Blank line]
$$ [formula] $$

STRUCTURE RULES:
1. Concept name line MUST be in **bold** using **Concept Name**
2. NO headings, NO subheadings
3. NO bullet symbols (•, -, *)
4. NO numbering (1., 2., etc.)
5. Only concept-wise blocks as defined above
6. Blank line before each new concept block

CONTENT RULES:
- Each concept: Exactly 1-2 explanatory lines
- Definition/meaning/key idea ONLY
- NO examples
- NO derivations
- NO extra theory
- NO paragraphs

FORMULA RULES:
- If formula exists → MUST include $$ block
- If no formula exists → SKIP formula block
- NEVER include formula without explanation
- NEVER include explanation without concept name

STRICTLY FORBIDDEN:
- Paragraphs
- Long explanations
- More than 2 lines of explanation
- Missing concept names
- Writing formulas without explanation
- Writing explanation without concept name
- Mixing formats

If structure is violated EVEN ONCE → REGENERATE ENTIRE OUTPUT.

====================================================
LANGUAGE POLICY (ABSOLUTE — SUBJECT-LOCKED)
====================================================

Language is STRICTLY determined by the subject.
Cross-language output is STRICTLY FORBIDDEN.

SUBJECT → LANGUAGE MAPPING (MANDATORY):

1) If Subject is "Hindi":
   - ALL content MUST be written ONLY in PURE, STANDARD HINDI.
   - Use formal CBSE/NCERT academic Hindi only.
   - DO NOT include any English or Sanskrit words.
   - DO NOT use Hinglish or transliterated English.

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
- Mixing languages in any form.
- Transliteration (e.g., "kya", "arth", "vidhya", "kathan", etc.).
- Subject-language mismatch (e.g., English notes for Hindi subject).
- Bilingual phrasing or explanations.

AUTO-REGENERATION RULE:
Any language violation → REGENERATE ENTIRE OUTPUT.

====================================================
ABSOLUTE OUTPUT STYLE RULES
====================================================

- NO headings
- NO subheadings
- NO bullet symbols (•, -, *)
- NO numbering
- Each line must be a clean short-note line
- Only concept-wise blocks as defined above

====================================================
UNIVERSAL FORMULA & LaTeX RULES (MANDATORY)
====================================================

1) ABSOLUTE LaTeX MANDATE:
- EVERY mathematical expression MUST be written in LaTeX.
- ALL formulas MUST appear ONLY inside their OWN $$ block.
- NO inline math using $...$.
- NEVER use \\( ... \\) or \\[ ... \\].
- Each $$ must be on its own line.
- ONLY ONE equation per $$ block.
- Blank line above and below each $$ block.

2) LaTeX COMMAND CONTAINMENT RULE (MANDATORY):
- ANY LaTeX command (token starting with backslash \\) is FORBIDDEN outside $$ ... $$.
- Examples of forbidden commands outside $$ ... $$:
  \\mathbb, \\times, \\to, \\cap, \\cup, \\in, \\subset, \\subseteq, \\Rightarrow
- ALL LaTeX commands MUST appear ONLY inside $$ ... $$.
- If ANY backslash-command appears outside math delimiters → REGENERATE.

3) PLAIN-TEXT MATH TOKEN BAN:
- FORBIDDEN outside $$:
  sin, cos, tan, sec, cosec, cot, sin^-1, cos^-1, tan^-1
  frac, sqrt, leq, geq, <=, >=, pi, theta, mu
  ^ as plain text, |x|, mod, modulus
  ANY raw backslash commands

4) INSIDE $$ — ALLOWED ONLY:
- ALLOWED:
  • \\frac{}{}, \\sqrt{}, \\int, \\cdot, \\sum, \\prod
  • Greek letters: \\alpha, \\beta, \\gamma, \\phi, \\theta, \\Phi
  • Proper subscripts: q_1, Q_{enc}, x_{i}
  • Proper superscripts: r^{2}, x^{n}, e^{i\\theta}
  • Operators: +, -, \\times, \\div, =, \\neq, \\approx

- STRICTLY FORBIDDEN inside $$:
  • \\text{...} or any text in equations
  • ANY English/Hindi/Sanskrit words inside $$
  • Units (N, J, C, V, m, s, kg, etc.) inside $$
  • Multiple equations in one $$ block
  • Truncated commands (\\fra, \\sq, \\epsil)
  • Trailing backslash
  • \\n, \\t or escaped characters

5) FORMULA COMPLETENESS VALIDATION:
For EVERY $$ block, ensure:
- Balanced $$ pairs
- Exactly ONE equation per block
- Balanced { } and ( ) parentheses
- No stray backslashes
- No truncated LaTeX tokens
- Formula contains at least one operator (=, \\frac, ^, _, \\cdot, etc.)
- Blank line above and below the $$ block
- Next line starts new concept or ends document

If ANY check fails → REGENERATE ENTIRE OUTPUT.

====================================================
CHEMISTRY SPECIFIC RULES
====================================================

For Chemistry subjects ONLY:

1) CHEMICAL FORMULAS:
   - Simple formulas in explanation: $H_2O$, $CO_2$, $CH_4$
   - Complex formulas in $$ blocks: $$H_2SO_4$$
   - Ions: $Na^+$, $Cl^-$, $SO_4^{2-}$

2) CHEMICAL EQUATIONS:
   - MUST be in $$ blocks ONLY
   - Use proper arrows: \\to, \\rightarrow, \\rightleftharpoons
   - Example: $$2H_2 + O_2 \\to 2H_2O$$

3) FORBIDDEN in Chemistry:
   - Plain text formulas (H2O, CO2)
   - Text inside $$ blocks
   - Missing subscripts/superscripts

====================================================
STATISTICS RULES
====================================================

If concept involves statistical data:
- Present data in proper markdown table format
- Table format:
  | Column1 | Column2 |
  |---------|---------|
  | Data1   | Data2   |
- Each row on its own line
- Exactly one blank line after table

====================================================
NORMALIZATION & SANITIZATION (MANDATORY)
====================================================

ALWAYS convert:
- q1 → q_1
- q2 → q_2
- r2 → r^{2}
- r3 → r^{3}
- Qenc → Q_{enc}
- Phi → \\Phi
- phi → \\phi
- theta → \\theta
- pi → \\pi
- mu → \\mu

FORBIDDEN notations:
- (E), (V), (Phi), (phi), (p), (Phi_E) in equations
- Any parentheses around standalone symbols
- Units inside $$ blocks

====================================================
FORMATTING & SPACING RULES
====================================================

1) CONCEPT SEPARATION:
   - Blank line before **Concept Name**
   - No blank line between concept name and explanation
   - If formula exists: blank line before $$, blank line after $$

2) LINE BREAKS:
   - Use actual line breaks in Markdown
   - No \\n or escaped characters
   - Each explanatory line should be separate

3) BOLD FORMATTING:
   - ONLY concept name line uses **bold**
   - Explanatory lines: normal text
   - Formula blocks: normal text (no bold)
   - If concept name not bold → REGENERATE

====================================================
FINAL SELF-VALIDATION CHECKLIST (MANDATORY)
====================================================

Before returning output, VERIFY ALL:

STRUCTURE:
✓ Concept → explanation → formula order followed  
✓ Exactly 1–2 explanation lines per concept  
✓ Concept name in **bold**  
✓ No bullets, no headings, no paragraphs  
✓ Formula present ONLY if applicable  
✓ Blank lines properly placed

LANGUAGE:
✓ Language matches subject exactly  
✓ No mixed language  
✓ No transliteration

LaTeX & MATH:
✓ NO LaTeX command outside $$  
✓ NO inline math ($...$)  
✓ NO \\text or units inside $$  
✓ Balanced braces and delimiters  
✓ Exactly one equation per $$ block  
✓ All math in proper LaTeX syntax

CHEMISTRY/STATISTICS:
✓ Chemical formulas in $...$ or $$...$$  
✓ Chemical equations in $$ blocks  
✓ Statistics data in markdown tables

FORMATTING:
✓ Markdown + KaTeX renderer safe  
✓ Clean line breaks  
✓ Proper bold formatting only for concept names  
✓ No stray characters

If ANY rule is violated → REGENERATE COMPLETELY.

====================================================

Now generate PERFECT concept-wise SHORT NOTES for:

Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}

OUTPUT ONLY THE MARKDOWN CONTENT.
`;

      // -------------------------------------------------------------------
      // 3️⃣ FIRST AI CALL (PRIMARY GENERATION)
      // -------------------------------------------------------------------
      const aiOutput = await step.run("Call OpenAI (Primary)", async () => {
     
        return await askOpenAI(prompt, "gpt-5.1");
      });

      // -------------------------------------------------------------------
      // 🔁 4️⃣ SECOND AI CALL (FIX ONLY — NO CONFLICT)
      // -------------------------------------------------------------------
const fixerPrompt = `
You are a STRICT LaTeX FORMULA VALIDATION FIXER
for CBSE Chapter-Wise Short Notes.

The input is a RAW STRING that may contain Markdown-like text.
DO NOT treat it as Markdown.
DO NOT format it.
DO NOT re-render it.

The content is MOSTLY CORRECT.
DO NOT regenerate content.
DO NOT rewrite explanations.
DO NOT change wording, language, order, or structure.
DO NOT add or remove concepts.

Your ONLY responsibility is to FIX LaTeX FORMULA VALIDITY
inside existing $$ ... $$ blocks.

====================================================
ABSOLUTE ALIGNMENT WITH ORIGINAL GENERATION PROMPT
====================================================

- ALL formulas MUST remain inside existing $$ ... $$ blocks
- Inline math ($...$) is STRICTLY FORBIDDEN
- NEVER use \\( \\) or \\[ \\]
- Each $$ block MUST remain exactly where it is

❌ Do NOT add new $$ blocks
❌ Do NOT remove existing $$ blocks
❌ Do NOT move formulas
❌ Do NOT move or edit non-formula text
❌ Do NOT reformat spacing or lines

====================================================
ALLOWED FIXES ONLY (INSIDE $$ BLOCKS)
====================================================

You may ONLY fix LaTeX validity issues inside $$ blocks:

1) Fix broken or truncated LaTeX commands
   (\\fra → \\frac, \\sq → \\sqrt, etc.)

2) Fix unbalanced braces { } or parentheses ( )

3) Fix invalid or partial symbols ONLY when required for LaTeX parsing
   (Phi → \\Phi, theta → \\theta, pi → \\pi)

4) Fix invalid subscripts/superscripts
   (q1 → q_1, r2 → r^{2})

5) Fix invalid arrow syntax
   (-> → \\to)

6) Ensure EXACTLY ONE valid equation per $$ block

====================================================
STRICTLY FORBIDDEN ACTIONS
====================================================

❌ Do NOT add \\text{}
❌ Do NOT add units (m, s, kg, J, etc.)
❌ Do NOT split or merge equations
❌ Do NOT introduce new operators
❌ Do NOT normalize explanation text
❌ Do NOT modify concept names
❌ Do NOT modify spacing or blank lines
❌ Do NOT move LaTeX outside $$ blocks

====================================================
CHEMISTRY SAFETY RULES
====================================================

✔ Chemical equations MUST remain in existing $$ blocks
✔ Allowed arrows only: \\to, \\rightarrow, \\rightleftharpoons
✔ Fix subscripts/superscripts ONLY if broken
✔ Do NOT rewrite reactions

====================================================
FINAL VALIDATION CHECK
====================================================

Before returning output, verify:

✓ Every $$ block is balanced
✓ LaTeX inside $$ parses correctly
✓ No text exists inside $$ blocks
✓ No LaTeX exists outside $$ blocks
✓ The STRING structure is unchanged

If a formula cannot be fixed WITHOUT changing meaning,
leave it EXACTLY AS IT IS.

====================================================
INPUT STRING
====================================================

<<<
${aiOutput}
>>>

IMPORTANT OUTPUT RULE:
- Return ONLY the corrected STRING
- Do NOT say “Markdown”
- Do NOT add explanations
- Do NOT add commentary
- Do NOT add formatting
`.trim();

  const subjectHardness = ["physics","chemistry","mathematics","applied mathematics", "accountancy", "bio technology"];

      let secondPassModel;
      if(subjectHardness.includes(mainSubject)){
        secondPassModel = "gpt-4o";
      }
      else{
        secondPassModel = "gpt-4o-mini"
      }

      const finalOutput = await step.run("Fix Markdown + LaTeX", async () => {
        return await askOpenAI(fixerPrompt, secondPassModel);
      });

      // -------------------------------------------------------------------
      // 5️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await ChapterWiseShortNotesModel.create({
          className,
          subject: mainSubject,
          chapter,
          content: finalOutput,
        });
      });

      // -------------------------------------------------------------------
      // 6️⃣ SAVE REDIS
      // -------------------------------------------------------------------
      await redis.set(cacheKey, finalOutput, {
        EX: 60 * 60 * 24 * 2,
      });

      await redis.del(pendingKey);

      return { source: "generated" };

    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`chapterWiseShortNotes error: ${err.message}`);
    }
  }
);
