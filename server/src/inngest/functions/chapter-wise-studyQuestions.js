import { inngest } from "../../libs/inngest.js";
import { ChapterWiseImportantQuestionModel } from "../../models/chapterWiseStudy/chapterWiseImportantQuestion.model.js";
import { parseSubject, detectCategory } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";
import { chapterWiseExtractJson as extractJSON } from "./extractJsonForFunctions/chapterWiseExtractJson.js";
export const chapterWiseStudyQuestionsFn = inngest.createFunction(
  {
    name: "Generate Chapter Wise Study Questions",
    id: "chapter-wise-study-questions",
    retries: 1,
  },
  { event: "lmp/generate.chapterWiseStudyQuestions" },
  async ({ event, step }) => {
    const { className, subject, chapter } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(subject); // ✅ correct input

    const cacheKey = `lmp:studyq:${className}:${mainSubject}:${chapter}`;
    const pendingKey = `lmp:studyq:pending:${className}:${mainSubject}:${chapter}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbData = await step.run("DB Check", async () => {
        return await ChapterWiseImportantQuestionModel.findOne({
          className,
          subject: mainSubject,
          chapter,
        });
      });

      if (dbData) {
        const safeDBContent = JSON.parse(JSON.stringify(dbData.content));

        await step.run("Save Redis", async () => {
          await redis.set(cacheKey, JSON.stringify(safeDBContent), {
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
You are an API that returns ONLY valid JSON. No extra text, no markdown, no explanation outside JSON.

Class: ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

TASK:
Generate EXACTLY 10 high-probability CBSE Board exam questions for this chapter.

STRICT LANGUAGE RULE:
If the subject is Hindi → give questions ONLY in Hindi.
If the subject is Sanskrit -> give questions ONLY in Sanskrit
Otherwise → answer ONLY in English. DO NOT USE Hindi for English or any other subject.
If this rule is violated, regenerate the answer.

RULES:
- Focus on NCERT back exercise questions and previous year CBSE questions (PYQs)
- Include questions that are repeatedly asked in CBSE board exams
- Mix of short answer (2-3 marks) and long answer (5 marks) questions
- Questions should cover important concepts, derivations, numericals, and theory
- Each question must be complete and exam-ready

OUTPUT FORMAT (strict JSON only):
{
  "questions": [
    {
      "question": "Complete question statement here"
    },
    {
      "question": "Second complete question"
    }
  ]
}

CRITICAL:
- Return ONLY the JSON object
- NO markdown code blocks
- NO backticks
- NO extra text before or after JSON
- All questions must be CBSE exam pattern based
- Questions should be from NCERT exercises or similar to PYQs
`.trim();

      // -------------------------------------------------------------------
      // 3️⃣ CALL OPENAI
      // -------------------------------------------------------------------
      const aiRaw = await step.run("Call OpenAI", async () => {
        return await askOpenAI(prompt);
      });

      // -------------------------------------------------------------------
      // 4️⃣ PARSE + VALIDATE
      // -------------------------------------------------------------------
      const parsed = await step.run("Extract JSON", async () => {
        return extractJSON(aiRaw);
      });

      parsed.questions.forEach((q, idx) => {
        if (!q.question) {
          throw new Error(`Invalid question structure at index ${idx}`);
        }
      });

      const safeParsed = JSON.parse(JSON.stringify(parsed));

      // -------------------------------------------------------------------
      // 5️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await ChapterWiseImportantQuestionModel.create({
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

      return { source: "generated" };
    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`chapterWiseStudyQuestions error: ${err.message}`);
    }
  }
);
