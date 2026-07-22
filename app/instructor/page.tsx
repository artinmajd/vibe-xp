import { requireInstructor } from "@/lib/require-instructor";
import { createServerClient } from "@/lib/supabase-server";
import { getInstructorCohort } from "@/lib/cohort";
import { getTeamXP } from "@/lib/team-xp";
import { redirect } from "next/navigation";
import InstructorDashboard from "@/components/instructor/InstructorDashboard";

export default async function InstructorPage() {
  await requireInstructor();

  // No cohort selected for this browser → go pick one.
  const cohort = await getInstructorCohort();
  if (!cohort) redirect("/instructor/cohorts");

  const supabase = createServerClient();

  // Teams in THIS cohort.
  const { data: teamsRaw } = await supabase
    .from("teams")
    .select("id, name, emoji, code")
    .eq("cohort_id", cohort.id)
    .order("name");

  const cohortTeamIds = (teamsRaw ?? []).map((t) => t.id);

  // Achievement ids for THIS cohort's current session (for session XP).
  const sessionAchIds = cohort.active_session_id
    ? ((await supabase
        .from("achievements")
        .select("id")
        .eq("cohort_id", cohort.id)
        .eq("session_number", cohort.active_session_id)).data ?? []).map((a) => a.id)
    : [];

  // Pending + approved submissions, scoped to this cohort's teams.
  const submissionSelect = `
      id, team_id, student_id, proof_data, screenshot_url, submitted_at,
      teams(name),
      students(display_name),
      achievements(title, xp, proof_type)
    `;

  const { data: pendingRaw } = cohortTeamIds.length
    ? await supabase
        .from("submissions")
        .select(submissionSelect)
        .eq("status", "pending")
        .in("team_id", cohortTeamIds)
        .order("submitted_at", { ascending: true })
    : { data: [] };

  const { data: approvedRaw } = cohortTeamIds.length
    ? await supabase
        .from("submissions")
        .select(submissionSelect)
        .in("status", ["approved", "auto_approved"])
        .in("team_id", cohortTeamIds)
        .order("submitted_at", { ascending: false })
    : { data: [] };

  type SubRow = NonNullable<typeof pendingRaw>[number];
  function mapSubmission(s: SubRow) {
    const ach = s.achievements as unknown as { title: string; xp: number; proof_type: string } | null;
    return {
      id: s.id,
      team_id: s.team_id,
      team_name: (s.teams as unknown as { name: string } | null)?.name ?? "Unknown",
      student_name: (s.students as unknown as { display_name: string } | null)?.display_name ?? "Unknown",
      achievement_title: ach?.title ?? "Unknown",
      achievement_xp: ach?.xp ?? 0,
      proof_type: ach?.proof_type ?? "",
      proof_data: s.proof_data as Record<string, unknown>,
      screenshot_url: s.screenshot_url,
      submitted_at: s.submitted_at,
    };
  }

  const pending = (pendingRaw ?? []).map(mapSubmission);
  const approved = (approvedRaw ?? []).map(mapSubmission);

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

      const { totalXp, levelInfo } = await getTeamXP(t.id, members.length);

      // Session XP: submissions tied to the cohort's current-session achievements.
      let sessionXp = 0;
      if (sessionAchIds.length > 0) {
        const { data: sessionSubs } = await supabase
          .from("submissions")
          .select("xp_awarded")
          .eq("team_id", t.id)
          .in("achievement_id", sessionAchIds)
          .in("status", ["auto_approved", "approved"]);
        sessionXp = (sessionSubs ?? []).reduce((sum, s) => sum + s.xp_awarded, 0);
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

  // All sessions (shared catalog). is_active is derived from the cohort.
  const { data: sessionsRaw } = await supabase
    .from("sessions")
    .select("id, title, unlocked_through")
    .order("id");

  const sessions = (sessionsRaw ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    is_active: s.id === cohort.active_session_id,
    unlocked_through: s.unlocked_through ?? 0,
  }));

  const activeSession = sessions.find((s) => s.is_active) ?? null;
  const chatEnabled = cohort.chat_enabled;

  // Students in this cohort without a team.
  const { data: teamlessRaw } = await supabase
    .from("students")
    .select("id, display_name")
    .eq("cohort_id", cohort.id)
    .is("team_id", null)
    .order("display_name");

  const teamlessStudents = (teamlessRaw ?? []).map((s) => ({ id: s.id, name: s.display_name }));

  // Achievements for the active session — per-cohort, is_unlocked on the row.
  const { data: achievementRows } = activeSession
    ? await supabase
        .from("achievements")
        .select("id, title, description, xp, is_secret, sort_order, block_number, is_unlocked")
        .eq("cohort_id", cohort.id)
        .eq("session_number", activeSession.id)
        .eq("is_active", true)
        .order("sort_order")
        .order("id")
    : { data: [] };

  const allAchievements = achievementRows ?? [];

  // Unlock preview uses non-secret achievements in order.
  const nonSecretList = allAchievements.filter((a) => !a.is_secret);
  const nextAchievement = nonSecretList.find((a) => !a.is_unlocked) ?? null;
  const unlockedList = nonSecretList.filter((a) => a.is_unlocked);
  const lastUnlockedAchievement = unlockedList[unlockedList.length - 1] ?? null;

  const sessionAchievements = allAchievements.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description ?? "",
    xp: a.xp,
    is_unlocked: a.is_unlocked,
    is_secret: a.is_secret,
    sort_order: a.sort_order ?? 0,
    block_number: a.block_number ?? 1,
  }));

  return (
    <InstructorDashboard
      pending={pending}
      approved={approved}
      teams={teams}
      teamlessStudents={teamlessStudents}
      sessions={sessions}
      activeSession={activeSession}
      nextAchievement={nextAchievement ? { id: nextAchievement.id, title: nextAchievement.title } : null}
      lastUnlockedAchievement={lastUnlockedAchievement ? { id: lastUnlockedAchievement.id, title: lastUnlockedAchievement.title } : null}
      sessionAchievements={sessionAchievements}
      chatEnabled={chatEnabled}
      cohort={{
        id: cohort.id,
        name: cohort.name,
        join_code: cohort.join_code,
        max_teams: cohort.max_teams ?? 5,
        max_team_members: cohort.max_team_members ?? 3,
      }}
    />
  );
}
