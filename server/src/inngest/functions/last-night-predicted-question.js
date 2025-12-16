import { inngest } from "../../libs/inngest.js";
import { PredictedQuestionModel } from "../../models/LastMinuteBeforeExam/predictedQuestion.model.js";
import { parseSubject, detectCategory } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";
import { lastMinuteExtractJson as extractJSON } from "./extractJsonForFunctions/lastMinuteExtractJson.js";

export const lastNightPredictedQuestionsFn = inngest.createFunction(
  {
    id: "lmp-predicted-questions",
    name: "Generate LMP Predicted Questions",
    retries:1,
  },
  { event: "lmp/generate.predictedQuestions" },
  async ({ event, step }) => {
    const { className, subject, chapter } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);
    const category = detectCategory(mainSubject);

    const cacheKey = `lmp:predicted:${className}:${mainSubject}:${chapter}`;
    const pendingKey = `lmp:predicted:pending:${className}:${mainSubject}:${chapter}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await step.run("DB Check", async () => {
        return await PredictedQuestionModel.findOne({
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
        return { questions: safeDBContent, source: "database" };
      }

      // -------------------------------------------------------------------
      // 2️⃣ BUILD PROMPT (UNCHANGED)
      // -------------------------------------------------------------------
  const prompt = `
You are an API that returns ONLY valid JSON. No extra text, no markdown, no explanation outside JSON.

Class: ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

TASK:
Generate EXACTLY 6 high-probability CBSE Board exam questions for this chapter.

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
      // 4️⃣ EXTRACT JSON
      // -------------------------------------------------------------------
      const parsed = extractJSON(aiRaw);

      parsed.questions.forEach((q, idx) => {
        if (!q.question) {
          throw new Error(`Invalid question at index ${idx}`);
        }
      });

      const safeParsed = JSON.parse(JSON.stringify(parsed));

      // -------------------------------------------------------------------
      // 5️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await PredictedQuestionModel.create({
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

      return { questions: safeParsed, source: "generated" };

    } catch (err) {
      // IMPORTANT: clear pending on failure
      await redis.del(pendingKey);
      throw new Error(`generatePredictedQuestions error: ${err.message}`);
    }
  }
);
