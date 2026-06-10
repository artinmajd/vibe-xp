import { requireInstructor } from "@/lib/require-instructor";
import { createServerClient } from "@/lib/supabase-server";
import { getTeamXP } from "@/lib/team-xp";
import InstructorDashboard from "@/components/instructor/InstructorDashboard";

export default async function InstructorPage() {
  await requireInstructor();

  const supabase = createServerClient();

  // Pending submissions
  const { data: pendingRaw } = await supabase
    .from("submissions")
    .select(`
      id, team_id, student_id, proof_data, screenshot_url, submitted_at,
      teams(name),
      students(display_name),
      achievements(title, xp, proof_type)
    `)
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });

  const pending = (pendingRaw ?? []).map((s) => ({
    id: s.id,
    team_id: s.team_id,
    team_name: (s.teams as unknown as { name: string } | null)?.name ?? "Unknown",
    student_name: (s.students as unknown as { display_name: string } | null)?.display_name ?? "Unknown",
    achievement_title: (s.achievements as unknown as { title: string; xp: number; proof_type: string } | null)?.title ?? "Unknown",
    achievement_xp: (s.achievements as unknown as { title: string; xp: number; proof_type: string } | null)?.xp ?? 0,
    proof_type: (s.achievements as unknown as { title: string; xp: number; proof_type: string } | null)?.proof_type ?? "",
    proof_data: s.proof_data as Record<string, unknown>,
    screenshot_url: s.screenshot_url,
    submitted_at: s.submitted_at,
  }));

  // All teams
  const { data: teamsRaw } = await supabase
    .from("teams")
    .select("id, name, emoji, code")
    .order("name");

  const teams = await Promise.all(
    (teamsRaw ?? []).map(async (t) => {
      const { data: membersRaw } = await supabase
        .from("team_members")
        .select("student_id, students(display_name)")
        .eq("team_id", t.id);

      const members = (membersRaw ?? []).map((m) => ({
        id: m.student_id,
        name: (m.students as unknown as { display_name: string } | null)?.display_name ?? "Unknown",
      }));

      const { totalXp, levelInfo } = await getTeamXP(t.id);

      // Session XP: submissions tied to the active session's achievements
      const { data: activeSession } = await supabase
        .from("sessions")
        .select("id")
        .eq("is_active", true)
        .maybeSingle();

      let sessionXp = 0;
      if (activeSession) {
        const { data: sessionAchs } = await supabase
          .from("achievements")
          .select("id")
          .eq("session_number", activeSession.id);

        if (sessionAchs && sessionAchs.length > 0) {
          const { data: sessionSubs } = await supabase
            .from("submissions")
            .select("xp_awarded")
            .eq("team_id", t.id)
            .in("achievement_id", sessionAchs.map((a) => a.id))
            .in("status", ["auto_approved", "approved"]);

          sessionXp = (sessionSubs ?? []).reduce((sum, s) => sum + s.xp_awarded, 0);
        }
      }

      return {
        id: t.id,
        name: t.name,
        emoji: t.emoji,
        code: t.code,
        members,
        totalXp,
        sessionXp,
        levelName: levelInfo.name,
      };
    })
  );

  // All sessions
  const { data: sessionsRaw } = await supabase
    .from("sessions")
    .select("id, title, is_active, unlocked_through")
    .order("id");

  const sessions = (sessionsRaw ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    is_active: s.is_active,
    unlocked_through: s.unlocked_through ?? 0,
  }));

  const activeSession = sessions.find((s) => s.is_active) ?? null;

  // Achievement unlock preview for the instructor dropdown
  const { data: achievementRows } = activeSession
    ? await supabase
        .from("achievements")
        .select("id, title, is_unlocked")
        .eq("session_number", activeSession.id)
        .eq("is_secret", false)
        .eq("is_active", true)
        .order("block_number")
        .order("id")
    : { data: [] };

  const achievementList = achievementRows ?? [];
  const nextAchievement = achievementList.find((a) => !a.is_unlocked) ?? null;
  const unlockedList = achievementList.filter((a) => a.is_unlocked);
  const lastUnlockedAchievement = unlockedList[unlockedList.length - 1] ?? null;

  return (
    <InstructorDashboard
      pending={pending}
      teams={teams}
      sessions={sessions}
      activeSession={activeSession}
      nextAchievement={nextAchievement}
      lastUnlockedAchievement={lastUnlockedAchievement}
    />
  );
}
