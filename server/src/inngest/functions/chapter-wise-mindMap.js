import { inngest } from "../../libs/inngest.js";
import { ChapterWiseMindMapModel } from "../../models/chapterWiseStudy/chapterWiseMindMap.model.js";
import { parseSubject } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";
import { chapterWiseExtractJson as extractJSON } from "./extractJsonForFunctions/chapterWiseExtractJson.js";
export const chapterWiseMindMapFn = inngest.createFunction(
  {
    name: "Generate Chapter Wise MindMap",
    id: "chapter-wise-mindmap",
    retries: 0,
  },
  { event: "lmp/generate.chapterWiseMindMap" },
  async ({ event, step }) => {
    const { className, subject, chapter } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);

    const cacheKey = `lmp:mindmap:${className}:${mainSubject}:${chapter}`;
    const pendingKey = `lmp:mindmap:pending:${className}:${mainSubject}:${chapter}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbData = await step.run("DB Check", async () => {
        return await ChapterWiseMindMapModel.findOne({
          className,
          subject: mainSubject,
          chapter,
        });
      });

      if (dbData) {
        const safeDB = JSON.parse(JSON.stringify(dbData.content));

        await step.run("Save Redis", async () => {
          await redis.set(cacheKey, JSON.stringify(safeDB), {
            EX: 60 * 60 * 24 * 2,
          });
        });

        return { source: "database" };
      }

      // -------------------------------------------------------------------
      // 2️⃣ PROMPT (UNCHANGED)
      // -------------------------------------------------------------------
   const prompt = `
You are a CBSE Board expert. Your ONLY task:

➡ Generate React-Flow compatible JSON mindmap for the chapter.

⚠ STRICT RULES:
Return ONLY valid JSON with EXACTLY:

{
  "nodes": [
    { "id": "1", "label": "Main Topic", "x": 0, "y": 0 }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" }
  ]
}

RULES FOR MINDMAP:
- "nodes" must be an array of objects:
    { id, label, x, y }
- "edges" must be an array of:
    { id, source, target }
- Node IDs MUST be unique numbers as strings: "1", "2", "3"...
- Parent node connects to child with edges.
- x/y coordinates must be auto-generated but simple layout:
    root → x:0,y:0
    children: x:300,y:(index*150)
    grandchildren: x:600,y:(index*150)

DATA RULES:
- Convert the entire chapter into:
    Root → Main topics → Subtopics
- Keep labels short and exam-friendly
- NO markdown
- NO backticks
- NO paragraphs
- NO extra explanation before or after JSON

Generate for:
Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}
`.trim();

      // -------------------------------------------------------------------
      // 3️⃣ CALL OPENAI
      // -------------------------------------------------------------------
      const aiRaw = await step.run("Call OpenAI",async () => {
        return await askOpenAI(prompt);
      });

      // -------------------------------------------------------------------
      // 4️⃣ PARSE + VALIDATE
      // -------------------------------------------------------------------
      const parsed = await step.run("Extract JSON", async () => {
        return extractJSON(aiRaw);
      });

      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
        throw new Error("Invalid mindmap JSON");
      }

      const safeParsed = JSON.parse(JSON.stringify(parsed));

      // -------------------------------------------------------------------
      // 5️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await ChapterWiseMindMapModel.create({
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
      throw new Error(`chapterWiseMindMap error: ${err.message}`);
    }
  }
);
