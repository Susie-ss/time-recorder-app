const express = require('express');
const cors = require('cors');

const app = express();

console.log('[api] Initializing Express app...');

// CORS for both local dev and Vercel deployment
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/relatives', require('./routes/relatives'));
app.use('/api/heartbeat', require('./routes/heartbeat'));

// Health check
app.get('/api/health', (req, res) => {
  console.log('[api] Health check OK');
  return res.json({ ok: true, time: new Date().toISOString() });
});

console.log('[api] Express app initialized successfully');

module.exports = app;
