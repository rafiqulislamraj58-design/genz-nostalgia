import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import adminRoutes from "../routes/admin.routes.js";
// Route & Controller imports
import authRoutes from "../routes/auth.routes.js";
import memoryRoutes from "../routes/memory.routes.js";
import { getCategories } from "../controllers/category.controller.js"; 

// Middleware imports
import { globalErrorHandler } from "../middlewares/error.middleware.js";
import uploadRoutes from "../routes/upload.routes.js";

const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  "https://gen-z-frontend-five.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Postman বা সার্ভার-টু-সার্ভার রিকোয়েস্টের জন্য origin undefined হতে পারে
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true 
  })
);

// Built-in middlewares for parsing incoming requests
app.use(express.json()); 
app.use(cookieParser()); 

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Zen Z Nostalgia Backend API! 🚀",
    status: "Server is up and running successfully",
    timestamp: new Date().toISOString()
  });
});

// Register application API routes
app.use("/api/auth", authRoutes);
app.use("/api/v1/memories", memoryRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/uploads", uploadRoutes);

// Register Categories Route
app.get("/api/v1/categories", getCategories); 

// Global Error Handler (Must be placed after all routes)
app.use(globalErrorHandler);

export default app;