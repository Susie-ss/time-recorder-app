const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

const isVercel = !!process.env.VERCEL;
const UPLOAD_DIR = isVercel ? '/tmp/uploads' : path.join(__dirname, '../../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
  }),
  limits: { fileSize: 20 * 1024 * 1024 }
});

router.use('/uploads', express.static(UPLOAD_DIR));

router.get('/', auth, async (req, res) => {
  try {
    const ids = await db.zrange(`assets:${req.user.id}`, 0, -1);
    if (!ids || ids.length === 0) return res.json({ assets: [] });

    const keys = ids.reverse().map(id => `asset:${id}`);
    const raws = await db.mget(...keys);
    const assets = raws.filter(r => r).map(r => (typeof r === 'string' ? JSON.parse(r) : r));
    res.json({ assets });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { type, title, content, tags } = req.body;
    if (!type || !title) return res.status(400).json({ error: '类型和标题必填' });

    const file_url = req.file ? `/api/assets/uploads/${req.file.filename}` : null;
    const file_name = req.file ? req.file.originalname : null;

    let parsedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        try { const arr = JSON.parse(tags); parsedTags = Array.isArray(arr) ? arr : [tags]; } catch { parsedTags = [tags]; }
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }

    const id = uuidv4();
    const asset = {
      id, user_id: req.user.id, type, title,
      content: content || null, file_url, file_name,
      tags: parsedTags,
      created_at: new Date().toISOString()
    };

    await db.set(`asset:${id}`, JSON.stringify(asset));
    await db.zadd(`assets:${req.user.id}`, Date.now(), id);

    res.status(201).json(asset);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id', auth, upload.single('file'), async (req, res) => {
  try {
    const raw = await db.get(`asset:${req.params.id}`);
    if (!raw) return res.status(404).json({ error: '资产不存在' });
    const asset = JSON.parse(raw);
    if (asset.user_id !== req.user.id) return res.status(404).json({ error: '资产不存在' });

    const { title, content, tags } = req.body;
    if (title) asset.title = title;
    if (content !== undefined) asset.content = content;
    if (req.file) { asset.file_url = `/api/assets/uploads/${req.file.filename}`; asset.file_name = req.file.originalname; }
    if (tags) {
      if (typeof tags === 'string') {
        try { const arr = JSON.parse(tags); asset.tags = Array.isArray(arr) ? arr : [tags]; } catch { asset.tags = [tags]; }
      } else if (Array.isArray(tags)) {
        asset.tags = tags;
      }
    }

    await db.set(`asset:${req.params.id}`, JSON.stringify(asset));
    res.json(asset);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const raw = await db.get(`asset:${req.params.id}`);
    if (!raw) return res.status(404).json({ error: '资产不存在' });
    const asset = JSON.parse(raw);
    if (asset.user_id !== req.user.id) return res.status(404).json({ error: '资产不存在' });

    await db.del(`asset:${req.params.id}`);
    await db.zrem(`assets:${req.user.id}`, req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
