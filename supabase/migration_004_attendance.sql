-- STEP 4: 참석 확정 정보(이름/전화번호/성별) 컬럼 추가
-- Supabase SQL Editor에서 한 번만 실행하세요.

alter table plugin_matches
  add column if not exists attendee_name text,
  add column if not exists attendee_phone text,
  add column if not exists attendee_gender text,
  add column if not exists attendance_confirmed boolean not null default false,
  add column if not exists attendance_confirmed_at timestamptz;
