/**
 * Targeted insert for Session 10 (Hour 1) achievements.
 * Run once: npx ts-node -r tsconfig-paths/register scripts/seed-s10.ts
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

const SESSION = 10;

const s10Achievements = [
  // ── Block 1 — Phase 4: Finish & Polish ──────────────────────────────────────
  {
    slug: "s10-back-in",
    session_number: SESSION,
    block_number: 1,
    title: "Back In",
    description: "Project open, live link loaded, and you know the one thing left to finish.",
    xp: 3,
    proof_type: "fields",
    proof_config: { fields: ["The one thing left to finish"] },
    is_secret: false,
  },
  {
    slug: "s10-final-bug-hunt",
    session_number: SESSION,
    block_number: 1,
    title: "Final Bug Hunt",
    description: "Playtest your own project and a podmate's, then fix any last bugs.",
    xp: 5,
    proof_type: "checklist",
    proof_config: { items: ["I playtested my own project and a podmate's, and fixed any last bugs"] },
    is_secret: false,
  },
  {
    slug: "s10-final-polish-1",
    session_number: SESSION,
    block_number: 1,
    title: "Final Polish 1",
    description: "A last visual or feel touch — spacing, colors, a title, a nicer ending. Upload a before-and-after.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s10-final-polish-2",
    session_number: SESSION,
    block_number: 1,
    title: "Final Polish 2",
    description: "Another last touch — upload a before-and-after.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s10-final-deploy",
    session_number: SESSION,
    block_number: 1,
    title: "Final Deploy",
    description: "Re-deploy your finished version and confirm the live link works on a fresh device — open it on a phone, photograph it, and submit the link.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "composite",
      require: ["screenshot", "fields"],
      fields: ["Your live link (confirmed working on a phone)"],
    },
    is_secret: false,
  },

  // ── Block 2 — Phase 5: Presentation-Ready ───────────────────────────────────
  {
    slug: "s10-demo-rehearsed",
    session_number: SESSION,
    block_number: 2,
    title: "Demo Rehearsed",
    description: "Practice your 60-second demo once with your pod: show it, say your one-sentence pitch, click the main thing.",
    xp: 5,
    proof_type: "checklist",
    proof_config: { items: ["I rehearsed my 60-second demo with my pod — showed it, said my pitch, clicked the main thing"] },
    is_secret: false,
  },
  {
    slug: "s10-presentation-ready",
    session_number: SESSION,
    block_number: 2,
    title: "PRESENTATION-READY",
    description: "The final milestone before you present — tick every box. An instructor confirms before XP awards.",
    xp: 15,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: [
        "The live link works on a fresh device",
        "It does its one thing",
        "No real personal info",
        "I can demo it in 60 seconds",
        "My one-sentence pitch is ready",
      ],
    },
    is_secret: false,
  },
];

async function main() {
  console.log(`Inserting ${s10Achievements.length} Session 10 achievements...`);

  const slugs = s10Achievements.map((a) => a.slug);
  const { data: existing } = await supabase
    .from("achievements")
    .select("slug")
    .in("slug", slugs);

  if (existing && existing.length > 0) {
    console.error("Already in DB — aborting to avoid duplicates:");
    existing.forEach((r) => console.error(" ", r.slug));
    process.exit(1);
  }

  const { error } = await supabase.from("achievements").insert(s10Achievements);
  if (error) {
    console.error("Insert failed:", error.message);
    process.exit(1);
  }

  console.log("Inserted. Running sort_order backfill for session 10...");

  const { data: rows, error: readErr } = await supabase
    .from("achievements")
    .select("id, slug, sort_order")
    .eq("session_number", SESSION);

  if (readErr || !rows) {
    console.error("Failed to read session 10 rows:", readErr?.message);
    process.exit(1);
  }

  const slugIndex = new Map(s10Achievements.map((a, i) => [a.slug, i]));
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

  console.log(`Done. ${s10Achievements.length} achievements inserted, ${needsOrder.length} sort_orders assigned.`);
}

main();
