const { issueSessionCookie } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method not allowed' });
    return;
  }

  if (!process.env.ADMIN_CODE || !process.env.SESSION_SECRET) {
    res.status(500).json({ ok: false, error: 'server not configured' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  const code = (body && body.code) || '';

  if (code !== process.env.ADMIN_CODE) {
    res.status(401).json({ ok: false, error: 'invalid code' });
    return;
  }

  res.setHeader('Set-Cookie', issueSessionCookie());
  res.status(200).json({ ok: true });
};
