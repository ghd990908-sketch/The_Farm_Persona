const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method not allowed' });
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
  const { name, phoneLast4, answers, scores, primaryType, secondaryType, isHybrid } = body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ ok: false, error: 'name required' });
    return;
  }
  if (!phoneLast4 || !/^\d{4}$/.test(phoneLast4)) {
    res.status(400).json({ ok: false, error: 'phoneLast4 required' });
    return;
  }
  if (!Array.isArray(answers) || !scores || !primaryType || !secondaryType) {
    res.status(400).json({ ok: false, error: 'invalid payload' });
    return;
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { error } = await supabase.from('results').insert({
    name: name.trim().slice(0, 60),
    phone_last4: phoneLast4,
    answers,
    scores,
    primary_type: primaryType,
    secondary_type: secondaryType,
    is_hybrid: !!isHybrid,
  });

  if (error) {
    res.status(500).json({ ok: false, error: error.message });
    return;
  }

  res.status(200).json({ ok: true });
};
