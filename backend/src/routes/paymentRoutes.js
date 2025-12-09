import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createRazorpayOrderForCart,
  verifyRazorpayPaymentAndCreateOrder,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-order", protect, createRazorpayOrderForCart);
router.post("/verify", protect, verifyRazorpayPaymentAndCreateOrder);

export default router;
