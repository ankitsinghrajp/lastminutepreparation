import express from "express";
import { getChapters, getClasses, getSubjects } from "../controllers/class.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/classes",verifyJWT,getClasses);
router.get("/subjects/:className",verifyJWT, getSubjects);
router.get("/chapters/:className/:subjectName",verifyJWT,getChapters);

export default router;