import express from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);

// Secure routes
router.use(verifyJWT);
router.post("/logout",logoutUser);
router.post("/refresh-token",refreshAccessToken);

export default router;