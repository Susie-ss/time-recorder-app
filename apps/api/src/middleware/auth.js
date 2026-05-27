const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'time-recorder-secret-2026';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }
  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token 已过期，请重新登录' });
  }
}

module.exports = { signToken, auth };
