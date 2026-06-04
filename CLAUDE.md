# CLAUDE.md

This file is the standing brief for Claude Code working on this project. Read it at the start of every session, before `ROADMAP.md`.

---

## What this project is

**vibe-xp** is a gamification web app for a 10-session "vibe coding" course aimed at teenagers (ages 13–17) with no prior coding background. The course teaches students to build web projects by prompting AI tools in plain language. This app runs in parallel with the course: students earn XP and achievements for completing in-class activities, and a live leaderboard displays team standings on a projector throughout each session.

The app itself is also a teaching artifact. By Session 6–7, students are learning to build multi-component web apps with agentic tools. This app — which they've been using since Session 1 — is a working example of exactly what they're learning to build. Keep this in mind when making design choices: the codebase should be readable enough that a curious student could open it later and recognize the patterns.

## Who's building it

Artin is building this before the course starts. He is not a full-time backend engineer. Code should be clear and conventional over clever. Comments explain the "why" only when the "what" isn't obvious from the code.

## The user model

There are three kinds of users:

- **Students** — teens, 13–17, have their own login (email + password via Supabase Auth). They sign up individually, then form or join teams of up to 3.
- **Teams** — 5 teams per cohort, max 3 students each. **All scoring happens at the team level.** Individual student XP does not exist. The `student_id` on a submission is only for audit ("which team member submitted this") and to power the `builders-apprentice` secret achievement.
- **Instructors** — access a separate dashboard behind a single shared passcode (`INSTRUCTOR_PASSCODE` env var). No per-instructor auth in v1.

## The course context that shapes design decisions

- **Sessions are 3 hours each.** The app gets used for ~3 hours straight per session, then sits idle for a tomorrow. Optimize for in-session reliability, not 24/7 uptime.
- **15 students max per cohort.** Scale concerns are negligible. Free tiers cover everything.
- **One projector shows the leaderboard during class.** Polling every 5 seconds is fine; websockets are overkill.
- **Teens have phones, sometimes laptops, sometimes both.** All pages should be mobile-friendly. The instructor dashboard and leaderboard are desktop-only.
- **Activities are time-boxed.** Submission flow needs to be fast — under 30 seconds from "I did the thing" to "+5 XP on the board."

## Tech stack (locked)

- **Framework:** Next.js 14+ App Router, TypeScript, Tailwind CSS
- **Database, storage, and auth:** Supabase (one project for all three)
- **Hosting:** Vercel
- **Package manager:** npm
- **Testing:** vitest (when validators get tests in Phase 8)

Do not introduce additional services, frameworks, or libraries without flagging it. Specifically:

- No state management library — React state and server components are enough
- No ORM — use the Supabase JS client directly
- No CSS framework other than Tailwind
- No UI component library in v1 — build what we need
- No analytics, no error tracking (Vercel's built-in logs are enough)

## Architectural conventions

### Supabase clients

There are three Supabase client patterns. Use the right one for the context.

- **`lib/supabase-server.ts`** — uses the service-role key. Server-only. Bypasses RLS. Use in API route handlers and server components when you need full database access.
- **`lib/supabase-browser.ts`** — uses the anon key. For client components that need to call Supabase Auth (login, signup, logout). Never use this for direct database reads or writes.
- **`lib/supabase-auth.ts`** — server-side session reading via `@supabase/ssr`. Used in middleware and route guards.

**Rule:** the service-role key must never appear in a client component or in the browser bundle. If you find yourself importing `supabase-server` into a `'use client'` file, stop — you're about to leak production credentials.

### Data access pattern

- All database writes go through API routes under `app/api/`.
- The browser never writes to the database directly. Even reads should go through API routes in v1 (this keeps RLS off without exposing data).
- The single chokepoint for awarding XP is `app/api/submit/route.ts`. Do not create alternate XP-awarding paths.

### Validators are pure functions

Validators in `lib/validators.ts` take inputs and return `{ valid, reason? }`. They do not touch the database (with one exception: `validateCodeEntry` needs to look up teams). They do not call APIs. They do not have side effects. This makes them trivial to test.

If you find yourself wanting to mix validation and database writes, separate them: validate first, then write.

### Total XP is always computed, never stored

There is no `teams.total_xp` column. Total XP is computed on every request by summing `submissions.xp_awarded` (where status is `auto_approved` or `approved`) plus `manual_xp_grants.xp`. This prevents an entire class of desync bugs. Postgres handles 5 teams × ~50 submissions trivially.

If you ever feel tempted to cache total XP — don't. Just don't.

### Achievements are data, not code

The achievement catalog lives in the `achievements` table, seeded from `scripts/seed.ts`. New achievements never require schema changes or React component changes — only a new row and (occasionally) a new validator + form component.

When adding achievements for Sessions 2–10, the workflow is:
1. Add the row in `scripts/seed.ts`
2. If it uses an existing `proof_type`, you're done — re-run the seed
3. If it needs a new `proof_type`, add the validator, the form component, and register both in their respective dispatch switches

### File layout

```
vibe-xp/
├── app/
│   ├── (auth)/              # Signup, login, logout routes
│   ├── dashboard/           # Team home (logged-in students)
│   ├── team-setup/          # Create or join team
│   ├── leaderboard/         # Public projector view
│   ├── instructor/          # Passcode-gated instructor dashboard
│   └── api/                 # All write endpoints + leaderboard read
├── components/
│   └── proof-forms/         # One component per proof_type
├── lib/
│   ├── supabase-server.ts
│   ├── supabase-browser.ts
│   ├── supabase-auth.ts
│   ├── validators.ts        # Pure validation functions
│   ├── dispatch-validator.ts
│   ├── team-xp.ts           # XP computation
│   ├── levels.ts            # XP → level mapping
│   ├── check-secrets.ts     # Secret achievement detection
│   └── require-auth.ts      # Route guard helper
├── scripts/
│   ├── seed.ts              # Populate achievements + sessions
│   ├── reset-cohort.ts      # Clear submissions between cohorts
│   └── generate-students.ts # Pre-create student accounts
├── middleware.ts            # Auth session refresh
├── agents.md
├── CLAUDE.md                # this file
└── ROADMAP.md               # build plan
```

### Naming conventions

- Files: kebab-case (`team-setup`, `supabase-server.ts`)
- Components: PascalCase (`ScreenshotForm.tsx`)
- Functions: camelCase
- Database tables and columns: snake_case
- Achievement slugs: kebab-case (`letter-counter`, `cursor-ready`)
- Environment variables: SCREAMING_SNAKE_CASE

### TypeScript

- Use strict mode (default in `create-next-app`)
- Define database row types in `lib/types.ts` matching the schema exactly
- Avoid `any`. If you must, comment why.
- Avoid `as` casts unless interfacing with an untyped library

## Don't touch list

- `.env.local` — never commit, never log, never embed in client code
- `.env*` files generally
- `node_modules/`
- Once a database migration is applied to production Supabase, do not edit it retroactively — write a new one
- Anyone's submitted screenshots in the `screenshots` bucket — read-only from the app's perspective

## What v1 deliberately does not have

These were considered and intentionally left out. Do not add them without an explicit decision:

- Row Level Security policies (service-role backend is the security boundary in v1)
- Real-time websocket subscriptions (5-second polling is enough)
- Email confirmation on signup (would slow down Session 1 registration)
- Password reset flows (instructor manually resets via Supabase dashboard if needed)
- Per-student leaderboards (XP is team-only)
- Notifications of any kind
- Mobile app
- Internationalization
- Dark mode toggle (default to a dark-leaning palette since the projector view sits over class)
- Achievement editing UI for instructors (achievements ship via the seed script)

## Failure modes to watch for

- **Service-role key in the client bundle.** Check the Network tab and the `.next/static` chunks. The key string should never appear.
- **Race condition on team formation.** Two students trying to be the third member of the same team at the same moment. The trigger handles this — but the API route should surface the error clearly.
- **Duplicate submissions.** The unique constraint catches them, but the API should return a friendly "already done" response, not a 500.
- **Leaderboard caching.** Next.js loves to cache. The leaderboard route must opt out: `export const dynamic = 'force-dynamic'` and `export const revalidate = 0`.
- **Storage bucket permissions.** Public read enabled or screenshots break. Verify after every Supabase config change.
- **Session activation drift.** Only one session can be `is_active = true` at a time. The partial unique index enforces this. If you ever see two active sessions, the index is missing.

## How to handle ambiguity

When the roadmap or this file doesn't cover a decision:

1. **Default to the simpler option** between two viable approaches
2. **Default to consistency** with existing patterns in the codebase
3. **If still unclear, ask** — don't guess on architecture decisions

## Working rhythm

- **At session start:** read `CLAUDE.md`, then `ROADMAP.md`, then check which phase is current by looking at the most recent commits.
- **One phase at a time.** Do not start Phase N+1 until Phase N's milestone checklist is fully checked.
- **Commit at phase boundaries** with messages like `Phase 4 complete: auth working end-to-end`.
- **If a milestone check fails**, fix the underlying issue. Do not work around it. Do not skip the check.
- **Before destructive operations** (truncating tables, force-pushes, deleting files), pause and confirm.
- **Keep changes scoped.** A phase should not edit files outside its responsibilities. If Phase 7 work requires touching a Phase 4 file, ask first.

## Communication style

When reporting progress or asking questions:

- Lead with what's done, then what's blocked
- Be specific: "the screenshot upload endpoint returns 500 because the storage bucket is private" beats "uploads aren't working"
- Quote actual error messages, don't paraphrase them
- If you've tried something that didn't work, say what you tried — saves a round trip

## A note on tone

The instructors building this are teaching teens. The app's user-facing copy should match that audience: clear, casual, encouraging. Not formal, not corporate. Examples:

- ❌ "Submission successfully recorded. Points awarded."
- ✅ "Nice — +5 XP."

- ❌ "Authentication required. Please log in to continue."
- ✅ "Log in to see your team's progress."

- ❌ "An error occurred while processing your request."
- ✅ "Something broke. Try again, or grab an instructor."

Error messages should sound like a friend, not a server.
