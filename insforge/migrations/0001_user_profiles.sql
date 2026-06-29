-- BRB account/profile storage.
-- Run against your InsForge project's Postgres (SQL editor or `@insforge/cli`).
-- One row per authenticated user; written only by the server (admin key),
-- always scoped to the verified user id.

create table if not exists public.user_profiles (
  user_id            uuid        primary key,
  full_name          text        not null default '',
  role               text        not null default '',
  company            text        not null default '',
  linkedin_url       text        not null default '',
  goals              jsonb       not null default '[]'::jsonb,
  tone_style         text        not null default '',
  tone_avoid         text        not null default '',
  tone_word          text        not null default '',
  max_contacts       integer     not null default 50,
  frequency_per_week integer     not null default 2,
  updated_at         timestamptz not null default now()
);
