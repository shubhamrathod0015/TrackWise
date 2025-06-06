// # Rate limiting
import { rateLimit } from "express-rate-limit";
import redisClient from "../utils/redis.js";

const redisStore = {
  async increment(key) {
    const totalHits = await redisClient.incr(key);
    const ttl = await redisClient.ttl(key);
    
    if (ttl === -1) {
      await redisClient.expire(key, 60);
      return { totalHits, resetTime: new Date(Date.now() + 60000) };
    }
    
    return { totalHits, resetTime: new Date(Date.now() + ttl * 1000) };
  }
};

const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per window
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  store: redisStore,
  keyGenerator: (req) => req.ip,
  handler: (req, res, next, options) => {
    throw new ApiError(429, `Too many requests. Limit: ${options.max} per minute`);
  }
});

export default apiRateLimiter;