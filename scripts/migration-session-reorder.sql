-- ============================================================
-- Migration: Session drag-and-drop reorder
-- Run ONCE in the Supabase SQL editor.
--
-- Reordering sessions means renumbering ALL of a cohort's sessions at once
-- (a "swap" of unique session_number values), which must also cascade to:
--   * every achievement's session_number (loose int match, no FK)
--   * the cohort's active_session_id (loose int match, no FK)
-- Doing this as sequential REST calls risks a transient unique-constraint
-- violation (old #2 -> new #1 while old #1 still holds #1). Instead:
--   1. Make the (cohort_id, session_number) unique constraint deferrable, so
--      Postgres only checks uniqueness at COMMIT, not after each row.
--   2. Add reorder_cohort_sessions(), a single SQL statement (one snapshot,
--      one transaction) that remaps sessions, achievements, and the cohort's
--      active_session_id together from one old->new mapping.
-- ============================================================

-- ALTER CONSTRAINT ... DEFERRABLE only works on foreign keys in Postgres —
-- a unique constraint has to be dropped and recreated to change deferrability.
alter table sessions drop constraint sessions_cohort_number_key;
alter table sessions add constraint sessions_cohort_number_key
  unique (cohort_id, session_number) deferrable initially deferred;

create or replace function reorder_cohort_sessions(p_cohort_id uuid, p_ordered_ids uuid[])
returns void as $$
  with mapping as (
    select s.id as session_id, s.session_number as old_number, ord.new_number::int as new_number
    from unnest(p_ordered_ids) with ordinality as ord(session_id, new_number)
    join sessions s on s.id = ord.session_id and s.cohort_id = p_cohort_id
  ),
  upd_sessions as (
    update sessions s
    set session_number = m.new_number
    from mapping m
    where s.id = m.session_id
    returning s.id
  ),
  upd_achievements as (
    update achievements a
    set session_number = m.new_number
    from mapping m
    where a.cohort_id = p_cohort_id and a.session_number = m.old_number
    returning a.id
  )
  update cohorts c
  set active_session_id = m.new_number
  from mapping m
  where c.id = p_cohort_id and c.active_session_id = m.old_number;
$$ language sql;
