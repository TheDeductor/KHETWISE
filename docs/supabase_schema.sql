-- Run this entire file in Supabase SQL editor (once)
-- khetwise schema v1

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  language text default 'en',
  created_at timestamp default now()
);

create table if not exists fields (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  crop text not null,
  latitude float not null,
  longitude float not null,
  area_acres float not null,
  created_at timestamp default now()
);

create table if not exists health_reports (
  id uuid primary key default gen_random_uuid(),
  field_id uuid references fields(id),
  health_score int,
  ndvi float,
  status text,
  stress_detected boolean default false,
  created_at timestamp default now()
);

create table if not exists disease_reports (
  id uuid primary key default gen_random_uuid(),
  field_id uuid references fields(id),
  disease text,
  confidence float,
  treatment text,
  latitude float,
  longitude float,
  created_at timestamp default now()
);
