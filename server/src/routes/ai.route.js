import express from "express";
import { summarizer } from "../controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyEmailMiddleware } from "../middlewares/mailVerify.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();
router.use(verifyJWT);
router.use(verifyEmailMiddleware);

router.post("/summarizer",upload.fields([
    {
        name:"pdf",
        maxCount:1
    }
]),summarizer);

export default router;