const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { signToken, auth } = require('../middleware/auth');

const router = express.Router();

const normEmail = (e) => (e || '').toLowerCase().trim();

router.post('/register', async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = normEmail(req.body.email);
    if (!name || !email || !password) return res.status(400).json({ error: '请填写完整信息' });

    // Check email uniqueness via email index
    const existingId = await db.get(`user:email:${email}`);
    if (existingId) return res.status(409).json({ error: '该邮箱已注册' });

    const id = uuidv4();
    const hash = bcrypt.hashSync(password, 10);
    const user = {
      id, name, email, password: hash,
      avatar: null, heartbeat_interval: 30, last_heartbeat: null,
      created_at: new Date().toISOString()
    };

    await db.set(`user:${id}`, JSON.stringify(user));
    await db.set(`user:email:${email}`, id);

    const { password: _, ...safeUser } = user;
    res.json({ token: signToken({ id, email }), user: safeUser });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    const email = normEmail(req.body.email);
    if (!email || !password) return res.status(400).json({ error: '请填写完整信息' });

    // Find user by email index
    const uid = await db.get(`user:email:${email}`);
    if (!uid) return res.status(401).json({ error: '邮箱或密码错误' });

    const raw = await db.get(`user:${uid}`);
    if (!raw) return res.status(401).json({ error: '邮箱或密码错误' });

    const user = JSON.parse(raw);
    if (!bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: '邮箱或密码错误' });

    const { password: _, ...safeUser } = user;
    res.json({ token: signToken({ id: user.id, email: user.email }), user: safeUser });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/me', auth, async (req, res) => {
  try {
    const raw = await db.get(`user:${req.user.id}`);
    if (!raw) return res.status(404).json({ error: '用户不存在' });
    const { password: _, ...user } = JSON.parse(raw);
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/profile', auth, async (req, res) => {
  try {
    const raw = await db.get(`user:${req.user.id}`);
    if (!raw) return res.status(404).json({ error: '用户不存在' });
    const user = JSON.parse(raw);

    const { name, heartbeat_interval } = req.body;
    if (name) user.name = name;
    if (heartbeat_interval) user.heartbeat_interval = Number(heartbeat_interval);

    await db.set(`user:${req.user.id}`, JSON.stringify(user));
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
