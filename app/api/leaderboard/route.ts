import { createServerClient } from "@/lib/supabase-server";
import { xpToLevel } from "@/lib/levels";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const view = request.nextUrl.searchParams.get("view") ?? "total";
  const supabase = createServerClient();

  // Active session
  const { data: session } = await supabase
    .from("sessions")
    .select("id, title")
    .eq("is_active", true)
    .maybeSingle();

  // All teams
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, emoji");

  if (!teams || teams.length === 0) {
    return NextResponse.json({ teams: [], session });
  }

  const teamIds = teams.map((t) => t.id);

  // All approved submissions
  const { data: submissions } = await supabase
    .from("submissions")
    .select("team_id, xp_awarded, achievement_id")
    .in("team_id", teamIds)
    .in("status", ["auto_approved", "approved"]);

  // Manual XP grants
  const { data: grants } = await supabase
    .from("manual_xp_grants")
    .select("team_id, xp")
    .in("team_id", teamIds);

  // Achievement IDs for the active session (for session XP)
  const { data: sessionAchievements } = session
    ? await supabase
        .from("achievements")
        .select("id")
        .eq("session_number", session.id)
    : { data: [] };

  const sessionAchievementIds = new Set((sessionAchievements ?? []).map((a) => a.id));

  // Build leaderboard rows
  const rows = teams.map((team) => {
    const teamSubmissions = (submissions ?? []).filter((s) => s.team_id === team.id);
    const teamGrants = (grants ?? []).filter((g) => g.team_id === team.id);

    const totalXp =
      teamSubmissions.reduce((sum, s) => sum + s.xp_awarded, 0) +
      teamGrants.reduce((sum, g) => sum + g.xp, 0);

    const sessionXp = teamSubmissions
      .filter((s) => sessionAchievementIds.has(s.achievement_id))
      .reduce((sum, s) => sum + s.xp_awarded, 0);

    const levelInfo = xpToLevel(totalXp);

    return {
      teamId: team.id,
      name: team.name,
      emoji: team.emoji,
      sessionXp,
      totalXp,
      level: levelInfo.level,
      levelName: levelInfo.name,
      xpToNext: levelInfo.xpToNext,
    };
  });

  // Sort by requested view
  rows.sort((a, b) =>
    view === "session" ? b.sessionXp - a.sessionXp : b.totalXp - a.totalXp
  );

  return NextResponse.json({ teams: rows, session });
}
