-- THE FARM 페르소나 진단 결과 저장 테이블
-- Supabase SQL Editor에서 실행하세요.

create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone_last4 text not null,
  answers jsonb not null,
  scores jsonb not null,
  primary_type text not null,
  secondary_type text not null,
  is_hybrid boolean not null default false,
  submitted_at timestamptz not null default now()
);

-- RLS 활성화 + 정책 없음 = anon/authenticated 키로는 전혀 접근 불가.
-- 서버(api/*)는 service role 키를 쓰므로 RLS를 우회해 정상 동작합니다.
alter table results enable row level security;
