const path = require('path');
const fs = require('fs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const kv = require('./kv-store');

// On Vercel, use /tmp/ for writable storage (persists across warm invocations)
const isVercel = !!process.env.VERCEL;
const DB_DIR = isVercel ? '/tmp' : path.join(__dirname, '../../data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const dbFile = path.join(DB_DIR, 'db.json');

// Initialize with defaults if file doesn't exist (e.g. first cold start on Vercel)
const initDefaults = !fs.existsSync(dbFile);
const adapter = new FileSync(dbFile);
const db = low(adapter);

if (initDefaults) {
  db.defaults({
    users: [],
    assets: [],
    messages: [],
    relatives: [],
    chat_messages: [],
    heartbeats: []
  }).write();

  // On Vercel cold start, try to restore data from KV
  if (isVercel && kv.isKVAvailable()) {
    kv.restoreFromKV(db).catch(e => console.warn('KV restore error:', e));
  }
}

// Wrap lowdb write to sync to KV on Vercel
const originalGet = db.get.bind(db);
const collectionsToSync = new Set();

// Hook into db writes: after any .write(), sync the collection to KV
const originalWrite = db.__proto__ ? db.__proto__.write : null;

// Override _ for Vercel KV sync
if (isVercel && kv.isKVAvailable()) {
  // Monkey-patch the chain to track which collection is being written
  const _get = db.get.bind(db);
  db.get = function(collection) {
    const chain = _get(collection);
    const _write = chain.write.bind(chain);
    chain.write = function() {
      const result = _write();
      // Async sync to KV (fire-and-forget)
      kv.syncCollectionToKV(db, collection).catch(() => {});
      return result;
    };
    return chain;
  };

  console.log('[KV] Vercel KV persistence enabled');
}

module.exports = db;
