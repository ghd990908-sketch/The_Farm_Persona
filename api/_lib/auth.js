const crypto = require('crypto');

const COOKIE_NAME = 'farm_admin';
const SESSION_MS = 12 * 60 * 60 * 1000; // 12시간

function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function issueSessionCookie() {
  const secret = process.env.SESSION_SECRET;
  const expires = Date.now() + SESSION_MS;
  const payload = String(expires);
  const token = `${payload}.${sign(payload, secret)}`;
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

function verifySession(req) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;

  const cookieHeader = req.headers.cookie || '';
  const found = cookieHeader
    .split(';')
    .map((s) => s.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!found) return false;

  const token = found.slice(COOKIE_NAME.length + 1);
  const dot = token.lastIndexOf('.');
  if (dot === -1) return false;

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(payload, secret);

  const sigBuf = Buffer.from(sig, 'hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  const expires = Number(payload);
  return Number.isFinite(expires) && Date.now() <= expires;
}

module.exports = { issueSessionCookie, clearSessionCookie, verifySession };
