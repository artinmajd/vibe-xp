import { createServerClient } from "@/lib/supabase-server";
import { xpToLevel } from "@/lib/levels";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const view = request.nextUrl.searchParams.get("view") ?? "total";
  const cohortCode = request.nextUrl.searchParams.get("cohort");
  const supabase = createServerClient();

  if (!cohortCode) {
    return NextResponse.json({ teams: [], session: null, cohort: null });
  }

  // Resolve the cohort by its join code (case-insensitive).
  const { data: cohort } = await supabase
    .from("cohorts")
    .select("id, name, join_code, active_session_id, max_team_members")
    .eq("join_code", cohortCode.toUpperCase())
    .maybeSingle();

  if (!cohort) {
    return NextResponse.json({ teams: [], session: null, cohort: null });
  }

  // The cohort's current session (sessions are per-cohort now).
  const { data: session } = cohort.active_session_id
    ? await supabase
        .from("sessions")
        .select("session_number, title")
        .eq("cohort_id", cohort.id)
        .eq("session_number", cohort.active_session_id)
        .maybeSingle()
    : { data: null };

  // Teams in this cohort, with members.
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, emoji")
    .eq("cohort_id", cohort.id);

  const { data: membersRaw } = await supabase
    .from("team_members")
    .select("team_id, students(display_name)");

  const membersByTeam = new Map<string, string[]>();
  for (const m of membersRaw ?? []) {
    const name = (m.students as unknown as { display_name: string } | null)?.display_name;
    if (!name) continue;
    const arr = membersByTeam.get(m.team_id) ?? [];
    arr.push(name);
    membersByTeam.set(m.team_id, arr);
  }

  if (!teams || teams.length === 0) {
    return NextResponse.json({ teams: [], session, cohort: { name: cohort.name, join_code: cohort.join_code, max_team_members: cohort.max_team_members ?? 3 } });
  }

  const teamIds = teams.map((t) => t.id);

  // All approved submissions for these teams
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

  // Achievement IDs for THIS cohort's current session (for session XP)
  const { data: sessionAchievements } = session
    ? await supabase
        .from("achievements")
        .select("id")
        .eq("cohort_id", cohort.id)
        .eq("session_number", session.session_number)
    : { data: [] };

  const sessionAchievementIds = new Set((sessionAchievements ?? []).map((a) => a.id));

  const rows = teams.map((team) => {
    const teamMembers = membersByTeam.get(team.id) ?? [];
    const memberCount = teamMembers.length || 1;
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
      members: teamMembers,
      memberCount,
      sessionXp,
      totalXp,
      level: levelInfo.level,
      levelName: levelInfo.name,
      xpToNext: levelInfo.xpToNext,
    };
  });

  rows.sort((a, b) =>
    view === "session" ? b.sessionXp - a.sessionXp : b.totalXp - a.totalXp
  );

  return NextResponse.json({
    teams: rows,
    session,
    cohort: { name: cohort.name, join_code: cohort.join_code, max_team_members: cohort.max_team_members ?? 3 },
  });
}
