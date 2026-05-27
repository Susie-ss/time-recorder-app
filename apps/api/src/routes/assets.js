const express = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../../uploads')),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

router.get('/', auth, (req, res) => {
  const rows = db.get('assets').filter({ user_id: req.user.id }).sortBy('created_at').reverse().value();
  res.json({ assets: rows });
});

router.post('/', auth, upload.single('file'), (req, res) => {
  const { type, title, content, tags } = req.body;
  if (!type || !title) return res.status(400).json({ error: '类型和标题必填' });
  const id = uuidv4();
  const file_url = req.file ? `/uploads/${req.file.filename}` : null;
  const file_name = req.file ? req.file.originalname : null;
  let parsedTags = tags;
  if (typeof tags === 'string') {
    try { const arr = JSON.parse(tags); parsedTags = Array.isArray(arr) ? arr : [tags]; } catch { parsedTags = [tags]; }
  }
  if (!Array.isArray(parsedTags)) parsedTags = [];
  const asset = { id, user_id: req.user.id, type, title, content: content || null, file_url, file_name, tags: parsedTags, created_at: new Date().toISOString() };
  db.get('assets').push(asset).write();
  res.status(201).json(asset);
});

router.patch('/:id', auth, upload.single('file'), (req, res) => {
  const asset = db.get('assets').find({ id: req.params.id, user_id: req.user.id }).value();
  if (!asset) return res.status(404).json({ error: '资产不存在' });
  const { title, content, tags } = req.body;
  const updates = {};
  if (title) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (req.file) { updates.file_url = `/uploads/${req.file.filename}`; updates.file_name = req.file.originalname; }
  if (tags) { try { const arr = JSON.parse(tags); updates.tags = Array.isArray(arr) ? arr : [tags]; } catch { updates.tags = [tags]; } }
  db.get('assets').find({ id: req.params.id }).assign(updates).write();
  res.json(db.get('assets').find({ id: req.params.id }).value());
});

router.delete('/:id', auth, (req, res) => {
  const asset = db.get('assets').find({ id: req.params.id, user_id: req.user.id }).value();
  if (!asset) return res.status(404).json({ error: '资产不存在' });
  db.get('assets').remove({ id: req.params.id }).write();
  res.json({ success: true });
});

module.exports = router;
