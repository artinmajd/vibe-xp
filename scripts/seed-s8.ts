/**
 * Targeted insert for Session 8 achievements.
 * Run once: npx ts-node -r tsconfig-paths/register scripts/seed-s8.ts
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

const SESSION = 8;

const s8Achievements = [
  // ── Block 0 — Setup & the Shift to Build Pods ───────────────────────────────
  {
    slug: "s8-ready-check",
    session_number: SESSION,
    block_number: 0,
    title: "Ready Check",
    description: "You're set up and ready to go live — tick all three to log in for the day.",
    xp: 10,
    proof_type: "checklist",
    proof_config: {
      items: [
        "Cursor open and signed in",
        "A working build I'm proud of is open and ready to deploy",
        "Today's accounts and tools are signed in",
      ],
    },
    is_secret: false,
  },

  // ── Block 1 — How the Internet Actually Works ────────────────────────────────
  {
    slug: "s8-internet-quiz",
    session_number: SESSION,
    block_number: 1,
    title: "Internet Quiz",
    description: "Three myth-or-fact questions about how the web actually carries your work.",
    xp: 3,
    proof_type: "quiz",
    proof_config: {
      questions: [
        {
          question: "When you visit a website, the whole site is stored on your computer.",
          options: ["Myth — your browser asks a server to send the page", "Fact — it downloads to your device"],
          correct_index: 0,
          xp: 1,
        },
        {
          question: "A domain is a friendly name that points to a server.",
          options: ["Myth", "Fact"],
          correct_index: 1,
          xp: 1,
        },
        {
          question: "A server is a computer that's always on, waiting to send pages to anyone who asks.",
          options: ["Myth", "Fact"],
          correct_index: 1,
          xp: 1,
        },
      ],
    },
    is_secret: false,
  },
  {
    slug: "s8-read-a-url",
    session_number: SESSION,
    block_number: 1,
    title: "Read a URL",
    description: "Break two real web addresses into their domain and their page path.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "URL #1 — the full address you chose",
        "URL #1 — what is the domain? (the building)",
        "URL #2 — the full address you chose",
        "URL #2 — what is the domain? (the building)",
      ],
    },
    is_secret: false,
  },

  // ── Block 2 — Never Lose Your Work: Version Control & Git ───────────────────
  {
    slug: "s8-save-point-check",
    session_number: SESSION,
    block_number: 2,
    title: "Save-Point Check",
    description: "Two myth-or-fact questions about version control.",
    xp: 2,
    proof_type: "quiz",
    proof_config: {
      questions: [
        {
          question: "Version control lets you return to an earlier version of your work.",
          options: ["Myth", "Fact"],
          correct_index: 1,
          xp: 1,
        },
        {
          question: "Once you change a file, the older version is gone forever.",
          options: ["Myth — if you committed it, you can go back", "Fact — it's gone"],
          correct_index: 0,
          xp: 1,
        },
      ],
    },
    is_secret: false,
  },
  {
    slug: "s8-first-save-points",
    session_number: SESSION,
    block_number: 2,
    title: "First Save Points",
    description: "Turn on version control and make at least two labeled commits — screenshot your version history.",
    xp: 6,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s8-time-travel",
    session_number: SESSION,
    block_number: 2,
    title: "Time Travel",
    description: "Make a change you don't like, then roll back to an earlier save point — screenshot the restored version.",
    xp: 6,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // ── Block 3 — Take It Live: Deploy to a Real URL ────────────────────────────
  {
    slug: "s8-public-check",
    session_number: SESSION,
    block_number: 3,
    title: "Public Check",
    description: "Before deploying, confirm there's no real personal information anywhere on the page.",
    xp: 3,
    proof_type: "checklist",
    proof_config: {
      items: [
        "Our page has no real personal information — no full names, school name, or address",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s8-everyones-live",
    session_number: SESSION,
    block_number: 3,
    title: "Everyone's Live",
    description: "Every pod member has deployed a build to a real, working URL — submit each link.",
    xp: 12,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Member 1's live URL",
        "Member 2's live URL",
        "Member 3's live URL",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s8-deploy-again",
    session_number: SESSION,
    block_number: 3,
    title: "Deploy Again",
    description: "Make a change, commit it, and re-deploy so the live link updates — screenshot the updated live page.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // ── Block 4 — Share It With the World ───────────────────────────────────────
  {
    slug: "s8-shared-it",
    session_number: SESSION,
    block_number: 4,
    title: "Shared It",
    description: "Every pod member shared their live link with at least one person outside the room.",
    xp: 5,
    proof_type: "checklist",
    proof_config: {
      items: [
        "Every member has shared their live link with someone outside the room",
      ],
    },
    is_secret: false,
  },

  // ── Block 5 — The Final Project: What It Is & Locking Your Idea ─────────────
  {
    slug: "s8-what-counts-as-done",
    session_number: SESSION,
    block_number: 5,
    title: "What Counts as Done",
    description: "Two myth-or-fact questions about what a finished final project looks like.",
    xp: 2,
    proof_type: "quiz",
    proof_config: {
      questions: [
        {
          question: "A finished final project has to work on a real link.",
          options: ["Myth", "Fact"],
          correct_index: 1,
          xp: 1,
        },
        {
          question: "It needs at least five features to count as done.",
          options: ["Myth — one thing, done well, is enough", "Fact — five features minimum"],
          correct_index: 0,
          xp: 1,
        },
      ],
    },
    is_secret: false,
  },
  {
    slug: "s8-everyone-pitched",
    session_number: SESSION,
    block_number: 5,
    title: "Everyone Pitched",
    description: "Every pod member said their project idea out loud — to the room or the pod.",
    xp: 5,
    proof_type: "checklist",
    proof_config: {
      items: [
        "Every member said their project idea out loud (to the room or the pod)",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s8-scoped-and-locked",
    session_number: SESSION,
    block_number: 5,
    title: "Scoped & Locked",
    description: "Every pod member's final one-sentence project spec is written down.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Member 1's one-sentence project spec",
        "Member 2's one-sentence project spec",
        "Member 3's one-sentence project spec",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s8-right-size",
    session_number: SESSION,
    block_number: 5,
    title: "Right Size",
    description: "Confirm every idea in your pod passes the size check.",
    xp: 3,
    proof_type: "checklist",
    proof_config: {
      items: [
        "Every idea does exactly one thing",
        "Every idea fits on one screen",
        "No idea needs accounts or saved data",
        "Every idea can be said in one sentence with no tech words",
      ],
    },
    is_secret: false,
  },

  // ── Block 6 — Wrap ───────────────────────────────────────────────────────────
  {
    slug: "s8-launch-day-done",
    session_number: SESSION,
    block_number: 6,
    title: "Launch Day Done",
    description: "Your pod hit every milestone — tick all five to close out the session.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: [
        "Everyone made save points (committed at least twice with labels)",
        "Everyone rolled back at least once",
        "Everyone deployed a build to a live URL",
        "Everyone shared their live link with someone",
        "Everyone locked a scoped final-project idea",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s8-build-plan",
    session_number: SESSION,
    block_number: 6,
    title: "Build Plan",
    description: "Every pod member jotted the first 2–3 pieces they'll build next session.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Member 1's first 2–3 pieces to build next session",
        "Member 2's first 2–3 pieces to build next session",
        "Member 3's first 2–3 pieces to build next session",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s8-one-thing-i-learned",
    session_number: SESSION,
    block_number: 6,
    title: "One Thing I Learned",
    description: "Finish the line: \"The wildest part of today was ___.\"",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["The wildest part of today was…"],
    },
    is_secret: false,
  },

  // ── Block 8 — All Session ────────────────────────────────────────────────────
  {
    slug: "s8-neighbor-assist",
    session_number: SESSION,
    block_number: 8,
    title: "Neighbor Assist",
    description: "Help another pod through a stuck commit or deploy — enter their team name to confirm.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["Pod you helped"],
    },
    is_secret: false,
  },
];

async function main() {
  console.log(`Inserting ${s8Achievements.length} Session 8 achievements...`);

  const slugs = s8Achievements.map((a) => a.slug);
  const { data: existing } = await supabase
    .from("achievements")
    .select("slug")
    .in("slug", slugs);

  if (existing && existing.length > 0) {
    console.error("Already in DB — aborting to avoid duplicates:");
    existing.forEach((r) => console.error(" ", r.slug));
    process.exit(1);
  }

  const { error } = await supabase.from("achievements").insert(s8Achievements);
  if (error) {
    console.error("Insert failed:", error.message);
    process.exit(1);
  }

  console.log("Inserted. Running sort_order backfill for session 8...");

  const { data: rows, error: readErr } = await supabase
    .from("achievements")
    .select("id, slug, sort_order")
    .eq("session_number", SESSION);

  if (readErr || !rows) {
    console.error("Failed to read session 8 rows:", readErr?.message);
    process.exit(1);
  }

  const slugIndex = new Map(s8Achievements.map((a, i) => [a.slug, i]));
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

  console.log(`Done. ${s8Achievements.length} achievements inserted, ${needsOrder.length} sort_orders assigned.`);
}

main();
