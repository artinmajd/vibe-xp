/**
 * One-off patch: remove Sessions 8, 9, and 10 from the TEMPLATE cohort
 * (test-cohort) — their curriculum content hasn't been reviewed against a
 * finalized slide deck yet.
 *
 * - Session 8 ("Teach Cursor How You Work") already has 0 achievements
 *   (its real content moved to session 7 in an earlier reorder).
 * - Session 9 ("The Build Sprint") has 17 achievements.
 * - Session 10 ("The Finish Line") has 7 achievements.
 * - 0 submissions exist against any of them — safe to hard-delete.
 *
 * Run once: npx ts-node scripts/patch-remove-sessions-8-9-10.ts
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
const SESSION_NUMBERS = [8, 9, 10];

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

  const { data: achRows } = await supabase
    .from("achievements")
    .select("id")
    .eq("cohort_id", cohort.id)
    .in("session_number", SESSION_NUMBERS);
  const achIds = (achRows ?? []).map((r) => r.id);
  console.log(`Found ${achIds.length} achievements across sessions ${SESSION_NUMBERS.join(", ")}.`);

  if (achIds.length > 0) {
    const { count } = await supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .in("achievement_id", achIds);
    if ((count ?? 0) > 0) {
      console.error(`ABORT: ${count} submissions exist against achievements slated for deletion.`);
      process.exit(1);
    }
  }

  console.log("Deleting achievements...");
  if (achIds.length > 0) {
    const { error } = await supabase.from("achievements").delete().in("id", achIds);
    if (error) { console.error("Achievement delete failed:", error.message); process.exit(1); }
  }
  console.log(`  ${achIds.length} achievements deleted.`);

  console.log("Deleting session rows...");
  const { error: sessErr, count: sessCount } = await supabase
    .from("sessions")
    .delete({ count: "exact" })
    .eq("cohort_id", cohort.id)
    .in("session_number", SESSION_NUMBERS);
  if (sessErr) { console.error("Session delete failed:", sessErr.message); process.exit(1); }
  console.log(`  ${sessCount} session rows deleted.`);

  const { data: remaining } = await supabase
    .from("sessions")
    .select("session_number, title")
    .eq("cohort_id", cohort.id)
    .order("session_number");
  console.log("\nRemaining sessions:");
  for (const s of remaining ?? []) {
    console.log(`  ${s.session_number}: ${s.title}`);
  }
}

main();
