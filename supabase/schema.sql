-- VA Pro app data (per-user JSON blobs keyed by storage key)
create table if not exists public.user_app_data (
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

create index if not exists user_app_data_user_id_idx on public.user_app_data (user_id);

alter table public.user_app_data enable row level security;

drop policy if exists "users read own data" on public.user_app_data;
create policy "users read own data"
  on public.user_app_data for select
  using (auth.uid() = user_id);

drop policy if exists "users insert own data" on public.user_app_data;
create policy "users insert own data"
  on public.user_app_data for insert
  with check (auth.uid() = user_id);

drop policy if exists "users update own data" on public.user_app_data;
create policy "users update own data"
  on public.user_app_data for update
  using (auth.uid() = user_id);

drop policy if exists "users delete own data" on public.user_app_data;
create policy "users delete own data"
  on public.user_app_data for delete
  using (auth.uid() = user_id);
