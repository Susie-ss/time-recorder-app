const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

redis.ping().then(() => console.log('[DB] Upstash Redis connected')).catch(err => console.error('[DB] Redis connection failed:', err.message));

module.exports = redis;
