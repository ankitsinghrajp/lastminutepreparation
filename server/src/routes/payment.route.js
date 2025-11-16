import express from "express";
import { checkout, getKey, paymentVerification } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/checkout",checkout);
router.post("/verify",paymentVerification);
router.get("/get-key",getKey);

export default router;