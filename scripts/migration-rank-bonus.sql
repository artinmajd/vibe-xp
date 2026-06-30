-- ============================================================
-- Migration: Speed-rank bonus
-- Run ONCE in the Supabase SQL editor.
--
-- Records, per submission, the order it was CONFIRMED (auto-graded on submit,
-- or instructor-approved) and the rank bonus that earned. Bonus = X - rank,
-- where X is the cohort's student count; rank 1 (first confirmed) gets X-1,
-- the last gets 0. The bonus is also folded into submissions.xp_awarded.
-- ============================================================

alter table submissions add column submission_rank int;            -- null until confirmed
alter table submissions add column bonus_xp int not null default 0;
