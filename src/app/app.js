import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Route & Controller imports
import authRoutes from "../routes/auth.routes.js";
import memoryRoutes from "../routes/memory.routes.js";
import { getCategories } from "../controllers/category.controller.js"; 

// Middleware imports
import { globalErrorHandler } from "../middlewares/error.middleware.js";

const app = express();

// Enable Cross-Origin Resource Sharing (CORS) for frontend
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true 
  })
);

// Built-in middlewares for parsing incoming requests
app.use(express.json()); 
app.use(cookieParser()); 

// Register application API routes
app.use("/api/auth", authRoutes);
app.use("/api/v1/memories", memoryRoutes);

// Register Categories Route
app.get("/api/v1/categories", getCategories); 
// Global Error Handler (Must be placed after all routes)
// Catches and formats any errors thrown in controllers
app.use(globalErrorHandler);

export default app;