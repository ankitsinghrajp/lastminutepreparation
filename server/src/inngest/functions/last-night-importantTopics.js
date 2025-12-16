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
You are a CBSE Board exam expert.
Think internally first, but DO NOT show your thinking.
You are an API that returns ONLY valid JSON.

Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}
Stream: ${category}

STRICT LANGUAGE RULE (ABSOLUTE):
- If subject is Hindi → read the chapter deeply and write topic names and explanations ONLY in Hindi.
- If subject is Sanskrit → read the chapter deeply and write topic names and explanations ONLY in Sanskrit.
- Otherwise → write topic names and explanations ONLY in English.
- DO NOT mix languages.
- If violated, regenerate the output.

SUBJECT TYPE SAFETY (CRITICAL):
- If subject is a LANGUAGE SUBJECT (English, Hindi, Sanskrit):
  → The "formula" field MUST ALWAYS be an empty string "".
  → NEVER include formulas, equations, symbols, LaTeX, or mathematical expressions.
- If subject is NOT a language subject:
  → Include a formula ONLY if it is:
     • commonly asked in CBSE exams
     • directly linked to that topic
  → Do NOT force formulas where they are not needed.

TASK:
Select EXACTLY 6 MOST IMPORTANT, HIGH-SCORING, and FREQUENTLY ASKED
CBSE Board exam topics from this chapter.

SELECTION INTELLIGENCE (VERY IMPORTANT):
- Prefer topics that:
  • Appear repeatedly in PYQs
  • Are asked for 3–5 marks
  • Are derivation / numerical / law / definition based (non-language subjects)
  • Are themes, character traits, literary devices, grammar rules (language subjects)
- Avoid:
  • Rarely asked theory
  • Overly generic or vague topics

CONTENT RULES:
- EXACTLY 6 topics (strict)
- Explanation must be 1–2 lines only
- Write like a topper: direct, exam-focused, no extra theory
- No introductions, no background story
- No subtopic lists inside topic names

FORMULA FIELD RULES (STRICT AND SUBJECT-AWARE):

- If subject is a LANGUAGE SUBJECT (English, Hindi, Sanskrit):
  → The "formula" field MUST ALWAYS be an empty string "".
  → NEVER include formulas, symbols, equations, or LaTeX.

- If subject is Mathematics:
  → ALWAYS include a standard mathematical expression, notation, or formula
    if the topic has ANY of the following:
      • definition-based mathematical notation
      • functional notation
      • set notation
      • symbolic representation
  → Examples you MUST include when applicable:
      • A × B
      • f(x)
      • f⁻¹(x)
      • (f ∘ g)(x) = f(g(x))
      • Domain = { x | condition }
  → Use empty string "" ONLY if absolutely no standard notation exists (very rare).

- If subject is Physics or Chemistry:
  → Include formula ONLY when a standard CBSE formula is directly linked to the topic.
  → Do NOT force formulas for pure theory topics.

- For Mathematics subjects:
- If a topic has a standard symbolic representation, definition using symbols, or commonly written mathematical form in NCERT or CBSE answers, you MUST include at least one appropriate formula or notation.
- Do NOT restrict formulas only to numericals or derivations.
- Use empty string "" ONLY when the topic is purely verbal and no standard mathematical notation is used in exams.


LATEX RULE (NON-LANGUAGE SUBJECTS):
- Use ONLY pure LaTeX syntax
- NO $$, NO $, NO markdown


OUTPUT FORMAT (STRICT JSON ONLY):
{
  "topics": [
    {
      "topic": "High probability CBSE topic name",
      "explanation": "1–2 line crisp, scoring-oriented explanation",
      "formula": ""
    }
  ]
}

IMPORTANT FORMULA SEPARATION RULE (STRICT):
- NEVER write any mathematical formula, equation, algebraic expression, or symbolic notation inside the "explanation" field.
- ALL formulas, equations, identities, and mathematical symbols MUST appear ONLY inside the "formula" field.
- The "explanation" field must contain ONLY verbal description in plain text.
- If a formula appears in the explanation, regenerate the output.


CRITICAL CONSTRAINTS:
- Output ONLY the JSON object
- NO extra text before or after JSON
- EXACTLY 6 topics
- Language subjects must NEVER contain formulas
- Do NOT invent formulas
- Every topic must be exam-relevant and high scoring
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
