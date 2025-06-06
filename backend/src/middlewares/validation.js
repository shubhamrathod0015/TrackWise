import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));

    throw new ApiError(422, "Validation failed", formattedErrors);
  };
};

// Chapter filter validation rules
const chapterFilterRules = [
  check("class").optional().trim().isString(),
  check("subject").optional().trim().isString(),
  check("unit").optional().trim().isString(),
  check("status").optional().isIn(["Completed", "In Progress", "Not Started"]),
  check("isWeakChapter").optional().isBoolean(),
  check("page").optional().isInt({ min: 1 }).toInt(),
  check("limit").optional().isInt({ min: 1, max: 100 }).toInt()
];

export { validate, chapterFilterRules };