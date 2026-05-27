// Vercel Serverless Function entry point
const app = require('./src/app');
module.exports = (req, res) => app(req, res);
