/**
 * One-off patch: sync the "Teach AI How You Work" session's achievements in
 * the TEMPLATE cohort (test-cohort) to its slide deck ("Session 5-Teach AI
 * How I Work.pptx"), now positioned as session_number=5 after the curriculum
 * reorder (this content used to live at session_number=8). The slide deck is
 * the source of truth.
 *
 * Main change: this deck teaches a TWO-tool model (agents.md + Skills) —
 * "Rule" is not a vocabulary word here (the deck's "Three New Words" are
 * agents.md, Skill, Summon). Our DB had modeled a three-tool system with a
 * separate "Rule" concept, so several achievements are renamed/reworded to
 * speak in agents.md terms instead:
 * - Set a Rule -> Set Your Style
 * - Safety Rule -> Safety Line
 * - Rule or Skill? -> agents.md or Skill?
 * - It Fired By Itself, When Does It Fire?, and Ship It's checklist all had
 *   "rule" language swapped for "agents.md".
 *
 * - Removes 3 achievements with no slide counterpart (0 submissions
 *   confirmed beforehand): First Idea Down (the deck prescribes a specific
 *   next-session project — a Memory Match game from the cards — and treats
 *   tonight's idea-decision as ungraded take-home reflection, not a scored
 *   in-class step), Neighbor Assist and Bonus Skill (neither has a dedicated
 *   EARN IT slide in this deck).
 * - Updates Ready Check's checklist to reference the correct prior-session
 *   folder (Session 4) and this session's folder (session-5-stack), and
 *   swaps stale "Cursor" wording for "Codex"/"VS Code" throughout.
 * - No block_number changes needed: removing the 3 orphaned achievements
 *   collapses the block range to exactly 0–6, already matching the deck.
 * - Renumbers sort_order to match the deck's sequence.
 *
 * Run once: npx ts-node scripts/patch-s5-slide-sync.ts
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
const SESSION_NUMBER = 5;

const TO_DELETE = ["s7-first-idea-down", "s7-neighbor-assist", "s7-bonus-skill"];

// Kept achievements: rename/re-word in place (preserves row id).
const UPDATES: Record<string, Record<string, unknown>> = {
  "s7-ready-check": {
    proof_config: {
      items: [
        "VS Code + Codex open and signed in",
        "Session 4 folder still alive — don't touch it, today's work lives somewhere new",
        "New folder created: session-5-stack",
        "I know where pages open in the browser",
      ],
    },
  },
  "s7-when-does-it-fire": {
    description: "Three quick questions about when each tool fires — agents.md and skills.",
    proof_config: {
      questions: [
        {
          question: "agents.md applies to every project you ever make.",
          options: ["Myth — it only applies to the project it's in", "Fact — it follows you everywhere"],
          correct_index: 0,
          xp: 1,
        },
        {
          question: "Your agents.md applies automatically without you asking.",
          options: ["Myth", "Fact"],
          correct_index: 1,
          xp: 1,
        },
        {
          question: "You have to summon a skill by name to use it.",
          options: ["Myth — it fires on its own", "Fact — you call it when you want it"],
          correct_index: 1,
          xp: 1,
        },
      ],
    },
  },
  "s7-set-a-rule": {
    slug: "s7-set-your-style",
    title: "Set Your Style",
    description: "Adapt the template into an agents.md entry capturing a style you always want — screenshot the saved entry.",
  },
  "s7-safety-rule": {
    slug: "s7-safety-line",
    title: "Safety Line",
    description: "Add a standing \"never include real personal information\" line to your agents.md so it's on in every project.",
    proof_config: {
      form_type: "checklist",
      items: ["I have added a \"never include real personal information\" line to my agents.md"],
    },
  },
  "s7-it-fired-by-itself": {
    description: "Build a brand-new thing without typing your style preference — screenshot it obeying your agents.md anyway.",
  },
  "s7-rule-or-skill": {
    slug: "s7-agents-md-or-skill",
    title: "agents.md or Skill?",
    description: "One fires automatically on every project. The other only works when you call it by name. Which is which?",
    proof_config: {
      form_type: "quiz",
      questions: [
        {
          question: "You want rounded buttons on every project without ever asking again. Is that agents.md or a Skill?",
          options: ["agents.md — it fires automatically on every project", "A Skill — you summon it when you need it"],
          correct_index: 0,
          xp: 1,
        },
      ],
    },
  },
  "s7-ship-it": {
    proof_config: {
      form_type: "checklist",
      items: [
        "An agents.md entry is set (including the safety line)",
        "A card skill is built",
        "The set has at least 3 cards",
        "The cards share a consistent look",
        "The skill was summoned, not re-typed, each time",
        "Final screenshot uploaded",
      ],
    },
  },
  "s7-one-thing-i-learned": {
    description: "Finish the line: \"When I want Codex to do something my way every time, I should ___.\"",
    proof_config: {
      form_type: "fields",
      fields: ["When I want Codex to do something my way every time, I should…"],
    },
  },
};

// Final sort order, deck sequence.
const FINAL_ORDER = [
  "s7-ready-check",
  "s7-when-does-it-fire",
  "s7-feel-the-repeat",
  "s7-set-your-style",
  "s7-safety-line",
  "s7-it-fired-by-itself",
  "s7-build-a-skill",
  "s7-summon-it",
  "s7-agents-md-or-skill",
  "s7-card-1",
  "s7-card-2",
  "s7-card-3",
  "s7-consistency-check",
  "s7-upgrade-the-recipe",
  "s7-show-the-set",
  "s7-borrow-a-skill",
  "s7-lent-a-skill",
  "s7-ship-it",
  "s7-one-thing-i-learned",
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
