import { createServerClient } from "@/lib/supabase-server";

// Speed-rank bonus. A submission earns a rank only once CONFIRMED
// (auto-graded on submit, or instructor-approved), but the rank reflects WHEN
// it was submitted — earlier submitted_at always ranks higher.
//
//   rank  = position by submitted_at among the achievement's confirmed subs
//           that earned nonzero base XP
//   bonus = max(0, X - rank), X = number of students in the cohort
//
// A submission with zero base XP (e.g. a quiz answered entirely wrong —
// validateQuiz only checks the answer is well-formed, not correct, so a
// wrong-but-valid quiz still gets auto_approved) doesn't compete for, or
// receive, the speed bonus: being fast is worthless if the answer is wrong.
// It's excluded from ranking entirely — later, correctly-answered
// submissions still fill ranks 1, 2, 3… as if it were never submitted.
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

  let rank = 0;
  for (const s of confirmed) {
    const base = (s.xp_awarded ?? 0) - (s.bonus_xp ?? 0);
    const earnedNothing = base <= 0;
    const newRank = earnedNothing ? null : ++rank;
    const newBonus = earnedNothing ? 0 : Math.max(0, X - newRank!);
    if (s.submission_rank === newRank && s.bonus_xp === newBonus) continue;

    await supabase
      .from("submissions")
      .update({ submission_rank: newRank, bonus_xp: newBonus, xp_awarded: base + newBonus })
      .eq("id", s.id);
  }
}
