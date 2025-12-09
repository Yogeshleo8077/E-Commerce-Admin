import express from "express";
import {
  addOrUpdateReview,
  getProductReviews,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: get all reviews for product
router.get("/:productId", getProductReviews);

// User: add or update review
router.post("/:productId", protect, addOrUpdateReview);

// Admin: delete review
router.delete("/:productId/:reviewId", protect, adminOnly, deleteReview);

export default router;
