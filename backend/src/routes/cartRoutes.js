import express from "express";
import {
  getMyCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // all cart routes require login

// GET /api/cart
router.get("/", getMyCart);

// POST /api/cart
router.post("/", addToCart);

// PUT /api/cart
router.put("/", updateCartItem);

// DELETE /api/cart/item/:productId
router.delete("/item/:productId", removeCartItem);

// DELETE /api/cart
router.delete("/", clearCart);

export default router;
