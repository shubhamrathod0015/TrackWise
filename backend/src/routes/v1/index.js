import express from "express";
import chapterRouter from "./chapter.routes.js";
import authRouter from "./auth.routes.js";
import { securityHeaders } from "../../utils/security.js";
import { rateLimiterConfig } from "../../utils/security.js";
import rateLimit from "express-rate-limit";
import { httpLogger } from "../../utils/logger.js";

const router = express.Router();

// Apply global middleware
router.use(httpLogger); // HTTP request logging
router.use(securityHeaders); // Security headers
router.use(rateLimit(rateLimiterConfig)); // Global rate limiting

// Route grouping
router.use("/auth", authRouter);
router.use("/chapters", chapterRouter);

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// 404 handler
router.use((req, res, next) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route ${req.originalUrl} not found`
  });
});

export default router;