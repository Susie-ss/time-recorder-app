const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM messages WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json({ messages: rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { type, title, content, recipient, contact, send_type, send_time } = req.body;
    if (!type || !title || !content || !recipient || !send_type) return res.status(400).json({ error: '请填写必填字段' });

    const { rows } = await db.query(
      `INSERT INTO messages (user_id, type, title, content, recipient, contact, send_type, send_time)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.user.id, type, title, content, recipient, contact || null, send_type, send_time || null]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const { rows: existing } = await db.query('SELECT * FROM messages WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (existing.length === 0) return res.status(404).json({ error: '留声舱不存在' });

    const { title, content, recipient, contact, send_type, send_time } = req.body;
    const sets = [], vals = [];
    let i = 1;
    if (title) { sets.push(`title = $${i++}`); vals.push(title); }
    if (content !== undefined) { sets.push(`content = $${i++}`); vals.push(content); }
    if (recipient) { sets.push(`recipient = $${i++}`); vals.push(recipient); }
    if (contact !== undefined) { sets.push(`contact = $${i++}`); vals.push(contact); }
    if (send_type) { sets.push(`send_type = $${i++}`); vals.push(send_type); }
    if (send_time !== undefined) { sets.push(`send_time = $${i++}`); vals.push(send_time); }

    if (sets.length > 0) {
      vals.push(req.params.id, req.user.id);
      await db.query(`UPDATE messages SET ${sets.join(', ')} WHERE id = $${i++} AND user_id = $${i}`, vals);
    }

    const { rows } = await db.query('SELECT * FROM messages WHERE id = $1', [req.params.id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM messages WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: '留声舱不存在' });
    await db.query('DELETE FROM messages WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
