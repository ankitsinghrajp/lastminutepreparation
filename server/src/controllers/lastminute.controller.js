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

  const cacheKey = `lmp:summary:${className}:${mainSubject}:${chapter}`;
  const pendingKey = `lmp:summary:pending:${className}:${mainSubject}:${chapter}`;

  // -------------------------------------------------------------------
  // 1️⃣ CHECK REDIS CACHE (FAST PATH)
  // -------------------------------------------------------------------
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      try {
        const finalData =
          typeof redisCached === "object"
            ? redisCached
            : JSON.parse(redisCached);

        return res
          .status(200)
          .json(new ApiResponse(200, finalData, "Summary Ready (Redis)"));
      } catch {
        await redis.del(cacheKey); // 🆕 corrupted cache cleanup
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // -------------------------------------------------------------------
  // 2️⃣ STALE PENDING LOCK CHECK (🆕 CRITICAL FIX)
  // -------------------------------------------------------------------
  try {
    const pendingAt = await redis.get(pendingKey);

    if (pendingAt) {
      const age = Date.now() - Number(pendingAt);

      // 🆕 break dead lock if older than 5 minutes
      if (age < 5 * 60 * 1000) {
        return res
          .status(202)
          .json(
            new ApiResponse(202, null, "Summary generation already in progress")
          );
      }

      await redis.del(pendingKey); // 🆕 stale lock cleanup
    }
  } catch (err) {
    console.error("Redis pending check error:", err);
  }

  // -------------------------------------------------------------------
  // 3️⃣ ACQUIRE LOCK + QUEUE INNGEST SAFELY
  // -------------------------------------------------------------------
  try {
    // 🆕 store timestamp instead of "1"
    const lockAcquired = await redis.set(
      pendingKey,
      Date.now().toString(),
      { nx: true, ex: 300 } // 🆕 longer TTL (5 min)
    );

    if (!lockAcquired) {
      return res
        .status(202)
        .json(
          new ApiResponse(202, null, "Summary generation already in progress")
        );
    }

    try {
      // 🆕 protect against inngest network hang
      await Promise.race([
        inngest.send({
          name: "lmp/generate.summary",
          data: { className, subject, chapter },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Inngest timeout")), 8000)
        ),
      ]);
    } catch (err) {
      // 🆕 rollback lock if queue fails
      await redis.del(pendingKey);
      throw err;
    }

    return res
      .status(202)
      .json(new ApiResponse(202, null, "Summary generation queued"));
  } catch (err) {
    console.error("Queue error:", err);
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
  // 1️⃣ CHECK REDIS CACHE (FAST PATH)
  // -------------------------------------------------------------------
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      try {
        const finalData =
          typeof redisCached === "object"
            ? redisCached
            : JSON.parse(redisCached);

        return res
          .status(200)
          .json(
            new ApiResponse(200, finalData, "Important Topics Ready (Redis)")
          );
      } catch {
        await redis.del(cacheKey); // 🆕 corrupted cache cleanup
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // -------------------------------------------------------------------
  // 2️⃣ STALE PENDING LOCK CHECK (🆕 CRITICAL FIX)
  // -------------------------------------------------------------------
  try {
    const pendingAt = await redis.get(pendingKey);

    if (pendingAt) {
      const age = Date.now() - Number(pendingAt);

      // 🆕 break deadlock if older than 5 minutes
      if (age < 5 * 60 * 1000) {
        return res
          .status(202)
          .json(
            new ApiResponse(
              202,
              null,
              "Important Topics generation already in progress"
            )
          );
      }

      await redis.del(pendingKey); // 🆕 stale lock cleanup
    }
  } catch (err) {
    console.error("Redis pending check error:", err);
  }

  // -------------------------------------------------------------------
  // 3️⃣ ACQUIRE LOCK + QUEUE INNGEST SAFELY
  // -------------------------------------------------------------------
  try {
    // 🆕 store timestamp instead of "1"
    const lockAcquired = await redis.set(
      pendingKey,
      Date.now().toString(),
      { nx: true, ex: 300 } // 🆕 5 min TTL
    );

    if (!lockAcquired) {
      return res
        .status(202)
        .json(
          new ApiResponse(
            202,
            null,
            "Important Topics generation already in progress"
          )
        );
    }

    try {
      // 🆕 protect against inngest network hang
      await Promise.race([
        inngest.send({
          name: "lmp/generate.importantTopics",
          data: { className, subject, chapter },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Inngest timeout")), 8000)
        ),
      ]);
    } catch (err) {
      // 🆕 rollback lock if queue fails
      await redis.del(pendingKey);
      throw err;
    }

    return res
      .status(202)
      .json(
        new ApiResponse(202, null, "Important Topics generation queued")
      );
  } catch (err) {
    console.error("Queue error:", err);
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
  // 1️⃣ CHECK REDIS CACHE (FAST PATH)
  // -------------------------------------------------------------------
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      try {
        const finalData =
          typeof redisCached === "object"
            ? redisCached
            : JSON.parse(redisCached);

        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              finalData,
              "Predicted Questions Ready (Redis)"
            )
          );
      } catch {
        await redis.del(cacheKey); // 🆕 corrupted cache cleanup
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // -------------------------------------------------------------------
  // 2️⃣ STALE PENDING LOCK CHECK (🆕 CRITICAL FIX)
  // -------------------------------------------------------------------
  try {
    const pendingAt = await redis.get(pendingKey);

    if (pendingAt) {
      const age = Date.now() - Number(pendingAt);

      // 🆕 break deadlock if older than 5 minutes
      if (age < 5 * 60 * 1000) {
        return res
          .status(202)
          .json(
            new ApiResponse(
              202,
              null,
              "Predicted questions generation already in progress"
            )
          );
      }

      await redis.del(pendingKey); // 🆕 stale lock cleanup
    }
  } catch (err) {
    console.error("Redis pending check error:", err);
  }

  // -------------------------------------------------------------------
  // 3️⃣ ACQUIRE LOCK + QUEUE INNGEST SAFELY
  // -------------------------------------------------------------------
  try {
    // 🆕 store timestamp instead of "1"
    const lockAcquired = await redis.set(
      pendingKey,
      Date.now().toString(),
      { nx: true, ex: 300 } // 🆕 5 min TTL
    );

    if (!lockAcquired) {
      return res
        .status(202)
        .json(
          new ApiResponse(
            202,
            null,
            "Predicted questions generation already in progress"
          )
        );
    }

    try {
      // 🆕 protect against inngest network hang
      await Promise.race([
        inngest.send({
          name: "lmp/generate.predictedQuestions",
          data: { className, subject, chapter },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Inngest timeout")), 8000)
        ),
      ]);
    } catch (err) {
      // 🆕 rollback lock if queue fails
      await redis.del(pendingKey);
      throw err;
    }

    return res
      .status(202)
      .json(
        new ApiResponse(
          202,
          null,
          "Predicted questions generation queued"
        )
      );
  } catch (err) {
    console.error("Queue error:", err);
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
  // 1️⃣ CHECK REDIS CACHE (FAST PATH)
  // -------------------------------------------------------------------
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      try {
        const finalData =
          typeof redisCached === "object"
            ? redisCached
            : JSON.parse(redisCached);

        return res
          .status(200)
          .json(
            new ApiResponse(200, finalData, "Important MCQs Ready (Redis)")
          );
      } catch {
        await redis.del(cacheKey); // 🆕 corrupted cache cleanup
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // -------------------------------------------------------------------
  // 2️⃣ STALE PENDING LOCK CHECK (🆕 CRITICAL FIX)
  // -------------------------------------------------------------------
  try {
    const pendingAt = await redis.get(pendingKey);

    if (pendingAt) {
      const age = Date.now() - Number(pendingAt);

      // 🆕 break deadlock if older than 5 minutes
      if (age < 5 * 60 * 1000) {
        return res
          .status(202)
          .json(
            new ApiResponse(
              202,
              null,
              "MCQs generation already in progress"
            )
          );
      }

      await redis.del(pendingKey); // 🆕 stale lock cleanup
    }
  } catch (err) {
    console.error("Redis pending check error:", err);
  }

  // -------------------------------------------------------------------
  // 3️⃣ ACQUIRE LOCK + QUEUE INNGEST SAFELY
  // -------------------------------------------------------------------
  try {
    // 🆕 store timestamp instead of "1"
    const lockAcquired = await redis.set(
      pendingKey,
      Date.now().toString(),
      { nx: true, ex: 300 } // 🆕 5 min TTL
    );

    if (!lockAcquired) {
      return res
        .status(202)
        .json(
          new ApiResponse(
            202,
            null,
            "MCQs generation already in progress"
          )
        );
    }

    try {
      // 🆕 protect against inngest network hang
      await Promise.race([
        inngest.send({
          name: "lmp/generate.mcqs",
          data: { className, subject, chapter },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Inngest timeout")), 8000)
        ),
      ]);
    } catch (err) {
      // 🆕 rollback lock if queue fails
      await redis.del(pendingKey);
      throw err;
    }

    return res
      .status(202)
      .json(new ApiResponse(202, null, "MCQs generation queued"));
  } catch (err) {
    console.error("Queue error:", err);
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
  // 1️⃣ CHECK REDIS CACHE (FAST PATH)
  // -------------------------------------------------------------------
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      try {
        const finalData =
          typeof redisCached === "object"
            ? redisCached
            : JSON.parse(redisCached);

        return res
          .status(200)
          .json(
            new ApiResponse(200, finalData, "Memory Booster Ready (Redis)")
          );
      } catch {
        await redis.del(cacheKey); // 🆕 corrupted cache cleanup
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // -------------------------------------------------------------------
  // 2️⃣ STALE PENDING LOCK CHECK (🆕 CRITICAL FIX)
  // -------------------------------------------------------------------
  try {
    const pendingAt = await redis.get(pendingKey);

    if (pendingAt) {
      const age = Date.now() - Number(pendingAt);

      // 🆕 break deadlock if older than 5 minutes
      if (age < 5 * 60 * 1000) {
        return res
          .status(202)
          .json(
            new ApiResponse(
              202,
              null,
              "Memory booster generation already in progress"
            )
          );
      }

      await redis.del(pendingKey); // 🆕 stale lock cleanup
    }
  } catch (err) {
    console.error("Redis pending check error:", err);
  }

  // -------------------------------------------------------------------
  // 3️⃣ ACQUIRE LOCK + QUEUE INNGEST SAFELY
  // -------------------------------------------------------------------
  try {
    // 🆕 store timestamp instead of "1"
    const lockAcquired = await redis.set(
      pendingKey,
      Date.now().toString(),
      { nx: true, ex: 400 } // 🆕 6–7 min TTL (booster can be slow)
    );

    if (!lockAcquired) {
      return res
        .status(202)
        .json(
          new ApiResponse(
            202,
            null,
            "Memory booster generation already in progress"
          )
        );
    }

    try {
      // 🆕 protect against inngest network hang
      await Promise.race([
        inngest.send({
          name: "lmp/generate.memoryBooster",
          data: { className, subject, chapter },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Inngest timeout")), 8000)
        ),
      ]);
    } catch (err) {
      // 🆕 rollback lock if queue fails
      await redis.del(pendingKey);
      throw err;
    }

    return res
      .status(202)
      .json(
        new ApiResponse(202, null, "Memory booster generation queued")
      );
  } catch (err) {
    console.error("Queue error:", err);
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
  // 1️⃣ CHECK REDIS CACHE (FAST PATH)
  // -------------------------------------------------------------------
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      try {
        const finalData =
          typeof redisCached === "object"
            ? redisCached
            : JSON.parse(redisCached);

        return res
          .status(200)
          .json(
            new ApiResponse(200, finalData, "AI Coach Ready (Redis)")
          );
      } catch {
        await redis.del(cacheKey); // 🆕 corrupted cache cleanup
      }
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // -------------------------------------------------------------------
  // 2️⃣ STALE PENDING LOCK CHECK (🆕 CRITICAL FIX)
  // -------------------------------------------------------------------
  try {
    const pendingAt = await redis.get(pendingKey);

    if (pendingAt) {
      const age = Date.now() - Number(pendingAt);

      // 🆕 break deadlock if older than 6 minutes
      if (age < 6 * 60 * 1000) {
        return res
          .status(202)
          .json(
            new ApiResponse(
              202,
              null,
              "AI Coach generation already in progress"
            )
          );
      }

      await redis.del(pendingKey); // 🆕 stale lock cleanup
    }
  } catch (err) {
    console.error("Redis pending check error:", err);
  }

  // -------------------------------------------------------------------
  // 3️⃣ ACQUIRE LOCK + QUEUE INNGEST SAFELY
  // -------------------------------------------------------------------
  try {
    // 🆕 store timestamp instead of "1"
    const lockAcquired = await redis.set(
      pendingKey,
      Date.now().toString(),
      { nx: true, ex: 420 } // 🆕 ~7 min TTL (AI Coach is slowest)
    );

    if (!lockAcquired) {
      return res
        .status(202)
        .json(
          new ApiResponse(
            202,
            null,
            "AI Coach generation already in progress"
          )
        );
    }

    try {
      // 🆕 protect against inngest network hang
      await Promise.race([
        inngest.send({
          name: "lmp/generate.aiCoach",
          data: { className, subject, chapter },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Inngest timeout")), 8000)
        ),
      ]);
    } catch (err) {
      // 🆕 rollback lock if queue fails
      await redis.del(pendingKey);
      throw err;
    }

    return res
      .status(202)
      .json(
        new ApiResponse(202, null, "AI Coach generation queued")
      );
  } catch (err) {
    console.error("Queue error:", err);
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
