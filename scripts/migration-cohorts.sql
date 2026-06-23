-- ============================================================
-- Migration: Cohorts (multi-classroom support)
-- Run ONCE in the Supabase SQL editor, top to bottom.
--
-- What it does:
--   * Adds a `cohorts` table (each classroom/group, with its own join
--     code and its own current session).
--   * Adds `cohort_achievement_unlocks` so unlock state is per-cohort.
--   * Scopes students + teams to a cohort.
--   * Moves "active session" off the global `sessions.is_active` flag and
--     onto each cohort (`cohorts.active_session_id`).
--   * Moves the team-chat toggle onto the cohort (`cohorts.chat_enabled`).
--   * Migrates all existing data into a cohort named "test-cohort".
--   * Drops the now-replaced global columns LAST.
--
-- IMPORTANT: deploy the matching app code together with this migration —
-- the old code reads sessions.is_active / achievements.is_unlocked, which
-- this migration removes.
-- ============================================================

-- 1. cohorts ---------------------------------------------------------------
create table cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text unique not null,            -- students type this at signup
  active_session_id int references sessions(id),  -- this cohort's current session
  chat_enabled boolean not null default true,
  is_archived boolean not null default false,
  created_at timestamptz default now()
);

-- 2. per-cohort achievement unlock state -----------------------------------
-- No row for a (cohort, achievement) pair == locked for that cohort.
create table cohort_achievement_unlocks (
  cohort_id uuid references cohorts(id) on delete cascade,
  achievement_id uuid references achievements(id) on delete cascade,
  is_unlocked boolean not null default false,
  primary key (cohort_id, achievement_id)
);

-- 3. scope students + teams to a cohort ------------------------------------
-- Added nullable first so the data migration below can backfill, then made
-- NOT NULL at the end.
alter table students add column cohort_id uuid references cohorts(id);
alter table teams    add column cohort_id uuid references cohorts(id);

-- 4. team names become unique PER COHORT (not globally) --------------------
-- Two different classrooms can each have a team called "Pixel Pirates".
-- Join codes stay globally unique (the `teams.code` unique constraint is
-- left untouched) so cross-team code lookups stay unambiguous.
alter table teams drop constraint teams_name_key;
alter table teams add constraint teams_cohort_name_key unique (cohort_id, name);

-- ============================================================
-- Data migration: move all existing data into "test-cohort"
-- ============================================================
do $$
declare
  v_cohort_id uuid;
  v_active_session int;
begin
  -- Seed the cohort's current session from whatever is active now (if any).
  select id into v_active_session from sessions where is_active = true limit 1;

  insert into cohorts (name, join_code, active_session_id, chat_enabled)
  values ('test-cohort', 'TEST-COHORT', v_active_session, true)
  returning id into v_cohort_id;

  -- Every existing student + team joins test-cohort.
  update students set cohort_id = v_cohort_id where cohort_id is null;
  update teams    set cohort_id = v_cohort_id where cohort_id is null;

  -- Carry over the current global unlock state into per-cohort rows.
  insert into cohort_achievement_unlocks (cohort_id, achievement_id, is_unlocked)
  select v_cohort_id, id, coalesce(is_unlocked, false)
  from achievements;
end $$;

-- 5. now that every row is backfilled, require cohort_id going forward -----
alter table students alter column cohort_id set not null;
alter table teams    alter column cohort_id set not null;

-- ============================================================
-- 6. Drop the replaced global state (LAST — the data migration read it)
--    * sessions.is_active  -> cohorts.active_session_id
--    * achievements.is_unlocked -> cohort_achievement_unlocks
-- ============================================================
drop index if exists one_active_session;
alter table sessions      drop column is_active;
alter table achievements  drop column is_unlocked;
