import { inngest } from "../../libs/inngest.js";
import { AiCoach } from "../../models/LastMinuteBeforeExam/aiCoach.model.js";
import { parseSubject, detectCategory } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";
import { lastMinuteExtractJson as extractJSON } from "./extractJsonForFunctions/lastMinuteExtractJson.js";

export const lastNightAICoachFn = inngest.createFunction(
  {
    id: "lmp-ai-coach",
    name: "Generate LMP AI Coach",
  },
  { event: "lmp/generate.aiCoach" },
  async ({ event, step }) => {
    const { className, subject, chapter } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(mainSubject);

    const cacheKey = `lmp:aicoach:${className}:${mainSubject}:${chapter}`;
    const pendingKey = `lmp:aicoach:pending:${className}:${mainSubject}:${chapter}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await step.run("DB Check", async () => {
        return await AiCoach.findOne({
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
        return { steps: safeDBContent.steps, source: "database" };
      }

      // -------------------------------------------------------------------
      // 2️⃣ BUILD PROMPT (UNCHANGED)
      // -------------------------------------------------------------------
       const prompt = `
You are an API. Output ONLY valid JSON.

Class ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

STRICT LANGUAGE RULE:
If the subject is Hindi or Sanskrit → response ONLY in Hindi.
Otherwise → response ONLY in English. DO NOT USE Hindi for English or any other subject.
If this rule is violated, regenerate the answer.

TASK:
Give EXACTLY 6 revision steps.

JSON:
{
  "steps":[
     {"priority":1,"action":"...","formula":""}
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

      if (!parsed.steps || !Array.isArray(parsed.steps)) {
        throw new Error("Invalid AI Coach format");
      }

      parsed.steps.sort((a, b) => a.priority - b.priority);

      const safeParsed = JSON.parse(JSON.stringify(parsed));

      // -------------------------------------------------------------------
      // 5️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await AiCoach.create({
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

      return { steps: safeParsed.steps, source: "generated" };

    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`generateAICoach error: ${err.message}`);
    }
  }
);
