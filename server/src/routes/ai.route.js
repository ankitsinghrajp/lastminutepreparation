import express from "express";
import { askAnyQuestion, generatePYQs, importantQuestionGenerator, quizMcqFillupTrueFalse, summarizer, topperStyleAnswer } from "../controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyEmailMiddleware } from "../middlewares/mailVerify.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { upload as pdfUpload } from "../middlewares/upload.middleware.js";

import { rateLimitByPlan } from "../rateLimiter.js";
import { LastMinutePanelAICoach, LastMinutePanelImportantTopics, LastMinutePanelMCQs, LastMinutePanelMemoryBooster, LastMinutePanelPredictedQuestions, LastMinutePanelSummary } from "../controllers/lastminute.controller.js";
import { chapterWiseDoubtSolver, chapterWiseMindMap, chapterWiseShortNotes, chapterWiseStudyQuestions, smartChapterSummary } from "../controllers/chapterwise.controller.js";
import { diagramImageAnalysis } from "../controllers/image.controller.js";
import { chatWithPdf } from "../controllers/chatWithPdf.controller.js";
import { uploadPdfAndProcess } from "../controllers/uploadPdfAndProcess.controller.js";
import { premiumOnly } from "../middlewares/premiumOnly.middleware.js";
import { pdfUploadQuotaCheck } from "../middlewares/pdfQuota.middleware.js";
import { redis } from "../libs/redis.js";

const router = express.Router();
router.use(verifyJWT);
router.use(verifyEmailMiddleware);


router.use(rateLimitByPlan);

router.post("/summarizer",upload.fields([
    {
        name:"image",
        maxCount:1
    }
]),summarizer);

// Last Night Before Exam Routes
router.post("/last-night-before-exam/summary",LastMinutePanelSummary);
router.post("/last-night-before-exam/important-topics",LastMinutePanelImportantTopics);
router.post("/last-night-before-exam/predicted-questions",LastMinutePanelPredictedQuestions);
router.post("/last-night-before-exam/mcqs",LastMinutePanelMCQs);
router.post("/last-night-before-exam/memory-booster",LastMinutePanelMemoryBooster);
router.post("/last-night-before-exam/ai-coach",LastMinutePanelAICoach);


// Topper Style Answer API Routes 
router.post("/topper-style-answer",topperStyleAnswer);


// Chapter Wise Study Routes
router.post("/chapter-wise-study/summary",smartChapterSummary);
router.post("/chapter-wise-study/short-notes",chapterWiseShortNotes);
router.post("/chapter-wise-study/important-questions",chapterWiseStudyQuestions);
router.post("/chapter-wise-study/mind-map",chapterWiseMindMap);
router.post("/chapter-wise-study/doubt-solver",chapterWiseDoubtSolver);



router.post("/important-question-generator",importantQuestionGenerator);
router.post("/ask-any",upload.fields([
    {
        name:"image",
        maxCount:1
    }
]),askAnyQuestion);




// Chat with pdf routes Premium Only routes
router.use(premiumOnly);

router.post("/get-pyqs",generatePYQs);
router.post("/image-analysis",upload.fields([
    {
        name:"image",
        maxCount:1
    }
]),diagramImageAnalysis);
router.post("/quiz-fillups",quizMcqFillupTrueFalse);



router.use(pdfUploadQuotaCheck);

router.post("/upload-pdf", pdfUpload.single("pdf"), uploadPdfAndProcess);
router.post("/chat-with-pdf", chatWithPdf);





// for testing only
router.get("/test-redis", async (req, res) => {
  try {
    const set = await redis.set("test123", "hello world", { ex: 60 });
    const get = await redis.get("test123");

    return res.json({ set, get });
  } catch (e) {
    return res.json({ error: e.message });
  }
});


export default router;