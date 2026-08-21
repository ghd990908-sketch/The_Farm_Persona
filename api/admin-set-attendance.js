const { createClient } = require('@supabase/supabase-js');
const { verifySession } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method not allowed' });
    return;
  }

  if (!verifySession(req)) {
    res.status(401).json({ ok: false, error: 'unauthorized' });
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
  const { id, confirmed } = body || {};

  if (!id || typeof id !== 'string' || typeof confirmed !== 'boolean') {
    res.status(400).json({ ok: false, error: 'id and confirmed required' });
    return;
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { error } = await supabase
    .from('plugin_matches')
    .update({
      attendance_confirmed: confirmed,
      attendance_confirmed_at: confirmed ? new Date().toISOString() : null,
    })
    .eq('id', id);

  if (error) {
    res.status(500).json({ ok: false, error: error.message });
    return;
  }

  res.status(200).json({ ok: true });
};
