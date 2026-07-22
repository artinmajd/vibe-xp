-- ============================================================
-- Migration: Per-cohort team limits
-- Run ONCE in the Supabase SQL editor.
--
-- Makes both team limits configurable per cohort (instructor edits them in
-- the dashboard's Teams tab):
--   * max_teams         — how many teams the cohort can have (was env MAX_TEAMS)
--   * max_team_members  — how many students fit in one team (was hardcoded 3)
--
-- The old hardcoded 3-per-team DB trigger is dropped; enforcement now lives
-- in the API routes, which read the cohort's configured limit.
-- ============================================================

alter table cohorts add column max_teams int not null default 5;
alter table cohorts add column max_team_members int not null default 3;

drop trigger if exists enforce_team_member_limit on team_members;
drop function if exists check_team_member_limit();
