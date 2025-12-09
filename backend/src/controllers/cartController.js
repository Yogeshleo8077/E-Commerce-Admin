import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Helper: get or create cart for user
const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await cart.populate("items.product");
  }
  return cart;
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
export const getMyCart = async (req, res, next) => {
  try {
    const cart = await findOrCreateCart(req.user._id);
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart (or increase quantity)
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const qty = quantity && quantity > 0 ? quantity : 1;

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await findOrCreateCart(userId);

    // Check if item already exists
    const existingItem = cart.items.find(
      (item) => item.product._id.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();
    cart = await cart.populate("items.product");

    res.json({
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quantity of a cart item
// @route   PUT /api/cart
// @access  Private
export const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId || quantity == null) {
      return res
        .status(400)
        .json({ message: "productId and quantity are required" });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    let cart = await findOrCreateCart(userId);

    const item = cart.items.find((i) => i.product._id.toString() === productId);

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;

    await cart.save();
    cart = await cart.populate("items.product");

    res.json({
      message: "Cart item updated",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/item/:productId
// @access  Private
export const removeCartItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    let cart = await findOrCreateCart(userId);

    const initialLength = cart.items.length;

    cart.items = cart.items.filter(
      (i) => i.product._id.toString() !== productId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    await cart.save();
    cart = await cart.populate("items.product");

    res.json({
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let cart = await findOrCreateCart(userId);

    cart.items = [];
    await cart.save();

    res.json({ message: "Cart cleared", cart });
  } catch (error) {
    next(error);
  }
};
