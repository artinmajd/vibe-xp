import { createServerClient } from "@/lib/supabase-server";
import { xpToLevel, LevelInfo } from "@/lib/levels";

export type TeamXP = {
  totalXp: number;
  memberCount: number;
  levelInfo: LevelInfo;
};

// Total XP is always computed — never stored.
// The fairness multiplier (3/memberCount) is baked into xp_awarded at
// approval time, so this function just sums what's already stored.
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

  const totalXp =
    (submissions ?? []).reduce((sum, s) => sum + s.xp_awarded, 0) +
    (grants ?? []).reduce((sum, g) => sum + g.xp, 0);

  return { totalXp, memberCount: resolvedMemberCount, levelInfo: xpToLevel(totalXp) };
}

// Apply the fairness multiplier for a given team size, relative to the
// cohort's configured max team size (so smaller teams aren't disadvantaged).
// Call this when xp_awarded is being set, not when reading it back.
export function applyTeamMultiplier(baseXp: number, memberCount: number, maxTeamMembers = 3): number {
  if (memberCount >= maxTeamMembers) return baseXp;
  return Math.round((baseXp * maxTeamMembers) / memberCount);
}
