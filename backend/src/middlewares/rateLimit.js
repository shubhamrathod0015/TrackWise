// # Rate limiting


const rateLimit = require('express-rate-limit');
const redisStore = require('rate-limit-redis');

module.exports = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests
  store: new redisStore({
    client: require('../config/redis')
  }),
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests, please try again later'
    });
  }
});