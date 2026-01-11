import { redis } from "../libs/redis.js";
import { inngest } from "../libs/inngest.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseSubject } from "../utils/helper.js";
import { safeInngestSend } from "../utils/safeInngest.js";

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

  /* -------------------- CACHE CHECK -------------------- */
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      const finalData =
        typeof redisCached === "object"
          ? redisCached
          : JSON.parse(redisCached);

      return res
        .status(200)
        .json(new ApiResponse(200, finalData, "Summary Ready (Redis)"));
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  /* -------------------- STALE PENDING CHECK -------------------- */
  try {
    const pendingAt = await redis.get(pendingKey);

    if (pendingAt) {
      const age = Date.now() - Number(pendingAt);

      if (age < 5 * 60 * 1000) {
        return res
          .status(202)
          .json(
            new ApiResponse(
              202,
              null,
              "Summary generation already in progress"
            )
          );
      }

      // stale lock cleanup
      await redis.del(pendingKey);
    }
  } catch (err) {
    console.error("Redis pending check error:", err);
  }

  /* -------------------- ACQUIRE LOCK -------------------- */
  const lockAcquired = await redis.set(
    pendingKey,
    Date.now().toString(),
    { nx: true, ex: 300 } // 5 min TTL
  );

  if (!lockAcquired) {
    return res
      .status(202)
      .json(
        new ApiResponse(
          202,
          null,
          "Summary generation already in progress"
        )
      );
  }

  try {
    // ✅ DIRECT INNGEST CALL (NO WRAPPER)
    await inngest.send({
      name: "lmp/generate.summary",
      data: { className, subject, chapter },
    });

    return res
      .status(202)
      .json(
        new ApiResponse(
          202,
          null,
          "Summary generation queued"
        )
      );
  } catch (err) {
    console.error("Queue error:", err);

    // 🔁 rollback lock if enqueue fails
    await redis.del(pendingKey);

    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          "Failed to queue generation"
        )
      );
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

  /* -------------------- CACHE CHECK -------------------- */
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      const finalData =
        typeof redisCached === "object"
          ? redisCached
          : JSON.parse(redisCached);

      return res.status(200).json(
        new ApiResponse(
          200,
          finalData,
          "Important Topics Ready (Redis)"
        )
      );
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  /* -------------------- STALE PENDING CHECK -------------------- */
  try {
    const pendingAt = await redis.get(pendingKey);

    if (pendingAt) {
      const age = Date.now() - Number(pendingAt);

      if (age < 5 * 60 * 1000) {
        return res.status(202).json(
          new ApiResponse(
            202,
            null,
            "Important Topics generation already in progress"
          )
        );
      }

      // stale lock cleanup
      await redis.del(pendingKey);
    }
  } catch (err) {
    console.error("Redis pending check error:", err);
  }

  /* -------------------- ACQUIRE LOCK -------------------- */
  const lockAcquired = await redis.set(
    pendingKey,
    Date.now().toString(),
    { nx: true, ex: 300 } // 5 min TTL
  );

  if (!lockAcquired) {
    return res.status(202).json(
      new ApiResponse(
        202,
        null,
        "Important Topics generation already in progress"
      )
    );
  }

  try {
    // ✅ DIRECT INNGEST CALL (NO WRAPPER)
    await inngest.send({
      name: "lmp/generate.importantTopics",
      data: { className, subject, chapter },
    });

    return res.status(202).json(
      new ApiResponse(
        202,
        null,
        "Important Topics generation queued"
      )
    );
  } catch (err) {
    console.error("Queue error:", err);

    // 🔁 rollback lock on failure
    await redis.del(pendingKey);

    return res.status(500).json(
      new ApiResponse(
        500,
        null,
        "Failed to queue generation"
      )
    );
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

  /* -------------------- CACHE CHECK -------------------- */
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      const finalData =
        typeof redisCached === "object"
          ? redisCached
          : JSON.parse(redisCached);

      return res.status(200).json(
        new ApiResponse(
          200,
          finalData,
          "Predicted Questions Ready (Redis)"
        )
      );
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  /* -------------------- STALE PENDING CHECK -------------------- */
  try {
    const pendingAt = await redis.get(pendingKey);

    if (pendingAt) {
      const age = Date.now() - Number(pendingAt);

      if (age < 5 * 60 * 1000) {
        return res.status(202).json(
          new ApiResponse(
            202,
            null,
            "Predicted questions generation already in progress"
          )
        );
      }

      // stale lock cleanup
      await redis.del(pendingKey);
    }
  } catch (err) {
    console.error("Redis pending check error:", err);
  }

  /* -------------------- ACQUIRE LOCK -------------------- */
  const lockAcquired = await redis.set(
    pendingKey,
    Date.now().toString(),
    { nx: true, ex: 300 } // 5 min TTL
  );

  if (!lockAcquired) {
    return res.status(202).json(
      new ApiResponse(
        202,
        null,
        "Predicted questions generation already in progress"
      )
    );
  }

  try {
    // ✅ DIRECT INNGEST CALL (NO WRAPPER)
    await inngest.send({
      name: "lmp/generate.predictedQuestions",
      data: { className, subject, chapter },
    });

    return res.status(202).json(
      new ApiResponse(
        202,
        null,
        "Predicted questions generation queued"
      )
    );
  } catch (err) {
    console.error("Queue error:", err);

    // 🔁 rollback lock on failure
    await redis.del(pendingKey);

    return res.status(500).json(
      new ApiResponse(
        500,
        null,
        "Failed to queue generation"
      )
    );
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

  /* -------------------- CACHE CHECK -------------------- */
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      const finalData =
        typeof redisCached === "object"
          ? redisCached
          : JSON.parse(redisCached);

      return res.status(200).json(
        new ApiResponse(
          200,
          finalData,
          "Important MCQs Ready (Redis)"
        )
      );
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  /* -------------------- STALE PENDING CHECK -------------------- */
  try {
    const pendingAt = await redis.get(pendingKey);

    if (pendingAt) {
      const age = Date.now() - Number(pendingAt);

      if (age < 5 * 60 * 1000) {
        return res.status(202).json(
          new ApiResponse(
            202,
            null,
            "MCQs generation already in progress"
          )
        );
      }

      // stale lock cleanup
      await redis.del(pendingKey);
    }
  } catch (err) {
    console.error("Redis pending check error:", err);
  }

  /* -------------------- ACQUIRE LOCK -------------------- */
  const lockAcquired = await redis.set(
    pendingKey,
    Date.now().toString(),
    { nx: true, ex: 300 } // 5 min TTL
  );

  if (!lockAcquired) {
    return res.status(202).json(
      new ApiResponse(
        202,
        null,
        "MCQs generation already in progress"
      )
    );
  }

  try {
    // ✅ DIRECT INNGEST SEND (NO WRAPPER)
    await inngest.send({
      name: "lmp/generate.mcqs",
      data: { className, subject, chapter },
    });

    return res.status(202).json(
      new ApiResponse(
        202,
        null,
        "MCQs generation queued"
      )
    );
  } catch (err) {
    console.error("Queue error:", err);

    // 🔁 rollback lock on failure
    await redis.del(pendingKey);

    return res.status(500).json(
      new ApiResponse(
        500,
        null,
        "Failed to queue generation"
      )
    );
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

  /* -------------------- CACHE CHECK -------------------- */
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      const finalData =
        typeof redisCached === "object"
          ? redisCached
          : JSON.parse(redisCached);

      return res.status(200).json(
        new ApiResponse(
          200,
          finalData,
          "Memory Booster Ready (Redis)"
        )
      );
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  /* -------------------- STALE PENDING CHECK -------------------- */
  try {
    const pendingAt = await redis.get(pendingKey);

    if (pendingAt) {
      const age = Date.now() - Number(pendingAt);

      if (age < 5 * 60 * 1000) {
        return res.status(202).json(
          new ApiResponse(
            202,
            null,
            "Memory booster generation already in progress"
          )
        );
      }

      // stale lock cleanup
      await redis.del(pendingKey);
    }
  } catch (err) {
    console.error("Redis pending check error:", err);
  }

  /* -------------------- ACQUIRE LOCK -------------------- */
  const lockAcquired = await redis.set(
    pendingKey,
    Date.now().toString(),
    { nx: true, ex: 420 } // ~7 min TTL
  );

  if (!lockAcquired) {
    return res.status(202).json(
      new ApiResponse(
        202,
        null,
        "Memory booster generation already in progress"
      )
    );
  }

  try {
    // ✅ DIRECT INNGEST SEND (NO WRAPPER)
    await inngest.send({
      name: "lmp/generate.memoryBooster",
      data: { className, subject, chapter },
    });

    return res.status(202).json(
      new ApiResponse(
        202,
        null,
        "Memory booster generation queued"
      )
    );
  } catch (err) {
    console.error("Queue error:", err);

    // 🔁 rollback lock on failure
    await redis.del(pendingKey);

    return res.status(500).json(
      new ApiResponse(
        500,
        null,
        "Failed to queue generation"
      )
    );
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

  /* -------------------- CACHE CHECK -------------------- */
  try {
    const redisCached = await redis.get(cacheKey);

    if (redisCached) {
      const finalData =
        typeof redisCached === "object"
          ? redisCached
          : JSON.parse(redisCached);

      return res.status(200).json(
        new ApiResponse(200, finalData, "AI Coach Ready (Redis)")
      );
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  /* -------------------- STALE PENDING CHECK -------------------- */
  try {
    const pendingAt = await redis.get(pendingKey);

    if (pendingAt) {
      const age = Date.now() - Number(pendingAt);

      if (age < 6 * 60 * 1000) {
        return res.status(202).json(
          new ApiResponse(
            202,
            null,
            "AI Coach generation already in progress"
          )
        );
      }

      // stale lock cleanup
      await redis.del(pendingKey);
    }
  } catch (err) {
    console.error("Redis pending check error:", err);
  }

  /* -------------------- ACQUIRE LOCK -------------------- */
  const lockAcquired = await redis.set(
    pendingKey,
    Date.now().toString(),
    { nx: true, ex: 420 } // ~7 min TTL
  );

  if (!lockAcquired) {
    return res.status(202).json(
      new ApiResponse(
        202,
        null,
        "AI Coach generation already in progress"
      )
    );
  }

  try {
    // ✅ DIRECT INNGEST CALL (SAFE)
    await inngest.send({
      name: "lmp/generate.aiCoach",
      data: { className, subject, chapter },
    });

    return res.status(202).json(
      new ApiResponse(
        202,
        null,
        "AI Coach generation queued"
      )
    );
  } catch (err) {
    console.error("Queue error:", err);

    // 🔁 rollback Redis lock on failure
    await redis.del(pendingKey);

    return res.status(500).json(
      new ApiResponse(
        500,
        null,
        "Failed to queue generation"
      )
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
