import { inngest } from "../../libs/inngest.js";
import { redis } from "../../libs/redis.js";
import { parseSubject } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";

export const topperStyleAnswerFn = inngest.createFunction(
  {
    id: "topper-style-answer",
    name: "Generate Topper Style Answer",
    retries:1,
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

Difficulty Level: Hard

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

3) For ALL OTHER subjects:
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

----------------------------------
DIFFICULTY LEVEL APPLICATION (MANDATORY)
----------------------------------
Easy:
- Very simple language
- No Skipped steps
- Examiner-satisfying logical flow

Medium:
- Standard CBSE depth
- No Skipped steps
- Examiner-satisfying logical flow

Hard:
- Full topper depth
- No skipped steps
- Examiner-satisfying logical flow

Difficulty affects ONLY depth, NEVER rules.

----------------------------------
CHAPTER–SYLLABUS ISOLATION
----------------------------------
- Answer MUST belong strictly to the given chapter and syllabus.
- Do NOT introduce concepts from other chapters or classes.
- Avoid unnecessary context unless NCERT/PYQ requires it.

----------------------------------
GENERAL ANSWER RULES
----------------------------------
- Start directly with the solution (NO introduction, NO conclusion).
- Follow exact question order: (a), (b), (c), …
- Use crisp exam language.
- NO conversational, casual, or apologetic tone.
- Bold ONLY key results or final numerical values.
- Do NOT add extra theory beyond mark requirement.

----------------------------------
SPECIAL CASE — DIAGRAM QUESTIONS (MARKDOWN DIAGRAMS ALLOWED)
----------------------------------
If the question asks to "draw", "sketch", or "show diagram":

YOU MUST:
- Tell - Sorry I can't create diagram here
- Just give the 3 lines only steps how to create a diagram
- Then continuous to solution 

FORBIDDEN:
- Images or image links
- SVG / HTML / Canvas
- Code blocks

----------------------------------
SPECIAL CASE — NUMERICAL / DERIVATION
----------------------------------
- NO theory
- What is given
- What is the formula
- Substitute it 
- Solve it 
- Give Result
- Units or explanations must be OUTSIDE $$ blocks

----------------------------------
UNIVERSAL FORMULA & MATH RULES (ABSOLUTE)
----------------------------------

1) ABSOLUTE LATEX MANDATE:
- EVERY mathematical expression MUST be written in LaTeX and wrapped inside:
  • Inline → $ ... $
  • Display → $$ ... $$

- NEVER output mathematical tokens as plain text.

----------------------------------
LATEX DELIMITER RESTRICTION (MANDATORY)
----------------------------------
- NEVER use \\( \\) or \\[ \\]
- ONLY $...$ or $$...$$ are allowed
- Any appearance of \\(, \\), \\[, \\] → regenerate

----------------------------------
LATEX COMMAND CONTAINMENT RULE (MANDATORY)
----------------------------------
- ANY LaTeX command (token starting with \\) is FORBIDDEN outside math mode.
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
- If ANY backslash-command appears outside math delimiters → regenerate.

----------------------------------
PLAIN-TEXT MATH TOKEN BAN
----------------------------------
The following are STRICTLY FORBIDDEN outside LaTeX:
sin, cos, tan, sec, cosec, cot,
sin^-1, cos^-1, tan^-1,
frac, sqrt,
<=, >=,
pi, mu, theta, degree,
^, |x|, mod, modulus

- Fractions → \\frac{a}{b}
- Roots → \\sqrt{}
- Trig → \\sin, \\cos, etc.
- Absolute value → \\lvert x \\rvert

----------------------------------
DISPLAY MATH STRICTNESS
----------------------------------
- One equation per $$ block ONLY
- NEVER multiple equations in one $$ block

----------------------------------
INEQUALITIES & SYSTEMS
----------------------------------
- Systems → ONE $$ block
- Each inequality on a new line

----------------------------------
CHEMICAL EQUATIONS
----------------------------------
- ALL chemical equations MUST be written ONLY as:
  $$ ... $$

----------------------------------
STATISTICS / TABLE RULES
----------------------------------
- If statistics is involved → MUST use markdown tables
- Ungrouped data → FIRST convert to frequency table
- Tables MUST be proper markdown tables
- Leave EXACTLY one blank line after every table

----------------------------------
MARKDOWN RULES
----------------------------------
- Markdown allowed ONLY for:
  - Line breaks
  - Sub-parts (a), (b), (c)
  - Bullet points
  - Tables
  - Diagrams
- NO headings
- NO code blocks
- NO JSON
- NO backticks

----------------------------------
OUTPUT SAFETY
----------------------------------
- NO phrases like “Final Answer”, “Explanation”, “According to the question”
- NO escaped newlines \\n
- NO stray punctuation
- NO math outside LaTeX

----------------------------------
FINAL SELF-CHECK (MANDATORY)
----------------------------------
Before responding:
- If ANY math appears outside $...$ or $$...$$ → regenerate
- If ANY backslash-command appears outside math → regenerate
- If ANY language rule is violated → regenerate
- If ANY rule is violated → regenerate internally until compliant

----------------------------------
FINAL COMMAND
----------------------------------
Now answer the question exactly as a CBSE TOPPER would,
in FULL compliance with ALL rules above.
`;



      const safePrompt = prompt.replace(/\\/g, "\\\\");

      const answer = await step.run("OpenAI Call", async () =>
        askOpenAI(safePrompt,"gpt-5-mini")
      );

      const finalAnswer = { answer };

      // 🔹 SAVE CACHE (2 DAYS)
      await redis.set(cacheKey, finalAnswer, {
        EX: 60 * 60 * 24 * 2,
      });

      await redis.del(pendingKey);
      return { success: true };
    } catch (err) {
      await redis.del(pendingKey);
      throw err;
    }
  }
);
