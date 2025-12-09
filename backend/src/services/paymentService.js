import dotenv from "dotenv";
dotenv.config(); // Make sure env vars are loaded
import Razorpay from "razorpay";
import crypto from "crypto";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn(
    "⚠️ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in .env. Payment will not work."
  );
}

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (amountInRupees) => {
  const amountInPaise = amountInRupees * 100; // Razorpay expects paise

  const options = {
    amount: amountInPaise,
    currency: "INR",
  };

  // const order = await razorpayInstance.orders.create(options);
  // return order;

  try {
    const order = await razorpayInstance.orders.create(options);
    console.log("Razorpay order created:", order.id);
    return order;
  } catch (err) {
    console.error(
      "Razorpay create order error:",
      err?.message,
      err?.statusCode,
      err?.error
    );
    throw err;
  }
};

export const verifyRazorpaySignature = ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  return expectedSignature === razorpaySignature;
};
