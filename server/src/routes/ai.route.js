import express from "express";
import { summarizer } from "../controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyEmailMiddleware } from "../middlewares/mailVerify.middleware.js";

const router = express.Router();
router.use(verifyJWT);
router.use(verifyEmailMiddleware);
router.post("/summarizer",summarizer);

export default router;