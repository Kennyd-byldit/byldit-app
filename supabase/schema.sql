-- BYLDit.ai Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- VEHICLES
-- ============================================================
create table if not exists vehicles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  year integer not null,
  make text not null,
  model text not null,
  trim text,
  nickname text,
  type text not null default 'garage' check (type in ('build', 'garage')),
  cover_photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table vehicles enable row level security;
create policy "Users see own vehicles" on vehicles for all using (auth.uid() = user_id);

-- ============================================================
-- PROJECTS
-- ============================================================
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid references vehicles(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  goal_type text not null,
  condition text,
  budget_estimate numeric(10,2),
  budget_actual numeric(10,2) default 0,
  status text not null default 'active' check (status in ('active', 'paused', 'complete')),
  cover_photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table projects enable row level security;
create policy "Users see own projects" on projects for all using (auth.uid() = user_id);

-- ============================================================
-- PHASES
-- ============================================================
create table if not exists phases (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  order_index integer not null default 0,
  status text not null default 'upcoming' check (status in ('upcoming', 'in_progress', 'complete')),
  cost_estimate numeric(10,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table phases enable row level security;
create policy "Users see own phases" on phases for all using (auth.uid() = user_id);

-- ============================================================
-- STEPS
-- ============================================================
create table if not exists steps (
  id uuid primary key default uuid_generate_v4(),
  phase_id uuid references phases(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  instructions text,
  difficulty text check (difficulty in ('Easy', 'Moderate', 'Advanced', 'Pro')),
  estimated_hours numeric(6,2),
  cost_estimate numeric(10,2),
  diy_or_shop text default 'DIY' check (diy_or_shop in ('DIY', 'Shop', 'Either')),
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'complete')),
  order_index integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table steps enable row level security;
create policy "Users see own steps" on steps for all using (auth.uid() = user_id);

-- ============================================================
-- PARTS
-- ============================================================
create table if not exists parts (
  id uuid primary key default uuid_generate_v4(),
  step_id uuid references steps(id) on delete set null,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  quantity integer default 1,
  cost_estimate numeric(10,2),
  cost_actual numeric(10,2),
  status text not null default 'needed' check (status in ('needed', 'ordered', 'received')),
  source text,
  part_number text,
  notes text,
  added_via text default 'manual' check (added_via in ('manual', 'walt')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table parts enable row level security;
create policy "Users see own parts" on parts for all using (auth.uid() = user_id);

-- ============================================================
-- EXPENSES
-- ============================================================
create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade not null,
  phase_id uuid references phases(id) on delete set null,
  step_id uuid references steps(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null,
  amount numeric(10,2) not null,
  expense_date date default current_date,
  added_via text default 'manual' check (added_via in ('manual', 'walt')),
  created_at timestamptz default now()
);
alter table expenses enable row level security;
create policy "Users see own expenses" on expenses for all using (auth.uid() = user_id);

-- ============================================================
-- NOTES
-- ============================================================
create table if not exists notes (
  id uuid primary key default uuid_generate_v4(),
  step_id uuid references steps(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  author text not null default 'user' check (author in ('user', 'walt')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table notes enable row level security;
create policy "Users see own notes" on notes for all using (auth.uid() = user_id);

-- ============================================================
-- FLAGS
-- ============================================================
create table if not exists flags (
  id uuid primary key default uuid_generate_v4(),
  note_id uuid references notes(id) on delete cascade,
  step_id uuid references steps(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  reason text,
  flagged_by text not null default 'user' check (flagged_by in ('user', 'walt')),
  resolved boolean default false,
  resolved_at timestamptz,
  created_at timestamptz default now()
);
alter table flags enable row level security;
create policy "Users see own flags" on flags for all using (auth.uid() = user_id);

-- ============================================================
-- PHOTOS
-- ============================================================
create table if not exists photos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade,
  step_id uuid references steps(id) on delete set null,
  vehicle_id uuid references vehicles(id) on delete cascade,
  storage_path text not null,
  url text not null,
  is_cover boolean default false,
  caption text,
  uploaded_at timestamptz default now()
);
alter table photos enable row level security;
create policy "Users see own photos" on photos for all using (auth.uid() = user_id);

-- ============================================================
-- WALT MESSAGES
-- ============================================================
create table if not exists walt_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references projects(id) on delete set null,
  role text not null check (role in ('user', 'walt')),
  content text not null,
  action_type text,
  action_ref_id uuid,
  created_at timestamptz default now()
);
alter table walt_messages enable row level security;
create policy "Users see own messages" on walt_messages for all using (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET (photos)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

create policy "Users can upload own photos" on storage.objects
  for insert with check (auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view own photos" on storage.objects
  for select using (auth.uid()::text = (storage.foldername(name))[1]);

