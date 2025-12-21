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

    const fileBuffer = fs.readFileSync(req.file.path);
    const jobId = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    const cacheKey = `lmp:pdf:${jobId}`;
    const pendingKey = `lmp:pdf:pending:${jobId}`;

    // 🔹 FAST PATH - CHECK REDIS CACHE
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        fs.unlinkSync(req.file.path);
        return res.status(200).json(
          new ApiResponse(200, cached, "PDF processed")
        );
      }
    } catch (err) {
      console.error("Redis GET error:", err);
    }

    // 🔹 CHECK IF ALREADY PENDING (BEFORE ACQUIRING LOCK)
    try {
      const isPending = await redis.get(pendingKey);
      
      if (isPending) {
        // Job already queued by another request
        fs.unlinkSync(req.file.path);
        return res.status(202).json(
          new ApiResponse(202, { jobId }, "PDF processing already in progress")
        );
      }
    } catch (err) {
      console.error("Redis pending check error:", err);
    }

    // 🔹 ACQUIRE LOCK AND TRIGGER JOB
    try {
      const lockAcquired = await redis.set(
        pendingKey,
        "1",
        { NX: true, EX: 120 }
      );

      if (lockAcquired) {
        await inngest.send({
          name: "lmp/generate.pdfProcessing",
          data: {
            jobId,
            filePath: req.file.path,
            originalName: req.file.originalname,
            userId: req.user._id,
          },
        });

        return res.status(202).json(
          new ApiResponse(202, { jobId }, "PDF processing queued")
        );
      } else {
        // Lock was acquired by another request in the microseconds between check and set
        fs.unlinkSync(req.file.path);
        return res.status(202).json(
          new ApiResponse(202, { jobId }, "PDF processing already in progress")
        );
      }
    } catch (err) {
      console.error("Redis lock error:", err);
      fs.unlinkSync(req.file.path);
      return res.status(500).json(
        new ApiResponse(500, null, "Failed to queue PDF processing")
      );
    }
    
  } catch (error) {
    // Clean up file if it exists
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
