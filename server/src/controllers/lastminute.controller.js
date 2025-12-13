import { redis } from "../libs/redis.js";
import { AiCoach } from "../models/LastMinuteBeforeExam/aiCoach.model.js";
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

  if (!className || !subject || !chapter) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Missing class, subject or chapter"));
  }

  const { mainSubject } = parseSubject(subject);

  const cacheKey = `lmp:imptopics:${className}:${mainSubject}:${chapter}`;
  const pendingKey = `lmp:imptopics:pending:${className}:${mainSubject}:${chapter}`;

  // -------------------------------------------------------------------
  // 1️⃣ CHECK REDIS (FAST PATH)
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
        } catch {
          await redis.del(cacheKey);
        }
      }

      if (finalData) {
        return res
          .status(200)
          .json(new ApiResponse(200, finalData, "Important Topics Ready (Redis)"));
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // -------------------------------------------------------------------
  // 2️⃣ CHECK PENDING FLAG (PREVENT DUPLICATE JOBS)
  // -------------------------------------------------------------------
  const isPending = await redis.get(pendingKey);

  if (!isPending) {
    await redis.set(pendingKey, "1", { EX: 120 }); // safety timeout

    await inngest.send({
      name: "lmp/generate.importantTopics",
      data: { className, subject, chapter },
    });
  }

  // -------------------------------------------------------------------
  // 3️⃣ RETURN QUEUED RESPONSE
  // -------------------------------------------------------------------
  return res
    .status(202)
    .json(new ApiResponse(202, null, "Important Topics generation queued"));
});

const LastMinutePanelPredictedQuestions = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;

  if (!className || !subject || !chapter) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Missing class, subject or chapter"));
  }

  const { mainSubject } = parseSubject(subject);

  const cacheKey = `lmp:predicted:${className}:${mainSubject}:${chapter}`;
  const pendingKey = `lmp:predicted:pending:${className}:${mainSubject}:${chapter}`;

  // -------------------------------------------------------------------
  // 1️⃣ CHECK REDIS (FAST PATH)
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
        } catch {
          await redis.del(cacheKey);
        }
      }

      if (finalData) {
        return res
          .status(200)
          .json(
            new ApiResponse(200, finalData, "Predicted Questions Ready (Redis)")
          );
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // -------------------------------------------------------------------
  // 2️⃣ CHECK PENDING FLAG (AVOID DUPLICATE JOBS)
  // -------------------------------------------------------------------
  const isPending = await redis.get(pendingKey);

  if (!isPending) {
    await redis.set(pendingKey, "1", { EX: 120 }); // safety timeout

    await inngest.send({
      name: "lmp/generate.predictedQuestions",
      data: { className, subject, chapter },
    });
  }

  // -------------------------------------------------------------------
  // 3️⃣ RETURN QUEUED RESPONSE
  // -------------------------------------------------------------------
  return res
    .status(202)
    .json(
      new ApiResponse(202, null, "Predicted questions generation queued")
    );
});

const LastMinutePanelMCQs = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;

  if (!className || !subject || !chapter) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Missing class, subject or chapter"));
  }

  const { mainSubject } = parseSubject(subject);

  const cacheKey = `lmp:mcqs:${className}:${mainSubject}:${chapter}`;
  const pendingKey = `lmp:mcqs:pending:${className}:${mainSubject}:${chapter}`;

  // -------------------------------------------------------------------
  // 1️⃣ CHECK REDIS (FAST PATH)
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
        } catch {
          await redis.del(cacheKey);
        }
      }

      if (finalData) {
        return res
          .status(200)
          .json(
            new ApiResponse(200, finalData, "Important MCQs Ready (Redis)")
          );
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // -------------------------------------------------------------------
  // 2️⃣ CHECK PENDING FLAG (AVOID DUPLICATE JOBS)
  // -------------------------------------------------------------------
  const isPending = await redis.get(pendingKey);

  if (!isPending) {
    await redis.set(pendingKey, "1", { EX: 120 });

    await inngest.send({
      name: "lmp/generate.mcqs",
      data: { className, subject, chapter },
    });
  }

  // -------------------------------------------------------------------
  // 3️⃣ RETURN QUEUED RESPONSE
  // -------------------------------------------------------------------
  return res
    .status(202)
    .json(new ApiResponse(202, null, "MCQs generation queued"));
});


const LastMinutePanelMemoryBooster = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;

  if (!className || !subject || !chapter) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Missing class, subject or chapter"));
  }

  const { mainSubject } = parseSubject(subject);

  const cacheKey = `lmp:booster:${className}:${mainSubject}:${chapter}`;
  const pendingKey = `lmp:booster:pending:${className}:${mainSubject}:${chapter}`;

  // -------------------------------------------------------------------
  // 1️⃣ CHECK REDIS (FAST PATH)
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
        } catch {
          await redis.del(cacheKey);
        }
      }

      if (finalData) {
        return res
          .status(200)
          .json(
            new ApiResponse(200, finalData, "Memory Booster Ready (Redis)")
          );
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // -------------------------------------------------------------------
  // 2️⃣ CHECK PENDING FLAG (AVOID DUPLICATE JOBS)
  // -------------------------------------------------------------------
  const isPending = await redis.get(pendingKey);

  if (!isPending) {
    await redis.set(pendingKey, "1", { EX: 120 });

    await inngest.send({
      name: "lmp/generate.memoryBooster",
      data: { className, subject, chapter },
    });
  }

  // -------------------------------------------------------------------
  // 3️⃣ RETURN QUEUED RESPONSE
  // -------------------------------------------------------------------
  return res
    .status(202)
    .json(
      new ApiResponse(202, null, "Memory booster generation queued")
    );
});


const LastMinutePanelAICoach = asyncHandler(async (req, res) => {
  const { className, subject, chapter } = req.body;

  if (!className || !subject || !chapter) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Missing class, subject or chapter"));
  }

  const { mainSubject } = parseSubject(subject);

  const cacheKey = `lmp:aicoach:${className}:${mainSubject}:${chapter}`;
  const pendingKey = `lmp:aicoach:pending:${className}:${mainSubject}:${chapter}`;

  // -------------------------------------------------------------------
  // 1️⃣ CHECK REDIS (FAST PATH)
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
        } catch {
          await redis.del(cacheKey);
        }
      }

      if (finalData) {
        return res
          .status(200)
          .json(
            new ApiResponse(200, finalData, "AI Coach Ready (Redis)")
          );
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // -------------------------------------------------------------------
  // 2️⃣ CHECK PENDING FLAG (AVOID DUPLICATE JOBS)
  // -------------------------------------------------------------------
  const isPending = await redis.get(pendingKey);

  if (!isPending) {
    await redis.set(pendingKey, "1", { EX: 120 });

    await inngest.send({
      name: "lmp/generate.aiCoach",
      data: { className, subject, chapter },
    });
  }

  // -------------------------------------------------------------------
  // 3️⃣ RETURN QUEUED RESPONSE
  // -------------------------------------------------------------------
  return res
    .status(202)
    .json(
      new ApiResponse(202, null, "AI Coach generation queued")
    );
});



export {
  LastMinutePanelSummary,
  LastMinutePanelImportantTopics,
  LastMinutePanelPredictedQuestions,
  LastMinutePanelMCQs,
  LastMinutePanelMemoryBooster,
  LastMinutePanelAICoach,
};
