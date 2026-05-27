const express = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../../../uploads')),
    filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
  }),
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.get('/', auth, (req, res) => {
  res.json({ messages: db.get('messages').filter({ user_id: req.user.id }).sortBy('created_at').reverse().value() });
});

router.post('/', auth, upload.single('file'), (req, res) => {
  const { type, title, content, recipient, contact, send_type, send_time } = req.body;
  if (!type || !title || !content || !recipient || !send_type) return res.status(400).json({ error: '请填写必填字段' });
  const file_url = req.file ? `/uploads/${req.file.filename}` : null;
  const file_name = req.file ? req.file.originalname : null;
  const msg = { id: uuidv4(), user_id: req.user.id, type, title, content, recipient, contact: contact || null, send_type, send_time: send_time || null, file_url, file_name, created_at: new Date().toISOString() };
  db.get('messages').push(msg).write();
  res.status(201).json(msg);
});

router.patch('/:id', auth, (req, res) => {
  const msg = db.get('messages').find({ id: req.params.id, user_id: req.user.id }).value();
  if (!msg) return res.status(404).json({ error: '留声舱不存在' });
  const { title, content, recipient, contact, send_type, send_time } = req.body;
  const updates = {};
  if (title) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (recipient) updates.recipient = recipient;
  if (contact !== undefined) updates.contact = contact;
  if (send_type) updates.send_type = send_type;
  if (send_time !== undefined) updates.send_time = send_time;
  db.get('messages').find({ id: req.params.id }).assign(updates).write();
  res.json(db.get('messages').find({ id: req.params.id }).value());
});

router.delete('/:id', auth, (req, res) => {
  const msg = db.get('messages').find({ id: req.params.id, user_id: req.user.id }).value();
  if (!msg) return res.status(404).json({ error: '留声舱不存在' });
  db.get('messages').remove({ id: req.params.id }).write();
  res.json({ success: true });
});

module.exports = router;
