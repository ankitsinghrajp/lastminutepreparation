import { inngest } from "../../libs/inngest.js";
import { ChapterWiseSummaryModel } from "../../models/chapterWiseStudy/chapterWiseSummary.model.js";
import { parseSubject, detectCategory } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";
import { chapterWiseExtractJson as extractJSON } from "./extractJsonForFunctions/chapterWiseExtractJson.js";
export const smartChapterSummaryFn = inngest.createFunction(
  {
    name: "Generate Smart Chapter Summary",
    id: "smart-chapter-summary",
    retries: 0,
  },
  { event: "lmp/generate.smartChapterSummary" },
  async ({ event, step }) => {
    const { className, subject, chapter } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(mainSubject);

    const cacheKey = `lmp:smartsummary:${className}:${mainSubject}:${chapter}`;
    const pendingKey = `lmp:smartsummary:pending:${className}:${mainSubject}:${chapter}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await step.run("DB Check", async () => {
        return await ChapterWiseSummaryModel.findOne({
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

        return { source: "database" };
      }

      // -------------------------------------------------------------------
      // 2️⃣ PROMPT (UNCHANGED LOGIC)
      // -------------------------------------------------------------------
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
✔ If there is ONE poem/chapter → write its summary in 2–3 paragraphs (each paragraph 5–6 simple lines).
✔ If there are TWO poems/chapters (detected using "/"):
     → First poem/chapter only → 2–3 paragraphs (5-6 simple lines each)
     → Leave ONE real blank line (press ENTER twice so there is a real empty line)
     → Second poem/chapter only → 2–3 paragraphs (5-6 simple lines each)

HARD RULES (non-negotiable):
✔ NO combining or comparing both poems/chapters
✔ Do NOT mention that there are two poems/chapters
✔ Do NOT include titles, headings, names, or section labels such as "First poem", "Second poem", etc.
✔ Just write the first summary → blank line → second summary

✔ USE REAL BLANK LINES ONLY:
  - The summary text INSIDE the JSON value MUST include actual newline characters (U+000A).
  - Do NOT output the two-character sequence backslash + n (that is, do NOT output "\\n" or "\\n\\n" anywhere).
  - Do NOT escape newlines as literal backslash sequences. Use real Enter key line breaks.
  - Do NOT include backslash characters immediately before the letter n (no \\n anywhere).
  - The blank line between summaries must be produced by pressing ENTER twice (one empty line between paragraphs).

✔ No bullet points, no numbering, no bold/italics, no emojis, no formulas, no quotes, no author names
✔ Only clean plain text in paragraphs

Return output ONLY in this JSON format:
{
  "summary": "Final summaries with real blank lines (use actual newlines; do not use backslash-n sequences)"
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

Write a short NCERT-style chapter summary in **5-6 simple lines** only.
It must be crisp, student-friendly, and useful for last-minute revision.

❌ Do NOT include formulas, numericals, derivations, diagrams, definitions, tables, or headings.
❌ Do NOT use bullet points, lists, or line breaks after every sentence.
✔ The summary must be a **single flowing paragraph of 5-6 lines** only.

Return output in JSON format ONLY:
{
  "summary": "5-6 line paragraph here"
}

Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}
Stream: ${category}
`.trim();
      });

      // -------------------------------------------------------------------
      // 3️⃣ CALL OPENAI
      // -------------------------------------------------------------------
      const aiRaw = await step.run("Call OpenAI", async () => {
        return await askOpenAI(prompt,"gpt-5-mini");
      });

      // -------------------------------------------------------------------
      // 4️⃣ PARSE JSON
      // -------------------------------------------------------------------
      const parsed = await step.run("Extract JSON", async () => {
        return extractJSON(aiRaw);
      });

      const safeParsed = JSON.parse(JSON.stringify(parsed));

      // -------------------------------------------------------------------
      // 5️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await ChapterWiseSummaryModel.create({
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

      return { source: "generated" };
    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`smartChapterSummary error: ${err.message}`);
    }
  }
);
