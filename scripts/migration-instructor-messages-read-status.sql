-- ============================================================
-- Migration: track whether the instructor has seen a student's message
-- Run ONCE in the Supabase SQL editor.
--
-- Powers two badges: the "Messages" tab's unread count (like the existing
-- "Submissions (N pending)" tab badge) and a red dot next to a specific
-- student's name in the Messages tab's student list.
--
-- Only meaningful for sender='student' rows — instructor-sent rows
-- (broadcasts and private messages) default to true since the instructor
-- obviously already "saw" their own message.
-- ============================================================

alter table instructor_messages add column read_by_instructor boolean not null default true;
