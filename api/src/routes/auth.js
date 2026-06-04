const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { signToken, auth } = require('../middleware/auth');

const router = express.Router();

const normEmail = (e) => (e || '').toLowerCase().trim();

router.post('/register', async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = normEmail(req.body.email);
    if (!name || !email || !password) return res.status(400).json({ error: '请填写完整信息' });

    const { rows } = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (rows.length > 0) return res.status(409).json({ error: '该邮箱已注册' });

    const hash = bcrypt.hashSync(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hash]
    );
    const user = result.rows[0];
    const { password: _, ...safeUser } = user;
    res.json({ token: signToken({ id: user.id, email: user.email }), user: safeUser });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    const email = normEmail(req.body.email);
    if (!email || !password) return res.status(400).json({ error: '请填写完整信息' });

    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0 || !bcrypt.compareSync(password, rows[0].password))
      return res.status(401).json({ error: '邮箱或密码错误' });

    const user = rows[0];
    const { password: _, ...safeUser } = user;
    res.json({ token: signToken({ id: user.id, email: user.email }), user: safeUser });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/me', auth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: '用户不存在' });
    const { password: _, ...user } = rows[0];
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/profile', auth, async (req, res) => {
  try {
    const { name, heartbeat_interval } = req.body;
    if (name) await db.query('UPDATE users SET name = $1 WHERE id = $2', [name, req.user.id]);
    if (heartbeat_interval) await db.query('UPDATE users SET heartbeat_interval = $1 WHERE id = $2', [Number(heartbeat_interval), req.user.id]);
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const { password: _, ...user } = rows[0];
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
