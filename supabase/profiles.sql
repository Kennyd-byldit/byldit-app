-- Add profiles table to track onboarding status
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  first_name text,
  last_name text,
  handle text,
  state text,
  city text,
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  bio text,
  experience text,
  reason text,
  work_style text,
  guidance_style text,
  workspace text[] not null default '{}'::text[],
  tools text[] not null default '{}'::text[],
  project_interests text[] not null default '{}'::text[],
  vehicle_interests text[] not null default '{}'::text[],
  walt_notes text,
  profile_photo_url text,
  profile_completed boolean not null default false,
  onboarded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users see own profile" on profiles for all using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
