import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { redis } from "../libs/redis.js";
import { inngest } from "../libs/inngest.js";
import crypto from "crypto";
import fs from "fs";

export const uploadPdfAndProcess = asyncHandler(async (req, res) => {
  if (!req.file?.path) {
    throw new ApiError(400, "PDF is required");
  }

  const fileBuffer = fs.readFileSync(req.file.path);
  const jobId = crypto.createHash("sha256").update(fileBuffer).digest("hex");

  const cacheKey = `lmp:pdf:${jobId}`;
  const pendingKey = `lmp:pdf:pending:${jobId}`;

  // 🔹 FAST PATH
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.status(200).json(
      new ApiResponse(200, cached, "PDF processed")
    );
  }

  // 🔹 QUEUE JOB
  const isPending = await redis.get(pendingKey);
  if (!isPending) {
    await redis.set(pendingKey, "1", { EX: 300 }); // 5 min safety

    await inngest.send({
      name: "lmp/generate.pdfProcessing",
      data: {
        jobId,
        filePath: req.file.path,
        originalName: req.file.originalname,
        userId: req.user._id,
      },
    });
  }

  return res.status(202).json(
    new ApiResponse(
      202,
      { jobId },
      "PDF processing queued"
    )
  );
});
