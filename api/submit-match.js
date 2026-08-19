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
  const { name, phoneLast4, personaType, eventType, region, mentorId, mentorName, projectId, projectName } = body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ ok: false, error: 'name required' });
    return;
  }
  if (!personaType || !eventType || !region || !mentorId || !projectId) {
    res.status(400).json({ ok: false, error: 'invalid payload' });
    return;
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { error } = await supabase.from('plugin_matches').insert({
    guest_name: name.trim().slice(0, 60),
    phone_last4: (phoneLast4 && /^\d{4}$/.test(phoneLast4)) ? phoneLast4 : null,
    persona_type: personaType,
    event_type: eventType,
    region: region,
    mentor_id: mentorId,
    mentor_name: mentorName || '',
    project_id: projectId,
    project_name: projectName || '',
    decision: 'yes',
  });

  if (error) {
    res.status(500).json({ ok: false, error: error.message });
    return;
  }

  res.status(200).json({ ok: true });
};
