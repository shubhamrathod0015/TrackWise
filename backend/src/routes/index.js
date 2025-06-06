import express from "express";
import v1Router from "./v1/index.js";
import { config } from "../utils/config.js";
import { errorHandler } from "../middlewares/error.js";

const router = express.Router();

// API versioning
router.use(`/api/v1`, v1Router);

// Error handling (must be last)
router.use(errorHandler);

export default router;