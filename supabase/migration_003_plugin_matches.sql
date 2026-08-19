-- STEP 3: 멘토/해외 프로젝트 매칭 플로우 저장 테이블
-- Supabase SQL Editor에서 한 번만 실행하세요.

create table if not exists plugin_matches (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  phone_last4 text,
  persona_type text not null,
  event_type text not null,
  region text not null,
  mentor_id text not null,
  mentor_name text not null,
  project_id text not null,
  project_name text not null,
  decision text not null default 'yes',
  created_at timestamptz not null default now()
);

-- RLS 활성화 + 정책 없음 = anon/authenticated 키로는 전혀 접근 불가.
-- 서버(api/*)는 service role 키를 쓰므로 RLS를 우회해 정상 동작합니다.
alter table plugin_matches enable row level security;
