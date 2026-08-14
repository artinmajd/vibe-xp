-- ============================================================
-- Migration: two-way instructor <-> student messaging
-- Run ONCE in the Supabase SQL editor.
--
-- Replaces the old "instructor_broadcasts" table (never a tracked migration
-- — it was created ad hoc, and was one-way only: instructor to students,
-- globally across ALL cohorts, with no cohort_id column at all).
--
-- A single table represents three kinds of rows via sender + student_id:
--   sender='instructor', student_id is null  -> broadcast to every student
--                                                in the cohort
--   sender='instructor', student_id = X       -> private message to student X
--   sender='student',    student_id = X       -> message from student X to
--                                                the instructor (always X's
--                                                own id — students only ever
--                                                message the instructor here,
--                                                never each other; team_messages
--                                                already covers team peer chat)
--
-- Everything is scoped to cohort_id, unlike the old global broadcasts.
-- ============================================================

create table instructor_messages (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid references cohorts(id) not null,
  student_id uuid references students(id),
  sender text not null check (sender in ('instructor', 'student')),
  content text,
  file_url text,
  file_name text,
  file_type text,
  created_at timestamptz default now()
);

create index instructor_messages_cohort_idx on instructor_messages(cohort_id);
create index instructor_messages_student_idx on instructor_messages(student_id);
