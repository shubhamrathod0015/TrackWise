//  # Business logic
import { Chapter } from "../models/chapter.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import cacheManager from "../utils/cache.js";

/**
 * @desc    Get all chapters with filtering and pagination
 * @route   GET /api/v1/chapters
 * @access  Public
 */
const getChapters = async (req, res, next) => {
  try {
    const {
      class: className,
      subject,
      unit,
      status,
      isWeakChapter,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = {};
    if (className) filter.class = className;
    if (subject) filter.subject = subject;
    if (unit) filter.unit = unit;
    if (status) filter.status = status;
    if (isWeakChapter) filter.isWeakChapter = isWeakChapter === 'true';

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalChapters = await Chapter.countDocuments(filter);

    // Execute query
    const chapters = await Chapter.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Prepare response
    const response = new ApiResponse(200, {
      chapters,
      pagination: {
        total: totalChapters,
        pages: Math.ceil(totalChapters / limit),
        currentPage: parseInt(page),
        perPage: parseInt(limit)
      }
    }, "Chapters retrieved successfully");

    res.status(200).json(response);
  } catch (error) {
    next(new ApiError(500, "Failed to retrieve chapters", error));
  }
};

/**
 * @desc    Get single chapter by ID
 * @route   GET /api/v1/chapters/:id
 * @access  Public
 */
const getChapterById = async (req, res, next) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    
    if (!chapter) {
      throw new ApiError(404, "Chapter not found");
    }

    res.status(200).json(
      new ApiResponse(200, chapter, "Chapter retrieved successfully")
    );
  } catch (error) {
    next(new ApiError(
      error.statusCode || 500, 
      error.message || "Failed to retrieve chapter", 
      error
    ));
  }
};

/**
 * @desc    Upload multiple chapters (Admin only)
 * @route   POST /api/v1/chapters
 * @access  Private/Admin
 */
const uploadChapters = async (req, res, next) => {
  try {
    const chaptersData = req.chaptersData;
    const failedUploads = [];
    const successfulUploads = [];

    // Process chapters in batches
    const batchSize = 50;
    for (let i = 0; i < chaptersData.length; i += batchSize) {
      const batch = chaptersData.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(chapterData => processChapter(chapterData))
      );

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulUploads.push(result.value);
        } else {
          failedUploads.push({
            data: batch[index],
            error: result.reason.message
          });
        }
      });
    }

    // Invalidate cache
    await cacheManager.invalidate("chapters:*");

    // Prepare response
    const response = new ApiResponse(
      201,
      {
        successCount: successfulUploads.length,
        failureCount: failedUploads.length,
        failedUploads
      },
      `Chapters uploaded: ${successfulUploads.length} succeeded, ${failedUploads.length} failed`
    );

    res.status(201).json(response);
  } catch (error) {
    next(new ApiError(500, "Bulk upload failed", error));
  }
};

// Helper function to process individual chapters
const processChapter = async (chapterData) => {
  try {
    // Validate required fields
    const requiredFields = ['subject', 'chapter', 'class', 'unit', 'questionSolved'];
    const missingFields = requiredFields.filter(field => !chapterData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Create chapter document
    const chapter = new Chapter({
      subject: chapterData.subject,
      chapter: chapterData.chapter,
      class: chapterData.class,
      unit: chapterData.unit,
      questionSolved: chapterData.questionSolved,
      yearWiseQuestionCount: chapterData.yearWiseQuestionCount || {},
      status: chapterData.status || "Not Started",
      isWeakChapter: chapterData.isWeakChapter || false
    });

    // Validate schema
    await chapter.validate();

    // Save to database
    const savedChapter = await chapter.save();
    return savedChapter._id;
  } catch (error) {
    throw new Error(error.message || "Chapter validation failed");
  }
};

export { getChapters, getChapterById, uploadChapters };