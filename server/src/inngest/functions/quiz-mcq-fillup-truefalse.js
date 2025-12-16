import { inngest } from "../../libs/inngest.js";
import { McqModel } from "../../models/ImportantMcqsTrueFalse/mcq.model.js"; 
import { parseSubject } from "../../utils/helper.js";
import { askOpenAI } from "../../utils/OpenAI.js";
import { redis } from "../../libs/redis.js";

export const quizMcqFillupTrueFalseFn = inngest.createFunction(
  {
    name: "Generate Quiz (MCQ, Fillups, True/False)",
    id: "quiz-mcq-fillup-truefalse",
    retries:1,
  },
  { event: "lmp/generate.quizMcqFillupTrueFalse" },
  async ({ event, step }) => {
    const { className, subject, chapter, index } = event.data;
    const { mainSubject, bookName } = parseSubject(subject);

    const topics =
      Array.isArray(index) && index.length > 0
        ? JSON.stringify(index)
        : "All key topics";

    const cacheKey = `lmp:quiz:${className}:${mainSubject}:${chapter}:${topics}`;
    const pendingKey = `lmp:quiz:pending:${className}:${mainSubject}:${chapter}:${topics}`;

    try {
      // -------------------------------------------------------------------
      // 1️⃣ DB CHECK
      // -------------------------------------------------------------------
      const dbCache = await step.run("DB Check", async () => {
        return await McqModel.findOne({
          className,
          subject: mainSubject,
          chapter,
        });
      });

      if (dbCache) {
        const safeDBData = JSON.parse(JSON.stringify(dbCache.content));

        await step.run("Save Redis", async () => {
          await redis.set(cacheKey, JSON.stringify(safeDBData), {
            EX: 60 * 60 * 24 * 2,
          });
        });

        await redis.del(pendingKey);
        return { source: "database" };
      }

     // 3️⃣ RAW PROMPT (UNTOUCHED)
  const prompt = `You are a CBSE Board exam question generator.

You MUST return ONLY valid JSON.
NO markdown.
NO backticks.
NO explanation.
NO text before or after JSON.

🚨 OUTPUT MUST MATCH THIS STRUCTURE EXACTLY 🚨  
(Do NOT add fields, do NOT remove fields, do NOT rename anything)

REQUIRED JSON FORMAT:
{
  "chapter": "<chapter name>",
  "class": "<class name>",
  "subject": "<subject name>",
  "questions": [
    {
      "id": 1,
      "type": "mcq | fillup | true_false",
      "question": "<question text>",
      "options": ["A", "B", "C", "D"],   // REQUIRED ONLY FOR MCQ
      "answer": "<correct answer>"
    }
  ]
}

STRICT RULES (NON-NEGOTIABLE):

1. The root object MUST contain EXACTLY these keys:
   - chapter
   - class
   - subject
   - questions

2. "questions" MUST be an array of objects.

3. Each question object MUST contain:
   - id (number, starting from 1, continuous, no gaps)
   - type ("mcq", "fillup", or "true_false")
   - question (string)
   - answer (string)

4. For "mcq":
   - MUST contain "options"
   - "options" MUST have EXACTLY 4 strings
   - "answer" MUST EXACTLY match one option

5. For "fillup":
   - MUST NOT contain "options"
   - Question MUST contain "______"

6. For "true_false":
   - MUST NOT contain "options"
   - "answer" MUST be EXACTLY "True" or "False"

7. TOTAL QUESTIONS:
   - Minimum 15
   - Maximum 20
   - Include ALL THREE TYPES

8. LANGUAGE:
   - If subject is Hindi → Hindi only
   - If subject is Sanskrit → Sanskrit only
   - Otherwise → English only

9. CONTENT:
   - Questions must be CBSE exam relevant
   - Based on NCERT
   - High probability board questions only

10. JSON MUST be parseable using JSON.parse().
    If any rule is violated → regenerate silently and fix.

INPUT DATA:
Class: ${className}
Subject: ${mainSubject}
Chapter: ${chapter}
Book: ${bookName}
Topics: ${topics}

RETURN ONLY THE JSON OBJECT.
`.trim();

      // -------------------------------------------------------------------
      // 3️⃣ CALL OPENAI
      // -------------------------------------------------------------------
      const aiRaw = await step.run("Call OpenAI", async () => {
        return await askOpenAI(prompt);
      });

      // -------------------------------------------------------------------
      // 4️⃣ PARSE + VALIDATE (UNCHANGED)
      // -------------------------------------------------------------------
      let finalQuestions;
      try {
        const cleaned = aiRaw
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        finalQuestions = JSON.parse(cleaned);

        const requiredFields = ["questions"];
        const missingFields = requiredFields.filter(
          (f) => !finalQuestions[f]
        );

        if (missingFields.length > 0) {
          throw new Error(
            "Missing required fields: " + missingFields.join(", ")
          );
        }

        if (
          !Array.isArray(finalQuestions.questions) ||
          finalQuestions.questions.length === 0
        ) {
          throw new Error("Questions array is empty or invalid");
        }
      } catch (err) {
        throw new Error("Failed to parse AI response: " + err.message);
      }

      // -------------------------------------------------------------------
      // 5️⃣ SAVE DB
      // -------------------------------------------------------------------
      await step.run("Save DB", async () => {
        await McqModel.create({
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
      throw new Error(`quizMcqFillupTrueFalse error: ${err.message}`);
    }
  }
);
