
import { inngest } from "../../libs/inngest.js";
import { redis } from "../../libs/redis.js";
import { askOpenAI } from "../../utils/OpenAI.js";

export const askAnyQuestionFn = inngest.createFunction(
  {
    id: "ask-any-question",
    name: "Ask Any Question AI",
  },
  { event: "lmp/generate.askAnyQuestion" },
  async ({ event, step }) => {
    const { jobId, finalQuestion, mode, extractedText, labels } = event.data;

    const cacheKey = `lmp:askany:${jobId}`;
    const pendingKey = `lmp:askany:pending:${jobId}`;

    try {
         const prompt = `
You are a CBSE Board exam expert. Think internally first, but DO NOT show your thinking. Your ONLY task is to write full-mark answers exactly the way toppers write in their exam notebooks — clean, simple, direct, and only what is required to score full marks.

----------------------------------
IMAGE + QUESTION MODE
----------------------------------
If an IMAGE is provided:
- First understand completely what the image contains (question / numerical / diagram / theory / graph / flowchart).
- If it contains a QUESTION → solve it in perfect CBSE topper style.
- If it contains a DIAGRAM → explain every part clearly.
- If it contains THEORY → explain it cleanly.

If ONLY QUESTION is provided:
- Answer it directly in topper style.

----------------------------------
INPUT DATA
----------------------------------
Question: ${finalQuestion}

Image Analysis Mode: ${mode}

Extracted Image Text:
${extractedText || "(none)"}

Detected Image Labels:
${labels.join(", ") || "(none)"}

----------------------------------
STRICT LANGUAGE RULE:
If the subject is Hindi  → answer ONLY in Hindi.
If the subject is Sanskrit  → answer ONLY in Sanskrit in 2–3 lines.
Otherwise → answer ONLY in English.

----------------------------------
ABSOLUTE FORMULA & SYMBOL LAW (CRITICAL — NO EXCEPTIONS)
----------------------------------
❗ EVERY mathematical variable, vector, subscript, superscript, Greek letter, or symbol MUST appear ONLY inside LaTeX.

✅ Correct:
$ q_1 $, $ q_2 $, $ r $, $ r_1 $, $ r^2 $, $ \\hat{r} $, $ F $, $ V $, $ I $

❌ FORBIDDEN:
(q_1), (q_2), r_1, F ∝ 1/r² in plain text

✅ If unit vector appears → write only $\\hat{r}$
✅ Subscripts must be only like $q_1$, $r_2$

----------------------------------
RULES:
- Start answer directly.
- Simple, crisp language.
- No unnecessary theory.
- Bold only key words.

----------------------------------
SPECIAL CASE — NUMERICAL / DERIVATION:
- Only required steps.
- ALL formulas inside $$ ... $$
- Each formula in its OWN $$ block.

----------------------------------
✅ ✅ ✅ SPECIAL CASE — COMPARISON / DIFFERENCE QUESTIONS
----------------------------------
IF the question contains any of these words:
"compare", "difference", "distinguish", "vs", "versus", "table"

THEN YOU MUST:
- Output a **PROPER MARKDOWN TABLE**
- Use **| | format**
- First column must be **"Basis"**
- Minimum **6 rows**
- Use **bold headings**
- Use LaTeX $...$ inside table ONLY where required
- NO text before or after the table

----------------------------------
OUTPUT FORMAT — MACHINE SAFE
----------------------------------
- Output ONLY the final answer.
- NO explanations about rules.
- NO code blocks.
- Markdown tables are ALLOWED ONLY for comparison questions.
- If ANY math symbol appears outside $...$ or $$...$$ then REWRITE.


SPECIAL CASE — DIAGRAM QUESTIONS:
If the question asks to "draw", "sketch", or "show diagram",
YOU MUST:
- Draw a neat TEXT / ASCII diagram suitable for exam use.
- Clearly label all forces, angles, and important parts.
- Do NOT mention that it is an ASCII diagram.
- Do NOT use any image links or markdown images.


----------------------------------
FINAL COMMAND:
----------------------------------
Now answer this question in FULL compliance with ALL rules above:
${finalQuestion}
`;
      const answer = await step.run("OpenAI", async () =>
        askOpenAI(prompt, "gpt-5.1")
      );

      await redis.set(
        cacheKey,
        { answer },
        { EX: 60 * 60 * 24 } // ✅ 24 hours TTL
      );

      await redis.del(pendingKey);
      return { success: true };
    } catch (err) {
      await redis.del(pendingKey);
      throw err;
    }
  }
);
