const path = require('path');
const fs = require('fs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

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
}

module.exports = db;
