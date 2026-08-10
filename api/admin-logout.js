const { clearSessionCookie } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method not allowed' });
    return;
  }
  res.setHeader('Set-Cookie', clearSessionCookie());
  res.status(200).json({ ok: true });
};
