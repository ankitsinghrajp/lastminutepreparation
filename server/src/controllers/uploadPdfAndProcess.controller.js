import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { redis } from "../libs/redis.js";
import { inngest } from "../libs/inngest.js";
import crypto from "crypto";
import fs from "fs";

export const uploadPdfAndProcess = asyncHandler(async (req, res) => {
  try {
    if (!req.file?.path) {
      throw new ApiError(400, "PDF is required");
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    const jobId = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    const cacheKey = `lmp:pdf:${jobId}`;
    const pendingKey = `lmp:pdf:pending:${jobId}`;

    /* -------------------- CACHE CHECK -------------------- */
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        fs.unlinkSync(filePath);
        return res
          .status(200)
          .json(new ApiResponse(200, cached, "PDF processed"));
      }
    } catch (err) {
      console.error("Redis GET error:", err);
    }

    /* -------------------- PENDING CHECK -------------------- */
    const isPending = await redis.get(pendingKey);
    if (isPending) {
      fs.unlinkSync(filePath);
      return res.status(202).json(
        new ApiResponse(
          202,
          { jobId },
          "PDF processing already in progress"
        )
      );
    }

    /* -------------------- ACQUIRE LOCK -------------------- */
    const lockAcquired = await redis.set(pendingKey, "1", {
      nx: true,
      ex: 120,
    });

    if (!lockAcquired) {
      fs.unlinkSync(filePath);
      return res.status(202).json(
        new ApiResponse(
          202,
          { jobId },
          "PDF processing already in progress"
        )
      );
    }

    try {
      // ✅ DIRECT INNGEST CALL (SAFE)
      await inngest.send({
        name: "lmp/generate.pdfProcessing",
        data: {
          jobId,
          filePath,
          originalName: req.file.originalname,
          userId: req.user._id,
        },
      });

      return res.status(202).json(
        new ApiResponse(
          202,
          { jobId },
          "PDF processing queued"
        )
      );
    } catch (err) {
      console.error("Queue error:", err);

      // 🔁 rollback Redis lock
      await redis.del(pendingKey);

      fs.unlinkSync(filePath);

      return res.status(500).json(
        new ApiResponse(
          500,
          null,
          "Failed to queue PDF processing"
        )
      );
    }
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    console.error("PDF upload error:", error);
    throw new ApiError(500, "Failed to process PDF upload");
  }
});


