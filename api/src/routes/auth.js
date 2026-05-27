const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { signToken, auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: '请填写完整信息' });
  const exists = db.get('users').find({ email }).value();
  if (exists) return res.status(409).json({ error: '该邮箱已注册' });
  const id = uuidv4();
  const hash = bcrypt.hashSync(password, 10);
  const now = new Date().toISOString();
  const user = { id, name, email, password: hash, avatar: null, heartbeat_interval: 30, last_heartbeat: null, created_at: now };
  db.get('users').push(user).write();
  const { password: _, ...safeUser } = user;
  res.json({ token: signToken({ id, email }), user: safeUser });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: '请填写完整信息' });
  const row = db.get('users').find({ email }).value();
  if (!row || !bcrypt.compareSync(password, row.password)) return res.status(401).json({ error: '邮箱或密码错误' });
  const { password: _, ...user } = row;
  res.json({ token: signToken({ id: row.id, email: row.email }), user });
});

router.get('/me', auth, (req, res) => {
  const row = db.get('users').find({ id: req.user.id }).value();
  if (!row) return res.status(404).json({ error: '用户不存在' });
  const { password: _, ...user } = row;
  res.json(user);
});

router.patch('/profile', auth, (req, res) => {
  const { name, heartbeat_interval } = req.body;
  if (name) db.get('users').find({ id: req.user.id }).assign({ name }).write();
  if (heartbeat_interval) db.get('users').find({ id: req.user.id }).assign({ heartbeat_interval: Number(heartbeat_interval) }).write();
  const row = db.get('users').find({ id: req.user.id }).value();
  const { password: _, ...user } = row;
  res.json(user);
});

module.exports = router;
