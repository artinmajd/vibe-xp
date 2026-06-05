import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // 1. Delete all quiz submissions
  const { data: quizAchs } = await supabase
    .from("achievements")
    .select("id, slug")
    .eq("proof_type", "quiz");

  const quizIds = (quizAchs ?? []).map((a) => a.id);

  if (quizIds.length > 0) {
    const { data: subs } = await supabase
      .from("submissions")
      .select("id")
      .in("achievement_id", quizIds);

    const subIds = (subs ?? []).map((s) => s.id);

    if (subIds.length > 0) {
      await supabase.from("instructor_actions").delete().in("submission_id", subIds);
    }

    const { data: deleted } = await supabase
      .from("submissions")
      .delete()
      .in("achievement_id", quizIds)
      .select("id");

    console.log(`Deleted ${deleted?.length ?? 0} quiz submission(s) for: ${(quizAchs ?? []).map((a) => a.slug).join(", ")}`);
  } else {
    console.log("No quiz achievements found.");
  }

  // 2. Disable all secret achievements
  const { data: updated } = await supabase
    .from("achievements")
    .update({ is_active: false })
    .eq("is_secret", true)
    .select("slug");

  console.log(`Disabled ${updated?.length ?? 0} secret achievement(s): ${(updated ?? []).map((a) => a.slug).join(", ") || "none"}`);
}

main();
