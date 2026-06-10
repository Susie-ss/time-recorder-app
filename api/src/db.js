// ioredis — native Redis TCP client (no TLS for this instance)
const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(REDIS_URL, {
  connectTimeout: 10000,
  maxRetriesPerRequest: 2,
  retryStrategy(times) {
    if (times > 2) return null;
    return Math.min(times * 400, 2000);
  },
  lazyConnect: true,  // connect on first command — better for Vercel cold starts
  tls: undefined,     // plain TCP — no TLS
});

let ready = false;
redis.on('connect', () => { ready = true; console.log('[DB] Redis TCP connected'); });
redis.on('ready', () => { ready = true; });
redis.on('error', (err) => console.error('[DB] Redis error:', err.message));
redis.on('close', () => { ready = false; });

// Helper for health check
redis.pingReady = () => (ready ? redis.ping() : Promise.reject(new Error('not connected')));

module.exports = redis;
