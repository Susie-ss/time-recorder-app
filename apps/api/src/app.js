const express = require('express');
const cors = require('cors');

const app = express();

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
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

module.exports = app;
