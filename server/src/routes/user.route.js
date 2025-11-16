import express from "express";
import { checkPlanExpiry, loginUser, logoutUser, refreshAccessToken, registerUser, resendEmail, verifyEmailController } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/refresh-token",refreshAccessToken);
router.get(`/verify-email`,verifyEmailController)
// Secure routes
router.use(verifyJWT);
router.post("/logout",logoutUser);
router.get("/resend-email",resendEmail);
router.post("/check-plan-expiry",checkPlanExpiry);

export default router;