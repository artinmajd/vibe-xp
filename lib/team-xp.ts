import { createServerClient } from "@/lib/supabase-server";
import { xpToLevel, LevelInfo } from "@/lib/levels";

export type TeamXP = {
  totalXp: number;
  levelInfo: LevelInfo;
};

// Total XP is always computed — never stored.
// Sums approved submissions + manual grants.
export async function getTeamXP(teamId: string): Promise<TeamXP> {
  const supabase = createServerClient();

  const [{ data: submissions }, { data: grants }] = await Promise.all([
    supabase
      .from("submissions")
      .select("xp_awarded")
      .eq("team_id", teamId)
      .in("status", ["auto_approved", "approved"]),
    supabase
      .from("manual_xp_grants")
      .select("xp")
      .eq("team_id", teamId),
  ]);

  const submissionXp = (submissions ?? []).reduce((sum, s) => sum + s.xp_awarded, 0);
  const grantXp = (grants ?? []).reduce((sum, g) => sum + g.xp, 0);
  const totalXp = submissionXp + grantXp;

  return { totalXp, levelInfo: xpToLevel(totalXp) };
}
