-- ============================================================
-- Migration: Per-cohort sessions
-- Run ONCE in the Supabase SQL editor.
--
-- Sessions become fully independent per cohort (title + number), mirroring
-- how achievements already work. Each cohort can now add/remove its own
-- sessions without touching any other cohort.
--
--   * sessions gains cohort_id and a uuid surrogate id; the old int `id`
--     (which was really "session number") becomes `session_number`, unique
--     per (cohort_id, session_number).
--   * achievements.session_number was never FK-constrained to sessions.id —
--     it's already a loose int match, so it needs NO change.
--   * cohorts.active_session_id drops its FK to sessions(id) (type changed
--     out from under it) but keeps storing the same session_number int —
--     same loose-coupling convention as achievements.session_number.
--   * Dead columns sessions.chat_enabled and sessions.unlocked_through are
--     dropped (chat_enabled lives on cohorts; unlocked_through was unused).
--   * Every existing cohort currently uses session_numbers 1-10 — each gets
--     its own copy of those 10 rows (same titles) so nothing is lost.
-- ============================================================

-- 1. Add cohort scoping + a new surrogate uuid id.
alter table sessions add column cohort_id uuid references cohorts(id) on delete cascade;
alter table sessions add column new_id uuid not null default gen_random_uuid();

-- 2. Existing 10 rows belong to the keeper cohort (test-cohort).
do $$
declare v_keeper uuid;
begin
  select id into v_keeper from cohorts where join_code = 'TEST-COHORT' limit 1;
  if v_keeper is null then raise exception 'Keeper cohort (TEST-COHORT) not found.'; end if;
  update sessions set cohort_id = v_keeper where cohort_id is null;
end $$;

-- 3. cohorts.active_session_id's FK depends on the sessions_pkey index, so it
--    must be dropped BEFORE we touch that primary key. Keep the column itself
--    as a plain int — same loose-coupling convention as
--    achievements.session_number (never FK-constrained either).
do $$
declare cname text;
begin
  select conname into cname
  from pg_constraint
  where conrelid = 'cohorts'::regclass
    and contype = 'f'
    and pg_get_constraintdef(oid) ilike '%active_session_id%';
  if cname is not null then
    execute format('alter table cohorts drop constraint %I', cname);
  end if;
end $$;

-- 4. Drop the old int primary key, promote the new uuid to be the real id.
alter table sessions drop constraint sessions_pkey;
alter table sessions rename column id to session_number;
alter table sessions rename column new_id to id;
alter table sessions add primary key (id);
alter table sessions alter column cohort_id set not null;
alter table sessions add constraint sessions_cohort_number_key unique (cohort_id, session_number);

-- 5. Give every OTHER existing cohort its own copy of the same 10 sessions
--    (they already reference session_numbers 1-10 in their achievements).
do $$
declare v_keeper uuid;
begin
  select id into v_keeper from cohorts where join_code = 'TEST-COHORT' limit 1;
  insert into sessions (cohort_id, session_number, title)
  select c.id, s.session_number, s.title
  from sessions s
  cross join cohorts c
  where s.cohort_id = v_keeper and c.id <> v_keeper;
end $$;

-- 6. Drop dead columns.
alter table sessions drop column if exists chat_enabled;
alter table sessions drop column if exists unlocked_through;
