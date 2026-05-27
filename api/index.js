// Vercel Serverless Function entry point
console.log('[index] Function cold start');
const app = require('./src/app');

// Must export a function that handles (req, res)
module.exports = (req, res) => {
  console.log('[index] Request: ' + req.method + ' ' + req.url);
  return app(req, res);
};
