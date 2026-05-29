// Vercel KV persistence layer for lowdb
// On Vercel: syncs users to KV on write, restores on cold start
// Falls back gracefully when KV is not configured

let kv = null;
try {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    kv = require('@vercel/kv');
  }
} catch (e) {
  // KV not available
}

// Restore users from KV into lowdb on cold start
async function restoreFromKV(db) {
  if (!kv) return;
  try {
    const raw = await kv.get('tr:users');
    if (raw) {
      const users = JSON.parse(raw);
      // Only restore if lowdb is empty (cold start)
      const existingUsers = db.get('users').value();
      if (existingUsers.length === 0 && users.length > 0) {
        db.set('users', users).write();
        console.log(`[KV] Restored ${users.length} users from KV`);
      }
    }
    // Also restore other collections
    for (const coll of ['assets', 'messages', 'relatives', 'chat_messages', 'heartbeats']) {
      const rawColl = await kv.get(`tr:${coll}`);
      if (rawColl) {
        const data = JSON.parse(rawColl);
        const existing = db.get(coll).value();
        if (existing.length === 0 && data.length > 0) {
          db.set(coll, data).write();
          console.log(`[KV] Restored ${data.length} ${coll} from KV`);
        }
      }
    }
  } catch (e) {
    console.warn('[KV] Restore failed:', e.message);
  }
}

// Sync all data to KV
async function syncToKV(db) {
  if (!kv) return;
  try {
    const users = db.get('users').value();
    await kv.set('tr:users', JSON.stringify(users));
  } catch (e) {
    console.warn('[KV] Sync failed:', e.message);
  }
}

// Sync users to KV after a write
async function syncUsersToKV(db) {
  if (!kv) return;
  try {
    const users = db.get('users').value();
    await kv.set('tr:users', JSON.stringify(users));
  } catch (e) {
    console.warn('[KV] Sync users failed:', e.message);
  }
}

// Sync a specific collection to KV
async function syncCollectionToKV(db, collection) {
  if (!kv) return;
  try {
    const data = db.get(collection).value();
    await kv.set(`tr:${collection}`, JSON.stringify(data));
  } catch (e) {
    console.warn(`[KV] Sync ${collection} failed:`, e.message);
  }
}

module.exports = {
  isKVAvailable: () => !!kv,
  restoreFromKV,
  syncToKV,
  syncUsersToKV,
  syncCollectionToKV
};
