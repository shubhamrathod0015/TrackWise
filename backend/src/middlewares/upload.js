import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/json") {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only JSON files are allowed"), false);
  }
};

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Single file
  }
});

const jsonFileUpload = upload.single("chaptersFile");

const validateUpload = (req, res, next) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }
  
  try {
    const data = JSON.parse(req.file.buffer.toString());
    if (!Array.isArray(data)) {
      throw new ApiError(400, "Uploaded file must contain an array of chapters");
    }
    
    req.chaptersData = data;
    next();
  } catch (error) {
    throw new ApiError(400, "Invalid JSON file: " + error.message);
  }
};

export { jsonFileUpload, validateUpload };