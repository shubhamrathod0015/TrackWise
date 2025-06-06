// //  # Server entry
// import dotenv from "dotenv"

// import connectDB from "./config/db.js";
// import {app} from './app.js'
// dotenv.config({
//     path: './.env'
// })



// connectDB()
// .then(() => {
//     app.listen(process.env.PORT || 8000, () => {
//         console.log(` Server is running at port : ${process.env.PORT}`);
//     })
// })
// .catch((err) => {
//     console.log("MONGO db connection failed !!! ", err);
// })



// asd
// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import mongoose from "mongoose";
// import router from "./routes/index.js";
// import redisClient from "./utils/redis.js";
// import { config } from "./utils/config.js";
// import logger from "./utils/logger.js";

// const app = express();

// // Database connection
// const connectDB = async () => {
//   try {
//     await mongoose.connect(config.mongodb.uri, config.mongo.options);
//     logger.info("MongoDB connected successfully");
//   } catch (error) {
//     logger.error("MongoDB connection failed", error);
//     process.exit(1);
//   }
// };


// // Middleware
// app.use(cors(config.cors));
// app.use(express.json({ limit: "16kb" }));
// app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// app.use(cookieParser());

// // Routes
// app.use(router);

// // Graceful shutdown
// const shutdown = async () => {
//   try {
//     await mongoose.connection.close();
//     await redisClient.disconnect();
//     logger.info("Services disconnected gracefully");
//     process.exit(0);
//   } catch (error) {
//     logger.error("Graceful shutdown failed", error);
//     process.exit(1);
//   }
// };

// process.on("SIGINT", shutdown);
// process.on("SIGTERM", shutdown);

// // Start server
// const PORT = config.port || 3000;
// app.listen(PORT, () => {
//   connectDB();
//   logger.info(`Server running on port ${PORT} in ${config.env} mode`);
// });



// zxzd

import { config } from "./utils/config.js";
import { app } from "./app.js";
import logger from "./utils/logger.js";
import mongoose from "mongoose";
import redisClient from "./utils/redis.js";

// ======================
// Database Connections
// ======================
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongo.uri, config.mongo.options);
    logger.info("MongoDB connected successfully", {
      db: mongoose.connection.name,
      host: mongoose.connection.host
    });
  } catch (error) {
    logger.error("MongoDB connection failed", {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error("Redis connection failed", {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

// ======================
// Server Initialization
// ======================
const startServer = async () => {
  const PORT = config.port || 3000;
  
  try {
    await Promise.all([connectDB(), connectRedis()]);
    
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${config.env} mode on port ${PORT}`);
    });

    return server;
  } catch (error) {
    logger.error("Server initialization failed", {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

// ======================
// Graceful Shutdown
// ======================
const shutdown = async (server, signal) => {
  logger.warn(`Received ${signal}. Shutting down gracefully...`);
  
  try {
    // Close HTTP server
    await new Promise((resolve) => server.close(resolve));
    
    // Close database connections
    await mongoose.connection.close();
    await redisClient.disconnect();
    
    logger.info("All connections closed. Exiting process.");
    process.exit(0);
  } catch (error) {
    logger.error("Graceful shutdown failed", {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

// ======================
// Entry Point
// ======================
(async () => {
  try {
    const server = await startServer();
    
    // Handle process signals
    process.on("SIGINT", () => shutdown(server, "SIGINT"));
    process.on("SIGTERM", () => shutdown(server, "SIGTERM"));
    
    // Handle unhandled rejections
    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled Rejection", { reason });
      throw reason;
    });
    
    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception", { error });
      shutdown(server, "uncaughtException");
    });
  } catch (error) {
    logger.error("Fatal application error", {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  } 
})();