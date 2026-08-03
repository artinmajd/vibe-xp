/**
 * One-off patch: sync the "Taking It Live" session's achievements in the
 * TEMPLATE cohort (test-cohort) to its slide deck ("Session 2-Taking It
 * Live.pptx"), now positioned as session_number=2 after the curriculum
 * reorder. The slide deck is the source of truth.
 *
 * - Removes 8 achievements with no slide counterpart (0 submissions
 *   confirmed against any of them beforehand): Read a URL, and the entire
 *   final-project-scoping set (What Counts as Done, Everyone Pitched,
 *   Scoped & Locked, Right Size, Launch Day Done, Build Plan, Neighbor
 *   Assist) — that content isn't in this deck; it likely belongs to a
 *   later session once we review that deck.
 * - Adds Accounts Ready (+8, self-attested checklist) — explicitly flagged
 *   "SUGGESTED — NOT YET IN VIBE-XP" in the deck.
 * - Updates One Thing I Learned's wording to the deck's session-specific
 *   prompt.
 * - Realigns block_number for every kept achievement to the deck's block
 *   structure (0-7): the deck added a new Block 3 (account creation) and
 *   moved the hands-on save-points work to a new Block 4, pushing
 *   deploy/share/wrap up by one or two blocks.
 * - Renumbers sort_order to match the deck's sequence.
 *
 * Run once: npx ts-node scripts/patch-s2-slide-sync.ts
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
const SESSION_NUMBER = 2;

const TO_DELETE = [
  "s8-read-a-url",
  "s8-what-counts-as-done",
  "s8-everyone-pitched",
  "s8-scoped-and-locked",
  "s8-right-size",
  "s8-launch-day-done",
  "s8-build-plan",
  "s8-neighbor-assist",
];

// Kept achievements: realign block_number (+ wording fix for one-thing-i-learned).
const UPDATES: Record<string, Record<string, unknown>> = {
  "s8-ready-check": { block_number: 0 },
  "s8-internet-quiz": { block_number: 1 },
  "s8-save-point-check": { block_number: 2 },
  "s8-first-save-points": { block_number: 4 },
  "s8-time-travel": { block_number: 4 },
  "s8-public-check": { block_number: 5 },
  "s8-everyones-live": { block_number: 5 },
  "s8-deploy-again": { block_number: 5 },
  "s8-shared-it": { block_number: 6 },
  "s8-one-thing-i-learned": {
    block_number: 7,
    description: "Finish the line: \"The thing that surprised me most about how the internet works is ___.\"",
    proof_config: { form_type: "fields", fields: ["The thing that surprised me most about how the internet works is…"] },
  },
};

const NEW_ACHIEVEMENT = {
  slug: "s8-accounts-ready",
  session_number: SESSION_NUMBER,
  block_number: 3,
  title: "Accounts Ready",
  description: "Every member has a GitHub account, one repository created, and a Vercel account connected to GitHub.",
  xp: 8,
  proof_type: "checklist",
  proof_config: {
    items: [
      "GitHub account created",
      "One repository created",
      "Vercel account connected to GitHub",
    ],
  },
  is_secret: false,
  is_active: true,
  is_unlocked: false,
};

// Final sort order, deck sequence.
const FINAL_ORDER = [
  "s8-ready-check",
  "s8-internet-quiz",
  "s8-save-point-check",
  "s8-accounts-ready",
  "s8-first-save-points",
  "s8-time-travel",
  "s8-public-check",
  "s8-everyones-live",
  "s8-deploy-again",
  "s8-shared-it",
  "s8-one-thing-i-learned",
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

  console.log("Inserting new achievement: s8-accounts-ready...");
  const { data: existingNew } = await supabase
    .from("achievements")
    .select("id")
    .eq("cohort_id", cohort.id)
    .eq("slug", NEW_ACHIEVEMENT.slug)
    .maybeSingle();
  if (existingNew) {
    console.log("  already exists — skipping insert.");
  } else {
    const { error } = await supabase.from("achievements").insert({ ...NEW_ACHIEVEMENT, cohort_id: cohort.id });
    if (error) { console.error("Insert failed:", error.message); process.exit(1); }
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
