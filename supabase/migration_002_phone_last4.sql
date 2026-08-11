-- 기존에 이미 배포된 프로젝트용 마이그레이션.
-- Supabase SQL Editor에서 한 번만 실행하세요.

alter table results add column if not exists phone_last4 text;
