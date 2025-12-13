import { inngest } from "../../libs/inngest.js";
import { LastMinuteMCQModel } from "../../models/LastMinuteBeforeExam/lastMinuteMcq.model.js";
import { parseSubject, detectCategory } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";
import { extractJSON } from "./extractJsonForFunctions/extractJson.js";
export const lastNightMCQsFn = inngest.createFunction(
  {
    id: "lmp-mcqs",
    name: "Generate LMP MCQs",
  },
  { event: "lmp/generate.mcqs" },
  async ({ event, step }) => {
    const { className, subject, chapter } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(mainSubject);

    const cacheKey = `lmp:mcqs:${className}:${mainSubject}:${chapter}`;
    const pendingKey = `lmp:mcqs:pending:${className}:${mainSubject}:${chapter}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await step.run("DB Check", async () => {
        return await LastMinuteMCQModel.findOne({
          className,
          subject: mainSubject,
          chapter,
        });
      });

      if (dbCache) {
        const safeDBContent = JSON.parse(JSON.stringify(dbCache.content));

        await redis.set(cacheKey, JSON.stringify(safeDBContent), {
          EX: 60 * 60 * 24 * 2,
        });

        await redis.del(pendingKey);
        return { mcqs: safeDBContent.mcqs, source: "database" };
      }

      // -------------------------------------------------------------------
      // 2️⃣ BUILD PROMPT (UNCHANGED)
      // -------------------------------------------------------------------
   const prompt = `
You are an API. Output ONLY valid JSON.

Class ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

Formula Rule: pure LaTeX only.

TASK:
Generate EXACTLY 5 MCQs.

JSON:
{
  "mcqs":[
    {
      "question":"...",
      "options":["...","...","...","..."],
      "correct":"...",
      "explanation":"...",
      "formula":""
    }
  ]
}
`.trim();

      // -------------------------------------------------------------------
      // 3️⃣ CALL OPENAI
      // -------------------------------------------------------------------
      const aiRaw = await step.run("Call OpenAI", async () => {
        return await askOpenAI(prompt);
      });

      // -------------------------------------------------------------------
      // 4️⃣ EXTRACT JSON
      // -------------------------------------------------------------------
      const parsed = extractJSON(aiRaw);

      parsed.mcqs.forEach((mcq, idx) => {
        if (!mcq.question || !mcq.correct || !mcq.options)
          throw new Error(`Invalid MCQ structure at ${idx}`);

        if (!Array.isArray(mcq.options) || mcq.options.length !== 4)
          throw new Error(`MCQ ${idx} must contain exactly 4 options`);

        if (!mcq.options.includes(mcq.correct))
          throw new Error(`Correct answer mismatch in MCQ ${idx}`);
      });

      const safeParsed = JSON.parse(JSON.stringify(parsed));

      // -------------------------------------------------------------------
      // 5️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await LastMinuteMCQModel.create({
          className,
          subject: mainSubject,
          chapter,
          content: safeParsed,
        });
      });

      // -------------------------------------------------------------------
      // 6️⃣ SAVE REDIS
      // -------------------------------------------------------------------
      await redis.set(cacheKey, JSON.stringify(safeParsed), {
        EX: 60 * 60 * 24 * 2,
      });

      await redis.del(pendingKey);

      return { mcqs: safeParsed.mcqs, source: "generated" };

    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`generateMCQs error: ${err.message}`);
    }
  }
);
