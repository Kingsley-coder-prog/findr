const Redis = require("ioredis");
require("dotenv").config();

const redis = new Redis(process.env.REDIS_URL);

redis.on("error", (error) => {
  console.error("Redis error:", error.message);
});

async function testRedisConnection() {
  try {
    await redis.ping();
    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Redis connection failed:", error.message);
    throw error;
  }
}

module.exports = { redis, testRedisConnection };
