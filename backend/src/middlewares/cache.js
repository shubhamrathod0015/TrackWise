// # Redis caching
import cacheManager from "../utils/cache.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const cacheMiddleware = (ttl = 3600) => {
  return async (req, res, next) => {
    if (req.method !== "GET") return next();
    
    const key = cacheManager.generateKey(req);
    const cachedData = await cacheManager.get(key);

    if (cachedData) {
      return res
        .status(200)
        .json(new ApiResponse(200, { ...cachedData, cached: true }, "Data served from cache"));
    }

    // Override res.json to cache response before sending
    const originalJson = res.json;
    res.json = (body) => {
      cacheManager.set(key, body, ttl);
      return originalJson.call(res, body);
    };

    next();
  };
};

export default cacheMiddleware;

