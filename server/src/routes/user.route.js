import express from "express";
import { checkPlanExpiry, earlyUserRegister, loginUser, logoutUser, refreshAccessToken, registerUser, resendEmail, verifyEmailController } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { loginLimiter, registerLimiter } from "../rateLimiter.js";
const router = express.Router();

router.post("/register",registerLimiter,registerUser);
router.post("/early-user-register",registerLimiter,earlyUserRegister);
router.post("/login",loginLimiter,loginUser);
router.post("/refresh-token",refreshAccessToken);
router.get(`/verify-email`,verifyEmailController)
// Secure routes
router.use(verifyJWT);
router.post("/logout",logoutUser);
router.get("/resend-email",resendEmail);
router.post("/check-plan-expiry",checkPlanExpiry);

export default router;