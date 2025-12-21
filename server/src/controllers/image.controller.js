
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

  // unique job id based on image content
  const jobId = crypto.createHash("sha256").update(buffer).digest("hex");

  const cacheKey = `lmp:diagram:${jobId}`;
  const pendingKey = `lmp:diagram:pending:${jobId}`;

  // -------------------------------------------------------------------
  // 1️⃣ CHECK REDIS (FASTEST PATH)
  // -------------------------------------------------------------------
  try {
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      let finalData;

      if (typeof cached === "object") {
        finalData = cached;
      } else {
        try {
          finalData = JSON.parse(cached);
        } catch (err) {
          await redis.del(cacheKey); // corrupted → delete
        }
      }

      if (finalData) {
        return res.status(200).json({
          success: true,
          aiResponse: finalData.aiResponse,
          mode_used: finalData.mode_used,
          labels: finalData.labels,
          extractedText: finalData.extractedText,
        });
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
      return res.status(202).json({
        success: true,
        message: "Diagram analysis already in progress",
        jobId,
      });
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
      { NX: true, EX: 90 } // 2 min lock (matches your original EX time)
    );

    if (lockAcquired) {
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
    } else {
      // Lock was acquired by another request in the microseconds between check and set
      return res.status(202).json({
        success: true,
        message: "Diagram analysis already in progress",
        jobId,
      });
    }
  } catch (err) {
    console.error("Redis lock error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to queue diagram analysis",
    });
  }
});