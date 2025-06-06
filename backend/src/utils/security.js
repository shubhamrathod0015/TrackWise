

// src/utils/security.js

// Example config object for rate limiting
const config = {
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute window
    max: 100,            // limit each IP to 100 requests per window
  }
};

/**
 * Set security headers middleware
 */
export const securityHeaders = (req, res, next) => {
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Basic XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Prevent embedding in iframes
  res.setHeader('X-Frame-Options', 'DENY');

  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'");

  // Strict transport security
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Referrer policy
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');

  next();
};

/**
 * Rate limiter configuration
 */
export const rateLimiterConfig = {
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      status: "error",
      message: `Too many requests. Limit: ${config.rateLimit.max} per minute`
    });
  }
};

/**
 * Sanitize input data to prevent injection attacks
 */
export const sanitize = (data) => {
  if (typeof data === 'string') {
    // Remove potentially dangerous characters
    return data.replace(/[<>"'`]/g, '');
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitize(item));
  }

  if (typeof data === 'object' && data !== null) {
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = sanitize(data[key]);
      return acc;
    }, {});
  }

  return data;
};

/**
 * Validate MongoDB ObjectId format
 */
export const isValidId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};
