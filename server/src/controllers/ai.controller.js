import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { configDotenv } from "dotenv";
import { parseSubject } from "../utils/helper.js";
import crypto from "crypto"


configDotenv();

import vision from "@google-cloud/vision";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { redis } from "../libs/redis.js";
import { inngest } from "../libs/inngest.js";

// __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vision client
const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, "../../ocr-key.json"),
});


const summarizer = asyncHandler(async (req, res) => {
  const { topic, level } = req.body;

  if (
    (!topic || !topic.trim()) &&
    (!req.files || !req.files.image)
  ) {
    throw new ApiError(400, "Either topic or image is required!");
  }

  let imageBuffer = null;

  if (req.files?.image) {
    imageBuffer = req.files.image[0].buffer;
  }

  // 🔐 DETERMINISTIC JOB ID
  const jobId = crypto
    .createHash("sha256")
    .update((topic || "") + (level || "") + (imageBuffer || ""))
    .digest("hex");

  const cacheKey = `lmp:summarizer:${jobId}`;
  const pendingKey = `lmp:summarizer:pending:${jobId}`;

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
        return res.status(200).json(
          new ApiResponse(200, finalData, "Summary ready")
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
      return res.status(202).json(
        new ApiResponse(202, { jobId }, "Summary generation already in progress")
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
      { nx: true, ex: 60 } // 2 min lock (matches your original EX time)
    );

    if (lockAcquired) {
      await inngest.send({
        name: "lmp/generate.summarizer",
        data: {
          jobId,
          topic,
          level,
          imageBuffer: imageBuffer
            ? imageBuffer.toString("base64")
            : null,
        },
      });

      return res.status(202).json(
        new ApiResponse(202, { jobId }, "Summary queued")
      );
    } else {
      // Lock was acquired by another request in the microseconds between check and set
      return res.status(202).json(
        new ApiResponse(202, { jobId }, "Summary generation already in progress")
      );
    }
  } catch (err) {
    console.error("Redis lock error:", err);
    return res.status(500).json(
      new ApiResponse(500, null, "Failed to queue summary generation")
    );
  }
});

const topperStyleAnswer = asyncHandler(async (req, res) => {
  const { user_question, selectedClass, selectedSubject, selectedChapter, regenerate } = req.body;
  
  if (!user_question || !selectedClass || !selectedSubject || !selectedChapter) {
    return res.status(400).json(
      new ApiResponse(400, null, "Missing required fields")
    );
  }

  // 🔑 NORMALIZE QUESTION (IMPORTANT)
  const normalizedQuestion = user_question
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  // 🔑 STABLE JOB ID
  const jobId = crypto
    .createHash("sha256")
    .update(`${selectedClass}|${selectedSubject}|${selectedChapter}|${normalizedQuestion}`)
    .digest("hex");

  const cacheKey = `lmp:topper:${jobId}`;
  const pendingKey = `lmp:topper:pending:${jobId}`;

  // -------------------------------------------------------------------
  // 🔄 HANDLE REGENERATE: DELETE CACHE AND FORCE NEW GENERATION
  // -------------------------------------------------------------------
  if (regenerate === true) {
    try {
      // Check if regeneration is already in progress
      const isPending = await redis.get(pendingKey);
      
      if (isPending) {
        // Regeneration already queued, don't trigger again
        return res.status(202).json(
          new ApiResponse(202, { jobId }, "Regeneration already in progress")
        );
      }

      // Delete cache (but NOT pendingKey yet - we'll set it next)
      await redis.del(cacheKey);
      console.log(`Cache cleared for regeneration: ${jobId}`);

      // Acquire lock for regeneration
      const lockAcquired = await redis.set(
        pendingKey,
        "1",
        { nx: true, ex: 60 }
      );

      if (lockAcquired) {
        await inngest.send({
          name: "lmp/generate.topperAnswer",
          data: {
            jobId,
            user_question,
            selectedClass,
            selectedSubject,
            selectedChapter,
          },
        });

        return res.status(202).json(
          new ApiResponse(202, { jobId }, "Regenerating answer")
        );
      } else {
        // Lock was just acquired by another request
        return res.status(202).json(
          new ApiResponse(202, { jobId }, "Regeneration already in progress")
        );
      }
    } catch (err) {
      console.error("Redis error during regenerate:", err);
      return res.status(500).json(
        new ApiResponse(500, null, "Failed to queue answer regeneration")
      );
    }
  }

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
        return res.status(200).json(
          new ApiResponse(200, finalData, "Answer Ready")
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
      return res.status(202).json(
        new ApiResponse(202, { jobId }, "Answer generation already in progress")
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
      { nx: true, ex: 60 }
    );

    if (lockAcquired) {
      await inngest.send({
        name: "lmp/generate.topperAnswer",
        data: {
          jobId,
          user_question,
          selectedClass,
          selectedSubject,
          selectedChapter,
        },
      });

      return res.status(202).json(
        new ApiResponse(202, { jobId }, "Answer is being generated")
      );
    } else {
      // Lock was acquired by another request in the microseconds between check and set
      return res.status(202).json(
        new ApiResponse(202, { jobId }, "Answer generation already in progress")
      );
    }
  } catch (err) {
    console.error("Redis lock error:", err);
    return res.status(500).json(
      new ApiResponse(500, null, "Failed to queue answer generation")
    );
  }
});
const importantQuestionGenerator = asyncHandler(async (req, res) => {
  const { className, subject, chapter, index } = req.body;

  if ([className, subject, chapter].some((f) => !f || f.trim() === "")) {
    throw new ApiError(400, "className, subject, chapter are required!");
  }

  const { mainSubject } = parseSubject(subject);

  const topics =
    Array.isArray(index) && index.length > 0
      ? JSON.stringify(index)
      : "All key topics";

  const cacheKey = `lmp:impQ:${className}:${mainSubject}:${chapter}:${topics}`;
  const pendingKey = `lmp:impQ:pending:${className}:${mainSubject}:${chapter}:${topics}`;

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
        return res.status(200).json(
          new ApiResponse(
            200,
            { data: finalData },
            "Important Questions Ready (Redis)"
          )
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
        .json(new ApiResponse(202, null, "Important questions generation already in progress"));
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
      { nx: true, ex: 150 }
    );

    if (lockAcquired) {
      await inngest.send({
        name: "lmp/generate.importantQuestions",
        data: { className, subject, chapter, index },
      });

      return res
        .status(202)
        .json(
          new ApiResponse(202, null, "Important questions generation queued")
        );
    } else {
      // Lock was acquired by another request in the microseconds between check and set
      return res
        .status(202)
        .json(new ApiResponse(202, null, "Important questions generation already in progress"));
    }
  } catch (err) {
    console.error("Redis lock error:", err);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to queue generation"));
  }
});


const quizMcqFillupTrueFalse = asyncHandler(async (req, res) => {
  const { className, subject, chapter, index } = req.body;

  if (!className || !subject || !chapter) {
    throw new ApiError(400, "className, subject and chapter are required");
  }

  const { mainSubject } = parseSubject(subject);

  const topics =
    Array.isArray(index) && index.length > 0
      ? JSON.stringify(index)
      : "All key topics";

  const cacheKey = `lmp:quiz:${className}:${mainSubject}:${chapter}:${topics}`;
  const pendingKey = `lmp:quiz:pending:${className}:${mainSubject}:${chapter}:${topics}`;

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
        return res.status(200).json(
          new ApiResponse(
            200,
            { data: finalData },
            "Quiz (MCQ, Fillups, True/False) Ready (Redis)"
          )
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
        .json(new ApiResponse(202, null, "Quiz generation already in progress"));
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
      { nx: true, ex: 150 } 
    );

    if (lockAcquired) {
      await inngest.send({
        name: "lmp/generate.quizMcqFillupTrueFalse",
        data: { className, subject, chapter, index },
      });

      return res
        .status(202)
        .json(
          new ApiResponse(202, null, "Quiz generation queued")
        );
    } else {
      // Lock was acquired by another request in the microseconds between check and set
      return res
        .status(202)
        .json(new ApiResponse(202, null, "Quiz generation already in progress"));
    }
  } catch (err) {
    console.error("Redis lock error:", err);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to queue generation"));
  }
});

const askAnyQuestion = asyncHandler(async (req, res) => {
  const question = req.body?.question?.trim() || "";
  const hasImage = !!req.files?.image;

  if (!question && !hasImage) {
    throw new ApiError(400, "Please provide a question or upload an image");
  }

  // ---------- IMAGE PROCESSING (IF ANY) ----------
  let extractedText = "";
  let labels = [];
  let mode = "no_image";
  let imageHash = "";

  if (hasImage) {
    let buffer = req.files.image[0].buffer;
    buffer = await sharp(buffer).png().toBuffer();

    imageHash = crypto.createHash("sha256").update(buffer).digest("hex");

    const [textResult] = await client.textDetection({
      image: { content: buffer },
    });
    extractedText = textResult.fullTextAnnotation?.text || "";

    const [labelResult] = await client.labelDetection({
      image: { content: buffer },
    });
    labels = (labelResult.labelAnnotations || [])
      .map((x) => x.description)
      .slice(0, 5);

    if (extractedText.trim()) mode = "text";
    else if (labels.length) mode = "label_only";
    else mode = "fallback";
  }

  const finalQuestion =
    question || extractedText || labels.join(", ");

  // ---------- JOB ID ----------
  const jobId = crypto
    .createHash("sha256")
    .update(finalQuestion + imageHash)
    .digest("hex");

  const cacheKey = `lmp:askany:${jobId}`;
  const pendingKey = `lmp:askany:pending:${jobId}`;

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
          status: "completed",
          jobId,
          answer: finalData.answer || finalData,
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
        status: "processing",
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
      { nx: true, ex: 60 } 
    );

    if (lockAcquired) {
      await inngest.send({
        name: "lmp/generate.askAnyQuestion",
        data: {
          jobId,
          finalQuestion,
          mode,
          extractedText,
          labels,
        },
      });

      return res.status(202).json({
        success: true,
        status: "processing",
        jobId,
      });
    } else {
      // Lock was acquired by another request in the microseconds between check and set
      return res.status(202).json({
        success: true,
        status: "processing",
        jobId,
      });
    }
  } catch (err) {
    console.error("Redis lock error:", err);
    return res.status(500).json({
      success: false,
      status: "error",
      message: "Failed to queue question processing",
    });
  }
});

const generatePYQs = asyncHandler(async (req, res) => {
  const { className, subject, chapter, year } = req.body;

  if (!className || !subject || !chapter || !year) {
    throw new ApiError(
      400,
      "className, subject, chapter and year are required"
    );
  }

  const { mainSubject } = parseSubject(subject);

  const cacheKey = `lmp:pyq:${className}:${mainSubject}:${chapter}:${year}`;
  const pendingKey = `lmp:pyq:pending:${className}:${mainSubject}:${chapter}:${year}`;

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
          .json(new ApiResponse(200, { data: finalData }, "PYQs Ready (Redis)"));
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
        .json(new ApiResponse(202, null, "PYQs generation already in progress"));
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
      { nx: true, ex: 150 } 
    );

    if (lockAcquired) {
      await inngest.send({
        name: "lmp/generate.pyqs",
        data: { className, subject, chapter, year },
      });

      return res
        .status(202)
        .json(new ApiResponse(202, null, "PYQs generation queued"));
    } else {
      // Lock was acquired by another request in the microseconds between check and set
      return res
        .status(202)
        .json(new ApiResponse(202, null, "PYQs generation already in progress"));
    }
  } catch (err) {
    console.error("Redis lock error:", err);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to queue generation"));
  }
});

export { summarizer, topperStyleAnswer, importantQuestionGenerator, quizMcqFillupTrueFalse,askAnyQuestion, generatePYQs};