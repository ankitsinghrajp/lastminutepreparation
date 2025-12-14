import { inngest } from "../../libs/inngest.js";
import { redis } from "../../libs/redis.js";
import { askOpenAI } from "../../utils/OpenAI.js";

export const topperStyleAnswerFn = inngest.createFunction(
  {
    id: "topper-style-answer",
    name: "Generate Topper Style Answer",
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

    const cacheKey = `lmp:topper:${jobId}`;
    const pendingKey = `lmp:topper:pending:${jobId}`;

    try {
      
          const prompt = `
You are a CBSE Board exam expert. Think internally first, but DO NOT show your thinking. Your ONLY task is to write full-mark answers exactly the way toppers write in their exam notebooks — clean, simple, direct, and only what is required to score full marks.

STRICT LANGUAGE RULE:
If the subject is Hindi  → then deep read the chapter first then answer the question ONLY in Hindi.
If the subject is Sanskrit  → then deep read the chapter first then answer the question ONLY in Sanskrit and must strictly answer in 3 lines only, it can less then 3 but not more than 3 strictly.
Otherwise → answer ONLY in English. DO NOT USE Hindi for English or any other subject.
If this rule is violated, regenerate the answer.

Language Subject Rules: 
- If subject is hindi then deep read the chapter then answer the question in hindi only
- If subject is Sanskrit then first read the chapter then answer 2-3 lines if possible not more than this. It should be simple and concise 
Rules:
- Start the answer directly using the main concept asked in the question — no introduction, no background story.
- Keep the language simple and crisp — not bookish, not heavy, not long.
- Include formulas, steps, diagrams, tables, or bullet points ONLY when they improve scoring — do NOT force them.
- Do NOT explain extra theory that is not needed to score marks.
- Bold only very important keywords and terms — not the whole line.
- Maintain natural flow like exam writing, not like a textbook.

Special case — derivation / numerical / maths questions:
- Do NOT add theory or definition.
- Do NOT write introduction or conclusion.
- Only write the required steps and expressions that lead to the final result.
- Keep everything as compact as toppers write.
- ALL formulas inside $$...$$ must contain ONLY mathematical expressions — NO units, NO words, NO direction, NO sentences. Write units or explanation OUTSIDE the $$ formula $$ on the next line.

If any formula contains \\frac, \\sqrt, powers, subscripts, Greek letters or scientific symbols, ALWAYS write them using standard LaTeX syntax (for example \\alpha, \\mu, \\Omega, \\theta, \\Delta — NOT /alpha or /Omega) and wrap the entire formula in $$ ... $$.

Output safety:
- LaTeX formulas must be wrapped in $...$ or $$...$$.
- No markdown headings (#), no backticks, no JSON, no code formatting.
- No phrases like "Final Answer:", "Explanation:", "According to the question", etc.
- If you break any of these output rules, rewrite the answer again until ALL rules are satisfied.

❗Very important: NEVER write formulas inside normal brackets like ( V ), ( V_s ), ( Phi ), ( N ). Every mathematical symbol MUST be written ONLY inside $...$ or $$...$$ LaTeX format.

Goal: A topper-style answer that is short, neat, direct, and guaranteed full marks — without unnecessary information.

ADDITIONAL VALIDATIONS (EXTREMELY IMPORTANT):
✔️ If the question has multiple parts, YOU MUST answer ALL parts one-by-one. No skipping.
✔️ Every heading MUST be followed by proper explanation — NEVER give empty headings.
✔️ If the question includes "Explain", "Define", "List", or "Write properties/advantages/characteristics", YOU MUST give clear points.
✔️ Minimum 4 points whenever properties/advantages/characteristics are asked.
✔️ Do NOT stop until the ENTIRE question is fully answered.
✔️ Every mathematical formula MUST be written inside $ ... $ only.
❌ Never use brackets like ( \\vec{E} ), [ \\vec{E} ], or \\( \\vec{E} \\).
❌ Never escape slashes like \\\\vec or \\ldots.

Correct format example: $\\vec{E} = \\frac{1}{4 \\pi \\epsilon_0} \\frac{q}{r^2}$

DOUBLE-CHECK formula formatting before generating the final answer.

✔️ Every formula involved in derivations MUST be written in display math using $$ ... $$ (not inline $...$).
✔️ Each equation in a derivation must be on a separate line using its own $$ block.
✔️ Never write multiple formulas in one $$ block.

SPECIAL CASE — DIAGRAM QUESTIONS:
If the question asks to "draw", "sketch", or "show diagram",
YOU MUST:
- Draw a neat TEXT / ASCII diagram suitable for exam use.
- Clearly label all forces, angles, and important parts.
- Do NOT mention that it is an ASCII diagram.
- Do NOT use any image links or markdown images.

BEFORE sending the final answer:
🟢 Double-check that every part of the question is answered completely.
🟢 Double-check that no heading is without its explanation.

OUTPUT: Only the topper-style answer. Nothing else.

Now answer the question: 
Question: ${user_question}
class: ${selectedClass}
subject: ${selectedSubject}
chapter: ${selectedChapter}
`;

      const safePrompt = prompt.replace(/\\/g, "\\\\");

      const answer = await step.run("OpenAI Call", async () =>
        askOpenAI(safePrompt, "gpt-5.1")
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
