import express from "express";
import { summarizer } from "../controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyEmail } from "../middlewares/mailVerify.middleware.js";

const router = express.Router();
router.use(verifyJWT);
router.use(verifyEmail);
router.post("/summarizer",summarizer);

export default router;