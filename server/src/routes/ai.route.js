import express from "express";
import { askAnyQuestion, chapterWiseStudy, diagramImageAnalysis, importantQuestionGenerator, lastNightBeforeExam, quizMcqFillupTrueFalse, summarizer } from "../controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyEmailMiddleware } from "../middlewares/mailVerify.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { rateLimitByPlan } from "../rateLimiter.js";

const router = express.Router();
router.use(verifyJWT);
router.use(verifyEmailMiddleware);
router.use(rateLimitByPlan);
router.post("/summarizer",upload.fields([
    {
        name:"pdf",
        maxCount:1
    }
]),summarizer);

router.post("/last-night-before-exam",lastNightBeforeExam);
router.post("/chapter-wise-study",chapterWiseStudy);
router.post("/important-question-generator",importantQuestionGenerator);
router.post("/quiz-fillups",quizMcqFillupTrueFalse);
router.post("/ask-any",askAnyQuestion);
router.post("/image-analysis",upload.fields([
    {
        name:"image",
        maxCount:1
    }
]),diagramImageAnalysis);

export default router;