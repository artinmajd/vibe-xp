/**
 * One-off patch: sync the "Think in Pieces, Build in Pieces" session's
 * achievements in the TEMPLATE cohort (test-cohort) to its slide deck
 * ("Session6-Building in pieces.pptx"), at session_number=6 (no reorder
 * needed — content already matched by title). The slide deck is the source
 * of truth.
 *
 * Major change: Blocks 3-6 were built entirely around a "dashboard"
 * exercise (Spot the Pieces, Wireframe Done, Dashboard Pieces 1-6, Name a
 * Tool/Chart.js, Surgical Strike, Named Tool Live, Paper to Pixels). This
 * deck replaces all of that with a continuation of the Mario game from
 * Block 1-2: sketch "Level 2" on paper, build it from the sketch, save an
 * agents.md file, and build "Level 3" in a brand-new chat to prove the file
 * works. None of the dashboard/Chart.js content exists in this deck.
 *
 * - Renames 2 Block 1 achievements to match the deck: Whack-a-Mole -> Fix
 *   and Re-Test, Weight Limit -> Why Did It Break? (with de-Cursored quiz
 *   options).
 * - Updates Ready Check's checklist to the deck's 4 items plus "Paper and
 *   markers on the table" as the 5th (the deck's own intro slide claims
 *   "five boxes" but only lists 4 — paper is clearly still relevant this
 *   session).
 * - Removes 23 achievements with no counterpart in this deck (0 submissions
 *   confirmed beforehand): the entire dashboard arc (21 achievements) plus
 *   Neighbor Assist and Bonus Piece (no textual support anywhere in this
 *   deck, not even a generic house-rule mention).
 * - Adds 6 new achievements matching the deck's actual Level 2/3 flow:
 *   Sketch Done, Nothing Real, Level 2 Checkpoint (block 3); Save File,
 *   Level 3 Lives (block 4); Game Is Live (block 5).
 * - Rewrites Ship It's checklist and Final Submission's proof to match the
 *   new content; drops a stale "strike" mention from We Showed It's
 *   description (leftover reference to the removed Surgical Strike arc).
 * - Renumbers block_number sequentially 0-7 (the deck's own numbering has
 *   duplicate/stale slides that were resolved by using the non-duplicate,
 *   non-stale-reference version of each) and sort_order to match the deck.
 *
 * Run once: npx ts-node scripts/patch-s6-slide-sync.ts
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
const SESSION_NUMBER = 6;

const TO_DELETE = [
  // Dashboard arc — Block 3 (old)
  "s5-spot-the-pieces",
  "s5-wireframe-done",
  "s5-safe-stats",
  "s5-rival-sign-off",
  // Dashboard arc — Block 4 (old)
  "s5-name-a-tool",
  "s5-name-drop-dont-read",
  // Dashboard arc — Block 5 (old)
  "s5-rulebook-ritual",
  "s5-dashboard-piece-1",
  "s5-dashboard-piece-2",
  "s5-dashboard-piece-3",
  "s5-surgical-phrasing",
  "s5-wireframe-in-the-loop",
  "s5-halftime-checkpoint",
  // Dashboard arc — Block 6 (old)
  "s5-surgical-strike",
  "s5-nothing-else-moved",
  "s5-dashboard-piece-4",
  "s5-dashboard-piece-5",
  "s5-dashboard-piece-6",
  "s5-named-tool-live",
  "s5-working-button",
  "s5-paper-to-pixels",
  // No deck support at all
  "s5-neighbor-assist",
  "s5-bonus-piece",
];

// Kept achievements: rename/reword/renumber in place (preserves row id).
const UPDATES: Record<string, Record<string, unknown>> = {
  "s5-ready-check": {
    proof_config: {
      items: [
        "VS Code open and Codex signed in",
        "Session 4 folder still alive — the site survived!",
        "New session-5-pieces folder created",
        "session-5-pieces opened in VS Code — the AI runs inside that folder",
        "Paper and markers on the table",
      ],
    },
  },
  "s5-whack-a-mole": {
    slug: "s5-fix-and-re-test",
    title: "Fix and Re-Test",
  },
  "s5-weight-limit": {
    slug: "s5-why-did-it-break",
    title: "Why Did It Break?",
    proof_config: {
      questions: [
        {
          question: "Why did the one-shot game break — even though the prompt was good and specific?",
          options: [
            "The prompt was too vague — it needed more detail.",
            "Too much cargo for one trip — the words were fine.",
            "The AI can't make games.",
          ],
          correct_index: 1,
          xp: 1,
        },
      ],
    },
  },
  "s5-ship-it": {
    block_number: 6,
    proof_config: {
      form_type: "checklist",
      items: [
        "Game reached 4+ working pieces (or Road Hopper swap)",
        "Sketch complete — boxed, labeled, numbered",
        "agents.md saved — by prompts only",
        "Level 2 built from the sketch — every box on screen",
        "Checkpoint photo taken — the game beside the paper",
        "The button works",
        "Level 3 built by a brand-new chat reading agents.md",
        "Repairs sent as fix-only prompts — symptom, not code",
      ],
    },
  },
  "s5-final-submission": {
    block_number: 6,
    description: "Submit the set: final game screenshot, both sketch photos, the one-shot game screenshot and bug sheet, and Level 3 running from its new chat.",
    proof_config: { form_type: "screenshot" },
  },
  "s5-we-showed-it": {
    description: "Present in the showcase — paper, Level 2, the enemy, and the ten-second bug reel — then tap the box.",
  },
};

const NEW_ACHIEVEMENTS = [
  {
    slug: "s5-sketch-done",
    session_number: SESSION_NUMBER,
    block_number: 3,
    title: "Sketch Done",
    description: "Sketch your Level 2 — boxes, labels, numbers. Photograph the paper and upload it.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
    is_active: true,
    is_unlocked: false,
  },
  {
    slug: "s5-nothing-real",
    session_number: SESSION_NUMBER,
    block_number: 3,
    title: "Nothing Real",
    description: "Confirm as a whole team: your game uses invented names and details only — no real schedules, locations, or school details.",
    xp: 3,
    proof_type: "checklist",
    proof_config: {
      items: ["Our game uses invented names and details only — nothing that says where we are or when"],
    },
    is_secret: false,
    is_active: true,
    is_unlocked: false,
  },
  {
    slug: "s5-level-2-checkpoint",
    session_number: SESSION_NUMBER,
    block_number: 3,
    title: "Level 2 Checkpoint",
    description: "Level 2 is built — screenshot the game next to the sketch it came from.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
    is_active: true,
    is_unlocked: false,
  },
  {
    slug: "s5-save-file",
    session_number: SESSION_NUMBER,
    block_number: 4,
    title: "Save File",
    description: "Create agents.md recording your game's name, hero and controls, style, and rules — everything a new chat needs to keep the game consistent. Screenshot the file.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
    is_active: true,
    is_unlocked: false,
  },
  {
    slug: "s5-level-3-lives",
    session_number: SESSION_NUMBER,
    block_number: 4,
    title: "Level 3 Lives",
    description: "In a brand-new chat, build Level 3 using agents.md and your quick sketch. Upload a screenshot of Level 3 running.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
    is_active: true,
    is_unlocked: false,
  },
  {
    slug: "s5-game-is-live",
    session_number: SESSION_NUMBER,
    block_number: 5,
    title: "Game Is Live",
    description: "Submit your live Vercel link — your game on the internet, playable in the browser, reachable from your homepage card.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "url" },
    is_secret: false,
    is_active: true,
    is_unlocked: false,
  },
];

// Final sort order, deck sequence.
const FINAL_ORDER = [
  "s5-ready-check",
  "s5-one-shot-untouched",
  "s5-bug-hunt",
  "s5-fix-and-re-test",
  "s5-why-did-it-break",
  "s5-game-piece-world",
  "s5-game-piece-hero",
  "s5-game-piece-gravity-jump",
  "s5-game-piece-platforms",
  "s5-game-piece-coins-score",
  "s5-game-piece-flag",
  "s5-one-shot-vs-pieces",
  "s5-sketch-done",
  "s5-nothing-real",
  "s5-level-2-checkpoint",
  "s5-save-file",
  "s5-level-3-lives",
  "s5-game-is-live",
  "s5-ship-it",
  "s5-final-submission",
  "s5-we-showed-it",
  "s5-one-thing-i-learned",
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
    console.log(`  ${slug} -> ${(fields as { slug?: string }).slug ?? slug}`);
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
