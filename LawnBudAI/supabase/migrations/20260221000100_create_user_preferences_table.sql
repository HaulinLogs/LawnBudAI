-- Create user_preferences table for storing user settings
-- Stores city, state, and grass/lawn preferences

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  city text not null default 'Madison',
  state text not null default 'WI',
  timezone text default 'America/Chicago',
  grass_type text default 'cool_season',
  lawn_size_sqft integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS (Safe to run multiple times)
alter table public.user_preferences enable row level security;

-- Idempotent block for Policies and Indexes
DO $$ 
BEGIN
    -- Policy: Read
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users read own preferences') THEN
        create policy "Users read own preferences"
          on public.user_preferences for select
          using (auth.uid() = user_id);
    END IF;

    -- Policy: Update
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users update own preferences') THEN
        create policy "Users update own preferences"
          on public.user_preferences for update
          using (auth.uid() = user_id)
          with check (auth.uid() = user_id);
    END IF;

    -- Policy: Insert
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users insert own preferences') THEN
        create policy "Users insert own preferences"
          on public.user_preferences for insert
          with check (auth.uid() = user_id);
    END IF;

    -- Index
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_preferences_user_id') THEN
        create index idx_user_preferences_user_id on public.user_preferences(user_id);
    END IF;

END $$;

-- Trigger Function (Always use OR REPLACE)
create or replace function public.create_user_preferences()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_preferences (user_id, city, state)
  values (new.id, 'Madison', 'WI')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Trigger (Safe because we drop it first)
drop trigger if exists on_auth_user_created_preferences on auth.users;
create trigger on_auth_user_created_preferences
  after insert on auth.users
  for each row execute procedure create_user_preferences();
