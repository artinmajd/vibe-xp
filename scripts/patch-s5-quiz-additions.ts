/**
 * One-off patch: add 3 new Block 3 quizzes to the "Teach AI How You Work"
 * session (session_number=5) in the TEMPLATE cohort, per the updated slide
 * deck ("Session 5 Teach AI How I Work.pptx", slides 54-59, appended after
 * the original 53-slide deck).
 *
 * - The Safety Line (+2, quiz) — where a standing safety rule belongs.
 * - Plan or Skill? (+2, quiz) — which question a Skill answers vs a plan.
 * - What Survives? (+2, quiz) — what does/doesn't survive a fresh chat.
 *
 * Placed at the end of Block 3, after "agents.md or Skill?" and before
 * Block 4's card-building activities.
 *
 * Run once: npx ts-node scripts/patch-s5-quiz-additions.ts
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

const NEW_ACHIEVEMENTS = [
  {
    slug: "s7-safety-line-quiz",
    session_number: SESSION_NUMBER,
    block_number: 3,
    title: "The Safety Line",
    description: "Where should \"Never include real personal information\" live so it always applies?",
    xp: 5,
    proof_type: "quiz",
    proof_config: {
      questions: [
        {
          question: "Where should \"Never include real personal information\" live so it always applies?",
          options: [
            "In a one-off prompt, retyped every time",
            "In your agents.md file",
            "Nowhere — Codex already knows this automatically",
          ],
          correct_index: 1,
          xp: 5,
        },
      ],
    },
    is_secret: false,
    is_active: true,
    is_unlocked: false,
  },
  {
    slug: "s7-plan-or-skill",
    session_number: SESSION_NUMBER,
    block_number: 3,
    title: "Plan or Skill?",
    description: "Which question does a Skill answer?",
    xp: 5,
    proof_type: "quiz",
    proof_config: {
      questions: [
        {
          question: "Which question does a Skill answer?",
          options: [
            "\"What should we build next?\"",
            "\"How do I make this again?\"",
            "\"Where did I save my files?\"",
          ],
          correct_index: 1,
          xp: 5,
        },
      ],
    },
    is_secret: false,
    is_active: true,
    is_unlocked: false,
  },
  {
    slug: "s7-what-survives",
    session_number: SESSION_NUMBER,
    block_number: 3,
    title: "What Survives?",
    description: "You open a brand-new chat. Which of these does NOT automatically survive unless you saved it as a file?",
    xp: 5,
    proof_type: "quiz",
    proof_config: {
      questions: [
        {
          question: "You open a brand-new chat. Which of these does NOT automatically survive unless you saved it as a file?",
          options: [
            "Your agents.md",
            "Your project's files and code",
            "The plan you and Codex talked through in Plan Mode",
          ],
          correct_index: 2,
          xp: 5,
        },
      ],
    },
    is_secret: false,
    is_active: true,
    is_unlocked: false,
  },
];

// Final sort order for the whole session, deck sequence with the new quizzes
// inserted at the end of Block 3.
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
  "s7-safety-line-quiz",
  "s7-plan-or-skill",
  "s7-what-survives",
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
