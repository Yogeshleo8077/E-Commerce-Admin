import express from "express";
import {
  createOrderFromCart,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// User routes
router.post("/", protect, createOrderFromCart);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

// Admin routes
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
