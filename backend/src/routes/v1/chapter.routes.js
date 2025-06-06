import express from "express";
import {
  getChapters,
  getChapterById,
  uploadChapters
} from "../../controllers/chapter.controller.js";
import { verifyJWT, verifyAdmin } from "../../middlewares/auth.js";
import cacheMiddleware from "../../middlewares/cache.js";
import { validate } from "../../middlewares/validation.js";
import { chapterFilterRules } from "../../middlewares/validation.js";
import { jsonFileUpload, validateUpload } from "../../middlewares/upload.js";

const router = express.Router();

// Public routes
router.route("/")
  .get(
    validate(chapterFilterRules),
    cacheMiddleware(3600), // Cache for 1 hour
    getChapters
  );

router.route("/:id")
  .get(getChapterById);

// Admin protected routes
router.route("/")
  .post(
    verifyJWT,
    verifyAdmin,
    jsonFileUpload,
    validateUpload,
    uploadChapters
  );

export default router;