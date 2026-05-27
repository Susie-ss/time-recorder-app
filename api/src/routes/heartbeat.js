const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, (req, res) => {
  const now = new Date().toISOString();
  db.get('heartbeats').push({ id: uuidv4(), user_id: req.user.id, created_at: now }).write();
  db.get('users').find({ id: req.user.id }).assign({ last_heartbeat: now }).write();
  res.json({ success: true, timestamp: now });
});

router.get('/history', auth, (req, res) => {
  const rows = db.get('heartbeats').filter({ user_id: req.user.id }).sortBy('created_at').reverse().take(30).value();
  res.json(rows);
});

module.exports = router;
