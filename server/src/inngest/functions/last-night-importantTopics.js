import { inngest } from "../../libs/inngest.js";
import { ImpTopicsModel } from "../../models/LastMinuteBeforeExam/impTopics.model.js";
import { parseSubject, detectCategory } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";
import { lastMinuteExtractJson as extractJSON } from "./extractJsonForFunctions/lastMinuteExtractJson.js";
export const lastNightImportantTopicsFn = inngest.createFunction(
  { name: "Generate LMP Important Topics",
    id: "last-night-important-topics",
    retries:1,
   },
  { event: "lmp/generate.importantTopics" },
  async ({ event, step }) => {
    try {
      const { className, subject, chapter } = event.data;
      const { mainSubject, bookName } = parseSubject(subject);
      const category = detectCategory(mainSubject);

      const cacheKey = `lmp:imptopics:${className}:${mainSubject}:${chapter}`;
      const pendingKey = `lmp:imptopics:pending:${className}:${mainSubject}:${chapter}`;

      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await step.run("DB Check", async () => {
        return await ImpTopicsModel.findOne({
          className,
          subject: mainSubject,
          chapter,
        });
      });

      if (dbCache) {
        const safeDBContent = JSON.parse(JSON.stringify(dbCache.content));

        await step.run("Save Redis", async () => {
          await redis.set(cacheKey, JSON.stringify(safeDBContent), {
            EX: 60 * 60 * 24 * 2,
          });
        });

        await redis.del(pendingKey);
        return { topics: safeDBContent, source: "database" };
      }

      // -------------------------------------------------------------------
      // 2️⃣ BUILD PROMPT (UNCHANGED)
      // -------------------------------------------------------------------
      const prompt = await step.run("Build Prompt", async () => {
        return `

You are an API that returns ONLY valid JSON. No extra text, no markdown, no explanation outside JSON.

Class: ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

STRICT LANGUAGE RULE:
If the subject is Hindi or Sanskrit → topic names and explanations must be written ONLY in Hindi.
Otherwise → topics and explanations ONLY in English. DO NOT USE Hindi for English or any other subject.
If this rule is violated, regenerate the answer.

TASK:
List EXACTLY 6 most important CBSE Board exam topics from this chapter that are frequently asked and carry high marks.

RULES:
- Focus on topics that appear most in CBSE question papers
- Include derivations, numericals, definitions, and theory-based topics as per CBSE pattern
- Explanation must be 1-2 lines maximum — crisp and exam-focused
- Formula field rules:
  * Use pure LaTeX syntax only (e.g., \\frac{a}{b}, \\sqrt{x}, \\alpha, \\theta, etc.)
  * Write formulas WITHOUT any $$ or $ symbols
  * If no formula is needed, use empty string ""
  * Example: "F = ma" or "v = u + at" or "\\frac{1}{2}mv^2"

OUTPUT FORMAT (strict JSON only):
{
  "topics": [
    {
      "topic": "Topic name here",
      "explanation": "Short exam-focused explanation in 1-2 lines",
      "formula": "LaTeX formula without $$ wrapper or empty string"
    },
    {
      "topic": "Second topic name",
      "explanation": "Brief explanation",
      "formula": ""
    }
  ]
}

CRITICAL:
- Return ONLY the JSON object
- NO markdown code blocks
- NO backticks
- NO extra text before or after JSON
- Ensure all 6 topics are CBSE exam relevant
`.trim();
      });

      // -------------------------------------------------------------------
      // 3️⃣ CALL OPENAI
      // -------------------------------------------------------------------
      const aiRaw = await step.run("Call OpenAI" ,async () => {
        return await askOpenAI(prompt);
      });

      // -------------------------------------------------------------------
      // 4️⃣ EXTRACT JSON
      // -------------------------------------------------------------------
      const parsed = await step.run("Extract JSON", async () => {
        return extractJSON(aiRaw);
      });

      if (!parsed.topics || !Array.isArray(parsed.topics)) {
        throw new Error("Invalid topics format");
      }

      const safeParsed = JSON.parse(JSON.stringify(parsed));

      // -------------------------------------------------------------------
      // 5️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await ImpTopicsModel.create({
          className,
          subject: mainSubject,
          chapter,
          content: safeParsed,
        });
      });

      // -------------------------------------------------------------------
      // 6️⃣ SAVE REDIS
      // -------------------------------------------------------------------
      await step.run("Save Redis", async () => {
        await redis.set(cacheKey, JSON.stringify(safeParsed), {
          EX: 60 * 60 * 24 * 2,
        });
      });

      await redis.del(pendingKey);

      return { topics: safeParsed.topics, source: "generated" };


    } catch (err) {
      throw new Error(`generateImportantTopics error: ${err.message}`);
    }
  }
);
