/**
 * Targeted insert for Session 5 achievements.
 * Run once: npx ts-node -r tsconfig-paths/register scripts/seed-s5.ts
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

const SESSION = 5;

const s5Achievements = [
  // ── Block 0 — Setup & Team Check-In ─────────────────────────────────────────
  {
    slug: "s5-ready-check",
    session_number: SESSION,
    block_number: 0,
    title: "Ready Check",
    description: "You're set up and ready to build — tick all five to log in for the day.",
    xp: 10,
    proof_type: "checklist",
    proof_config: {
      items: [
        "Cursor open and signed in",
        "Session 4 folder still alive (three-page site survived!)",
        "New folder created: session-5-pieces",
        "I know where pages open in the browser",
        "Paper and markers on the table",
      ],
    },
    is_secret: false,
  },

  // ── Block 1 — The One-Shot Game ──────────────────────────────────────────────
  {
    slug: "s5-one-shot-untouched",
    session_number: SESSION,
    block_number: 1,
    title: "One-Shot, Untouched",
    description: "Run the exact Mario-style prompt once and don't touch the result — screenshot it as-is.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-bug-hunt",
    session_number: SESSION,
    block_number: 1,
    title: "Bug Hunt",
    description: "Playtest the one-shot game hard and list at least six symptoms in plain English.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Symptom #1",
        "Symptom #2",
        "Symptom #3",
        "Symptom #4",
        "Symptom #5",
        "Symptom #6",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s5-whack-a-mole",
    session_number: SESSION,
    block_number: 1,
    title: "Whack-a-Mole",
    description: "Send one repair prompt, re-playtest everything, and upload before-and-after screenshots showing what else changed.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-weight-limit",
    session_number: SESSION,
    block_number: 1,
    title: "Weight Limit",
    description: "Why did the one-shot game break — even though the prompt was good?",
    xp: 1,
    proof_type: "quiz",
    proof_config: {
      questions: [
        {
          question: "Why did the one-shot game break — even though the prompt was good and specific?",
          options: [
            "The words were too vague.",
            "Too much cargo for one prompt — every prompt has a weight limit.",
            "Cursor doesn't know how to make games.",
          ],
          correct_index: 1,
          xp: 1,
        },
      ],
    },
    is_secret: false,
  },

  // ── Block 2 — Rebuild the Game Piece by Piece ────────────────────────────────
  {
    slug: "s5-game-piece-world",
    session_number: SESSION,
    block_number: 2,
    title: "Game Piece: World",
    description: "Build the game world — sky background and solid ground strip. Screenshot it working.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-game-piece-hero",
    session_number: SESSION,
    block_number: 2,
    title: "Game Piece: Hero",
    description: "Add the hero — moves left and right, can't leave the screen. Screenshot it working.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-game-piece-gravity-jump",
    session_number: SESSION,
    block_number: 2,
    title: "Game Piece: Gravity + Jump",
    description: "Add gravity and jumping — space bar jumps, hero falls back naturally, one jump at a time. Screenshot it working.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-game-piece-platforms",
    session_number: SESSION,
    block_number: 2,
    title: "Game Piece: Platforms",
    description: "Add three floating platforms — hero lands on top and falls off edges. Screenshot it working.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-game-piece-coins-score",
    session_number: SESSION,
    block_number: 2,
    title: "Game Piece: Coins + Score",
    description: "Add five gold coins and a score counter — touching a coin collects it and the score goes up. Screenshot it working.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-game-piece-flag",
    session_number: SESSION,
    block_number: 2,
    title: "Game Piece: Flag",
    description: "Add the flag — reaching it shows YOU WIN and a play-again button. Screenshot it working.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-one-shot-vs-pieces",
    session_number: SESSION,
    block_number: 2,
    title: "One-Shot vs. Pieces",
    description: "Submit one sentence: \"The difference was ___.\"",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["The difference was…"],
    },
    is_secret: false,
  },

  // ── Block 3 — Wireframing ────────────────────────────────────────────────────
  {
    slug: "s5-spot-the-pieces",
    session_number: SESSION,
    block_number: 3,
    title: "Spot the Pieces",
    description: "List at least eight components you can see across the two projected screens.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Component #1",
        "Component #2",
        "Component #3",
        "Component #4",
        "Component #5",
        "Component #6",
        "Component #7",
        "Component #8",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s5-wireframe-done",
    session_number: SESSION,
    block_number: 3,
    title: "Wireframe Done",
    description: "All six dashboard pieces boxed, labeled, and numbered with a build order — upload a photo of the paper.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-safe-stats",
    session_number: SESSION,
    block_number: 3,
    title: "Safe Stats",
    description: "Confirm your dashboard uses invented or harmless numbers only — no real schedules, locations, or school details.",
    xp: 3,
    proof_type: "checklist",
    proof_config: {
      items: [
        "Our dashboard uses invented or harmless numbers only — no real schedules, locations, or school details",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s5-rival-sign-off",
    session_number: SESSION,
    block_number: 3,
    title: "Rival Sign-Off",
    description: "A rival reads your wireframe cold and confirms they could place every piece from the sketch alone.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["Rival team's name (they confirmed your wireframe is buildable)"],
    },
    is_secret: false,
  },

  // ── Block 4 — Naming the Tool ────────────────────────────────────────────────
  {
    slug: "s5-name-a-tool",
    session_number: SESSION,
    block_number: 4,
    title: "Name a Tool",
    description: "Run the same piece twice — plain vs. with a named tool (a font or chart) — and upload before-and-after screenshots.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-name-drop-dont-read",
    session_number: SESSION,
    block_number: 4,
    title: "Name-Drop, Don't Read",
    description: "Do you need to understand what Chart.js is in order to use it in a prompt?",
    xp: 1,
    proof_type: "quiz",
    proof_config: {
      questions: [
        {
          question: "Do you need to understand what Chart.js is in order to use it in a prompt?",
          options: [
            "Yes — you need to read the docs first.",
            "No — you name-drop it and Cursor does the rest.",
          ],
          correct_index: 1,
          xp: 1,
        },
      ],
    },
    is_secret: false,
  },

  // ── Block 5 — Build the Dashboard, Part 1 ───────────────────────────────────
  {
    slug: "s5-rulebook-ritual",
    session_number: SESSION,
    block_number: 5,
    title: "Rulebook Ritual",
    description: "Create agents.md for the dashboard, including a numbered \"The pieces\" section from your wireframe — screenshot the file.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-dashboard-piece-1",
    session_number: SESSION,
    block_number: 5,
    title: "Dashboard Piece 1",
    description: "Build piece 1 from your wireframe in one prompt, check it matches, and screenshot it.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-dashboard-piece-2",
    session_number: SESSION,
    block_number: 5,
    title: "Dashboard Piece 2",
    description: "Build piece 2 from your wireframe in one prompt, check it matches, and screenshot it.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-dashboard-piece-3",
    session_number: SESSION,
    block_number: 5,
    title: "Dashboard Piece 3",
    description: "Build piece 3 from your wireframe in one prompt, check it matches, and screenshot it.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-surgical-phrasing",
    session_number: SESSION,
    block_number: 5,
    title: "Surgical Phrasing",
    description: "Screenshot your chat showing piece-sized prompts that use \"only\" and \"do not touch anything else.\"",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-wireframe-in-the-loop",
    session_number: SESSION,
    block_number: 5,
    title: "Wireframe in the Loop",
    description: "Drop a photo of your wireframe into the Cursor chat as a build reference — screenshot it in the chat.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-halftime-checkpoint",
    session_number: SESSION,
    block_number: 5,
    title: "Halftime Checkpoint",
    description: "Screenshot the half-built dashboard next to the wireframe.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // ── Block 6 — Surgical Changes, Then Finish ──────────────────────────────────
  {
    slug: "s5-surgical-strike",
    session_number: SESSION,
    block_number: 6,
    title: "Surgical Strike",
    description: "Draw a Strike Card, transform one piece with \"change only / don't touch anything else,\" and upload before-and-after screenshots of the whole dashboard.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-nothing-else-moved",
    session_number: SESSION,
    block_number: 6,
    title: "Nothing Else Moved",
    description: "A rival walks every non-target piece against your before screenshot and confirms they're unchanged.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["Rival team's name (they confirmed nothing else moved)"],
    },
    is_secret: false,
  },
  {
    slug: "s5-dashboard-piece-4",
    session_number: SESSION,
    block_number: 6,
    title: "Dashboard Piece 4",
    description: "Build piece 4 from your wireframe in one prompt, check it matches, and screenshot it.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-dashboard-piece-5",
    session_number: SESSION,
    block_number: 6,
    title: "Dashboard Piece 5",
    description: "Build piece 5 from your wireframe in one prompt, check it matches, and screenshot it.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-dashboard-piece-6",
    session_number: SESSION,
    block_number: 6,
    title: "Dashboard Piece 6",
    description: "Build piece 6 from your wireframe in one prompt, check it matches, and screenshot it.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-named-tool-live",
    session_number: SESSION,
    block_number: 6,
    title: "Named Tool, Live",
    description: "A real animated chart (Chart.js or equivalent named tool) is live on the dashboard — screenshot it.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-working-button",
    session_number: SESSION,
    block_number: 6,
    title: "Working Button",
    description: "Upload before-and-after screenshots showing your button visibly changing something on the page.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s5-paper-to-pixels",
    session_number: SESSION,
    block_number: 6,
    title: "Paper to Pixels",
    description: "A rival holds your wireframe next to the screen and confirms every numbered box is where the paper says.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["Rival team's name (they confirmed every wireframe box matches the screen)"],
    },
    is_secret: false,
  },

  // ── Block 8 — All Session ────────────────────────────────────────────────────
  {
    slug: "s5-neighbor-assist",
    session_number: SESSION,
    block_number: 8,
    title: "Neighbor Assist",
    description: "Help another team get unstuck — enter their team name to confirm it happened.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["Team you helped"],
    },
    is_secret: false,
  },
  {
    slug: "s5-bonus-piece",
    session_number: SESSION,
    block_number: 8,
    title: "Bonus Piece",
    description: "Fast finisher? Wireframe an extra component first, then build it in one prompt — screenshot the result.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // ── Block 7 — Showcase & Wrap ────────────────────────────────────────────────
  {
    slug: "s5-ship-it",
    session_number: SESSION,
    block_number: 7,
    title: "Ship It",
    description: "Tick every box on the finish-line checklist — an instructor confirms before XP awards.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: [
        "Piece-by-piece game reached 4+ working pieces (or Road Hopper swap)",
        "Wireframe complete — six pieces boxed, labeled, and numbered",
        "agents.md created with \"The pieces\" section, by prompts only",
        "All six dashboard pieces present, each matching the wireframe",
        "A named tool is live with a visible effect (Chart.js or similar)",
        "The button works and changes something on the page",
        "The surgical strike was confirmed clean (or broke and was repaired)",
        "Chat shows one piece per prompt — no mega-prompts",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s5-final-submission",
    session_number: SESSION,
    block_number: 7,
    title: "Final Submission",
    description: "Upload your final dashboard screenshot and fill the two anchor fields.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "composite",
      require: ["screenshot", "fields"],
      fields: [
        "What is your dashboard about?",
        "What did your Strike Card transform?",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s5-we-showed-it",
    session_number: SESSION,
    block_number: 7,
    title: "We Showed It",
    description: "Your team presented in the showcase.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: ["Our team presented in the showcase"],
    },
    is_secret: false,
  },
  {
    slug: "s5-one-thing-i-learned",
    session_number: SESSION,
    block_number: 7,
    title: "One Thing I Learned",
    description: "Finish the line: \"Big builds are really ___.\"",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["Big builds are really…"],
    },
    is_secret: false,
  },
];

async function main() {
  console.log(`Inserting ${s5Achievements.length} Session 5 achievements...`);

  // Pre-flight: confirm no slugs already exist
  const slugs = s5Achievements.map((a) => a.slug);
  const { data: existing } = await supabase
    .from("achievements")
    .select("slug")
    .in("slug", slugs);

  if (existing && existing.length > 0) {
    console.error("Already in DB — aborting to avoid duplicates:");
    existing.forEach((r) => console.error(" ", r.slug));
    process.exit(1);
  }

  const { error } = await supabase.from("achievements").insert(s5Achievements);
  if (error) {
    console.error("Insert failed:", error.message);
    process.exit(1);
  }

  console.log("Inserted. Running sort_order backfill for session 5...");

  const { data: rows, error: readErr } = await supabase
    .from("achievements")
    .select("id, slug, sort_order")
    .eq("session_number", SESSION);

  if (readErr || !rows) {
    console.error("Failed to read session 5 rows:", readErr?.message);
    process.exit(1);
  }

  const slugIndex = new Map(s5Achievements.map((a, i) => [a.slug, i]));
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

  console.log(`Done. ${s5Achievements.length} achievements inserted, ${needsOrder.length} sort_orders assigned.`);
}

main();
