import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const displayName = process.argv[2];
  if (!displayName) {
    console.error("Usage: npx tsx scripts/clear-submissions.ts <display_name>");
    process.exit(1);
  }

  const { data: student } = await supabase
    .from("students")
    .select("id, team_id, display_name")
    .eq("display_name", displayName)
    .maybeSingle();

  if (!student) {
    console.error(`No student found with display_name "${displayName}"`);
    process.exit(1);
  }

  if (!student.team_id) {
    console.error(`${displayName} is not on a team.`);
    process.exit(1);
  }

  const { data: deleted, error } = await supabase
    .from("submissions")
    .delete()
    .eq("team_id", student.team_id)
    .select("id");

  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }

  console.log(`Cleared ${deleted?.length ?? 0} submission(s) for ${displayName}'s team.`);
}

main();
