// # Redis caching

const redis = require('../config/redis');

const cache = (duration) => {
  return async (req, res, next) => {
    const key = '__express__' + req.originalUrl;
    const cachedData = await redis.get(key);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    } else {
      res.sendResponse = res.json;
      res.json = (body) => {
        redis.setex(key, duration, JSON.stringify(body));
        res.sendResponse(body);
      };
      next();
    }
  };
};