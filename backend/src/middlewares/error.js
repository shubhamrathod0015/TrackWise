export const errorHandler = (err, req, res, next) => {
  let error = err;
  
  if (!(error instanceof ApiError)) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      error = new ApiError(400, `Validation error: ${messages.join(", ")}`);
    }
    // Handle duplicate key errors
    else if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      error = new ApiError(409, `${field} already exists`);
    }
    // Handle JWT errors
    else if (error.name === "JsonWebTokenError") {
      error = new ApiError(401, "Invalid token");
    }
    // Handle other errors
    else {
      error = new ApiError(error.statusCode || 500, error.message || "Internal Server Error");
    }
  }

  const response = {
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack })
  };

  return res.status(error.statusCode).json(response);
};