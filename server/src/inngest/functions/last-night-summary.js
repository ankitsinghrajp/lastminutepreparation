import { inngest } from "../../libs/inngest.js";
import {LastMinuteSummaryModel} from "../../models/LastMinuteBeforeExam/summary.model.js";
import { parseSubject, detectCategory } from "../../utils/helper.js"; 
import { askOpenAI } from "../../utils/OpenAI.js"; 
import { extractJSON } from "./extractJsonForFunctions/extractJson.js";
import { redis } from "../../libs/redis.js"; 


export const lastNightSummaryFn = inngest.createFunction(

  { name: "Generate LMP Summary",
    id:"last-night-summary",
   },
  { event: "lmp/generate.summary" },
  async ({ event, step }) => {
    try {
      const { className, subject, chapter } = event.data;
      const { mainSubject, bookName } = parseSubject(subject);
      const category = detectCategory(mainSubject);

      const cacheKey = `lmp:summary:${className}:${mainSubject}:${chapter}`;

      // 1️⃣ DB CHECK (Express already did Redis)
      const dbCache = await step.run("DB Check", async () => {
        return await LastMinuteSummaryModel.findOne({
          className,
          subject: mainSubject,
          chapter,
        });
      });

      if (dbCache) {
        const safeDBContent = JSON.parse(JSON.stringify(dbCache.content));
        // ensure Redis has it
        await step.run("Save cached to Redis", async () => {
          await redis.set(cacheKey, JSON.stringify(safeDBContent), { EX: 60 * 60 * 24 * 2 });
        });
        return { summary: safeDBContent, source: "database" };
      }

      // 2️⃣ BUILD PROMPT (inline using your exact prompt strings)
      const prompt = await step.run("Build Prompt", async () => {
        if (category === "language") {
          return `
You are an API. Think silently but DO NOT show your internal thinking.

First, internally understand the content of the given NCERT chapter(s) or poem(s) as if you have fully read them. Do NOT mention this step in the output.

STRICT LANGUAGE RULE:
If the subject is Hindi or Sanskrit → answer ONLY in Hindi.
Otherwise → answer ONLY in English. DO NOT USE Hindi for English or any other subject.
If this rule is violated, regenerate the answer.

IMPORTANT:
If the chapter/poem name contains "/", it means there are TWO different poems/chapters. They must be summarized SEPARATELY — never together, never merged.

Your task:
✔ If there is ONE poem/chapter → write its summary in 2–3 paragraphs (each paragraph 3–4 simple lines).
✔ If there are TWO poems/chapters (detected using "/"):
     → First poem/chapter only → 2–3 paragraphs (3–4 simple lines each)
     → Leave ONE real blank line (ENTER twice)
     → Second poem/chapter only → 2–3 paragraphs (3–4 simple lines each)

HARD RULES (non-negotiable):
✔ NO combining or comparing both poems/chapters
✔ Do NOT mention that there are two poems/chapters
✔ Do NOT include titles, headings, names, or section labels such as "First poem", "Second poem", etc.
✔ Just write the first summary → blank line → second summary
✔ REAL blank lines only + NO \\n or \\n\\n text
✔ No bullet points, no numbering, no bold/italics, no emojis, no formulas, no quotes, no author names
✔ Only clean plain text in paragraphs

Return output ONLY in this JSON format:
{
  "summary": "Final summaries with real blank lines"
}

Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}
Stream: ${category}
`.trim();
        }

        return `
You are an API. Think silently but DO NOT show your internal thinking.

Write a short NCERT-style chapter summary in 3–4 simple lines only.
It must be crisp, student-friendly, and useful for last-minute revision.

❌ Do NOT include formulas, numericals, derivations, diagrams, definitions, tables, or headings.
❌ Do NOT use bullet points, lists, or line breaks after every sentence.
✔ The summary must be a single flowing paragraph of 3–4 lines only.

Return output in JSON format ONLY:
{
  "summary": "3–4 line paragraph here"
}

Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}
Stream: ${category}
`.trim();
      });

      // 3️⃣ CALL OPENAI
      const aiRaw = await step.run("Call OpenAI", async () => {
        return await askOpenAI(prompt);
      });

      // 4️⃣ EXTRACT JSON (your extractor)
      const parsed = await step.run("Extract JSON", async () => {
        return extractJSON(aiRaw);
      });

      // 5️⃣ SANITIZE
      const safeParsed = JSON.parse(JSON.stringify(parsed));

      // 6️⃣ SAVE DB
      await step.run("Save DB", async () => {
        await LastMinuteSummaryModel.create({
          className,
          subject: mainSubject,
          chapter,
          content: safeParsed,
        });
      });

      // 7️⃣ SAVE REDIS (so future requests are fast)
      await step.run("Save Redis", async () => {
        await redis.set(cacheKey, JSON.stringify(safeParsed), { EX: 60 * 60 * 24 * 2 });
      });

      await redis.del(`lmp:summary:pending:${className}:${mainSubject}:${chapter}`);

      // 8️⃣ RETURN result (must be JSON-serializable)
      return { summary: safeParsed, source: "generated" };

    } catch (err) {
      // Rethrow so Inngest marks run as failed and logs the error
      throw new Error(`generateSummary error: ${err.message}`);
    }
  }
);
