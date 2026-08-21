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
  const trimmedName = name.trim().slice(0, 60);
  const cleanPhoneLast4 = (phoneLast4 && /^\d{4}$/.test(phoneLast4)) ? phoneLast4 : null;

  const record = {
    guest_name: trimmedName,
    phone_last4: cleanPhoneLast4,
    persona_type: personaType,
    event_type: eventType,
    region: region,
    mentor_id: mentorId,
    mentor_name: mentorName || '',
    project_id: projectId,
    project_name: projectName || '',
    decision: 'yes',
  };

  // 같은 이름 + 전화번호 뒤4자리로 이미 제출한 기록이 있으면 새로 만들지 않고
  // 그 기록을 최신 선택으로 덮어써서 새로고침/재시도로 인한 중복 행을 막는다.
  if (cleanPhoneLast4) {
    const { data: existing } = await supabase
      .from('plugin_matches')
      .select('id')
      .eq('guest_name', trimmedName)
      .eq('phone_last4', cleanPhoneLast4)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('plugin_matches')
        .update(record)
        .eq('id', existing.id)
        .select('id')
        .single();

      if (error) {
        res.status(500).json({ ok: false, error: error.message });
        return;
      }
      res.status(200).json({ ok: true, id: data.id });
      return;
    }
  }

  const { data, error } = await supabase.from('plugin_matches').insert(record).select('id').single();

  if (error) {
    res.status(500).json({ ok: false, error: error.message });
    return;
  }

  res.status(200).json({ ok: true, id: data.id });
};
