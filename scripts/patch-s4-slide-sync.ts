/**
 * One-off patch: sync the "Plan Before You Build" session's achievements in
 * the TEMPLATE cohort (test-cohort) to its slide deck ("Session
 * 4-Planning.pptx"), positioned as session_number=4 after the curriculum
 * reorder. The slide deck is the source of truth.
 *
 * Structural note: the deck's block numbering literally reads 0, 1, 2, 3,
 * then jumps straight to a "BLOCK 6 · FINAL BUILD" label on its final-build
 * EARN IT slides, then "BLOCK 7" for ship-it/showcase/wrap — no block 5 or
 * true block 6 content exists anywhere in the deck. Treating the final-build
 * content as block 4 (not 6) collapses the numbering to 0,1,2,3,4,7, which
 * matches every other block's content cleanly.
 *
 * - Removes 12 achievements with no counterpart in this deck (0 submissions
 *   confirmed against any of them beforehand):
 *   - Dead Link Found, Zero Questions (superseded by the new one-shot/Wreck
 *     Hunt framing)
 *   - Brief Canvas, Identity Locked (no brief-document step in this deck)
 *   - The entire chat-wipe/agents.md-drift arc: Caught the Drift, Cursor
 *     Forgot ___, agents.md Exists, Snap-Back Confirmed, Page Three
 *     Confirmed, Two Wipes
 *   - The remix-round arc: File First, Remix Everywhere (replaced by a
 *     different final-build "mission upgrade" arc)
 * - Adds Site Is Live (+5, url) and The Full Stack (+10, screenshot of
 *   plan+loop+approve for the final mission-upgrade build).
 * - Rewrites Wreck Hunt's fields to the deck's specific one-shot
 *   space-restaurant exercise (de-Cursored).
 * - Simplifies Zoom Sheet from 15 fields down to 4 (one per zoom level),
 *   matching the deck's lighter framing.
 * - Drops the 2 now-orphaned items (chat-wipe page, remix-everywhere) from
 *   Site Complete's checklist.
 * - Updates We Toured Our Site's wording to mention touring "live from its
 *   URL".
 * - Replaces stale "Cursor" wording with "Codex" where the deck specifically
 *   names it (Ready Check's tool-open item) or generic "AI" phrasing
 *   elsewhere (Plan Generated, Patch the Gaps).
 * - Renumbers block_number (collapsing the removed blocks 3/5/6 as described
 *   above) and sort_order to match the deck's sequence.
 *
 * Run once: npx ts-node scripts/patch-s4-slide-sync.ts
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
const SESSION_NUMBER = 4;

const TO_DELETE = [
  "s4-dead-link-found",
  "s4-zero-questions",
  "s4-brief-canvas",
  "s4-identity-locked",
  "s4-caught-the-drift",
  "s4-cursor-forgot",
  "s4-agents-md-exists",
  "s4-snap-back-confirmed",
  "s4-page-three-confirmed",
  "s4-two-wipes",
  "s4-file-first",
  "s4-remix-everywhere",
];

// Kept achievements: realign block_number + rewrite wording/fields in place.
const UPDATES: Record<string, Record<string, unknown>> = {
  "s4-ready-check": {
    proof_config: {
      items: [
        "VS Code open and Codex signed in",
        "Session 3 folder still present — the game survived!",
        "New session-4-site folder created",
        "I know where pages open in the browser",
      ],
    },
  },
  "s4-wreck-hunt": {
    description:
      "List six things that broke or drifted in your one-shot site — found by clicking, not just looking.",
    proof_config: {
      form_type: "fields",
      fields: [
        "Add dishes past 50 credits — did the free dessert actually appear?",
        "Drop back below 50 — did the dessert leave, or was it free forever?",
        "Did you try to remove a dish from your order — was there a way?",
        "Book a table, then try the same slot again — did it stop you?",
        "Leave a 1-star rating — did the average on the home page move?",
        "What dishes, prices, or names did the AI invent?",
      ],
    },
  },
  "s4-zoom-sheet": {
    description:
      "Complete all four zoom levels — Idea, Visitor, Pages, Details — for your real project and the wreck you found.",
    proof_config: {
      form_type: "fields",
      fields: [
        "The Idea — one sentence: what is it, and why is it cool?",
        "The Visitor — who lands here, what should they feel, and what should they do?",
        "The Pages — name your three pages, what each is for, and confirm the same nav appears on every page",
        "The Details — for each page, list 2–3 sections and note which page holds your feature",
      ],
    },
  },
  "s4-plan-generated": {
    block_number: 3,
    description:
      "Screenshot the AI's plan — generated in Plan Mode from your typed idea, with nothing built yet.",
  },
  "s4-patch-the-gaps": {
    block_number: 3,
    description:
      "List each clarifying question the AI asked and how you answered it. If it asked none, write \"zero questions\" and take the bow.",
    proof_config: {
      form_type: "fields",
      fields: ["The AI's clarifying questions and your answers (or \"zero questions\")"],
    },
  },
  "s4-plan-inspection": { block_number: 3 },
  "s4-read-before-approve": { block_number: 3 },
  "s4-home-page-from-the-plan": { block_number: 3 },
  "s4-broke-it-fixed-it": { block_number: 4 },
  "s4-site-complete": {
    proof_config: {
      form_type: "checklist",
      items: [
        "Brief fully done (identity + Always/Never rules)",
        "Plan inspected and approved before building",
        "agents.md created with every section, by prompts only",
        "Three pages reachable from the same nav on every page (clicked in front of a witness)",
        "Identity and theme consistent across pages (rival-confirmed)",
        "The interactive feature works",
      ],
    },
  },
  "s4-we-toured-our-site": {
    description:
      "Give the showcase tour on the projector — live from its URL — then tick the box.",
    proof_config: {
      form_type: "checklist",
      items: ["Our team toured the site on the projector — live from its URL"],
    },
  },
};

const NEW_ACHIEVEMENTS = [
  {
    slug: "s4-the-full-stack",
    session_number: SESSION_NUMBER,
    block_number: 4,
    title: "The Full Stack",
    description:
      "Screenshot your chat showing all three: the plan request, one loop fix, and the scoped approval.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
    is_active: true,
    is_unlocked: false,
  },
  {
    slug: "s4-site-is-live",
    session_number: SESSION_NUMBER,
    block_number: 7,
    title: "Site Is Live",
    description:
      "Submit your live Vercel link — the whole three-page site, on the internet, reachable from your homepage card.",
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
  "s4-ready-check",
  "s4-the-wreck",
  "s4-wreck-hunt",
  "s4-zoom-sheet",
  "s4-plan-generated",
  "s4-patch-the-gaps",
  "s4-plan-inspection",
  "s4-read-before-approve",
  "s4-home-page-from-the-plan",
  "s4-the-full-stack",
  "s4-broke-it-fixed-it",
  "s4-site-is-live",
  "s4-site-complete",
  "s4-we-toured-our-site",
  "s4-one-line-takeaway",
  "s4-recap-check",
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
    console.log(`  ${slug} updated`);
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
