const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const id = uuidv4();
    const hb = { id, user_id: req.user.id, created_at: new Date().toISOString() };
    const now = hb.created_at;

    await db.set(`hb:${id}`, JSON.stringify(hb));
    await db.zadd(`hbs:${req.user.id}`, { score: Date.now(), member: id });

    // Update user's last_heartbeat
    const raw = await db.get(`user:${req.user.id}`);
    if (raw) {
      const user = JSON.parse(raw);
      user.last_heartbeat = now;
      await db.set(`user:${req.user.id}`, JSON.stringify(user));
    }

    res.json({ success: true, timestamp: now });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/history', auth, async (req, res) => {
  try {
    const ids = await db.zrange(`hbs:${req.user.id}`, -30, -1);
    if (!ids || ids.length === 0) return res.json([]);

    const keys = ids.reverse().map(id => `hb:${id}`);
    const raws = await db.mget(...keys);
    const history = raws.filter(r => r).map(r => (typeof r === 'string' ? JSON.parse(r) : r));
    res.json(history);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
