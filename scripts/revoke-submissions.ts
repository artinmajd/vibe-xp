import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const slugs = process.argv.slice(2);
  if (slugs.length === 0) {
    console.error("Usage: npx tsx scripts/revoke-submissions.ts <slug> [slug2 ...]");
    process.exit(1);
  }

  const { data: achs } = await supabase
    .from("achievements")
    .select("id, slug")
    .in("slug", slugs);

  if (!achs || achs.length === 0) {
    console.error("No matching achievements found.");
    process.exit(1);
  }

  const ids = achs.map((a) => a.id);

  // Find affected submissions
  const { data: subs } = await supabase
    .from("submissions")
    .select("id")
    .in("achievement_id", ids);

  const subIds = (subs ?? []).map((s) => s.id);

  // Delete referencing instructor_actions first
  if (subIds.length > 0) {
    await supabase.from("instructor_actions").delete().in("submission_id", subIds);
  }

  // Delete submissions
  const { data: deleted } = await supabase
    .from("submissions")
    .delete()
    .in("achievement_id", ids)
    .select("id");

  console.log(`Deleted ${deleted?.length ?? 0} submission(s) for: ${achs.map((a) => a.slug).join(", ")}`);
}

main();
