/**
 * Targeted insert for Session 6 achievements.
 * Run once: npx ts-node -r tsconfig-paths/register scripts/seed-s6.ts
 * Delete this file after confirming rows landed in the DB.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SESSION = 6;

const s6Achievements = [
  // ── Block 0 — Setup & Team Check-In ─────────────────────────────────────────
  {
    slug: "s6-ready-check",
    session_number: SESSION,
    block_number: 0,
    title: "Ready Check",
    description: "You're set up and ready to debug — tick all four to log in for the day.",
    xp: 10,
    proof_type: "checklist",
    proof_config: {
      items: [
        "Cursor open and signed in",
        "Session 5 folder still alive (dashboard survived!)",
        "New folder created: session-6-debug",
        "I know where pages open in the browser",
      ],
    },
    is_secret: false,
  },

  // ── Block 1 — Everything Breaks: The Debugging Loop ─────────────────────────
  {
    slug: "s6-bug-report-check",
    session_number: SESSION,
    block_number: 1,
    title: "Bug Report Check",
    description: "Two quick myth-or-fact questions about what makes a useful bug report.",
    xp: 2,
    proof_type: "quiz",
    proof_config: {
      questions: [
        {
          question: "\"It doesn't work\" is a useful bug report.",
          options: ["Myth", "Fact"],
          correct_index: 0,
          xp: 1,
        },
        {
          question: "Pasting the error text to the AI helps it fix the problem.",
          options: ["Myth", "Fact"],
          correct_index: 1,
          xp: 1,
        },
      ],
    },
    is_secret: false,
  },
  {
    slug: "s6-first-fix",
    session_number: SESSION,
    block_number: 1,
    title: "First Fix",
    description: "Build the tiny countdown timer, find one rough edge, and fix it by naming the symptom — upload before-and-after screenshots.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s6-open-the-console",
    session_number: SESSION,
    block_number: 1,
    title: "Open the Console",
    description: "Open the browser console on your page and screenshot it — this is where error messages live.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s6-safe-paste",
    session_number: SESSION,
    block_number: 1,
    title: "Safe Paste",
    description: "Confirm you'll never send personal info, passwords, or API keys to the AI when ferrying an error.",
    xp: 3,
    proof_type: "checklist",
    proof_config: {
      items: [
        "I will never send personal info, passwords, or API keys to the AI when copying an error",
      ],
    },
    is_secret: false,
  },

  // ── Block 2 — The Repair Kit: Search · Run · Roll Back ──────────────────────
  {
    slug: "s6-ask-it-to-look-it-up",
    session_number: SESSION,
    block_number: 2,
    title: "Ask It to Look It Up",
    description: "Ask the AI to search for something (a sound, an effect, a tool) and screenshot the result.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s6-safety-net",
    session_number: SESSION,
    block_number: 2,
    title: "Safety Net",
    description: "Make any change, then roll it back to the previous version — screenshot the restored state.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s6-repair-kit-check",
    session_number: SESSION,
    block_number: 2,
    title: "Repair Kit Check",
    description: "Your fix made things worse. What's the move?",
    xp: 1,
    proof_type: "quiz",
    proof_config: {
      questions: [
        {
          question: "Your fix made things worse. What's the move?",
          options: [
            "Keep sending more fix prompts until something works.",
            "Roll back to what worked, then re-describe the symptom more clearly.",
            "Restart the whole project from scratch.",
          ],
          correct_index: 1,
          xp: 1,
        },
      ],
    },
    is_secret: false,
  },

  // ── Block 3 — Whack-a-Mole Lab: Build the Base ──────────────────────────────
  {
    slug: "s6-whack-playfield",
    session_number: SESSION,
    block_number: 3,
    title: "Whack-a-Mole: Playfield",
    description: "Build the game screen — a 3×3 grid of holes on a themed background, a title, and a score starting at 0. Screenshot it working.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s6-whack-moles",
    session_number: SESSION,
    block_number: 3,
    title: "Whack-a-Mole: Moles Pop Up",
    description: "Make a mole pop up in a random hole every second and disappear — one at a time. Screenshot it working.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s6-whack-click-score",
    session_number: SESSION,
    block_number: 3,
    title: "Whack-a-Mole: Click to Score",
    description: "Clicking a mole makes it disappear and adds one to the score — clicking an empty hole does nothing. Screenshot it working.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s6-whack-timer",
    session_number: SESSION,
    block_number: 3,
    title: "Whack-a-Mole: Timer",
    description: "Add a 30-second countdown — when it reaches zero, the game stops and shows the final score. Screenshot it working.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s6-whack-game-over",
    session_number: SESSION,
    block_number: 3,
    title: "Whack-a-Mole: Game Over",
    description: "When time runs out, show a GAME OVER screen with the final score and a Play Again button that restarts. Screenshot it working.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s6-squash-one",
    session_number: SESSION,
    block_number: 3,
    title: "Squash One",
    description: "Find one real bug in the base game, fix it by naming the symptom, and upload before-and-after screenshots.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // ── Block 4 — Break It On Purpose: Add Features, Fix the Fallout ────────────
  {
    slug: "s6-power-speed-up",
    session_number: SESSION,
    block_number: 4,
    title: "Power-Up: Speed Up",
    description: "Make the moles pop up faster every 10 seconds — fix whatever breaks, and upload before-and-after screenshots.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s6-power-sound",
    session_number: SESSION,
    block_number: 4,
    title: "Power-Up: Sound on Whack",
    description: "Play a short pop sound when a mole is whacked — fix whatever breaks, and upload before-and-after screenshots.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s6-power-golden-mole",
    session_number: SESSION,
    block_number: 4,
    title: "Power-Up: Golden Mole",
    description: "Add a rare golden mole worth 5 points instead of 1 — fix whatever breaks, and upload before-and-after screenshots.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s6-power-combo",
    session_number: SESSION,
    block_number: 4,
    title: "Power-Up: Combo / Streak",
    description: "Add a combo or streak bonus for hitting multiple moles in a row — fix whatever breaks, and upload before-and-after screenshots.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s6-power-difficulty",
    session_number: SESSION,
    block_number: 4,
    title: "Power-Up: Difficulty Buttons",
    description: "Add Easy / Medium / Hard buttons that change how fast moles appear — fix whatever breaks, and upload before-and-after screenshots.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s6-power-two-at-once",
    session_number: SESSION,
    block_number: 4,
    title: "Power-Up: Two at Once",
    description: "Make two moles appear at the same time — fix whatever breaks, and upload before-and-after screenshots.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s6-power-splat",
    session_number: SESSION,
    block_number: 4,
    title: "Power-Up: Splat Animation",
    description: "Add a splat or hit animation when a mole is whacked — fix whatever breaks, and upload before-and-after screenshots.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s6-caught-the-ai",
    session_number: SESSION,
    block_number: 4,
    title: "Caught the AI",
    description: "Find a change the AI made that you didn't ask for, name it as a symptom, and get it put back — upload before-and-after screenshots.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s6-rolled-back",
    session_number: SESSION,
    block_number: 4,
    title: "Rolled Back",
    description: "A fix made things worse, so you rolled back and tried a different description — screenshot the recovered state.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // ── Block 5 — Peer QA: Playtest & Bug-Report ────────────────────────────────
  {
    slug: "s6-qa-pass",
    session_number: SESSION,
    block_number: 5,
    title: "QA Pass",
    description: "Playtest a rival team's game and file at least three plain-English symptoms — what you did, what happened.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Symptom #1 (what you did → what happened)",
        "Symptom #2 (what you did → what happened)",
        "Symptom #3 (what you did → what happened)",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s6-got-qad",
    session_number: SESSION,
    block_number: 5,
    title: "Got QA'd",
    description: "Another team playtested your game — enter their team name as proof.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["QA team's name (they playtested your game)"],
    },
    is_secret: false,
  },
  {
    slug: "s6-fixed-from-the-field",
    session_number: SESSION,
    block_number: 5,
    title: "Fixed From the Field",
    description: "Fix at least one bug from your peer QA report using the debugging loop — upload before-and-after screenshots.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // ── Block 6 — Showcase & Wrap ────────────────────────────────────────────────
  {
    slug: "s6-ship-it",
    session_number: SESSION,
    block_number: 6,
    title: "Ship It",
    description: "Tick every box on the finish-line checklist — an instructor confirms before XP awards.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: [
        "The game has a clear theme",
        "Moles (or targets) appear and can be clicked",
        "Clicking a mole adds to the score",
        "A timer or end state works",
        "At least two power-up features added beyond the base",
        "At least one bug fixed using the debugging loop (named symptom or pasted error)",
        "Went through peer QA",
        "Final screenshot uploaded",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s6-final-submission",
    session_number: SESSION,
    block_number: 6,
    title: "Final Submission",
    description: "Upload your final game screenshot and tell your best bug-and-fix story.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "composite",
      require: ["screenshot", "fields"],
      fields: [
        "What broke?",
        "How did you describe it to the AI?",
        "What fixed it?",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s6-we-showed-it",
    session_number: SESSION,
    block_number: 6,
    title: "We Showed It",
    description: "Your team presented and others played your game.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: ["Our team presented and others played our game"],
    },
    is_secret: false,
  },
  {
    slug: "s6-one-thing-i-learned",
    session_number: SESSION,
    block_number: 6,
    title: "One Thing I Learned",
    description: "Finish the line: \"When something breaks, I should ___.\"",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["When something breaks, I should…"],
    },
    is_secret: false,
  },

  // ── Block 8 — All Session ────────────────────────────────────────────────────
  {
    slug: "s6-neighbor-assist",
    session_number: SESSION,
    block_number: 8,
    title: "Neighbor Assist",
    description: "Help another team fix a bug — enter their team name to confirm it happened.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["Team you helped"],
    },
    is_secret: false,
  },
  {
    slug: "s6-bonus-feature",
    session_number: SESSION,
    block_number: 8,
    title: "Bonus Feature",
    description: "Fast finisher? Add an extra feature beyond the menu and fix whatever it breaks — upload before-and-after screenshots.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
];

async function main() {
  console.log(`Inserting ${s6Achievements.length} Session 6 achievements...`);

  // Pre-flight: confirm no slugs already exist
  const slugs = s6Achievements.map((a) => a.slug);
  const { data: existing } = await supabase
    .from("achievements")
    .select("slug")
    .in("slug", slugs);

  if (existing && existing.length > 0) {
    console.error("Already in DB — aborting to avoid duplicates:");
    existing.forEach((r) => console.error(" ", r.slug));
    process.exit(1);
  }

  const { error } = await supabase.from("achievements").insert(s6Achievements);
  if (error) {
    console.error("Insert failed:", error.message);
    process.exit(1);
  }

  console.log("Inserted. Running sort_order backfill for session 6...");

  const { data: rows, error: readErr } = await supabase
    .from("achievements")
    .select("id, slug, sort_order")
    .eq("session_number", SESSION);

  if (readErr || !rows) {
    console.error("Failed to read session 6 rows:", readErr?.message);
    process.exit(1);
  }

  const slugIndex = new Map(s6Achievements.map((a, i) => [a.slug, i]));
  const rank = (slug: string) => slugIndex.get(slug) ?? Number.MAX_SAFE_INTEGER;

  const needsOrder = rows
    .filter((r) => !r.sort_order || r.sort_order === 0)
    .sort((a, b) => rank(a.slug) - rank(b.slug));

  let next = 0;
  for (const r of needsOrder) {
    next += 1;
    const { error: upErr } = await supabase
      .from("achievements")
      .update({ sort_order: next })
      .eq("id", r.id);
    if (upErr) {
      console.error(`Failed to set sort_order for ${r.slug}:`, upErr.message);
      process.exit(1);
    }
    console.log(`  sort_order ${next} → ${r.slug}`);
  }

  console.log(`Done. ${s6Achievements.length} achievements inserted, ${needsOrder.length} sort_orders assigned.`);
}

main();
