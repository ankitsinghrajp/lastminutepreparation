import { inngest } from "../../libs/inngest.js";
import { ImpQuestionModel } from "../../models/ImportantQuestionsPage/impquestions.model.js";
import { parseSubject } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";

export const importantQuestionGeneratorFn = inngest.createFunction(
  {
    name: "Generate Important Question Set",
    id: "important-question-generator",
    retries: 1,
  },
  { event: "lmp/generate.importantQuestions" },
  async ({ event, step }) => {
    const { className, subject, chapter, index } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);

    const topics =
      Array.isArray(index) && index.length > 0
        ? JSON.stringify(index)
        : "All key topics";

    const cacheKey = `lmp:impQ:${className}:${mainSubject}:${chapter}:${topics}`;
    const pendingKey = `lmp:impQ:pending:${className}:${mainSubject}:${chapter}:${topics}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await step.run("DB Check", async () => {
        return await ImpQuestionModel.findOne({
          className,
          subject: mainSubject,
          chapter,
        });
      });

      if (dbCache) {
        const safeData = JSON.parse(JSON.stringify(dbCache.content));

        await step.run("Save Redis", async () => {
          await redis.set(cacheKey, JSON.stringify(safeData), {
            EX: 60 * 60 * 24 * 2,
          });
        });

        await redis.del(pendingKey);
        return { source: "database" };
      }

 // 2️⃣ PREPARE PROMPT (UNTOUCHED)
 const prompt = `
You are a CBSE Exam Expert. First read the ncert chapter first that is provided in deeply. Think deeply do not show it. Generate ONLY HIGH-VALUE QUESTIONS (95% chance) that come frequently in CBSE Boards.

Return **VALID JSON only** (no markdown, no backticks).

INPUT:
Class: ${className}
Subject: ${subject}
Chapter: ${chapter}
Topics: ${topics}

NCERT BOOK NAME: ${bookName}

OUTPUT JSON STRUCTURE:
{
  "chapter": "<chapter name>",
  "whyImportant": "<2 lines explaining why this chapter is important for exam>",
  
  "importantQuestions": [
    {
      "question": "<Most expected question>",
      "marks": "<1/2/3/5>",
      "whyThisIsImportant": "<1–2 lines>",
      "keywords": ["keyword1", "keyword2"],
      "modelAnswer": "<Simple English answer written exactly like exam>"
    }
  ],

  "mustPracticeNumericals": [
    {
      "question": "<numerical question if subject needs>",
      "marks": "<2/3/5>",
      "formulaUsed": ["formula1", "formula2"],
      "solutionSteps": "Step 1: ... Step 2: ... Step 3: ...",
      "commonMistake": "<common student mistake>"
    }
  ],

  "veryShortQuestions": [
    {
      "question": "<1 mark conceptual question>",
      "answer": "<crisp answer>",
      "keywords": ["term1"]
    }
  ],

  "longAnswerQuestions": [
    {
      "question": "<expected 5-mark or derivation question>",
      "structure": "Intro → Point 1 → Point 2 → Diagram → Conclusion",
      "modelAnswer": "<full answer student can copy>",
      "diagramTip": "<if diagram needed>"
    }
  ],

  "examStrategy": {
    "howToAttempt": ["tip1", "tip2"],
    "mustRevise": ["topic1", "topic2"],
    "avoidMistakes": ["mistake1", "mistake2"]
  }
}

Requirements:
- Minimum 10 important questions.
- All answers in simple CBSE-friendly language.
- No complex words.
- All JSON must be strictly valid.
`.trim();

      // -------------------------------------------------------------------
      // 3️⃣ CALL OPENAI
      // -------------------------------------------------------------------
      const aiRaw = await step.run("Call OpenAI",async () => {
        return await askOpenAI(prompt);
      });

      // -------------------------------------------------------------------
      // 4️⃣ PARSE + VALIDATE (UNCHANGED LOGIC)
      // -------------------------------------------------------------------
      let finalQuestions;
      try {
        const clean = aiRaw
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        finalQuestions = JSON.parse(clean);

        const required = [
          "chapter",
          "importantQuestions",
          "veryShortQuestions",
          "longAnswerQuestions",
          "examStrategy",
        ];

        const missing = required.filter((f) => !finalQuestions[f]);
        if (missing.length > 0) {
          throw new Error("Missing required fields: " + missing.join(", "));
        }
      } catch (err) {
        throw new Error("Failed to parse AI response: " + err.message);
      }

      // -------------------------------------------------------------------
      // 5️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await ImpQuestionModel.create({
          className,
          subject: mainSubject,
          chapter,
          content: finalQuestions,
        });
      });

      // -------------------------------------------------------------------
      // 6️⃣ SAVE REDIS
      // -------------------------------------------------------------------
      await step.run("Save Redis", async () => {
        await redis.set(cacheKey, JSON.stringify(finalQuestions), {
          EX: 60 * 60 * 24 * 2,
        });
      });

      await redis.del(pendingKey);

      return { source: "generated" };
    } catch (err) {
      await redis.del(pendingKey);
      throw new Error(`importantQuestionGenerator error: ${err.message}`);
    }
  }
);
