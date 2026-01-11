
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APIError.js";
import { redis } from "../libs/redis.js";
import { inngest } from "../libs/inngest.js";
import crypto from "crypto";

export const diagramImageAnalysis = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.image) {
    throw new ApiError(400, "Please upload image first!");
  }

  const buffer = req.files.image[0].buffer;

  // 🔐 unique job id based on image content
  const jobId = crypto.createHash("sha256").update(buffer).digest("hex");

  const cacheKey = `lmp:diagram:${jobId}`;
  const pendingKey = `lmp:diagram:pending:${jobId}`;

  /* -------------------- CACHE CHECK -------------------- */
  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      const finalData =
        typeof cached === "object" ? cached : JSON.parse(cached);

      return res.status(200).json({
        success: true,
        aiResponse: finalData.aiResponse,
        mode_used: finalData.mode_used,
        labels: finalData.labels,
        extractedText: finalData.extractedText,
      });
    }
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  /* -------------------- PENDING CHECK -------------------- */
  const isPending = await redis.get(pendingKey);
  if (isPending) {
    return res.status(202).json({
      success: true,
      message: "Diagram analysis already in progress",
      jobId,
    });
  }

  /* -------------------- ACQUIRE LOCK -------------------- */
  const lockAcquired = await redis.set(pendingKey, "1", {
    nx: true,
    ex: 90,
  });

  if (!lockAcquired) {
    return res.status(202).json({
      success: true,
      message: "Diagram analysis already in progress",
      jobId,
    });
  }

  try {
    // ✅ DIRECTLY AWAIT INNGEST
    await inngest.send({
      name: "lmp/generate.diagramAnalysis",
      data: {
        jobId,
        imageBuffer: buffer.toString("base64"),
      },
    });

    return res.status(202).json({
      success: true,
      message: "Diagram analysis queued",
      jobId,
    });
  } catch (err) {
    console.error("Queue error:", err);

    // 🔁 rollback lock on failure
    await redis.del(pendingKey);

    return res.status(500).json({
      success: false,
      message: "Failed to queue diagram analysis",
    });
  }
});
