/**
 * Targeted insert for Session 7 achievements.
 * Run once: npx ts-node -r tsconfig-paths/register scripts/seed-s7.ts
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

const SESSION = 7;

const s7Achievements = [
  // ── Block 0 — Setup & Team Check-In ─────────────────────────────────────────
  {
    slug: "s7-ready-check",
    session_number: SESSION,
    block_number: 0,
    title: "Ready Check",
    description: "You're set up and ready to build your stack — tick all four to log in for the day.",
    xp: 10,
    proof_type: "checklist",
    proof_config: {
      items: [
        "Cursor open and signed in",
        "Session 6 folder still alive (debug game survived!)",
        "New folder created: session-7-stack",
        "I know where pages open in the browser",
      ],
    },
    is_secret: false,
  },

  // ── Block 1 — Stop Repeating Yourself: The Three Tools ──────────────────────
  {
    slug: "s7-when-does-it-fire",
    session_number: SESSION,
    block_number: 1,
    title: "When Does It Fire?",
    description: "Three quick questions about when each tool fires — agents.md, rules, and skills.",
    xp: 3,
    proof_type: "quiz",
    proof_config: {
      questions: [
        {
          question: "agents.md applies to every project you ever make.",
          options: ["Myth — it only applies to the project it's in", "Fact — it follows you everywhere"],
          correct_index: 0,
          xp: 1,
        },
        {
          question: "A rule applies automatically without you asking.",
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
    is_secret: false,
  },
  {
    slug: "s7-feel-the-repeat",
    session_number: SESSION,
    block_number: 1,
    title: "Feel the Repeat",
    description: "Build two mini-pages, typing the same style preference into both prompts — upload a screenshot of each.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // ── Block 2 — Rules: Your Always-On Style ────────────────────────────────────
  {
    slug: "s7-set-a-rule",
    session_number: SESSION,
    block_number: 2,
    title: "Set a Rule",
    description: "Adapt the template into a rule that captures a style you always want — screenshot the saved rule.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s7-safety-rule",
    session_number: SESSION,
    block_number: 2,
    title: "Safety Rule",
    description: "Add a standing \"never include real personal information\" rule so it's on in every project.",
    xp: 3,
    proof_type: "checklist",
    proof_config: {
      items: [
        "I have added a \"never include real personal information\" standing rule",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s7-it-fired-by-itself",
    session_number: SESSION,
    block_number: 2,
    title: "It Fired By Itself",
    description: "Build a brand-new thing without typing your style preference — screenshot it obeying the rule anyway.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // ── Block 3 — Skills: Recipes You Summon ─────────────────────────────────────
  {
    slug: "s7-build-a-skill",
    session_number: SESSION,
    block_number: 3,
    title: "Build a Skill",
    description: "Adapt the trading-card recipe template into a skill — screenshot the saved skill file.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s7-summon-it",
    session_number: SESSION,
    block_number: 3,
    title: "Summon It",
    description: "Summon your card skill for any single subject and screenshot the result.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s7-rule-or-skill",
    session_number: SESSION,
    block_number: 3,
    title: "Rule or Skill?",
    description: "Always on automatically, or only when you call it by name?",
    xp: 1,
    proof_type: "quiz",
    proof_config: {
      questions: [
        {
          question: "You want rounded buttons on every project without ever asking again. Is that a rule or a skill?",
          options: ["A rule — it fires automatically on every project", "A skill — you summon it when you need it"],
          correct_index: 0,
          xp: 1,
        },
      ],
    },
    is_secret: false,
  },

  // ── Block 4 — Build the Card Set ─────────────────────────────────────────────
  {
    slug: "s7-card-1",
    session_number: SESSION,
    block_number: 4,
    title: "Card 1",
    description: "Summon your card skill for subject #1 — screenshot the finished card.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s7-card-2",
    session_number: SESSION,
    block_number: 4,
    title: "Card 2",
    description: "Summon your card skill for subject #2 — screenshot the finished card.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s7-card-3",
    session_number: SESSION,
    block_number: 4,
    title: "Card 3",
    description: "Summon your card skill for subject #3 — screenshot the finished card.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s7-consistency-check",
    session_number: SESSION,
    block_number: 4,
    title: "Consistency Check",
    description: "All three cards share a look you didn't re-describe each time — upload the full set in one screenshot.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s7-upgrade-the-recipe",
    session_number: SESSION,
    block_number: 4,
    title: "Upgrade the Recipe",
    description: "Improve your skill once (add a stat, a rarity gem, a foil effect), then summon it to show the upgrade — screenshot the result.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // ── Block 5 — Share-Out & Peer Skill Swap ────────────────────────────────────
  {
    slug: "s7-show-the-set",
    session_number: SESSION,
    block_number: 5,
    title: "Show the Set",
    description: "Your team showed its card set to the room.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: ["Our team showed its card set to the room"],
    },
    is_secret: false,
  },
  {
    slug: "s7-borrow-a-skill",
    session_number: SESSION,
    block_number: 5,
    title: "Borrow a Skill",
    description: "Get another team's card skill, summon it for your own subject, and screenshot the result.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s7-lent-a-skill",
    session_number: SESSION,
    block_number: 5,
    title: "Lent a Skill",
    description: "Another team borrowed your card skill — enter their team name as proof.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["Team that borrowed your skill"],
    },
    is_secret: false,
  },

  // ── Block 6 — Final Project Kickoff & Wrap ───────────────────────────────────
  {
    slug: "s7-ship-it",
    session_number: SESSION,
    block_number: 6,
    title: "Ship It",
    description: "Tick every box on the finish-line checklist — an instructor confirms before XP awards.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: [
        "A personal rule is set (and includes the \"never real personal info\" rule)",
        "A card skill is built",
        "The set has at least 3 cards",
        "The cards share a consistent look from the rule",
        "The skill was summoned (not re-typed) each time",
        "Final screenshot uploaded",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s7-first-idea-down",
    session_number: SESSION,
    block_number: 6,
    title: "First Idea Down",
    description: "Jot a one-sentence final-project idea for each team member — small, one-screen, one thing it does.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Team member 1's idea (one sentence)",
        "Team member 2's idea (one sentence)",
        "Team member 3's idea (one sentence)",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s7-one-thing-i-learned",
    session_number: SESSION,
    block_number: 6,
    title: "One Thing I Learned",
    description: "Finish the line: \"When I want Cursor to do something my way every time, I should ___.\"",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["When I want Cursor to do something my way every time, I should…"],
    },
    is_secret: false,
  },

  // ── Block 8 — All Session ────────────────────────────────────────────────────
  {
    slug: "s7-neighbor-assist",
    session_number: SESSION,
    block_number: 8,
    title: "Neighbor Assist",
    description: "Help another team — enter their team name to confirm it happened.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["Team you helped"],
    },
    is_secret: false,
  },
  {
    slug: "s7-bonus-skill",
    session_number: SESSION,
    block_number: 8,
    title: "Bonus Skill",
    description: "Fast finisher? Build a second skill for something else (a quiz, a stat bar, a banner) and summon it — screenshot the result.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
];

async function main() {
  console.log(`Inserting ${s7Achievements.length} Session 7 achievements...`);

  // Pre-flight: confirm no slugs already exist
  const slugs = s7Achievements.map((a) => a.slug);
  const { data: existing } = await supabase
    .from("achievements")
    .select("slug")
    .in("slug", slugs);

  if (existing && existing.length > 0) {
    console.error("Already in DB — aborting to avoid duplicates:");
    existing.forEach((r) => console.error(" ", r.slug));
    process.exit(1);
  }

  const { error } = await supabase.from("achievements").insert(s7Achievements);
  if (error) {
    console.error("Insert failed:", error.message);
    process.exit(1);
  }

  console.log("Inserted. Running sort_order backfill for session 7...");

  const { data: rows, error: readErr } = await supabase
    .from("achievements")
    .select("id, slug, sort_order")
    .eq("session_number", SESSION);

  if (readErr || !rows) {
    console.error("Failed to read session 7 rows:", readErr?.message);
    process.exit(1);
  }

  const slugIndex = new Map(s7Achievements.map((a, i) => [a.slug, i]));
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

  console.log(`Done. ${s7Achievements.length} achievements inserted, ${needsOrder.length} sort_orders assigned.`);
}

main();
