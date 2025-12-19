import { redis } from "../libs/redis.js";
import { inngest } from "../libs/inngest.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseSubject } from "../utils/helper.js";


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
  // 2️⃣ CHECK IF ALREADY PENDING (BEFORE ACQUIRING LOCK)
  // -------------------------------------------------------------------
  try {
    const isPending = await redis.get(pendingKey);
    
    if (isPending) {
      // Job already queued by another request
      return res
        .status(202)
        .json(new ApiResponse(202, null, "Summary generation already in progress"));
    }
  } catch (err) {
    console.error("Redis pending check error:", err);
  }

  // -------------------------------------------------------------------
  // 3️⃣ ACQUIRE LOCK AND TRIGGER JOB
  // -------------------------------------------------------------------
  try {
    const lockAcquired = await redis.set(
      pendingKey,
      "1",
      { NX: true, EX: 300 } // 5 min safety
    );

    if (lockAcquired) {
      await inngest.send({
        name: "lmp/generate.summary",
        data: { className, subject, chapter },
      });

      return res
        .status(202)
        .json(new ApiResponse(202, null, "Summary generation queued"));
    } else {
      // Lock was acquired by another request in the microseconds between check and set
      return res
        .status(202)
        .json(new ApiResponse(202, null, "Summary generation already in progress"));
    }
  } catch (err) {
    console.error("Redis lock error:", err);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to queue generation"));
  }
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
  // 2️⃣ CHECK IF ALREADY PENDING (BEFORE ACQUIRING LOCK)
  // -------------------------------------------------------------------
  try {
    const isPending = await redis.get(pendingKey);
    
    if (isPending) {
      // Job already queued by another request
      return res
        .status(202)
        .json(new ApiResponse(202, null, "Important Topics generation already in progress"));
    }
  } catch (err) {
    console.error("Redis pending check error:", err);
  }

  // -------------------------------------------------------------------
  // 3️⃣ ACQUIRE LOCK AND TRIGGER JOB
  // -------------------------------------------------------------------
  try {
    const lockAcquired = await redis.set(
      pendingKey,
      "1",
      { NX: true, EX: 300 } // 5 min safety
    );

    if (lockAcquired) {
      await inngest.send({
        name: "lmp/generate.importantTopics",
        data: { className, subject, chapter },
      });

      return res
        .status(202)
        .json(new ApiResponse(202, null, "Important Topics generation queued"));
    } else {
      // Lock was acquired by another request in the microseconds between check and set
      return res
        .status(202)
        .json(new ApiResponse(202, null, "Important Topics generation already in progress"));
    }
  } catch (err) {
    console.error("Redis lock error:", err);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to queue generation"));
  }
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
  // 2️⃣ CHECK IF ALREADY PENDING (BEFORE ACQUIRING LOCK)
  // -------------------------------------------------------------------
  try {
    const isPending = await redis.get(pendingKey);
    
    if (isPending) {
      // Job already queued by another request
      return res
        .status(202)
        .json(
          new ApiResponse(202, null, "Predicted questions generation already in progress")
        );
    }
  } catch (err) {
    console.error("Redis pending check error:", err);
  }

  // -------------------------------------------------------------------
  // 3️⃣ ACQUIRE LOCK AND TRIGGER JOB
  // -------------------------------------------------------------------
  try {
    const lockAcquired = await redis.set(
      pendingKey,
      "1",
      { NX: true, EX: 300 } // 5 min safety
    );

    if (lockAcquired) {
      await inngest.send({
        name: "lmp/generate.predictedQuestions",
        data: { className, subject, chapter },
      });

      return res
        .status(202)
        .json(
          new ApiResponse(202, null, "Predicted questions generation queued")
        );
    } else {
      // Lock was acquired by another request in the microseconds between check and set
      return res
        .status(202)
        .json(
          new ApiResponse(202, null, "Predicted questions generation already in progress")
        );
    }
  } catch (err) {
    console.error("Redis lock error:", err);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to queue generation"));
  }
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
  // 2️⃣ CHECK IF ALREADY PENDING (BEFORE ACQUIRING LOCK)
  // -------------------------------------------------------------------
  try {
    const isPending = await redis.get(pendingKey);
    
    if (isPending) {
      // Job already queued by another request
      return res
        .status(202)
        .json(
          new ApiResponse(202, null, "MCQs generation already in progress")
        );
    }
  } catch (err) {
    console.error("Redis pending check error:", err);
  }

  // -------------------------------------------------------------------
  // 3️⃣ ACQUIRE LOCK AND TRIGGER JOB
  // -------------------------------------------------------------------
  try {
    const lockAcquired = await redis.set(
      pendingKey,
      "1",
      { NX: true, EX: 300 } // 5 min safety
    );

    if (lockAcquired) {
      await inngest.send({
        name: "lmp/generate.mcqs",
        data: { className, subject, chapter },
      });

      return res
        .status(202)
        .json(new ApiResponse(202, null, "MCQs generation queued"));
    } else {
      // Lock was acquired by another request in the microseconds between check and set
      return res
        .status(202)
        .json(
          new ApiResponse(202, null, "MCQs generation already in progress")
        );
    }
  } catch (err) {
    console.error("Redis lock error:", err);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to queue generation"));
  }
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
  // 2️⃣ CHECK IF ALREADY PENDING (BEFORE ACQUIRING LOCK)
  // -------------------------------------------------------------------
  try {
    const isPending = await redis.get(pendingKey);
    
    if (isPending) {
      // Job already queued by another request
      return res
        .status(202)
        .json(
          new ApiResponse(202, null, "Memory booster generation already in progress")
        );
    }
  } catch (err) {
    console.error("Redis pending check error:", err);
  }

  // -------------------------------------------------------------------
  // 3️⃣ ACQUIRE LOCK AND TRIGGER JOB
  // -------------------------------------------------------------------
  try {
    const lockAcquired = await redis.set(
      pendingKey,
      "1",
      { NX: true, EX: 300 } // 5 min safety
    );

    if (lockAcquired) {
      await inngest.send({
        name: "lmp/generate.memoryBooster",
        data: { className, subject, chapter },
      });

      return res
        .status(202)
        .json(
          new ApiResponse(202, null, "Memory booster generation queued")
        );
    } else {
      // Lock was acquired by another request in the microseconds between check and set
      return res
        .status(202)
        .json(
          new ApiResponse(202, null, "Memory booster generation already in progress")
        );
    }
  } catch (err) {
    console.error("Redis lock error:", err);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to queue generation"));
  }
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
  // 2️⃣ CHECK IF ALREADY PENDING (BEFORE ACQUIRING LOCK)
  // -------------------------------------------------------------------
  try {
    const isPending = await redis.get(pendingKey);
    
    if (isPending) {
      // Job already queued by another request
      return res
        .status(202)
        .json(
          new ApiResponse(202, null, "AI Coach generation already in progress")
        );
    }
  } catch (err) {
    console.error("Redis pending check error:", err);
  }

  // -------------------------------------------------------------------
  // 3️⃣ ACQUIRE LOCK AND TRIGGER JOB
  // -------------------------------------------------------------------
  try {
    const lockAcquired = await redis.set(
      pendingKey,
      "1",
      { NX: true, EX: 300 } // 5 min safety
    );

    if (lockAcquired) {
      await inngest.send({
        name: "lmp/generate.aiCoach",
        data: { className, subject, chapter },
      });

      return res
        .status(202)
        .json(
          new ApiResponse(202, null, "AI Coach generation queued")
        );
    } else {
      // Lock was acquired by another request in the microseconds between check and set
      return res
        .status(202)
        .json(
          new ApiResponse(202, null, "AI Coach generation already in progress")
        );
    }
  } catch (err) {
    console.error("Redis lock error:", err);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to queue generation"));
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
