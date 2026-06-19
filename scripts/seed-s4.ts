/**
 * Targeted insert for Session 4 achievements.
 * Run once: npx ts-node -r tsconfig-paths/register scripts/seed-s4.ts
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

const SESSION = 4;

const s4Achievements = [
  // ── Block 0 — Kickoff ────────────────────────────────────────────────────────
  {
    slug: "s4-ready-check",
    session_number: SESSION,
    block_number: 0,
    title: "Ready Check",
    description: "You're set up and ready to build — tick all four to log in for the day.",
    xp: 10,
    proof_type: "checklist",
    proof_config: {
      items: [
        "Cursor open and signed in",
        "Session 3 folder still present (trading card survived!)",
        "New session-4-site folder created",
        "I know where pages open in the browser",
      ],
    },
    is_secret: false,
  },

  // ── Block 1 — One-Sentence Site ───────────────────────────────────────────────
  {
    slug: "s4-the-wreck",
    session_number: SESSION,
    block_number: 1,
    title: "The Wreck",
    description: "Screenshot your one-shot site — left completely untouched. Wrecks score; repaired wrecks don't.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s4-wreck-hunt",
    session_number: SESSION,
    block_number: 1,
    title: "Wreck Hunt",
    description: "Inspect the one-shot site by clicking and list 6 things that broke or drifted.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Did a nav exist on every page? What did you find?",
        "Did all nav links work when you clicked them? What happened?",
        "Were colors and fonts consistent across pages? What differed?",
        "Was the organization name the same on every page? What did you notice?",
        "What facts did Cursor invent that nobody asked for?",
        "What was the visitor supposed to do, and was it clear?",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s4-dead-link-found",
    session_number: SESSION,
    block_number: 1,
    title: "Dead Link Found",
    description: "Screenshot a broken or missing nav link you found by actually clicking it.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // ── Block 2 — Plan in Four Zoom Levels ───────────────────────────────────────
  {
    slug: "s4-zoom-sheet",
    session_number: SESSION,
    block_number: 2,
    title: "Zoom Sheet",
    description: "Complete all four zoom levels (Idea → Visitor → Pages → Details) for your real project.",
    xp: 8,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "The Idea (one sentence: what is it and why is it cool?)",
        "The Visitor — who lands here?",
        "The Visitor — what should they feel?",
        "The Visitor — what should they do?",
        "Page 1 — name",
        "Page 1 — purpose",
        "Page 2 — name",
        "Page 2 — purpose",
        "Page 3 — name",
        "Page 3 — purpose",
        "Nav rule (write: same nav on every page, linking all three)",
        "Page 1 — sections (list 2–3)",
        "Page 2 — sections (list 2–3)",
        "Page 3 — sections (list 2–3)",
        "Which page holds the interactive feature, and what does it do?",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s4-zero-questions",
    session_number: SESSION,
    block_number: 2,
    title: "Zero Questions",
    description: "A neighbor reads your Zoom Sheet cold and confirms they could build from it without asking anything.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Neighbor team's name",
        "Did they confirm they could build from your plan with no questions? Write their answer — or any question they had.",
      ],
    },
    is_secret: false,
  },

  // ── Block 3 — Write the Brief ────────────────────────────────────────────────
  {
    slug: "s4-brief-canvas",
    session_number: SESSION,
    block_number: 3,
    title: "Brief Canvas",
    description: "Upload a photo of your completed Brief Canvas (all fields, page map, three Always + two Never rules).",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "composite",
      require: ["screenshot", "fields"],
      fields: ["What is your organization's name?"],
    },
    is_secret: false,
  },
  {
    slug: "s4-identity-locked",
    session_number: SESSION,
    block_number: 3,
    title: "Identity Locked",
    description: "Your organization's identity is fully decided — name, slogan, mascot, and colors.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["Organization name", "Slogan", "Mascot emoji", "2–3 colors"],
    },
    is_secret: false,
  },

  // ── Block 4 — Cursor Plan Mode ───────────────────────────────────────────────
  {
    slug: "s4-plan-generated",
    session_number: SESSION,
    block_number: 4,
    title: "Plan Generated",
    description: "Screenshot Cursor's plan from Plan Mode, generated from your brief — nothing built yet.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s4-patch-the-gaps",
    session_number: SESSION,
    block_number: 4,
    title: "Patch the Gaps",
    description: "List each clarifying question Cursor asked and how you answered it. If it asked none, write \"zero questions.\"",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["Cursor's clarifying questions and your answers (or \"zero questions\")"],
    },
    is_secret: false,
  },
  {
    slug: "s4-plan-inspection",
    session_number: SESSION,
    block_number: 4,
    title: "Plan Inspection",
    description: "Complete the Plan Inspection Card — all eight checks ticked, any fix logged. The Debugger leads.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "composite",
      require: ["checklist", "fields"],
      items: [
        "All three pages from our map are in the plan",
        "The same nav on every page",
        "Our name, slogan, and mascot are in there",
        "Our colors and reference style are respected",
        "Every section from our map is present",
        "Nothing invented that we never asked for",
        "Nothing missing",
        "Order is sensible — home page first",
      ],
      fields: ["Fix we sent to Plan Mode (write \"none\" if no fix was needed)"],
    },
    is_secret: false,
  },
  {
    slug: "s4-read-before-approve",
    session_number: SESSION,
    block_number: 4,
    title: "Read Before Approve",
    description: "Screenshot the chat showing your approval message came after the inspection notes — never approve a plan you haven't read.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s4-home-page-from-the-plan",
    session_number: SESSION,
    block_number: 4,
    title: "Home Page From the Plan",
    description: "Screenshot the home page built from the approved plan — identity visible (name, slogan, mascot) and a working nav with all three page links.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // ── Block 5 — New Chat Amnesia ───────────────────────────────────────────────
  {
    slug: "s4-caught-the-drift",
    session_number: SESSION,
    block_number: 5,
    title: "Caught the Drift",
    description: "Screenshot the home page and page two side by side, showing the mismatch after the fresh-chat wipe.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s4-cursor-forgot",
    session_number: SESSION,
    block_number: 5,
    title: "Cursor Forgot ___",
    description: "In one sentence, name what the fresh chat forgot.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["Complete the sentence: \"Cursor forgot ___.\""],
    },
    is_secret: false,
  },
  {
    slug: "s4-agents-md-exists",
    session_number: SESSION,
    block_number: 5,
    title: "agents.md Exists",
    description: "Screenshot the contents of your agents.md — all required sections present, created and edited by prompts only.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s4-snap-back-confirmed",
    session_number: SESSION,
    block_number: 5,
    title: "Snap-Back Confirmed",
    description: "After \"make every page match agents.md\", a rival team clicks through and confirms the drifted page now matches.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Rival team's name",
        "What did the rival team confirm when they clicked through?",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s4-page-three-confirmed",
    session_number: SESSION,
    block_number: 5,
    title: "Page Three Confirmed",
    description: "A rival team confirms page three (built post-wipe from agents.md) matches the site map and the rest of the site, with nav updated everywhere.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Rival team's name",
        "What did the rival team confirm about page three?",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s4-two-wipes",
    session_number: SESSION,
    block_number: 5,
    title: "Two Wipes",
    description: "In one sentence, compare Wipe #1 (the drift) with Wipe #2 (the snap-back). What changed?",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["In one sentence, what was different between Wipe #1 (the drift) and Wipe #2 (the snap-back)?"],
    },
    is_secret: false,
  },

  // ── Block 6 — Remix Round ────────────────────────────────────────────────────
  {
    slug: "s4-file-first",
    session_number: SESSION,
    block_number: 6,
    title: "File First",
    description: "Screenshot the chat showing you updated agents.md before sending the remix prompt to the pages.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s4-remix-everywhere",
    session_number: SESSION,
    block_number: 6,
    title: "Remix Everywhere",
    description: "A rival team runs the Site-Check Card and confirms the remix landed on every page and nothing else broke.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Rival team's name",
        "What did the rival team confirm when they ran the Site-Check Card?",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s4-broke-it-fixed-it",
    session_number: SESSION,
    block_number: 6,
    title: "Broke It, Fixed It",
    description: "Screenshot a repair prompt you used — a described symptom or an error pasted with \"fix this.\" (Optional)",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // ── Block 7 — Showcase & Wrap ────────────────────────────────────────────────
  {
    slug: "s4-site-complete",
    session_number: SESSION,
    block_number: 7,
    title: "Site Complete",
    description: "Tick every box on the completion checklist — an instructor confirms before XP awards.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: [
        "Brief fully done (identity + Always/Never rules)",
        "Plan inspected and approved before building",
        "agents.md created with every section, by prompts only",
        "Three pages reachable from the same nav on every page (clicked in front of a witness)",
        "Identity and theme consistent across pages (rival-confirmed)",
        "The interactive feature works",
        "At least one page built after a chat wipe",
        "Remix visible on every page",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s4-we-toured-our-site",
    session_number: SESSION,
    block_number: 7,
    title: "We Toured Our Site",
    description: "Your team gave the fifteen-second nav tour on the projector.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: ["Our team gave the fifteen-second nav tour on the projector"],
    },
    is_secret: false,
  },
  {
    slug: "s4-one-line-takeaway",
    session_number: SESSION,
    block_number: 7,
    title: "One-Line Takeaway",
    description: "Finish the line: \"Today I learned that before I build, I should ___.\"",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["Today I learned that before I build, I should…"],
    },
    is_secret: false,
  },
  {
    slug: "s4-recap-check",
    session_number: SESSION,
    block_number: 7,
    title: "Recap Check",
    description: "Quick myth-or-fact check on today's big ideas. +1 per correct answer.",
    xp: 2,
    proof_type: "quiz",
    proof_config: {
      questions: [
        {
          question: "A new chat remembers your last conversation by default.",
          options: ["Myth", "Fact"],
          correct_index: 0,
          xp: 1,
        },
        {
          question: "agents.md is read at the start of every chat, automatically.",
          options: ["Myth", "Fact"],
          correct_index: 1,
          xp: 1,
        },
      ],
    },
    is_secret: false,
  },
];

async function main() {
  console.log(`Inserting ${s4Achievements.length} Session 4 achievements...`);

  // Pre-flight: confirm no slugs already exist
  const slugs = s4Achievements.map((a) => a.slug);
  const { data: existing } = await supabase
    .from("achievements")
    .select("slug")
    .in("slug", slugs);

  if (existing && existing.length > 0) {
    console.error("Already in DB — aborting to avoid duplicates:");
    existing.forEach((r) => console.error(" ", r.slug));
    process.exit(1);
  }

  const { error } = await supabase.from("achievements").insert(s4Achievements);

  if (error) {
    console.error("Insert failed:", error.message);
    process.exit(1);
  }

  console.log("Inserted. Running sort_order backfill for session 4...");

  const { data: rows, error: readErr } = await supabase
    .from("achievements")
    .select("id, slug, sort_order")
    .eq("session_number", SESSION);

  if (readErr || !rows) {
    console.error("Failed to read session 4 rows:", readErr?.message);
    process.exit(1);
  }

  const slugIndex = new Map(s4Achievements.map((a, i) => [a.slug, i]));
  const rank = (slug: string) => slugIndex.get(slug) ?? Number.MAX_SAFE_INTEGER;

  const maxExisting = Math.max(0, ...rows.filter((r) => r.sort_order > 0).map((r) => r.sort_order));
  const needsOrder = rows
    .filter((r) => !r.sort_order || r.sort_order === 0)
    .sort((a, b) => rank(a.slug) - rank(b.slug));

  let next = maxExisting;
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

  console.log(`Done. ${s4Achievements.length} achievements inserted, ${needsOrder.length} sort_orders assigned.`);
}

main();
