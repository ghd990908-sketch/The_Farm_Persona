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
  const { id, name, phone, gender } = body || {};

  if (!id || typeof id !== 'string') {
    res.status(400).json({ ok: false, error: 'id required' });
    return;
  }
  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ ok: false, error: 'name required' });
    return;
  }
  const phoneDigits = typeof phone === 'string' ? phone.replace(/[^0-9]/g, '') : '';
  if (phoneDigits.length < 9 || phoneDigits.length > 11) {
    res.status(400).json({ ok: false, error: 'valid phone required' });
    return;
  }
  if (gender !== 'male' && gender !== 'female') {
    res.status(400).json({ ok: false, error: 'gender required' });
    return;
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { error } = await supabase
    .from('plugin_matches')
    .update({
      attendee_name: name.trim().slice(0, 60),
      attendee_phone: phone.trim().slice(0, 20),
      attendee_gender: gender,
      attendance_confirmed: true,
      attendance_confirmed_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    res.status(500).json({ ok: false, error: error.message });
    return;
  }

  res.status(200).json({ ok: true });
};
