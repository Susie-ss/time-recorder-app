// Upstash Redis REST API — pipeline POST for all commands (no URL length limits)
// Parses REDIS_URL=redis://default:TOKEN@HOST:PORT

const REDIS_URL = process.env.REDIS_URL || '';

let restUrl, restToken;

if (REDIS_URL) {
  try {
    const u = new URL(REDIS_URL);
    restUrl = `https://${u.hostname}`;
    restToken = u.password || '';
  } catch { restUrl = null; restToken = null; }
}

// Execute a single Redis command via pipeline POST
async function cmd(command, ...args) {
  if (!restUrl || !restToken) throw new Error('REDIS_URL not configured');
  const resp = await fetch(`${restUrl}/pipeline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${restToken}`,
    },
    body: JSON.stringify([[command, ...args]]),
    signal: AbortSignal.timeout(10000),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Redis ${resp.status}: ${text.substring(0, 200)}`);
  }
  const results = await resp.json();
  if (results[0].error) throw new Error(results[0].error);
  return results[0].result;
}

// Execute multiple commands in one pipeline
async function pipeline(commands) {
  if (!restUrl || !restToken) throw new Error('REDIS_URL not configured');
  const resp = await fetch(`${restUrl}/pipeline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${restToken}`,
    },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(15000),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Redis ${resp.status}: ${text.substring(0, 200)}`);
  }
  const results = await resp.json();
  // Return array of result values (throw on first error)
  return results.map((r) => {
    if (r.error) throw new Error(r.error);
    return r.result;
  });
}

const db = {
  connect: () => (restUrl && restToken) ? Promise.resolve('OK') : Promise.reject(new Error('REDIS_URL not configured')),

  // String
  get: (key) => cmd('get', key),
  set: (key, value) => cmd('set', key, value),
  del: (...keys) => cmd('del', ...keys),
  exists: (key) => cmd('exists', key),
  incr: (key) => cmd('incr', key),
  expire: (key, seconds) => cmd('expire', key, String(seconds)),

  // Sorted Set
  zadd: (key, score, member) => cmd('zadd', key, String(score), member),
  zrem: (key, member) => cmd('zrem', key, member),
  zrange: (key, start, stop) => cmd('zrange', key, String(start), String(stop)),
  zrevrange: (key, start, stop) => cmd('zrevrange', key, String(start), String(stop)),
  zcard: (key) => cmd('zcard', key),

  // Multi-key
  mget: (...keys) => cmd('mget', ...keys),
  mset: (...kvs) => cmd('mset', ...kvs),

  // Utility
  keys: (pattern) => cmd('keys', pattern),
  ping: () => cmd('ping'),

  // Batch pipeline
  pipeline,
};

console.log(`[DB] REST API: ${restUrl ? restUrl.replace(/\/\/.*@/, '//***@') : 'NOT CONFIGURED'}`);

module.exports = db;
