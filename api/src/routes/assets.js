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
    const { rows } = await db.query('SELECT * FROM assets WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json({ assets: rows });
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

    const { rows } = await db.query(
      `INSERT INTO assets (user_id, type, title, content, file_url, file_name, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.id, type, title, content || null, file_url, file_name, JSON.stringify(parsedTags)]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id', auth, upload.single('file'), async (req, res) => {
  try {
    const { rows: existing } = await db.query('SELECT * FROM assets WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (existing.length === 0) return res.status(404).json({ error: '资产不存在' });

    const { title, content, tags } = req.body;
    const sets = [], vals = [];
    let i = 1;

    if (title) { sets.push(`title = $${i++}`); vals.push(title); }
    if (content !== undefined) { sets.push(`content = $${i++}`); vals.push(content); }
    if (req.file) { sets.push(`file_url = $${i++}`); vals.push(`/api/assets/uploads/${req.file.filename}`); sets.push(`file_name = $${i++}`); vals.push(req.file.originalname); }
    if (tags) {
      let pt = [];
      try { const arr = JSON.parse(tags); pt = Array.isArray(arr) ? arr : [tags]; } catch { pt = [tags]; }
      sets.push(`tags = $${i++}`); vals.push(JSON.stringify(pt));
    }

    if (sets.length > 0) {
      vals.push(req.params.id, req.user.id);
      await db.query(`UPDATE assets SET ${sets.join(', ')} WHERE id = $${i++} AND user_id = $${i}`, vals);
    }

    const { rows } = await db.query('SELECT * FROM assets WHERE id = $1', [req.params.id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM assets WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: '资产不存在' });
    await db.query('DELETE FROM assets WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
