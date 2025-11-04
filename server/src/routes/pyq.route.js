import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { bulkUploadPYQ, createPYQ, getPYQ } from "../controllers/pyq.controller.js";
const router = express.Router();

router.use(verifyJWT);
router.post("/admin/create",createPYQ);
router.get("/get-pyqs",getPYQ);
router.post("/admin/bulk-upload",bulkUploadPYQ);

export default router;