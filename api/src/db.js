const Redis = require('ioredis');

const rawUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Upstash uses TLS but gives redis:// scheme — convert to rediss:// for ioredis
const redisUrl = rawUrl.includes('redis.io') ? rawUrl.replace('redis://', 'rediss://') : rawUrl;

const redis = new Redis(redisUrl, {
  connectTimeout: 10000,
  maxRetriesPerRequest: 2,
  retryStrategy(times) {
    if (times > 3) return null; // give up after 3 retries
    console.log(`[DB] Redis retry ${times}`);
    return Math.min(times * 400, 2000);
  },
  lazyConnect: true,
});

let connected = false;
redis.on('connect', () => { connected = true; console.log('[DB] Redis connected'); });
redis.on('error', (err) => console.error('[DB] Redis error:', err.message));

redis.isReady = () => connected;

module.exports = redis;
