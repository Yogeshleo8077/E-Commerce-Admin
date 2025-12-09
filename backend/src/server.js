import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5173",
  "https://your-frontend.vercel.app",
  "https://your-admin.vercel.app",
];

dotenv.config();

// Connect DB
connectDB();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// Basic socket connection handler
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Join user-specific room
  socket.on("joinUserRoom", (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
    }
  });

  // Join order-specific room
  socket.on("joinOrderRoom", (orderId) => {
    if (orderId) {
      socket.join(`order_${orderId}`);
    }
  });

  // later: join rooms for orders, chat, etc.
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Export io for use in controllers (for emitting events later)
export { io };

// Start server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
