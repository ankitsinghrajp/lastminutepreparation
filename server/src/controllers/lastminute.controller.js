import { redis } from "../libs/redis.js";
import { AiCoach } from "../models/LastMinuteBeforeExam/aiCoach.model.js";
import { ImpTopicsModel } from "../models/LastMinuteBeforeExam/impTopics.model.js";
import { LastMinuteMCQModel } from "../models/LastMinuteBeforeExam/lastMinuteMcq.model.js";
import { Booster } from "../models/LastMinuteBeforeExam/memoryBooster.model.js";
import { PredictedQuestionModel } from "../models/LastMinuteBeforeExam/predictedQuestion.model.js";
import { inngest } from "../libs/inngest.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { detectCategory, parseSubject } from "../utils/helper.js";
import { askOpenAI } from "../utils/OpenAI.js";

const extractJSON = (text) => {
  if (!text) throw new Error("Empty response received from AI.");

  text = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // Extract only JSON object
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("No JSON found.");

  let jsonString = text.substring(first, last + 1);

  jsonString = jsonString.replace(/\\/g, "\\\\");

  jsonString = jsonString.replace(/[\u0000-\u001F]+/g, " ");

  return JSON.parse(jsonString);
};

const LastMinutePanelSummary = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;

  if (!className || !subject || !chapter) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Missing class, subject or chapter"));
  }

  const { mainSubject } = parseSubject(subject);

  // Redis cache key
  const cacheKey = `lmp:summary:${className}:${mainSubject}:${chapter}`;

  // Pending flag key
  const pendingKey = `lmp:summary:pending:${className}:${mainSubject}:${chapter}`;

  // -------------------------------------------------------------------
  // 1️⃣ CHECK REDIS (FASTEST PATH)
  // -------------------------------------------------------------------
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      let finalData;

      if (typeof redisCached === "object") {
        finalData = redisCached;
      } else {
        try {
          finalData = JSON.parse(redisCached);
        } catch (err) {
          await redis.del(cacheKey); // corrupted → delete
        }
      }

      if (finalData) {
        return res
          .status(200)
          .json(new ApiResponse(200, finalData, "Summary Ready (Redis)"));
      }
    }
  } catch (err) {
    console.log("Redis GET error:", err);
  }

  // -------------------------------------------------------------------
  // 2️⃣ CHECK IF A JOB IS ALREADY RUNNING (PENDING FLAG)
  // -------------------------------------------------------------------
  const isPending = await redis.get(pendingKey);

  if (!isPending) {
    // No job running → queue Inngest job
    // Set pending flag so no duplicate Inngest jobs spawn
    await redis.set(pendingKey, "1", { EX: 120 }); // 2 min timeout safety

    await inngest.send({
      name: "lmp/generate.summary",
      data: { className, subject, chapter },
    });
  }

  // -------------------------------------------------------------------
  // 3️⃣ RETURN QUEUED RESPONSE (FRONTEND POLLS UNTIL READY)
  // -------------------------------------------------------------------
  return res
    .status(202)
    .json(new ApiResponse(202, null, "Summary generation queued"));
});



const LastMinutePanelImportantTopics = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);
  const category = detectCategory(mainSubject);

  // Redis Cache Key
  const cacheKey = `lmp:imptopics:${className}:${mainSubject}:${chapter}`;

  // 1️⃣ CHECK REDIS CACHE FIRST
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      // Upstash REST returns objects automatically
      if (typeof redisCached === "object") {
        return res
          .status(200)
          .json(new ApiResponse(200, redisCached, "Important Topics Ready "));
      }

      // fallback if string
      if (typeof redisCached === "string") {
       return res
          .status(200)
          .json(
            new ApiResponse(200, JSON.parse(redisCached), "Important Topics Ready ")
          );
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // 2️⃣ PROMPT (UNCHANGED)
  const prompt = `
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
`;

  try {
    // 3️⃣ CHECK DB CACHE
    const dbCache = await ImpTopicsModel.findOne({
      className,
      subject: mainSubject,
      chapter,
    });

    if (dbCache) {
      const safeDBContent = JSON.parse(JSON.stringify(dbCache.content));

      // Save to Redis for future faster response
      await redis.set(cacheKey, JSON.stringify(safeDBContent), {
        ex: 60 * 60 * 24 * 2, 
      });

      return res
        .status(200)
        .json(new ApiResponse(200, safeDBContent, "Important Topics Ready "));
    }

    // 4️⃣ GENERATE VIA OPENAI
    let output = await askOpenAI(prompt);
    const parsed = extractJSON(output);

    // validate
    if (!parsed.topics || !Array.isArray(parsed.topics)) {
      throw new Error("Invalid topics format");
    }

    parsed.topics.forEach((topic, idx) => {
      if (!topic.topic || !topic.explanation || topic.formula === undefined) {
        throw new Error(`Invalid topic structure at index ${idx}`);
      }
    });

    const safeParsed = JSON.parse(JSON.stringify(parsed));

    // 5️⃣ SAVE TO DB
    await ImpTopicsModel.create({
      className,
      subject: mainSubject,
      chapter,
      content: safeParsed,
    });

    // 6️⃣ SAVE TO REDIS
    await redis.set(cacheKey, JSON.stringify(safeParsed), {
      ex: 60 * 60 * 24 * 2,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, safeParsed, "Important Topics Ready"));
  } catch (error) {
    console.error("Topics generation failed:", error);
    return res.status(500).json(
      new ApiResponse(
        500,
        null,
        "Failed to generate topics. Please try again."
      )
    );
  }
});

const LastMinutePanelPredictedQuestions = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);
  const category = detectCategory(mainSubject);

  // Redis Cache Key
  const cacheKey = `lmp:predicted:${className}:${mainSubject}:${chapter}`;

  // 1️⃣ CHECK REDIS CACHE
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      // Upstash REST usually returns parsed object
      if (typeof redisCached === "object") {
      
        return res
          .status(200)
          .json(new ApiResponse(200, redisCached, "Predicted Questions Ready "));
      }

      // fallback: string → parse
      if (typeof redisCached === "string") {
        const parsed = JSON.parse(redisCached);
        return res
          .status(200)
          .json(new ApiResponse(200, parsed, "Predicted Questions Ready "));
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // ✨ PROMPT — UNTOUCHED & EXACT
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
`;

  try {
    // 2️⃣ CHECK DATABASE CACHE
    const dbCache = await PredictedQuestionModel.findOne({
      className,
      subject: mainSubject,
      chapter,
    });

    if (dbCache) {
      const safeDBContent = JSON.parse(JSON.stringify(dbCache.content));

      // warm redis
      await redis.set(cacheKey, JSON.stringify(safeDBContent), {
        ex: 60 * 60 * 24 * 2, 
      });

      return res
        .status(200)
        .json(new ApiResponse(200, safeDBContent, "Predicted Questions Ready "));
    }

    // 3️⃣ GENERATE USING AI
    let output = await askOpenAI(prompt);
    const parsed = extractJSON(output);

    // validation
    parsed.questions.forEach((q, idx) => {
      if (!q.question) {
        throw new Error(`Invalid question structure at index ${idx}`);
      }
    });

    const safeParsed = JSON.parse(JSON.stringify(parsed));

    // 4️⃣ SAVE TO DB
    await PredictedQuestionModel.create({
      className,
      subject: mainSubject,
      chapter,
      content: safeParsed,
    });

    // 5️⃣ SAVE TO REDIS
    await redis.set(cacheKey, JSON.stringify(safeParsed), {
      ex: 60 * 60 * 24 * 2,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, safeParsed, "Predicted Questions Ready"));
  } catch (error) {
    console.error("Predicted questions generation failed:", error);
    return res.status(500).json(
      new ApiResponse(
        500,
        null,
        "Failed to generate predicted questions. Please try again."
      )
    );
  }
});


const LastMinutePanelMCQs = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);
  const category = detectCategory(mainSubject);

  // Redis Cache Key
  const cacheKey = `lmp:mcqs:${className}:${mainSubject}:${chapter}`;

  // 1️⃣ CHECK REDIS CACHE FIRST
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      // Upstash REST returns JSON object directly
      if (typeof redisCached === "object") {
        return res
          .status(200)
          .json(new ApiResponse(200, redisCached, "Important MCQs Ready "));
      }

      // fallback if string
      if (typeof redisCached === "string") {
        const parsed = JSON.parse(redisCached);
        return res
          .status(200)
          .json(new ApiResponse(200, parsed, "Important MCQs Ready "));
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  //  PROMPT (UNCHANGED)
  const prompt = `
You are an API. Output ONLY valid JSON.

Class ${className} | Subject: ${mainSubject} | Book: ${bookName}
Chapter: ${chapter} | Stream: ${category}

Formula Rule: pure LaTeX only.

TASK:
Generate EXACTLY 5 MCQs.

JSON:
{
  "mcqs":[
    {
      "question":"...",
      "options":["...","...","...","..."],
      "correct":"...",
      "explanation":"...",
      "formula":""
    }
  ]
}
`;

  try {
    // 2️⃣ CHECK DATABASE CACHE
    const dbCache = await LastMinuteMCQModel.findOne({
      className,
      subject: mainSubject,
      chapter,
    });

    if (dbCache) {
      const safeDBContent = JSON.parse(JSON.stringify(dbCache.content));

      // save to redis
      await redis.set(cacheKey, JSON.stringify(safeDBContent), {
        ex: 60 * 60 * 24 * 2,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, safeDBContent, "Important MCQs Ready "));
    }

    // 3️⃣ GENERATE USING OPENAI
    let output = await askOpenAI(prompt);
    const parsed = extractJSON(output);

    // validation
    parsed.mcqs.forEach((mcq, idx) => {
      if (!mcq.question || !mcq.correct || !mcq.options)
        throw new Error(`Invalid MCQ structure at ${idx}`);

      if (!Array.isArray(mcq.options) || mcq.options.length !== 4)
        throw new Error(`MCQ ${idx} must contain exactly 4 options`);

      if (!mcq.options.includes(mcq.correct))
        throw new Error(`Correct answer mismatch in MCQ ${idx}`);
    });

    const safeParsed = JSON.parse(JSON.stringify(parsed));

    // 4️⃣ SAVE TO DB
    await LastMinuteMCQModel.create({
      className,
      subject: mainSubject,
      chapter,
      content: safeParsed,
    });

    // 5️⃣ SAVE TO REDIS
    await redis.set(cacheKey, JSON.stringify(safeParsed), {
      ex: 60 * 60 * 24 * 2,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, safeParsed, "MCQs Ready"));
  } catch (error) {
    console.error("MCQs generation failed:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to generate MCQs."));
  }
});


const LastMinutePanelMemoryBooster = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);
  const category = detectCategory(mainSubject);

  // Redis Cache Key
  const cacheKey = `lmp:booster:${className}:${mainSubject}:${chapter}`;

  // 1️⃣ CHECK REDIS CACHE
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      // Upstash REST returns object directly
      if (typeof redisCached === "object") {
        return res
          .status(200)
          .json(new ApiResponse(200, redisCached, "Memory Booster Ready "));
      }

      // fallback if returned string
      if (typeof redisCached === "string") {
        const parsed = JSON.parse(redisCached);
        return res
          .status(200)
          .json(new ApiResponse(200, parsed, "Memory Booster Ready "));
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // PROMPT (UNCHANGED, EXACT)
  const prompt = `
You are an API. Output ONLY valid JSON.

Class ${className} | Subject: ${mainSubject} | Chapter: ${chapter}
NCERT Book: ${bookName} | Stream: ${category}

Formula Rule (non-negotiable):
✔ Formula MUST be PURE LaTeX only (e.g., \\frac{a}{b}, \\sin \\theta, E = mc^2)
❌ NO square brackets around formula
❌ NO text before or after the formula
❌ Formula value must NOT include explanation, only math expression
If no formula is required, return an empty string "".


STRICT LANGUAGE RULE:
If the subject is Hindi or Sanskrit → response ONLY in Hindi.
Otherwise → response ONLY in English. DO NOT USE Hindi for English or any other subject.
If this rule is violated, regenerate the answer.

TASK:
Generate EXACTLY 3 boosters:
1) acronym
2) story
3) pattern

Formula Rule:
- Use pure LaTeX only.

JSON:
{
  "boosters":[
    {"type":"acronym","content":"...","formula":""},
    {"type":"story","content":"...","formula":""},
    {"type":"pattern","content":"...","formula":""}
  ]
}
`;

  try {
    // 2️⃣ CHECK DATABASE CACHE
    const dbCache = await Booster.findOne({
      className,
      subject: mainSubject,
      chapter,
    });

    if (dbCache) {
      const safeDBContent = JSON.parse(JSON.stringify(dbCache.content));

      // Warm Redis
      await redis.set(cacheKey, JSON.stringify(safeDBContent), {
        ex: 60 * 60 * 24 * 2,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, safeDBContent, "Memory Booster Ready "));
    }

    // 3️⃣ GENERATE USING OPENAI
    let output = await askOpenAI(prompt);
    const parsed = extractJSON(output);

    // Validation (optional but safe)
    if (!parsed.boosters || !Array.isArray(parsed.boosters) || parsed.boosters.length !== 3) {
      throw new Error("Invalid booster format");
    }

    const safeParsed = JSON.parse(JSON.stringify(parsed));

    // 4️⃣ SAVE TO DB
    await Booster.create({
      className,
      subject: mainSubject,
      chapter,
      content: safeParsed,
    });

    // 5️⃣ SAVE TO REDIS
    await redis.set(cacheKey, JSON.stringify(safeParsed), {
      ex: 60 * 60 * 24 * 2,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, safeParsed, "Memory Booster Ready"));
  } catch (error) {
    console.error("Memory booster generation failed:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to generate memory boosters."));
  }
});


const LastMinutePanelAICoach = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;
  const { mainSubject, bookName } = parseSubject(subject);
  const category = detectCategory(mainSubject);

  // Redis Cache Key
  const cacheKey = `lmp:aicoach:${className}:${mainSubject}:${chapter}`;

  // 1️⃣ CHECK REDIS CACHE FIRST
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      // Upstash returns object directly
      if (typeof redisCached === "object") {
        return res
          .status(200)
          .json(new ApiResponse(200, redisCached, "AI Coach Ready "));
      }

      // If string fallback → JSON parse
      if (typeof redisCached === "string") {
        const parsed = JSON.parse(redisCached);
        return res
          .status(200)
          .json(new ApiResponse(200, parsed, "AI Coach Ready "));
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // PROMPT — EXACT, UNTOUCHED
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
`;

  try {
    // 2️⃣ CHECK DATABASE CACHE
    const dbCache = await AiCoach.findOne({
      className,
      subject: mainSubject,
      chapter,
    });

    if (dbCache) {
      const safeDBContent = JSON.parse(JSON.stringify(dbCache.content));

      // Cache into Redis for instant future response
      await redis.set(cacheKey, JSON.stringify(safeDBContent), {
        ex: 60 * 60 * 24 * 2,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, safeDBContent, "AI Coach Ready "));
    }

    // 3️⃣ GENERATE VIA AI
    let output = await askOpenAI(prompt);
    const parsed = extractJSON(output);

    // Sort steps by priority
    parsed.steps.sort((a, b) => a.priority - b.priority);

    const safeParsed = JSON.parse(JSON.stringify(parsed));

    // 4️⃣ SAVE IN DATABASE
    await AiCoach.create({
      className,
      subject: mainSubject,
      chapter,
      content: safeParsed,
    });

    // 5️⃣ SAVE IN REDIS
    await redis.set(cacheKey, JSON.stringify(safeParsed), {
      ex: 60 * 60 * 24 * 2,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, safeParsed, "AI Coach Ready"));
  } catch (error) {
    console.error("AI coach generation failed:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(500, null, "Failed to generate coaching steps.")
      );
  }
});


export {
  LastMinutePanelSummary,
  LastMinutePanelImportantTopics,
  LastMinutePanelPredictedQuestions,
  LastMinutePanelMCQs,
  LastMinutePanelMemoryBooster,
  LastMinutePanelAICoach,
};
