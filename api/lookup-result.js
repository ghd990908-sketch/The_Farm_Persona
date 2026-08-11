const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'method not allowed' });
    return;
  }

  const name = (req.query.name || '').toString().trim().slice(0, 60);
  const phone = (req.query.phone || '').toString().trim();

  if (!name || !/^\d{4}$/.test(phone)) {
    res.status(400).json({ ok: false, error: 'invalid query' });
    return;
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase
    .from('results')
    .select('name, primary_type, secondary_type, is_hybrid, scores, submitted_at')
    .eq('name', name)
    .eq('phone_last4', phone)
    .order('submitted_at', { ascending: false })
    .limit(1);

  if (error) {
    res.status(500).json({ ok: false, error: error.message });
    return;
  }

  res.status(200).json({ ok: true, result: (data && data[0]) || null });
};
