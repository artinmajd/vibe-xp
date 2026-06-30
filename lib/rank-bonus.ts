import { createServerClient } from "@/lib/supabase-server";

// Speed-rank bonus. A submission earns a rank only once CONFIRMED
// (auto-graded on submit, or instructor-approved), but the rank reflects WHEN
// it was submitted — earlier submitted_at always ranks higher.
//
//   rank  = position by submitted_at among the achievement's confirmed subs
//   bonus = max(0, X - rank), X = number of students in the cohort
//
// Because a late-approved-but-early-submitted entry can outrank one already
// confirmed, we re-rank the whole confirmed set on every confirmation (and on
// reject/retract, so the rest move up). The bonus is flat (no team multiplier)
// and folded into xp_awarded. base = xp_awarded - bonus_xp is preserved.
export async function rerankAchievement(
  supabase: ReturnType<typeof createServerClient>,
  achievementId: string,
  cohortId: string
): Promise<void> {
  const { data: confirmed } = await supabase
    .from("submissions")
    .select("id, submitted_at, xp_awarded, bonus_xp, submission_rank")
    .eq("achievement_id", achievementId)
    .in("status", ["auto_approved", "approved"])
    .order("submitted_at", { ascending: true })
    .order("id", { ascending: true });

  if (!confirmed) return;

  const { count: students } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("cohort_id", cohortId);
  const X = students ?? 1;

  for (let i = 0; i < confirmed.length; i++) {
    const s = confirmed[i];
    const newRank = i + 1;
    const newBonus = Math.max(0, X - newRank);
    if (s.submission_rank === newRank && s.bonus_xp === newBonus) continue;

    const baseMultiplied = (s.xp_awarded ?? 0) - (s.bonus_xp ?? 0);
    await supabase
      .from("submissions")
      .update({ submission_rank: newRank, bonus_xp: newBonus, xp_awarded: baseMultiplied + newBonus })
      .eq("id", s.id);
  }
}
