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
  const { ids } = body || {};

  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => typeof id === 'string')) {
    res.status(400).json({ ok: false, error: 'ids required' });
    return;
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { error } = await supabase.from('results').delete().in('id', ids);

  if (error) {
    res.status(500).json({ ok: false, error: error.message });
    return;
  }

  res.status(200).json({ ok: true });
};
