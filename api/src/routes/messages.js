const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', auth, async (req, res) => {
  try {
    const ids = await db.zrange(`msgs:${req.user.id}`, 0, -1);
    if (!ids || ids.length === 0) return res.json({ messages: [] });

    const keys = ids.reverse().map(id => `msg:${id}`);
    const raws = await db.mget(...keys);
    const messages = raws.filter(r => r).map(r => (typeof r === 'string' ? JSON.parse(r) : r));
    res.json({ messages });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { type, title, content, recipient, contact, send_type, send_time } = req.body;
    if (!type || !title || !content || !recipient || !send_type) return res.status(400).json({ error: '请填写必填字段' });

    const id = uuidv4();
    const msg = {
      id, user_id: req.user.id, type, title, content,
      recipient, contact: contact || null, send_type, send_time: send_time || null,
      file_url: null, file_name: null,
      created_at: new Date().toISOString()
    };

    // Save uploaded file info if present (audio/video)
    if (req.file) {
      msg.file_name = req.file.originalname;
      msg.file_size = req.file.size;
      msg.file_type = req.file.mimetype;
    }

    await db.set(`msg:${id}`, JSON.stringify(msg));
    await db.zadd(`msgs:${req.user.id}`, Date.now(), id);

    res.status(201).json(msg);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const raw = await db.get(`msg:${req.params.id}`);
    if (!raw) return res.status(404).json({ error: '留声舱不存在' });
    const msg = JSON.parse(raw);
    if (msg.user_id !== req.user.id) return res.status(404).json({ error: '留声舱不存在' });

    ['title', 'content', 'recipient', 'contact', 'send_type', 'send_time'].forEach(k => {
      if (req.body[k] !== undefined) msg[k] = req.body[k];
    });

    await db.set(`msg:${req.params.id}`, JSON.stringify(msg));
    res.json(msg);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const raw = await db.get(`msg:${req.params.id}`);
    if (!raw) return res.status(404).json({ error: '留声舱不存在' });
    const msg = JSON.parse(raw);
    if (msg.user_id !== req.user.id) return res.status(404).json({ error: '留声舱不存在' });

    await db.del(`msg:${req.params.id}`);
    await db.zrem(`msgs:${req.user.id}`, req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
