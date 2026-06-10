import { createServerClient } from "@/lib/supabase-server";
import { xpToLevel, LevelInfo } from "@/lib/levels";

export type TeamXP = {
  rawXp: number;
  adjustedXp: number;
  memberCount: number;
  totalXp: number; // alias for adjustedXp — kept for backwards compat
  levelInfo: LevelInfo;
};

// Total XP is always computed — never stored.
// Sums approved submissions + manual grants, then applies a fairness
// multiplier of 3/memberCount so smaller teams compete on equal footing.
// Level progression uses raw XP so leveling isn't inflated.
export async function getTeamXP(teamId: string, memberCount?: number): Promise<TeamXP> {
  const supabase = createServerClient();

  const [{ data: submissions }, { data: grants }, { data: members }] = await Promise.all([
    supabase
      .from("submissions")
      .select("xp_awarded")
      .eq("team_id", teamId)
      .in("status", ["auto_approved", "approved"]),
    supabase
      .from("manual_xp_grants")
      .select("xp")
      .eq("team_id", teamId),
    memberCount === undefined
      ? supabase.from("team_members").select("student_id").eq("team_id", teamId)
      : Promise.resolve({ data: null }),
  ]);

  const resolvedMemberCount =
    memberCount ?? (members as { student_id: string }[] | null)?.length ?? 1;

  const rawXp =
    (submissions ?? []).reduce((sum, s) => sum + s.xp_awarded, 0) +
    (grants ?? []).reduce((sum, g) => sum + g.xp, 0);

  const adjustedXp =
    resolvedMemberCount < 3
      ? Math.round((rawXp * 3) / resolvedMemberCount)
      : rawXp;

  return {
    rawXp,
    adjustedXp,
    memberCount: resolvedMemberCount,
    totalXp: adjustedXp,
    levelInfo: xpToLevel(rawXp),
  };
}
