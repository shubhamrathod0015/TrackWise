import redis from "redis";
import { promisify } from "util";
import logger from "./logger.js";

class RedisManager {
    constructor() {
        this.client = redis.createClient({
            url: process.env.REDIS_URL,
            legacyMode: true
        });

        this.client.on("error", (err) => {
            logger.error(`Redis Error: ${err.message}`, { service: "redis" });
        });

        this.client.on("connect", () => {
            logger.info("Redis connected successfully", { service: "redis" });
        });

        this.client.on("end", () => {
            logger.warn("Redis connection closed", { service: "redis" });
        });

        // Promisify methods
        this.getAsync = promisify(this.client.get).bind(this.client);
        this.setExAsync = promisify(this.client.setEx).bind(this.client);
        this.delAsync = promisify(this.client.del).bind(this.client);
        this.incrAsync = promisify(this.client.incr).bind(this.client);
        this.expireAsync = promisify(this.client.expire).bind(this.client);
        this.ttlAsync = promisify(this.client.ttl).bind(this.client);
    }

    /**
     * Connect to Redis
     */
    async connect() {
        await this.client.connect();
    }

    /**
     * Get value from Redis
     * @param {string} key - Cache key
     * @returns {Promise<any>} Cached value
     */
    async get(key) {
        try {
            const data = await this.getAsync(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.error(`Redis GET error: ${error.message}`, { key, service: "redis" });
            return null;
        }
    }

    /**
     * Set value in Redis with TTL
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time to live in seconds
     */
    async set(key, value, ttl = 3600) {
        try {
            await this.setExAsync(key, ttl, JSON.stringify(value));
        } catch (error) {
            logger.error(`Redis SET error: ${error.message}`, { key, service: "redis" });
        }
    }

    /**
     * Delete key from Redis
     * @param {string|string[]} keys - Key(s) to delete
     */
    async del(keys) {
        try {
            if (Array.isArray(keys)) {
                await Promise.all(keys.map(key => this.delAsync(key)));
            } else {
                await this.delAsync(keys);
            }
        } catch (error) {
            logger.error(`Redis DEL error: ${error.message}`, { keys, service: "redis" });
        }
    }

    /**
     * Invalidate keys by pattern
     * @param {string} pattern - Pattern to match keys
     */
    async invalidatePattern(pattern) {
        try {
            const keys = await new Promise((resolve, reject) => {
                this.client.keys(pattern, (err, keys) => {
                    if (err) reject(err);
                    resolve(keys);
                });
            });
            
            if (keys.length > 0) {
                await this.del(keys);
                logger.info(`Invalidated ${keys.length} cache keys: ${pattern}`, { service: "cache" });
            }
        } catch (error) {
            logger.error(`Cache invalidation error: ${error.message}`, { pattern, service: "cache" });
        }
    }

    /**
     * Gracefully shutdown Redis connection
     */
    async disconnect() {
        try {
            await this.client.quit();
            logger.info("Redis connection closed", { service: "redis" });
        } catch (error) {
            logger.error(`Redis disconnect error: ${error.message}`, { service: "redis" });
        }
    }
}

// Singleton instance
const redisClient = new RedisManager();
export default redisClient;