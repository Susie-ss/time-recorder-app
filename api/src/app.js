const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: true, credentials: true }));

// Vercel may pre-parse body; skip express.json() if body already populated
const jsonParser = express.json();
app.use((req, res, next) => {
  if (req.body) return next();
  jsonParser(req, res, next);
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/relatives', require('./routes/relatives'));
app.use('/api/heartbeat', require('./routes/heartbeat'));

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

module.exports = app;
