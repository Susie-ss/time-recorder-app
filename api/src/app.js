const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: true, credentials: true }));

// Robust body parser for Vercel serverless environment
// Vercel's Node runtime may pre-consume the stream, so we handle both cases
app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  // If Vercel already parsed body into a plain object, skip
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body) && Object.keys(req.body).length > 0) {
    return next();
  }
  // Otherwise parse with express
  express.json()(req, res, (err) => {
    if (err) {
      // Stream already consumed — body might be empty or pre-parsed as {}
      req.body = req.body || {};
      return next();
    }
    next();
  });
});

// Debug: log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} body=${JSON.stringify(req.body).substring(0, 100)}`);
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/relatives', require('./routes/relatives'));
app.use('/api/heartbeat', require('./routes/heartbeat'));

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Global error handler — always return JSON, never HTML
app.use((err, req, res, next) => {
  console.error('[Error]', err.message, err.stack);
  res.status(500).json({ error: err.message || '服务器内部错误' });
});

module.exports = app;
