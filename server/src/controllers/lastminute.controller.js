import { redis } from "../libs/redis.js";
import { AiCoach } from "../models/LastMinuteBeforeExam/aiCoach.model.js";
import { ImpTopicsModel } from "../models/LastMinuteBeforeExam/impTopics.model.js";
import { LastMinuteMCQModel } from "../models/LastMinuteBeforeExam/lastMinuteMcq.model.js";
import { Booster } from "../models/LastMinuteBeforeExam/memoryBooster.model.js";
import { PredictedQuestionModel } from "../models/LastMinuteBeforeExam/predictedQuestion.model.js";
import { LastMinuteSummaryModel } from "../models/LastMinuteBeforeExam/summary.model.js";
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
  const { mainSubject, bookName } = parseSubject(subject);
  const category = detectCategory(mainSubject);

  // Redis Cache Key
  const cacheKey = `lmp:summary:${className}:${mainSubject}:${chapter}`;

  // 1️⃣ CHECK REDIS
// 1️⃣ CHECK REDIS CACHE
try {
  const redisCached = await redis.get(cacheKey);

  if (redisCached) {
    let finalData;

    // CASE 1: Already an object (Upstash sometimes returns object)
    if (typeof redisCached === "object") {
      finalData = redisCached;
    }
    // CASE 2: String → needs JSON.parse
    else if (typeof redisCached === "string") {
      try {
        finalData = JSON.parse(redisCached);
      } catch (e) {
        console.log("Invalid JSON string in Redis, deleting key...");
        await redis.del(cacheKey);
      }
    }

    if (finalData) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, finalData, "Summary Ready")
        );
    }
  }
} catch (err) {
  console.log("Redis GET error:", err);
}


  let prompt = "";

  if (category === "language") {
    prompt = `
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
`;
  } else {
    prompt = `
You are an API. Think silently but DO NOT show your internal thinking.

Write a short NCERT-style chapter summary in **3–4 simple lines** only.
It must be crisp, student-friendly, and useful for last-minute revision.

❌ Do NOT include formulas, numericals, derivations, diagrams, definitions, tables, or headings.
❌ Do NOT use bullet points, lists, or line breaks after every sentence.
✔ The summary must be a **single flowing paragraph of 3–4 lines** only.

Return output in JSON format ONLY:
{
  "summary": "3–4 line paragraph here"
}

Class: ${className}
Subject: ${mainSubject}
Book: ${bookName}
Chapter: ${chapter}
Stream: ${category}
`;
  }

  try {
    // 2️⃣ CHECK DATABASE
    const dbCache = await LastMinuteSummaryModel.findOne({
      className,
      subject: mainSubject,
      chapter,
    });

    if (dbCache) {
      const safeDBContent = JSON.parse(JSON.stringify(dbCache.content));

      await redis.set(
        cacheKey,
        JSON.stringify(safeDBContent),
        { ex: 60 * 60 * 24 * 2 }  // 48 hours
      );

      return res
        .status(200)
        .json(new ApiResponse(200, safeDBContent, "Summary Ready "));
    }

    // 3️⃣ CALL OPENAI
    const output = await askOpenAI(prompt);
    const parsed = extractJSON(output);

    // ⭐ FIX — convert to pure JSON-safe object
    const safeParsed = JSON.parse(JSON.stringify(parsed));

    // 4️⃣ SAVE TO DATABASE
    await LastMinuteSummaryModel.create({
      className,
      subject: mainSubject,
      chapter,
      content: safeParsed,
    });

    // 5️⃣ STORE IN REDIS SAFELY
    await redis.set(
      cacheKey,
      JSON.stringify(safeParsed),
      { ex: 60 * 60 * 24 * 2}
    );

    return res
      .status(200)
      .json(new ApiResponse(200, safeParsed, "Summary Ready"));
  } catch (error) {
    console.error("Summary generation failed:", error);
    return res.status(500).json(
      new ApiResponse(
        500,
        null,
        "Failed to generate summary. Please try again."
      )
    );
  }
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
