const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// ioredis: lazy connect, works well with Vercel serverless
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  tls: {},
});

redis.on('error', (err) => console.error('[DB] Redis error:', err.message));
redis.on('connect', () => console.log('[DB] Redis connected'));

module.exports = redis;
