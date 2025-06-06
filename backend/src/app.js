// // # Express setup

// import express from "express"
// import cors from "cors"
// import cookieParser from "cookie-parser"

// const app = express()

// app.use(cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true
// }))

// app.use(express.json({limit: "16kb"}))
// app.use(express.urlencoded({extended: true, limit: "16kb"}))
// app.use(express.static("public"))
// app.use(cookieParser())

// export { app }


import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./utils/config.js";
import { securityHeaders } from "./utils/security.js";
import { httpLogger } from "./utils/logger.js";
import { rateLimiterConfig } from "./utils/security.js";
import rateLimit from "express-rate-limit";
import router from "./routes/index.js";

// Create Express application
const app = express();

// ======================
// Security Middlewares
// ======================
app.use(securityHeaders); // Security headers (XSS, CSP, HSTS, etc.)
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: config.cors.methods,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ======================
// Core Middlewares
// ======================
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));

// ======================
// Observability Middlewares
// ======================
app.use(httpLogger); // HTTP request logging
app.use(rateLimit(rateLimiterConfig)); // Redis-backed rate limiting

// ======================
// Application Routes
// ======================
app.use(router);

// ======================
// Fallback Route Handler
// ======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`
  });
});

export { app };