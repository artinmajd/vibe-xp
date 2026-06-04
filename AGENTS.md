# vibe-xp — Agent Reference

**vibe-xp** is a gamification web app for a 10-session "vibe coding" course aimed at teenagers (ages 13–17) with no prior coding background. Students earn XP and achievements for completing in-class activities; a live leaderboard displays team standings on a projector. The app is also a teaching artifact — by Session 6–7, students are learning to build apps like this one, so the codebase should be readable and conventional over clever.

## Tech stack

- **Framework:** Next.js 14+ App Router, TypeScript, Tailwind CSS
- **Database / storage / auth:** Supabase (one project for all three)
- **Hosting:** Vercel
- **Package manager:** npm

## Key constraints

- **5 teams × 3 students max.** All scoring is at the team level — individual student XP does not exist. `student_id` on a submission is audit-only.
- **Per-student auth, team-level XP.** Students sign in with email + password via Supabase Auth; XP belongs to their team.
- **Achievements are data, not code.** The achievement catalog lives in the `achievements` table, seeded from `scripts/seed.ts`. New achievements never require schema changes — only a new row and (when needed) a new validator + form component.
- **No RLS in v1.** All writes go through Next.js API routes using the service-role key. The browser never holds the service-role key. Only the anon key is used for Supabase Auth login flows.
- **Screenshots go to Supabase Storage** in a public bucket called `screenshots`.

## Conventions

- **Server-only Supabase client:** `lib/supabase-server.ts` uses the service-role key and must never be imported into a `'use client'` file or any file that ends up in the browser bundle.
- **Single submission endpoint:** all achievement submissions go through `app/api/submit/route.ts`. Do not create alternate XP-awarding paths.
- **Validators are pure functions:** `lib/validators.ts` functions take inputs and return `{ valid, reason? }`. They do not touch the database (except `validateCodeEntry`, which needs a team lookup) and have no side effects.
- **Total XP is always computed, never stored.** There is no `teams.total_xp` column. XP is computed by summing `submissions.xp_awarded` (status `auto_approved` or `approved`) plus `manual_xp_grants.xp` on every request.

## Don't touch

- `.env.local` — never commit, never log, never embed in client code
- `.env*` files generally
- `node_modules/`
- Database migrations once applied to production — write a new migration instead
- Submitted screenshots in the `screenshots` bucket — read-only from the app's perspective
