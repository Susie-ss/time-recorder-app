const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    await db.query('INSERT INTO heartbeats (user_id) VALUES ($1)', [req.user.id]);
    const now = new Date().toISOString();
    await db.query('UPDATE users SET last_heartbeat = $1 WHERE id = $2', [now, req.user.id]);
    res.json({ success: true, timestamp: now });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/history', auth, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM heartbeats WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30',
      [req.user.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
