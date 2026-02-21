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

-- Enable RLS on user_preferences
alter table public.user_preferences enable row level security;

-- Policy: Users can only read their own preferences
create policy "Users read own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

-- Policy: Users can update their own preferences
create policy "Users update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: Users can insert their own preferences
create policy "Users insert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

-- Indexes for performance
create index idx_user_preferences_user_id on public.user_preferences(user_id);

-- Trigger to auto-create preferences for new users
create or replace function public.create_user_preferences()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_preferences (user_id, city, state)
  values (new.id, 'Madison', 'WI')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_preferences on auth.users;
create trigger on_auth_user_created_preferences
  after insert on auth.users
  for each row execute procedure create_user_preferences();
