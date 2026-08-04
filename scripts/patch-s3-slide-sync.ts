/**
 * One-off patch: sync the "Art of Prompting" session's achievements in the
 * TEMPLATE cohort (test-cohort) to its slide deck ("Session 3-Prompting.pptx"),
 * now positioned as session_number=3 after the curriculum reorder. The slide
 * deck is the source of truth.
 *
 * Main change: the build target upgraded from a static trading card to a
 * deployed tic-tac-toe game (own GitHub repo, live Vercel URL, homepage card
 * link) — so several achievements are full replacements, not just renames.
 *
 * - Removes 2 achievements with no slide counterpart (0 submissions
 *   confirmed): Reference Confirmed, Upgrade: Layout.
 * - Renames + rewrites: Card Canvas -> Game Canvas (tic-tac-toe design
 *   fields), First Card -> It's Alive (live URL instead of a card
 *   screenshot), Upgrade: Stat Drama -> Upgrade: Scoreboard, Card Complete
 *   -> Project Shipped (deployed-game requirements), We Showed Our Card ->
 *   We Showed Our Game.
 * - Adds Upgrade: Win Drama (new lane).
 * - Upgrades The Restyle to a composite proof (screenshot + prompt field).
 * - Simplifies Double Style to a plain "tick when live" checklist.
 * - Updates Goldilocks Sort's question set to match the deck exactly
 *   (swaps in the "movie quiz game" prompt, reorders "something fun").
 * - Replaces stale "Cursor" wording with generic AI phrasing (5 spots) or
 *   "Codex" specifically where the deck now says Codex (One-Line Takeaway).
 * - Renumbers sort_order to match the deck's sequence. Block numbers (0-6)
 *   are unchanged — they already matched the deck's structure.
 *
 * Run once: npx ts-node scripts/patch-s3-slide-sync.ts
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
const SESSION_NUMBER = 3;

const TO_DELETE = ["s3-reference-confirmed", "s3-upgrade-layout"];

// Kept achievements: rename/re-word/re-config in place (preserves row id).
const UPDATES: Record<string, Record<string, unknown>> = {
  "s3-ready-check": {
    proof_config: {
      items: [
        "AI open and signed in",
        "Session 2 folder visible",
        "New Session 3 folder created",
        "I know where the page opens",
      ],
    },
  },
  "s3-gap-page": {
    description: "Everyone typed the same sentence — upload a screenshot of the page AI gave you.",
  },
  "s3-spot-the-gaps": {
    description: "List 5 things AI decided on its own — font, colors, background, mood, spacing…",
  },
  "s3-guess-list": {
    description: "List 6 things the lazy \"Make tic-tac-toe.\" prompt left for AI to guess.",
  },
  "s3-decided-build": {
    // unchanged content-wise, no tool-name mention — no fields to update.
  },
  "s3-goldilocks-sort": {
    proof_config: {
      questions: [
        {
          question: "Make a cool team page.",
          options: ["Too vague", "Too much", "Just right"],
          correct_index: 0,
          xp: 1,
        },
        {
          question: "Hi AI, I hope you're doing well today. So basically we are a team and we were kind of thinking that maybe it would be nice, if it's not too hard, to have some sort of page, it could be any color really, we like blue but also red is fine, and maybe our names somewhere, and our teacher said it should look good, so yeah, something cool, thanks so much, you're the best…",
          options: ["Too vague", "Too much", "Just right"],
          correct_index: 1,
          xp: 1,
        },
        {
          question: "Make a one-page site for our team, the Pixel Pirates. Dark purple and gold pirate theme, team name huge at the top, three cards with nicknames, and a button that shows our battle cry. Easy to read.",
          options: ["Too vague", "Too much", "Just right"],
          correct_index: 2,
          xp: 1,
        },
        {
          question: "Make a movie quiz game. Five questions one at a time, score at the end with a \"Play Again\" button. Bright colors, big text, easy to click.",
          options: ["Too vague", "Too much", "Just right"],
          correct_index: 2,
          xp: 1,
        },
        {
          question: "Make something fun for our team.",
          options: ["Too vague", "Too much", "Just right"],
          correct_index: 0,
          xp: 1,
        },
      ],
    },
  },
  "s3-caught-it-wrong": {
    description: "AI confidently botched the reference — screenshot the wrong result you caught.",
  },
  "s3-restyle": {
    description: "Screenshot your page after restyling it with one named reference look, and submit the restyle prompt you used.",
    proof_config: {
      form_type: "composite",
      require: ["screenshot", "fields"],
      fields: ["The restyle prompt you used"],
    },
  },
  "s3-double-style": {
    description: "Stack two references on one page so it still reads clearly — tick the box once it's live.",
    proof_type: "checklist",
    proof_config: {
      items: ["Two references stacked on one page — and it still reads clearly"],
    },
  },
  "s3-card-canvas": {
    slug: "s3-game-canvas",
    title: "Game Canvas",
    description: "Decide on paper first — fill in all 8 fields of your Game Design Canvas before you prompt.",
    proof_config: {
      form_type: "fields",
      fields: [
        "Game name",
        "Style reference (named)",
        "Main colors",
        "X and O look",
        "Win moment",
        "Draw message",
        "Scoreboard or restart",
        "One surprise detail",
      ],
    },
  },
  "s3-first-card": {
    slug: "s3-its-alive",
    title: "It's Alive",
    description: "Submit your live Vercel link right after Phase 1 — while the page still just says \"Coming soon.\"",
    proof_config: { form_type: "url" },
  },
  "s3-upgrade-stronger-style": {
    description: "Make the game look more like a real named reference — sharpen the board, the title font, and the buttons.",
  },
  "s3-upgrade-stat-drama": {
    slug: "s3-upgrade-scoreboard",
    title: "Upgrade: Scoreboard",
    description: "Add a running score for X and O that updates after every round.",
  },
  "s3-upgrade-personality": {
    description: "Keep everything, but make it feel less generic — a catchphrase, a sound, a detail nobody else has.",
  },
  "s3-upgrade-polish": {
    description: "Make this feel finished. Spacing, contrast, and one subtle premium detail.",
  },
  "s3-card-complete": {
    slug: "s3-project-shipped",
    title: "Project Shipped",
    description: "The whole-team gate for the main build: your deployed tic-tac-toe game meets every requirement. An instructor checks it off.",
    proof_config: {
      form_type: "checklist",
      items: [
        "Own folder, own repo, pushed to GitHub",
        "Live Vercel URL opens on a phone",
        "Two players can finish a full game",
        "Wins and draws both show something",
        "A nameable reference style",
        "Three or more upgrade nudges",
        "Homepage card links to the live game",
        "No private information anywhere",
      ],
    },
  },
  "s3-showed-card": {
    slug: "s3-showed-game",
    title: "We Showed Our Game",
    description: "Your team presented its game on the projector.",
    proof_config: { items: ["Our team presented on the projector"] },
  },
  "s3-takeaway": {
    description: "Finish the line: \"Today I learned that when steering Codex, I should ___.\"",
    proof_config: {
      form_type: "fields",
      fields: ["Today I learned that when steering Codex, I should…"],
    },
  },
};

const NEW_ACHIEVEMENTS = [
  {
    slug: "s3-upgrade-win-drama",
    session_number: SESSION_NUMBER,
    block_number: 5,
    title: "Upgrade: Win Drama",
    description: "Make winning feel huge — highlight the winning line and add a celebration.",
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
  "s3-ready-check",
  "s3-gap-page",
  "s3-spot-the-gaps",
  "s3-guess-list",
  "s3-decided-build",
  "s3-goldilocks-sort",
  "s3-before-after",
  "s3-five-lanes",
  "s3-broke-it-fixed-it",
  "s3-caught-it-wrong",
  "s3-restyle",
  "s3-double-style",
  "s3-game-canvas",
  "s3-its-alive",
  "s3-upgrade-stronger-style",
  "s3-upgrade-scoreboard",
  "s3-upgrade-win-drama",
  "s3-upgrade-personality",
  "s3-upgrade-polish",
  "s3-project-shipped",
  "s3-showed-game",
  "s3-takeaway",
  "s3-recap-check",
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
