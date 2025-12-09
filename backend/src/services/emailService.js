import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // app password if using Gmail
  },
});

// generic function
export const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) return;

  const mailOptions = {
    from: `"MyShop" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export const sendOrderConfirmationEmail = async (user, order) => {
  const subject = `Order Placed Successfully (#${order._id})`;
  const text = `Hi ${user.name}, your order has been placed successfully. Total: ₹${order.totalPrice}.`;
  await sendEmail({ to: user.email, subject, text });
};

export const sendOrderStatusUpdateEmail = async (user, order) => {
  const subject = `Order Status Updated (#${order._id})`;
  const text = `Hi ${user.name}, your order status is now: ${order.orderStatus}.`;
  await sendEmail({ to: user.email, subject, text });
};
