/**
 * Targeted insert for Session 9 achievements.
 * Run once: npx ts-node -r tsconfig-paths/register scripts/seed-s9.ts
 * Delete this file after confirming rows landed in the DB.
 *
 * Note: unlock state is per-cohort now (cohort_achievement_unlocks). New rows
 * land with NO unlock row, so they are locked for every cohort until an
 * instructor releases them. That's the intended default.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SESSION = 9;

const s9Achievements = [
  // ── Block 1 — Phase 0: Plan the Build ───────────────────────────────────────
  {
    slug: "s9-re-locked-and-wireframed",
    session_number: SESSION,
    block_number: 1,
    title: "Re-Locked & Wireframed",
    description: "Re-read your one-sentence spec, break it into its pieces, and sketch a wireframe — upload a photo of your sketch.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s9-build-order-set",
    session_number: SESSION,
    block_number: 1,
    title: "Build Order Set",
    description: "Decide the order you'll build your pieces — which one, built first, gets you a working core loop fastest.",
    xp: 3,
    proof_type: "fields",
    proof_config: { fields: ["Which piece are you building first?", "Then what order? (list the rest)"] },
    is_secret: false,
  },
  {
    slug: "s9-rulebook-ready",
    session_number: SESSION,
    block_number: 1,
    title: "Rulebook Ready",
    description: "Create an agents.md for your project (by prompt) so Cursor knows your pieces, your style, and your rules.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // ── Block 2 — Phase 1: Build the MVP ────────────────────────────────────────
  {
    slug: "s9-locked-and-loaded",
    session_number: SESSION,
    block_number: 2,
    title: "Locked & Loaded",
    description: "Restate your one-sentence goal with your project open and the wireframe in view.",
    xp: 5,
    proof_type: "fields",
    proof_config: { fields: ["Your one-sentence goal"] },
    is_secret: false,
  },
  {
    slug: "s9-skeleton-up",
    session_number: SESSION,
    block_number: 2,
    title: "Skeleton Up",
    description: "Get your project's basic layout on screen — the pieces from your wireframe, empty is fine.",
    xp: 5,
    proof_type: "checklist",
    proof_config: { items: ["My project's basic layout (the wireframe pieces) is on screen"] },
    is_secret: false,
  },
  {
    slug: "s9-mvp-it-does-the-thing",
    session_number: SESSION,
    block_number: 2,
    title: "MVP — It Does The Thing",
    description: "Your project does its one core thing, end to end. Upload a screenshot (or a 10-second screen recording frame) of it working.",
    xp: 15,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // ── Block 3 — Pod Check-In ──────────────────────────────────────────────────
  {
    slug: "s9-pod-check-in-done",
    session_number: SESSION,
    block_number: 3,
    title: "Pod Check-In Done",
    description: "Show your pod where you are and get one \"what works\" and one \"what to fix next.\"",
    xp: 5,
    proof_type: "checklist",
    proof_config: { items: ["I showed my progress and got one \"what works\" and one \"what to fix next\" from my pod"] },
    is_secret: false,
  },

  // ── Block 4 — Phase 2: Ship It ──────────────────────────────────────────────
  {
    slug: "s9-saved-before-shipping",
    session_number: SESSION,
    block_number: 4,
    title: "Saved Before Shipping",
    description: "Commit a save point of your working MVP — upload a screenshot of your commit history.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s9-public-check",
    session_number: SESSION,
    block_number: 4,
    title: "Public Check",
    description: "Before going public, confirm there's no real personal info anywhere on your page.",
    xp: 3,
    proof_type: "checklist",
    proof_config: { items: ["My page has no real personal information — no full names, school, or address"] },
    is_secret: false,
  },
  {
    slug: "s9-shipped",
    session_number: SESSION,
    block_number: 4,
    title: "SHIPPED",
    description: "Your MVP is deployed to a real, working URL. Submit the link.",
    xp: 15,
    proof_type: "instructor_flag",
    proof_config: { form_type: "url" },
    is_secret: false,
  },

  // ── Block 5 — Phase 3: Make It Better ───────────────────────────────────────
  {
    slug: "s9-glow-up-1",
    session_number: SESSION,
    block_number: 5,
    title: "Glow-Up 1",
    description: "Ship an improvement — nicer visuals, a sound, an animation, a better end screen, clearer instructions, a small stretch feature. Upload a before-and-after.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s9-glow-up-2",
    session_number: SESSION,
    block_number: 5,
    title: "Glow-Up 2",
    description: "Ship another improvement and upload a before-and-after.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s9-glow-up-3",
    session_number: SESSION,
    block_number: 5,
    title: "Glow-Up 3",
    description: "Ship a third improvement and upload a before-and-after.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s9-bug-squashed-1",
    session_number: SESSION,
    block_number: 5,
    title: "Bug Squashed 1",
    description: "Fix a bug with the loop (named symptom or pasted error) and upload a before-and-after.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s9-bug-squashed-2",
    session_number: SESSION,
    block_number: 5,
    title: "Bug Squashed 2",
    description: "Fix another bug with the loop and upload a before-and-after.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s9-re-shipped",
    session_number: SESSION,
    block_number: 5,
    title: "Re-Shipped",
    description: "Re-deploy after improving so your live link shows your latest — submit the updated link.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "url" },
    is_secret: false,
  },
  {
    slug: "s9-day-1-done",
    session_number: SESSION,
    block_number: 5,
    title: "Day 1 Done",
    description: "Tick every box — an instructor confirms before XP awards.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: [
        "MVP works",
        "Deployed to a live link",
        "Committed save points",
        "Went through the pod check-in",
        "Shipped at least 2 improvements",
      ],
    },
    is_secret: false,
  },
];

async function main() {
  console.log(`Inserting ${s9Achievements.length} Session 9 achievements...`);

  const slugs = s9Achievements.map((a) => a.slug);
  const { data: existing } = await supabase
    .from("achievements")
    .select("slug")
    .in("slug", slugs);

  if (existing && existing.length > 0) {
    console.error("Already in DB — aborting to avoid duplicates:");
    existing.forEach((r) => console.error(" ", r.slug));
    process.exit(1);
  }

  const { error } = await supabase.from("achievements").insert(s9Achievements);
  if (error) {
    console.error("Insert failed:", error.message);
    process.exit(1);
  }

  console.log("Inserted. Running sort_order backfill for session 9...");

  const { data: rows, error: readErr } = await supabase
    .from("achievements")
    .select("id, slug, sort_order")
    .eq("session_number", SESSION);

  if (readErr || !rows) {
    console.error("Failed to read session 9 rows:", readErr?.message);
    process.exit(1);
  }

  const slugIndex = new Map(s9Achievements.map((a, i) => [a.slug, i]));
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

  console.log(`Done. ${s9Achievements.length} achievements inserted, ${needsOrder.length} sort_orders assigned.`);
}

main();
