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
   const prompt = `You are a CBSE Board exam expert. Think internally first but DO NOT show your thinking.

Your ONLY task is to generate SHORT NOTES for the given chapter exactly like toppers write: clean, crisp, scoring, and technically perfect.

MOST IMPORTANT THING:
Ensure that all important topics should be covered in short notes.

STRICT LANGUAGE RULE:
• If subject is Hindi → Write ONLY in Hindi.
• If subject is Sanskrit → Write ONLY in Sanskrit.
• Otherwise → Write ONLY in English.

====================================================
ABSOLUTE OUTPUT RULES (DO NOT BREAK THESE)
====================================================

1) BULLET RULE:
• You MUST NOT use "• " or "- " at the beginning of any line.
• Instead, write clean short-note style points WITHOUT any symbols. Just simple lines.
• NO paragraphs, NO headings, NO intros, NO conclusions.
• No long paragraphs — only crisp, concise points.

2) FORMULA APPEARANCE RULE (CRITICAL):
• ANY mathematical expression (like F = …, E = …, V = …, Q/r^2, fractions, integrals)
  MUST ALWAYS appear ONLY inside its own $$ ... $$ block.
• NEVER write formulas as plain text inside points.
• If ANY formula appears outside $$ → REGENERATE immediately.

3) DISPLAY MATH FORMAT (MANDATORY):
Every formula MUST look EXACTLY like this:

(blank line)
$$
F = k \\frac{q_1 q_2}{r^2}
$$
(blank line)

4) INSIDE $$ RULES:
ALLOWED:
• \\frac
• \\sqrt
• \\int
• \\cdot
• \\epsilon_0
• Greek letters: \\alpha, \\beta, \\gamma, \\phi, \\theta, \\Phi
• Proper subscripts: q_1, Q_{enc}, r^2, A_{net}
• Superscripts using ^{ }

NOT ALLOWED:
• frac (without \\)
• sqrt (without \\)
• epsilon0, eps, epsilon
• ANY English words inside formulas
• ^2 without braces
• Multiple equations in one $$ block
• Equations inside (parentheses) like (E), (V), (Phi)
• **NEW RULE:** \\text{...} or ANY usage of \\text is strictly forbidden inside $$ blocks
• **NEW RULE:** Units (C, N, m, J, etc.) MUST NOT appear inside $$ blocks — they must be written outside the formula as plain text

5) AFTER $$ RULE:
• The VERY NEXT line MUST be a new short-note point (but WITHOUT "• " or "- ").
• NO normal text is allowed directly under $$ unless it is a point.

6) BRACES / BACKSLASH RULE:
• Every { must have matching }
• EVERY LaTeX command MUST begin with \\
• Phi → ❌ WRONG
• \\Phi → ✅ CORRECT

7) VALIDATION BEFORE OUTPUT (MANDATORY):
Before sending final answer, you MUST self-check:

✔ Every formula is inside its own $$ block  
✔ No formulas appear as plain text  
✔ No inline math ($...$) exists  
✔ No forbidden tokens (frac, sqrt, eps, epsilon0, text)  
✔ **NO \\text{...} inside formulas**  
✔ **NO units inside formulas**  
✔ All commands start with "\\"  
✔ Braces balanced  
✔ No trailing backslashes or incomplete commands  
✔ Blank line above AND below every formula  
✔ Proper point immediately after each $$ block  
✔ No English words inside $$ blocks

====================================================
FORMULA COMPLETENESS RULES (NEW — FIXES HALF / TRUNCATED FORMULAE)
====================================================

The model MUST perform these checks for each $$ ... $$ block and REGENERATE if any check fails:

1) Balanced $$ pairs:
   • The number of $$ tokens in the whole output must be even.
   • Each $$ must appear on its own line.

2) Single-equation per block:
   • Each $$ block MUST contain exactly one equation/expression.
   • No extra text or commentary inside.

3) Braces & parentheses completeness:
   • Count of '{' equals count of '}' inside each formula.
   • Count of '(' equals count of ')'.
   • If mismatch → REGENERATE.

4) No trailing backslash or incomplete command:
   • Formula MUST NOT end with a single "\\".
   • No "\\" followed only by whitespace or end-of-block.

5) No truncated LaTeX tokens:
   • Commands like \\fra, \\sq, \\epsil are forbidden.
   • \\frac must contain both numerator and denominator braces.

6) No stray backslash sequences:
   • "\\n", "\\t", etc. are forbidden inside $$.  

7) Minimum content sanity:
   • A formula must contain at least one operator (=, \\frac, ^, _, \\cdot, etc.).  

8) Blank-line placement:
   • One blank line above and one blank line below each formula.  
   • Then a short-note point immediately (without bullets).  

====================================================
ADDITIONAL INLINE MATH AND SANITIZATION VALIDATIONS (MANDATORY):

A. Parentheses to inline math:
1. You must never output Greek letters or variables inside plain parentheses such as (Phi), (phi), (p), (E), (V), (Phi_E).
   Convert them to inline math:
     (Phi)   -> $ \\Phi $
     (phi)   -> $ \\phi $
     (Phi_E) -> $ \\Phi_E $
     (p)     -> $ p $

B. Subscript and superscript rules:
1. Variables followed by digits must always use subscripts or exponents:
   q1 → q_1  
   q2 → q_2  
   r2 → r^{2}  
   r3 → r^{3}
2. Qenc → Q_{enc}

C. Greek letter normalization:
1. Greek names must start with backslash:
   Phi → \\Phi  
   phi → \\phi

Now generate the topper-style SHORT NOTES for:
Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}
`.trim();

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
