import redis from "redis";
import { promisify } from "util";

class CacheManager {
  constructor() {
    this.client = redis.createClient({
      url: process.env.REDIS_URL,
      legacyMode: true
    });
    
    this.client.connect()
      .then(() => console.log("Redis connected"))
      .catch(err => console.error("Redis connection error:", err));
    
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setExAsync = promisify(this.client.setEx).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  async set(key, value, ttl = 3600) {
    return this.setExAsync(key, ttl, JSON.stringify(value));
  }

  async get(key) {
    const data = await this.getAsync(key);
    return data ? JSON.parse(data) : null;
  }

  async invalidate(keys) {
    if (Array.isArray(keys)) return this.delAsync(keys);
    return this.delAsync([keys]);
  }

  generateKey(req) {
    const filterParams = new URLSearchParams(req.query).toString();
    return `chapters:${filterParams}`;
  }
}

export default new CacheManager();