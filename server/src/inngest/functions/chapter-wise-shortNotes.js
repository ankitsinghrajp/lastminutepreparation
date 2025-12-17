import { inngest } from "../../libs/inngest.js";
import {ChapterWiseShortNotesModel} from "../../models/chapterWiseStudy/chapterWiseShortNotes.model.js"
import { parseSubject } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";
import { chapterWiseExtractJson as extractJSON } from "./extractJsonForFunctions/chapterWiseExtractJson.js";

export const chapterWiseShortNotesFn = inngest.createFunction(
  {
    name: "Generate Chapter Wise Short Notes",
    id: "chapter-wise-short-notes",
    retries: 1,
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
        const safeData = dbNotes.content;

        await step.run("Save Redis", async () => {
          await redis.set(cacheKey, safeData, {
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
You are an API that returns ONLY valid Markdown.
No explanations, no meta text, no thinking output.

You are a CBSE Board exam expert.
Think internally first but DO NOT show your thinking.

Your ONLY task is to generate CHAPTER-WISE SHORT NOTES
in a STRICT CONCEPT-WISE FORMAT exactly like toppers write.

====================================================
MANDATORY CONTENT STRUCTURE (ABSOLUTE)
====================================================

Every topic MUST follow this EXACT pattern:

1) Concept name (written as a normal line, NOT a heading)
2) Immediately followed by EXACTLY 1–2 short explanatory lines
   - Definition / meaning / key idea
   - No examples
   - No derivations
   - No extra theory
3) If a formula exists → write the formula
4) If no formula exists → SKIP formula block and move to next concept

THEN repeat the SAME structure for the next concept.

STRICTLY FORBIDDEN:
- Paragraphs
- Long explanations
- More than 2 lines of explanation
- Missing concept names
- Writing formulas without explanation
- Writing explanation without concept name
- Mixing formats

If this structure is violated EVEN ONCE → REGENERATE ENTIRE OUTPUT.

====================================================
LANGUAGE POLICY (ABSOLUTE — SUBJECT-LOCKED)
====================================================

Language is STRICTLY determined by the subject.
Cross-language output is STRICTLY FORBIDDEN.

SUBJECT → LANGUAGE MAPPING:

1) Hindi → ONLY pure CBSE Hindi
2) Sanskrit → ONLY pure Classical Sanskrit
3) Others → ONLY academic English

AUTO-REGENERATION:
Any language violation → REGENERATE.

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

----------------------------------------------------
1) ABSOLUTE LaTeX MANDATE
----------------------------------------------------

- EVERY mathematical expression MUST be written in LaTeX.
- ALL formulas MUST appear ONLY inside their OWN $$ block.
- NO inline math using $...$.
- NEVER use \\( ... \\) or \\[ ... \\].
- Each $$ must be on its own line.
- ONLY ONE equation per $$ block.

----------------------------------------------------
2) LaTeX COMMAND CONTAINMENT RULE (MANDATORY)
----------------------------------------------------

- ANY LaTeX command (a token starting with backslash \\) is STRICTLY FORBIDDEN
  outside math mode.
- Examples of forbidden commands outside $$ ... $$ include:
  \\mathbb
  \\times
  \\to
  \\cap
  \\cup
  \\in
  \\subset
  \\subseteq
  \\Rightarrow
- ALL LaTeX commands MUST appear ONLY inside $$ ... $$.
- If ANY backslash-command appears outside math delimiters → REGENERATE ENTIRE OUTPUT.

----------------------------------------------------
3) PLAIN-TEXT MATH TOKEN BAN
----------------------------------------------------

FORBIDDEN outside $$:
sin, cos, tan, sec, cosec, cot
frac, sqrt
<=, >=
pi, theta, mu
^ as plain text
|x|
mod, modulus
ANY raw backslash commands

----------------------------------------------------
4) INSIDE $$ — ALLOWED ONLY
----------------------------------------------------

ALLOWED:
- \\frac
- \\sqrt
- \\int
- \\cdot
- Greek letters with backslash:
  \\alpha, \\beta, \\gamma, \\phi, \\theta, \\Phi
- Proper subscripts: q_1, Q_{enc}
- Proper superscripts: r^{2}

STRICTLY FORBIDDEN inside $$:
- \\text{...}
- ANY English/Hindi/Sanskrit words
- Units (N, J, C, V, m, s, etc.)
- frac without \\
- sqrt without \\
- epsilon0, eps
- Multiple equations in one $$ block
- Truncated commands (\\fra, \\sq, \\epsil)
- Trailing backslash
- \\n, \\t or escaped characters

----------------------------------------------------
5) FORMULA COMPLETENESS VALIDATION
----------------------------------------------------

For EVERY $$ block, ensure:

- Balanced $$ pairs
- Exactly ONE equation per block
- Balanced { } and ( )
- No stray backslashes
- No truncated LaTeX tokens
- Formula contains at least one operator (=, \\frac, ^, _, \\cdot)
- Blank line above and below the $$ block
- Next line is a valid short-note line

If ANY check fails → REGENERATE ENTIRE OUTPUT.

====================================================
NORMALIZATION & SANITIZATION (MANDATORY)
====================================================

- q1 → q_1
- q2 → q_2
- r2 → r^{2}
- r3 → r^{3}
- Qenc → Q_{enc}
- Phi → \\Phi
- phi → \\phi
- theta → \\theta

FORBIDDEN:
(E), (V), (Phi), (phi), (p), (Phi_E)

====================================================
CHEMISTRY & STATISTICS RULES
====================================================

- ALL chemical equations MUST be written ONLY inside $$ blocks
- Statistics data MUST be shown as proper markdown tables
- Each table row on its own line
- Exactly one blank line after every table


====================================================
Mandatory Rule
====================================================

- The Concept name line MUST be written in **bold** using Markdown (**Concept Name**).
- ONLY the concept name line may be bold.
- Explanatory lines MUST NOT be bold.
- Formula blocks MUST NOT be bold.
- If a concept name is not bold → REGENERATE ENTIRE OUTPUT.


====================================================
FINAL SELF-VALIDATION (MANDATORY)
====================================================

Before returning output, VERIFY:

✔ Concept → explanation → formula order followed  
✔ Exactly 1–2 explanation lines per concept  
✔ No bullets, no headings, no paragraphs  
✔ Formula present ONLY if applicable  
✔ NO LaTeX command outside $$  
✔ No inline math  
✔ No \\text or units inside $$  
✔ Balanced braces and delimiters  
✔ Subject-language match  
✔ Markdown + KaTeX renderer safe  

If ANY rule is violated → REGENERATE UNTIL PERFECT.

====================================================

Now generate PERFECT concept-wise SHORT NOTES for:

Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}
`;


      // -------------------------------------------------------------------
      // 3️⃣ CALL OPENAI
      // -------------------------------------------------------------------
      const aiOutput = await step.run("Call OpenAI", async () => {
        const safePrompt = prompt.replace(/\\/g, "\\\\");
        return await askOpenAI(safePrompt, "gpt-5.1");
      });

      // -------------------------------------------------------------------
      // 4️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await ChapterWiseShortNotesModel.create({
          className,
          subject: mainSubject,
          chapter,
          content: aiOutput,
        });
      });

      // -------------------------------------------------------------------
      // 5️⃣ SAVE REDIS
      // -------------------------------------------------------------------
      await step.run("Save Redis", async () => {
        await redis.set(cacheKey, aiOutput, {
          EX: 60 * 60 * 24 * 2,
        });
      });

      await redis.del(pendingKey);

      return { source: "generated" };
    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`chapterWiseShortNotes error: ${err.message}`);
    }
  }
);
