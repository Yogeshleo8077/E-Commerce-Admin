import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
} from "../services/paymentService.js";
import { sendOrderConfirmationEmail } from "../services/emailService.js";
import { io } from "../server.js";

// Helper: calculate totals (same as in orderController – you can reuse or share later)
const calculatePrices = (cartItems) => {
  const itemsPrice = cartItems.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  const shippingPrice = itemsPrice > 1000 ? 0 : 50;
  const taxPrice = Math.round(itemsPrice * 0.18);

  const totalPrice = itemsPrice + shippingPrice + taxPrice;
  console.log("Price calculation:", {
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  });
  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};

// @desc    Create Razorpay order from current cart
// @route   POST /api/payment/create-order
// @access  Private
export const createRazorpayOrderForCart = async (req, res, next) => {
  try {
    const user = req.user;

    let cart = await Cart.findOne({ user: user._id }).populate("items.product");
    console.log("Cart for user in create-order:", cart);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const prices = calculatePrices(cart.items);

    const razorpayOrder = await createRazorpayOrder(prices.totalPrice);

    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount, // in paise
      currency: razorpayOrder.currency,
      razorpayOrderId: razorpayOrder.id,
      prices, // useful for frontend if needed
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment and create order
// @route   POST /api/payment/verify
// @access  Private
export const verifyRazorpayPaymentAndCreateOrder = async (req, res, next) => {
  try {
    const user = req.user;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !shippingAddress
    ) {
      return res
        .status(400)
        .json({ message: "Payment details and shippingAddress are required" });
    }

    const isValid = verifyRazorpaySignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (!isValid) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Get user's cart
    let cart = await Cart.findOne({ user: user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Prepare order items & check stock
    const orderItems = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);

      if (!product) {
        return res
          .status(400)
          .json({ message: `Product not found: ${item.product._id}` });
      }

      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Not enough stock for ${product.name}` });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0]?.url || "",
        price: product.price,
        quantity: item.quantity,
      });
    }

    const prices = calculatePrices(
      cart.items.map((i) => ({
        product: { price: i.product.price },
        quantity: i.quantity,
      }))
    );

    // Decrease stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: user._id,
      orderItems,
      shippingAddress,
      paymentMethod: "ONLINE",
      paymentStatus: "PAID",
      paymentInfo: {
        id: razorpay_payment_id,
        status: "captured",
        signature: razorpay_signature,
      },
      itemsPrice: prices.itemsPrice,
      shippingPrice: prices.shippingPrice,
      taxPrice: prices.taxPrice,
      totalPrice: prices.totalPrice,
      orderStatus: "PROCESSING",
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    // Email to user
    await sendOrderConfirmationEmail(user, order);

    // Realtime events
    io.to(`user_${user._id}`).emit("orderCreated", {
      orderId: order._id,
      status: order.orderStatus,
    });
    io.to(`order_${order._id}`).emit("orderStatusUpdated", {
      orderId: order._id,
      status: order.orderStatus,
    });

    res.json({
      message: "Payment verified and order created",
      order,
    });
  } catch (error) {
    next(error);
  }
};
