import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
} from "../services/emailService.js";
import { io } from "../server.js"; // for realtime updates

// Helper: calculate price totals
const calculatePrices = (cartItems) => {
  const itemsPrice = cartItems.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  const shippingPrice = itemsPrice > 1000 ? 0 : 50; // example rule
  const taxPrice = Math.round(itemsPrice * 0.18); // 18% GST example

  const totalPrice = itemsPrice + shippingPrice + taxPrice;
  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};

// @desc    Create order from cart (COD version for now)
// @route   POST /api/orders
// @access  Private
export const createOrderFromCart = async (req, res, next) => {
  try {
    const user = req.user;
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res
        .status(400)
        .json({ message: "shippingAddress and paymentMethod are required" });
    }

    if (!["COD", "ONLINE"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    // Get user's cart
    let cart = await Cart.findOne({ user: user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Prepare order items + check stock & recalc price using latest product data
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
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING",
      itemsPrice: prices.itemsPrice,
      shippingPrice: prices.shippingPrice,
      taxPrice: prices.taxPrice,
      totalPrice: prices.totalPrice,
      orderStatus: "PENDING",
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    // Send email
    await sendOrderConfirmationEmail(user, order);

    // Emit realtime event (user can listen by userId or orderId room)
    io.to(`user_${user._id}`).emit("orderCreated", {
      orderId: order._id,
      status: order.orderStatus,
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by id (only owner or admin)
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not allowed to view this order" });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin - get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments();
    const orders = await Order.find()
      .populate("user", "name email")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    res.json({
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin - update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = status;

    if (status === "DELIVERED") {
      order.paymentStatus = "PAID"; // for COD after delivery
      order.deliveredAt = new Date();
    }

    if (status === "CANCELLED") {
      order.cancelledAt = new Date();
      // (refund logic for ONLINE can be added later)
    }

    await order.save();

    // Email notification
    await sendOrderStatusUpdateEmail(order.user, order);

    // Realtime update: notify user room & order room
    io.to(`user_${order.user._id}`).emit("orderStatusUpdated", {
      orderId: order._id,
      status: order.orderStatus,
    });
    io.to(`order_${order._id}`).emit("orderStatusUpdated", {
      orderId: order._id,
      status: order.orderStatus,
    });

    res.json({
      message: "Order status updated",
      order,
    });
  } catch (error) {
    next(error);
  }
};
