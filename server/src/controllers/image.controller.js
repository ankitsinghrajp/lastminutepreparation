
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

  // 🔹 FAST PATH (Redis hit)
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.status(200).json({
      success: true,
      aiResponse: cached.aiResponse,
      mode_used: cached.mode_used,
      labels: cached.labels,
      extractedText: cached.extractedText,
    });
  }

  // 🔹 If not pending → queue job
  const isPending = await redis.get(pendingKey);
  if (!isPending) {
    await redis.set(pendingKey, "1", { EX: 120 });

    await inngest.send({
      name: "lmp/generate.diagramAnalysis",
      data: {
        jobId,
        imageBuffer: buffer.toString("base64"),
      },
    });
  }

  return res.status(202).json({
    success: true,
    message: "Diagram analysis queued",
    jobId,
  });
});
