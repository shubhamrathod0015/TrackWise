/**
 * Custom API error class for standardized error handling
 */
export class ApiError extends Error {
    /**
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Error message
     * @param {Array} errors - Detailed error information
     * @param {string} stack - Error stack trace
     */
    constructor(statusCode, message, errors = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;
        
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Convert error to JSON format
     * @returns {Object} Standardized error object
     */
    toJSON() {
        return {
            success: false,
            statusCode: this.statusCode,
            message: this.message,
            ...(this.errors.length > 0 && { errors: this.errors }),
            ...(process.env.NODE_ENV === "development" && { stack: this.stack })
        };
    }

    /**
     * Send error response
     * @param {Response} res - Express response object
     */
    send(res) {
        return res.status(this.statusCode).json(this.toJSON());
    }

    /**
     * Create a bad request error (400)
     */
    static badRequest(message = "Bad Request", errors = []) {
        return new ApiError(400, message, errors);
    }

    /**
     * Create an unauthorized error (401)
     */
    static unauthorized(message = "Unauthorized") {
        return new ApiError(401, message);
    }

    /**
     * Create a forbidden error (403)
     */
    static forbidden(message = "Forbidden") {
        return new ApiError(403, message);
    }

    /**
     * Create a not found error (404)
     */
    static notFound(message = "Not Found") {
        return new ApiError(404, message);
    }

    /**
     * Create a conflict error (409)
     */
    static conflict(message = "Conflict") {
        return new ApiError(409, message);
    }

    /**
     * Create an internal server error (500)
     */
    static internal(message = "Internal Server Error") {
        return new ApiError(500, message);
    }
}