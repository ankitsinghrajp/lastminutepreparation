import { inngest } from "../../libs/inngest.js";
import { PyqModel } from "../../models/PreviousYearQuestions/pyq.model.js";
import { parseSubject } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";

export const generatePYQsFn = inngest.createFunction(
  {
    name: "Generate PYQs",
    id: "generate-pyqs",
  },
  { event: "lmp/generate.pyqs" },
  async ({ event, step }) => {
    const { className, subject, chapter, year } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);

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
You are a CBSE PYQ Expert. Your ONLY task is to generate synthetic but accurate
CBSE-style PYQs for ONE specific year provided by the user.

USER INPUT:
- Class: ${className}
- Subject: ${subject}
- Chapter: ${chapter}
- Year: ${year}

STRICT GENERATION RULES:
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

FINAL OUTPUT FORMAT:
{
  "class": "${className}",
  "subject": "${subject}",
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
RETURN STRICT JSON ONLY.
  `;

      // -------------------------------------------------------------------
      // 3️⃣ CALL OPENAI
      // -------------------------------------------------------------------
      const aiRaw = await step.run("Call OpenAI", async () => {
        return await askOpenAI(prompt, "gpt-5.1");
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
