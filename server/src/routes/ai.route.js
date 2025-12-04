import express from "express";
import { askAnyQuestion, generatePYQs, importantQuestionGenerator, quizMcqFillupTrueFalse, summarizer, topperStyleAnswer } from "../controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyEmailMiddleware } from "../middlewares/mailVerify.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { rateLimitByPlan } from "../rateLimiter.js";
import { LastMinutePanelAICoach, LastMinutePanelImportantTopics, LastMinutePanelMCQs, LastMinutePanelMemoryBooster, LastMinutePanelPredictedQuestions, LastMinutePanelSummary } from "../controllers/lastminute.controller.js";
import { chapterWiseDoubtSolver, chapterWiseMindMap, chapterWiseShortNotes, chapterWiseStudyQuestions, smartChapterSummary } from "../controllers/chapterwise.controller.js";
import { diagramImageAnalysis } from "../controllers/image.controller.js";

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


router.post("/get-pyqs",generatePYQs);
router.post("/important-question-generator",importantQuestionGenerator);
router.post("/quiz-fillups",quizMcqFillupTrueFalse);
router.post("/ask-any",askAnyQuestion);



// Image & Pdf Routes


// - Diagram Analysis

router.post("/image-analysis",upload.fields([
    {
        name:"image",
        maxCount:1
    }
]),diagramImageAnalysis);


export default router;