import { inngest } from "../../libs/inngest.js";
import { Booster } from "../../models/LastMinuteBeforeExam/memoryBooster.model.js";
import { parseSubject, detectCategory } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";
import { lastMinuteExtractJson as extractJSON } from "./extractJsonForFunctions/lastMinuteExtractJson.js";

export const lastNightMemoryBoosterFn = inngest.createFunction(
  {
    id: "lmp-memory-booster",
    name: "Generate LMP Memory Booster",
    retries: 1,
  },
  { event: "lmp/generate.memoryBooster" },
  async ({ event, step }) => {
    const { className, subject, chapter } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(mainSubject);

    const cacheKey = `lmp:booster:${className}:${mainSubject}:${chapter}`;
    const pendingKey = `lmp:booster:pending:${className}:${mainSubject}:${chapter}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await step.run("DB Check", async () => {
        return await Booster.findOne({
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
        return { boosters: safeDBContent.boosters, source: "database" };
      }

      // -------------------------------------------------------------------
      // 2️⃣ BUILD PROMPT (UNCHANGED)
      // -------------------------------------------------------------------
       const prompt = `
You are an API. Output ONLY valid JSON.

Class ${className} | Subject: ${mainSubject} | Chapter: ${chapter}
NCERT Book: ${bookName} | Stream: ${category}

Formula Rule (non-negotiable):
✔ Formula MUST be PURE LaTeX only (e.g., \\frac{a}{b}, \\sin \\theta, E = mc^2)
❌ NO square brackets around formula
❌ NO text before or after the formula
❌ Formula value must NOT include explanation, only math expression
If no formula is required, return an empty string "".


STRICT LANGUAGE RULE:
If the subject is Hindi or Sanskrit → response ONLY in Hindi.
Otherwise → response ONLY in English. DO NOT USE Hindi for English or any other subject.
If this rule is violated, regenerate the answer.

TASK:
Generate EXACTLY 3 boosters:
1) acronym
2) story
3) pattern

Formula Rule:
- Use pure LaTeX only.

JSON:
{
  "boosters":[
    {"type":"acronym","content":"...","formula":""},
    {"type":"story","content":"...","formula":""},
    {"type":"pattern","content":"...","formula":""}
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

      if (
        !parsed.boosters ||
        !Array.isArray(parsed.boosters) ||
        parsed.boosters.length !== 3
      ) {
        throw new Error("Invalid booster format");
      }

      const safeParsed = JSON.parse(JSON.stringify(parsed));

      // -------------------------------------------------------------------
      // 5️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await Booster.create({
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

      return { boosters: safeParsed.boosters, source: "generated" };

    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`generateMemoryBooster error: ${err.message}`);
    }
  }
);
