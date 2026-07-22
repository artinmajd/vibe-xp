/**
 * One-off patch: sync Session 1 achievements in the TEMPLATE cohort
 * (test-cohort) to the "Session 1 — What is AI & How Does It Think?" slide
 * deck, which is now the source of truth. Tool changed from Cursor to
 * VSCode + Codex; first build changed from hello.html to a Project Hub.
 *
 * - Renames/re-prices 9 kept achievements (preserves their row id).
 * - Deletes 17 achievements with no slide counterpart (0 submissions
 *   confirmed against any of them beforehand).
 * - Inserts 1 new achievement (the privacy quiz, "Share or Skip?").
 * - Renumbers block_number + sort_order for the whole session to match the
 *   slide sequence (blocks 1–8, with a new privacy block 5).
 *
 * Run once: npx ts-node scripts/patch-s1-slide-sync.ts
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

// Slugs with no counterpart in the slides — safe to delete (0 submissions confirmed).
const TO_DELETE = [
  "team-ideas",
  "double-down", "hallucination-hunter", "fact-checker",
  "contradiction-machine", "context-loader", "follow-up-investigator",
  "browser-launch", "personalization",
  "add-hyperlink", "add-second-page", "add-user-interaction", "add-sound",
  "fix-broken-page", "undo-failed-change", "use-10-prompts",
  "image-button-animation-combo",
];

// Kept achievements: rename/re-price/re-block in place (preserves row id).
// Each entry: old slug -> new field values.
const UPDATES: Record<string, Record<string, unknown>> = {
  "team-names": {
    title: "Assemble the Squad",
    description: "Register your team on the Team Join page — team name, three member names, and an optional emoji or avatar.",
    xp: 5,
    block_number: 1,
  },
  "ai-quiz": {
    slug: "myth-or-fact",
    title: "Myth or Fact",
    description: "Three quick statements about AI — is each one myth or fact?",
    xp: 3,
    block_number: 2,
    proof_config: {
      questions: [
        {
          question: "An LLM is searching the live internet for your answer.",
          options: ["Myth", "Fact"],
          correct_index: 0,
          xp: 1,
        },
        {
          question: "The model predicts the next word based on patterns it learned.",
          options: ["Myth", "Fact"],
          correct_index: 1,
          xp: 1,
        },
        {
          question: "When it doesn't know something, it usually just admits it.",
          options: ["Myth", "Fact"],
          correct_index: 0,
          xp: 1,
        },
      ],
    },
  },
  "letter-counter": {
    slug: "caught-it-counting",
    title: "Caught It Counting",
    description: "Got the model to confidently give a wrong letter or vowel count — and caught it in the act.",
    xp: 5,
    block_number: 3,
  },
  "made-it-cave": {
    description: "Got the model to abandon a correct answer after you pushed back with fake authority.",
    xp: 5,
    block_number: 3,
  },
  "past-the-cutoff": {
    description: "Caught the model admitting it doesn't know a recent event, making something up, or triggering a web search.",
    xp: 5,
    block_number: 3,
  },
  "expert-witness": {
    description: "Caught the model stating something confidently wrong about a topic your pair genuinely knows well.",
    xp: 5,
    block_number: 4,
  },
  "context-upgrade": {
    slug: "context-wins",
    title: "Context Wins",
    description: "List three specific details the context-fed answer got right or added that the first answer missed.",
    xp: 5,
    block_number: 4,
    proof_config: { fields: ["Detail 1", "Detail 2", "Detail 3"] },
  },
  "cursor-ready": {
    slug: "locked-and-loaded",
    title: "Locked and Loaded",
    description: "Your AI builder is set up and ready to go — tick all three to log in for the day.",
    xp: 10,
    block_number: 6,
    proof_type: "checklist",
    proof_config: {
      items: [
        "VSCode open",
        "Codex panel open and signed in",
        "vibe-coding folder open in the sidebar",
      ],
    },
  },
  "first-file": {
    slug: "hub-online",
    title: "Hub Online",
    description: "Upload a screenshot of your Project Hub open in a browser — big title, your name, and the \"Session 1\" card showing.",
    xp: 5,
    block_number: 7,
  },
  "add-custom-background": {
    slug: "restyle-your-hub",
    title: "Restyle your hub",
    description: "Change your hub's background — a color, gradient, image, or pattern.",
    xp: 3,
    block_number: 8,
  },
  "add-image": {
    slug: "add-an-image",
    title: "Add an image",
    description: "Add an image of something you like to your hub.",
    xp: 3,
    block_number: 8,
  },
  "add-animation": {
    slug: "make-your-cards-pop",
    title: "Make your cards pop",
    description: "Add hover effects, shadows, or animations to your project cards.",
    xp: 3,
    block_number: 8,
  },
  "add-button": {
    slug: "add-a-working-button",
    title: "Add a working button",
    description: "Add a button to your hub that does something when clicked.",
    xp: 5,
    block_number: 8,
  },
};

const NEW_ACHIEVEMENT = {
  slug: "share-or-skip",
  session_number: 1,
  block_number: 5,
  title: "Share or Skip?",
  description: "Three things you could paste into an AI chat — share it, or skip it?",
  xp: 3,
  proof_type: "quiz",
  proof_config: {
    questions: [
      {
        question: "A Wikipedia paragraph about your favourite game.",
        options: ["Share", "Skip"],
        correct_index: 0,
        xp: 1,
      },
      {
        question: "Your teammate's full name and school — for the About page.",
        options: ["Share", "Skip"],
        correct_index: 1,
        xp: 1,
      },
      {
        question: "Your streaming password, so the AI can \"test the login page.\"",
        options: ["Share", "Skip"],
        correct_index: 1,
        xp: 1,
      },
    ],
  },
  is_secret: false,
  is_active: true,
  is_unlocked: false,
};

// Final sort order, slide sequence. Keyed by the NEW slug (post-rename).
const FINAL_ORDER = [
  "team-names",
  "myth-or-fact",
  "caught-it-counting",
  "made-it-cave",
  "past-the-cutoff",
  "expert-witness",
  "context-wins",
  "share-or-skip",
  "locked-and-loaded",
  "hub-online",
  "restyle-your-hub",
  "add-an-image",
  "make-your-cards-pop",
  "add-a-working-button",
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

  // Pre-flight: confirm zero submissions against the deleted slugs.
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
  for (const [oldSlug, fields] of Object.entries(UPDATES)) {
    const { data: updated, error } = await supabase
      .from("achievements")
      .update(fields)
      .eq("cohort_id", cohort.id)
      .eq("slug", oldSlug)
      .select("id")
      .maybeSingle();
    if (error) { console.error(`Update failed for ${oldSlug}:`, error.message); process.exit(1); }
    if (!updated) { console.error(`WARNING: ${oldSlug} not found in template cohort — skipped.`); continue; }
    console.log(`  ${oldSlug} -> ${fields.slug ?? oldSlug}`);
  }

  console.log("Inserting new achievement: share-or-skip...");
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
    .eq("session_number", 1)
    .order("sort_order");

  console.log(`\nDone. Session 1 now has ${final?.length ?? 0} achievements:\n`);
  for (const r of final ?? []) {
    console.log(`  [blk ${r.block_number}] ${r.title} (+${r.xp}) — ${r.proof_type} <${r.slug}>`);
  }
}

main();
