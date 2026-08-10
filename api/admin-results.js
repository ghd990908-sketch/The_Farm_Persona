const { createClient } = require('@supabase/supabase-js');
const { verifySession } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'method not allowed' });
    return;
  }

  if (!verifySession(req)) {
    res.status(401).json({ ok: false, error: 'unauthorized' });
    return;
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) {
    res.status(500).json({ ok: false, error: error.message });
    return;
  }

  res.status(200).json({ ok: true, results: data });
};
