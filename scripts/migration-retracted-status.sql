-- ============================================================
-- Migration: 'retracted' submission status
-- Run ONCE in the Supabase SQL editor.
--
-- Retracting an approved submission used to delete the row. We now keep it and
-- mark it 'retracted' so it stays visible (tagged) in the student submissions
-- list. Retracted/rejected submissions are excluded from XP, leaderboard, and
-- ranking exactly like before (those all filter to auto_approved/approved).
-- ============================================================

-- Drop the existing status CHECK (name-agnostic), then re-add with 'retracted'.
do $$
declare cname text;
begin
  select conname into cname
  from pg_constraint
  where conrelid = 'submissions'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%status%';
  if cname is not null then
    execute format('alter table submissions drop constraint %I', cname);
  end if;
end $$;

alter table submissions
  add constraint submissions_status_check
  check (status in ('auto_approved', 'pending', 'approved', 'rejected', 'retracted'));
