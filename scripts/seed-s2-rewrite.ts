/**
 * Session 2 rewrite — deletes the old 11 achievements and inserts 30 new ones.
 * Run once: npx ts-node -r tsconfig-paths/register scripts/seed-s2-rewrite.ts
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

const SESSION = 2;

const OLD_SLUGS = [
  "s2-cursor-ready",
  "first-pixels",
  "spot-the-difference",
  "chain-builder",
  "add-picture",
  "visual-theme",
  "working-button",
  "add-hover-effect",
  "add-second-section",
  "ten-prompts-total",
  "builder-combo",
];

const s2Achievements = [
  // ── Block 0 — Setup & Team Check-In ─────────────────────────────────────────
  {
    slug: "s2-team-check-in",
    session_number: SESSION,
    block_number: 0,
    title: "Team Check-In",
    description: "Confirm your team is here and ready — tick the box to log in for the day.",
    xp: 5,
    proof_type: "checklist",
    proof_config: {
      items: ["All team members are confirmed, present, and signed in"],
    },
    is_secret: false,
  },

  // ── Block 1 — Cursor Basics & Your First Page ────────────────────────────────
  {
    slug: "s2-everyones-in",
    session_number: SESSION,
    block_number: 1,
    title: "Everyone's In",
    description: "Every member has Cursor open, signed in, the session-2-build folder created, and the chat panel open.",
    xp: 10,
    proof_type: "checklist",
    proof_config: {
      items: [
        "Cursor open and signed in",
        "Folder session-2-build created",
        "Chat panel open",
        "Every team member knows where the page appears",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s2-first-page-live",
    session_number: SESSION,
    block_number: 1,
    title: "First Page Live",
    description: "Your name/nickname page renders in the browser. Screenshot it — this is your \"before\" picture for the whole day.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-spot-the-guesses",
    session_number: SESSION,
    block_number: 1,
    title: "Spot the Guesses",
    description: "After your first page appears, list three things Cursor chose on its own — without you telling it.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Thing Cursor decided on its own #1",
        "Thing Cursor decided on its own #2",
        "Thing Cursor decided on its own #3",
      ],
    },
    is_secret: false,
  },

  // ── Block 2 — Vague vs. Specific Prompts ────────────────────────────────────
  {
    slug: "s2-the-lazy-page",
    session_number: SESSION,
    block_number: 2,
    title: "The Lazy Page",
    description: "Build the vague pizza page (\"Make a page about pizza.\") and screenshot it — leave it untouched.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-diagnosis",
    session_number: SESSION,
    block_number: 2,
    title: "Diagnosis",
    description: "List six things Cursor had to guess on the vague pizza page because you didn't say.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Colors and fonts — what did Cursor choose?",
        "Title — what did Cursor invent?",
        "Sections — what did Cursor decide to include?",
        "Who is the page for? Did you say? What did Cursor assume?",
        "Is there anything to click? What did Cursor decide?",
        "Style or vibe — what did Cursor go with?",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s2-the-directed-page",
    session_number: SESSION,
    block_number: 2,
    title: "The Directed Page",
    description: "Build the specific pizza page from the fully loaded prompt and screenshot it.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-seven-ingredients",
    session_number: SESSION,
    block_number: 2,
    title: "Seven Ingredients",
    description: "Rewrite the weak dog prompt so it includes all seven ingredients — tick each one you used.",
    xp: 7,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: [
        "Topic — what the page is about",
        "Audience — who it's for",
        "Vibe — funny, serious, futuristic, cozy…",
        "Visual style — colors, layout, theme, font feeling",
        "Structure — title, sections, cards, list, facts…",
        "Interaction — button, quiz, random picker, counter…",
        "Constraints — one page, easy to read, no private info…",
      ],
    },
    is_secret: false,
  },

  // ── Block 3 — Improving Without Restarting ───────────────────────────────────
  {
    slug: "s2-no-restart-remake",
    session_number: SESSION,
    block_number: 3,
    title: "No-Restart Remake",
    description: "Transform the vague pizza page using four follow-up prompts — one of each type — without restarting.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: [
        "Style prompt used",
        "Structure prompt used",
        "Interaction prompt used",
        "Polish or debug prompt used",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s2-before-after",
    session_number: SESSION,
    block_number: 3,
    title: "Before & After",
    description: "Upload your before (vague pizza page) and after (transformed page) screenshots in one submission.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // ── Block 4 — Build Your Own Page ───────────────────────────────────────────
  {
    slug: "s2-safe-and-sound",
    session_number: SESSION,
    block_number: 4,
    title: "Safe & Sound",
    description: "Confirm your page uses first names or nicknames only — no private information.",
    xp: 3,
    proof_type: "checklist",
    proof_config: {
      items: [
        "Our page uses first names or nicknames only — no address, school, phone, passwords, or private details",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s2-design-canvas",
    session_number: SESSION,
    block_number: 4,
    title: "Design Canvas",
    description: "Fill all eight fields of your build canvas before you write the first prompt.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Topic (what is the page about?)",
        "Audience (who is it for?)",
        "Vibe (funny, serious, futuristic, cozy…?)",
        "Visual theme (named look or style)",
        "Main colors",
        "Three sections (name all three)",
        "Interactive feature (what does it do?)",
        "Surprise detail",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s2-its-alive",
    session_number: SESSION,
    block_number: 4,
    title: "It's Alive",
    description: "The first version of your own page renders in the browser — screenshot it.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  // Upgrade Menu — five à-la-carte lanes, +3 each
  {
    slug: "s2-upgrade-visual-identity",
    session_number: SESSION,
    block_number: 4,
    title: "Upgrade: Visual Identity",
    description: "Make the visual theme stronger — more consistent colors, better spacing, a title style that matches.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-upgrade-content",
    session_number: SESSION,
    block_number: 4,
    title: "Upgrade: Content",
    description: "Improve the text so it is more interesting, specific, and fun to read — short and clear.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-upgrade-layout",
    session_number: SESSION,
    block_number: 4,
    title: "Upgrade: Layout",
    description: "Organize the page into clean sections or cards — make the layout easier to scan.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-upgrade-interaction",
    session_number: SESSION,
    block_number: 4,
    title: "Upgrade: Interaction",
    description: "Make the interactive feature more useful and fun — it should change something on the page when clicked.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-upgrade-polish",
    session_number: SESSION,
    block_number: 4,
    title: "Upgrade: Polish",
    description: "Make the page feel finished — improve spacing, headings, contrast, and small visual details.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-working-feature",
    session_number: SESSION,
    block_number: 4,
    title: "Working Feature",
    description: "Screenshot your interactive feature on the page — it must visibly do something.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-checkpoint",
    session_number: SESSION,
    block_number: 4,
    title: "Checkpoint",
    description: "Submit your best prompt so far and one thing you still want to improve.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Your best prompt so far",
        "One thing you still want to improve",
      ],
    },
    is_secret: false,
  },

  // ── Block 5 — Debugging & Remixing ──────────────────────────────────────────
  {
    slug: "s2-good-bug-report",
    session_number: SESSION,
    block_number: 5,
    title: "Good Bug Report",
    description: "Pick the most useful way to describe a broken button.",
    xp: 1,
    proof_type: "quiz",
    proof_config: {
      questions: [
        {
          question: "Pick the most useful way to describe a broken button.",
          options: [
            "It doesn't work.",
            "The button appears, but nothing happens.",
            "I expected the button to show a random fact. Instead, nothing happens when I click it. Please fix it so a new fact appears each time.",
          ],
          correct_index: 2,
          xp: 1,
        },
      ],
    },
    is_secret: false,
  },
  {
    slug: "s2-bug-hunt",
    session_number: SESSION,
    block_number: 5,
    title: "Bug Hunt",
    description: "Find one real weakness on your page, write a fix prompt using the formula, and upload a before-and-after screenshot.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-remix-applied",
    session_number: SESSION,
    block_number: 5,
    title: "Remix Applied",
    description: "Apply your drawn Remix Card using prompts only and screenshot the result.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-peer-test",
    session_number: SESSION,
    block_number: 5,
    title: "Peer Test",
    description: "Test a neighboring team's page and fill the four peer-test fields.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "What is the page about?",
        "What is its strongest part?",
        "What did you click or try on the page?",
        "One thing to improve",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s2-got-tested",
    session_number: SESSION,
    block_number: 5,
    title: "Got Tested",
    description: "Another team tested your page — enter their team name as proof the feedback happened.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["Testing team's name"],
    },
    is_secret: false,
  },
  {
    slug: "s2-final-fix",
    session_number: SESSION,
    block_number: 5,
    title: "Final Fix",
    description: "Apply one repair or polish prompt based on the peer feedback you received and upload the result.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // ── Block 6 — Showcase & Wrap ────────────────────────────────────────────────
  {
    slug: "s2-ship-it",
    session_number: SESSION,
    block_number: 6,
    title: "Ship It",
    description: "Tick every box on the finish-line checklist — an instructor confirms before XP awards.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: [
        "The page has a title",
        "The page has at least three sections",
        "The page has a clear visual theme",
        "The page has a working interactive feature",
        "Improved with at least four follow-up prompts",
        "Went through a peer test",
        "Went through a debug or polish prompt",
        "Final screenshot uploaded",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s2-final-page",
    session_number: SESSION,
    block_number: 6,
    title: "Final Page",
    description: "Upload your final screenshot and fill the submission card.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "composite",
      require: ["screenshot", "fields"],
      fields: [
        "Page title",
        "Your best prompt",
        "The bug or weakness you fixed",
        "One thing you're proud of",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s2-we-showed-it",
    session_number: SESSION,
    block_number: 6,
    title: "We Showed It",
    description: "Your team presented its page in the showcase.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: ["Our team presented in the showcase"],
    },
    is_secret: false,
  },
  {
    slug: "s2-one-thing-i-learned",
    session_number: SESSION,
    block_number: 6,
    title: "One Thing I Learned",
    description: "Finish the line: \"When building with AI, I should ___.\"",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["When building with AI, I should…"],
    },
    is_secret: false,
  },
];

async function main() {
  console.log("Session 2 rewrite — deleting old achievements and inserting new ones...");

  // 1. Check for submissions against old slugs — abort if any exist
  const { data: oldRows } = await supabase
    .from("achievements")
    .select("id, slug")
    .in("slug", OLD_SLUGS);

  if (oldRows && oldRows.length > 0) {
    const oldIds = oldRows.map((r) => r.id);
    const { count } = await supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .in("achievement_id", oldIds);

    if (count && count > 0) {
      console.error(`Aborting: ${count} submission(s) reference old S2 achievements. Clear them first.`);
      process.exit(1);
    }

    // 2. Delete old achievements
    const { error: delErr } = await supabase
      .from("achievements")
      .delete()
      .in("slug", OLD_SLUGS);

    if (delErr) {
      console.error("Failed to delete old achievements:", delErr.message);
      process.exit(1);
    }
    console.log(`  Deleted ${oldRows.length} old S2 achievement(s).`);
  } else {
    console.log("  No old S2 achievements found — skipping delete.");
  }

  // 3. Pre-flight: confirm no new slugs already exist
  const newSlugs = s2Achievements.map((a) => a.slug);
  const { data: existing } = await supabase
    .from("achievements")
    .select("slug")
    .in("slug", newSlugs);

  if (existing && existing.length > 0) {
    console.error("Some new slugs already exist — aborting to avoid duplicates:");
    existing.forEach((r) => console.error(" ", r.slug));
    process.exit(1);
  }

  // 4. Insert new achievements
  const { error: insertErr } = await supabase.from("achievements").insert(s2Achievements);
  if (insertErr) {
    console.error("Insert failed:", insertErr.message);
    process.exit(1);
  }
  console.log(`  Inserted ${s2Achievements.length} new S2 achievements.`);

  // 5. Sort order backfill for session 2
  const { data: rows, error: readErr } = await supabase
    .from("achievements")
    .select("id, slug, sort_order")
    .eq("session_number", SESSION);

  if (readErr || !rows) {
    console.error("Failed to read session 2 rows:", readErr?.message);
    process.exit(1);
  }

  const slugIndex = new Map(s2Achievements.map((a, i) => [a.slug, i]));
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

  console.log(`Done. ${s2Achievements.length} achievements inserted, ${needsOrder.length} sort_orders assigned.`);
}

main();
