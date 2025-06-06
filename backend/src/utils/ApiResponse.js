/**
 * Standardized API success response format
 */
export class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }

    /**
     * Send the formatted response
     * @param {Response} res - Express response object
     * @returns {Response} Formatted JSON response
     */
    send(res) {
        return res.status(this.statusCode).json({
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            data: this.data
        });
    }
}

/**
 * Standardized API pagination response
 */
export class PaginatedResponse extends ApiResponse {
    constructor(statusCode, data, pagination, message = "Success") {
        super(statusCode, data, message);
        this.pagination = pagination;
    }

    send(res) {
        return res.status(this.statusCode).json({
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            data: this.data,
            pagination: this.pagination
        });
    }
}