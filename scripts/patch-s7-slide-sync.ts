/**
 * One-off patch: sync the "Everything Breaks (and How Pros Fix It Fast)"
 * session's achievements in the TEMPLATE cohort (test-cohort) to its slide
 * deck ("Session7-Debugging.pptx"), at session_number=7 (no reorder needed
 * — content already matched by title/prefix). The slide deck is the source
 * of truth.
 *
 * Major change: the deck refocuses scoring entirely onto the debugging
 * skill, not the feature-building that creates bugs to debug. It has NO
 * "EARN IT ON VIBE-XP" slide for any individual Whack-a-Mole build piece
 * (Playfield, Moles Pop Up, Click to Score, Timer, Game Over) or power-up
 * feature (Speed Up, Sound, Golden Mole, Combo, Difficulty, Two-at-Once,
 * Splat) — those become ungated build instructions. Only the debugging
 * moments (Squash One, Caught the AI, Rolled Back) and the overall Ship It
 * gate (which just requires "at least two power-up features" exist, not
 * scoring each one) are scored.
 *
 * - Removes 14 achievements with no EARN IT slide in this deck (0
 *   submissions confirmed beforehand): the 5 Whack-a-Mole build pieces, the
 *   7 power-up features, We Showed It (no showcase-presentation slide in
 *   Block 6 despite the block being titled "Showcase & Wrap"), and Bonus
 *   Feature (no textual support anywhere).
 * - Adds "Try It and See" (+3), the third Repair Kit move alongside Roll
 *   Back (Safety Net) and Look It Up (Ask It to Look It Up) — the deck
 *   frames all three as a "complete any two of three" badge set.
 * - Rewrites Final Submission to screenshot + URL (composite), dropping the
 *   bug-and-fix story fields the deck no longer asks for.
 * - Updates Ready Check's stale wording: Cursor -> VS Code + Codex, the
 *   leftover "(dashboard survived!)" reference to the now-removed old
 *   Session 6 dashboard content -> "Session 6 folder still alive — the game
 *   survived!" (matching the deck's own EARN IT slide 11, which says
 *   "Session 6" — its walkthrough slide 10 says "Session 5", a stale
 *   leftover we're disregarding), and session-6-debug -> session-7-debug.
 * - Moves Neighbor Assist (still supported via the house rules' "Helping
 *   another team earns XP") from the stray block_number 8 down to 6,
 *   matching the deck's actual max block.
 *
 * Run once: npx ts-node scripts/patch-s7-slide-sync.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TEMPLATE_JOIN_CODE = "TEST-COHORT";
const SESSION_NUMBER = 7;

const TO_DELETE = [
  // Whack-a-Mole base build pieces — no EARN IT slide in this deck
  "s6-whack-playfield",
  "s6-whack-moles",
  "s6-whack-click-score",
  "s6-whack-timer",
  "s6-whack-game-over",
  // Power-up features — no EARN IT slide in this deck
  "s6-power-speed-up",
  "s6-power-sound",
  "s6-power-golden-mole",
  "s6-power-combo",
  "s6-power-difficulty",
  "s6-power-two-at-once",
  "s6-power-splat",
  // No deck support at all
  "s6-we-showed-it",
  "s6-bonus-feature",
];

// Kept achievements: reword/renumber in place (preserves row id).
const UPDATES: Record<string, Record<string, unknown>> = {
  "s6-ready-check": {
    proof_config: {
      items: [
        "VS Code + Codex open and signed in",
        "Session 6 folder still alive — the game survived!",
        "New folder created: session-7-debug",
        "I know where pages open in the browser",
      ],
    },
  },
  "s6-final-submission": {
    description: "Submit a final screenshot of your project along with its live URL.",
    proof_config: {
      form_type: "composite",
      require: ["screenshot", "fields"],
      fields: ["Your live project URL"],
    },
  },
  "s6-neighbor-assist": { block_number: 6 },
};

const NEW_ACHIEVEMENTS = [
  {
    slug: "s6-try-it-and-see",
    session_number: SESSION_NUMBER,
    block_number: 2,
    title: "Try It and See",
    description: "Ask the AI to run it and tell you what happens, or what error shows up — screenshot its report.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
    is_active: true,
    is_unlocked: false,
  },
];

// Final sort order, deck sequence.
const FINAL_ORDER = [
  "s6-ready-check",
  "s6-bug-report-check",
  "s6-first-fix",
  "s6-open-the-console",
  "s6-safe-paste",
  "s6-ask-it-to-look-it-up",
  "s6-safety-net",
  "s6-try-it-and-see",
  "s6-repair-kit-check",
  "s6-squash-one",
  "s6-caught-the-ai",
  "s6-rolled-back",
  "s6-qa-pass",
  "s6-got-qad",
  "s6-fixed-from-the-field",
  "s6-ship-it",
  "s6-final-submission",
  "s6-one-thing-i-learned",
  "s6-neighbor-assist",
];

async function main() {
  const { data: cohort, error: cohortErr } = await supabase
    .from("cohorts")
    .select("id, name")
    .eq("join_code", TEMPLATE_JOIN_CODE)
    .single();
  if (cohortErr || !cohort) {
    console.error("Template cohort not found:", cohortErr?.message);
    process.exit(1);
  }
  console.log(`Template cohort: ${cohort.name} (${cohort.id})`);

  const { data: toDeleteRows } = await supabase
    .from("achievements")
    .select("id, slug")
    .eq("cohort_id", cohort.id)
    .in("slug", TO_DELETE);
  const deleteIds = (toDeleteRows ?? []).map((r) => r.id);
  if (deleteIds.length > 0) {
    const { count } = await supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .in("achievement_id", deleteIds);
    if ((count ?? 0) > 0) {
      console.error(`ABORT: ${count} submissions exist against achievements slated for deletion.`);
      process.exit(1);
    }
  }
  console.log(`Deleting ${deleteIds.length} achievements with no slide counterpart...`);
  if (deleteIds.length > 0) {
    const { error } = await supabase.from("achievements").delete().in("id", deleteIds);
    if (error) { console.error("Delete failed:", error.message); process.exit(1); }
  }

  console.log(`Updating ${Object.keys(UPDATES).length} kept achievements...`);
  for (const [slug, fields] of Object.entries(UPDATES)) {
    if (Object.keys(fields).length === 0) continue;
    const { data: updated, error } = await supabase
      .from("achievements")
      .update(fields)
      .eq("cohort_id", cohort.id)
      .eq("slug", slug)
      .select("id")
      .maybeSingle();
    if (error) { console.error(`Update failed for ${slug}:`, error.message); process.exit(1); }
    if (!updated) { console.error(`WARNING: ${slug} not found in template cohort — skipped.`); continue; }
    console.log(`  ${slug} updated`);
  }

  console.log(`Inserting ${NEW_ACHIEVEMENTS.length} new achievement(s)...`);
  for (const ach of NEW_ACHIEVEMENTS) {
    const { data: existingNew } = await supabase
      .from("achievements")
      .select("id")
      .eq("cohort_id", cohort.id)
      .eq("slug", ach.slug)
      .maybeSingle();
    if (existingNew) {
      console.log(`  ${ach.slug} already exists — skipping insert.`);
      continue;
    }
    const { error } = await supabase.from("achievements").insert({ ...ach, cohort_id: cohort.id });
    if (error) { console.error(`Insert failed for ${ach.slug}:`, error.message); process.exit(1); }
  }

  console.log("Renumbering sort_order for the whole session...");
  for (let i = 0; i < FINAL_ORDER.length; i++) {
    const slug = FINAL_ORDER[i];
    const { error } = await supabase
      .from("achievements")
      .update({ sort_order: i + 1 })
      .eq("cohort_id", cohort.id)
      .eq("slug", slug);
    if (error) { console.error(`sort_order failed for ${slug}:`, error.message); process.exit(1); }
  }

  const { data: final } = await supabase
    .from("achievements")
    .select("slug, block_number, sort_order, title, xp, proof_type")
    .eq("cohort_id", cohort.id)
    .eq("session_number", SESSION_NUMBER)
    .order("sort_order");

  console.log(`\nDone. Session ${SESSION_NUMBER} now has ${final?.length ?? 0} achievements:\n`);
  for (const r of final ?? []) {
    console.log(`  [blk ${r.block_number}] ${r.title} (+${r.xp}) — ${r.proof_type} <${r.slug}>`);
  }
}

main();
