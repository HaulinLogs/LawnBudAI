-- Add missing state column to user_preferences if it wasn't created
-- because the table already existed when 20260221000100 ran.
-- The original migration used CREATE TABLE IF NOT EXISTS, so any columns
-- added in that statement were silently skipped on existing tables.

alter table public.user_preferences
  add column if not exists state text not null default 'WI';
