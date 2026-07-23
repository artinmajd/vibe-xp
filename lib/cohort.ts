import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase-server";

// Cohort context.
//
// There is no global "active cohort" — that would clobber simultaneous
// classrooms sharing one instructor passcode. Instead each instructor's
// browser holds its own cohort choice in the `instructor_cohort` cookie, and
// every instructor route/page scopes its reads + writes to it. Students don't
// choose anything: their cohort comes from `students.cohort_id`.

export const INSTRUCTOR_COHORT_COOKIE = "instructor_cohort";

export type Cohort = {
  id: string;
  name: string;
  join_code: string;
  active_session_id: number | null;
  chat_enabled: boolean;
  is_archived: boolean;
  max_teams: number;
  max_team_members: number;
  created_at: string;
};

// The cohort the current instructor browser is managing, or null if none is
// selected yet (the dashboard then shows the cohort picker).
export async function getInstructorCohort(): Promise<Cohort | null> {
  const cookieStore = await cookies();
  const cohortId = cookieStore.get(INSTRUCTOR_COHORT_COOKIE)?.value;
  if (!cohortId) return null;

  const supabase = createServerClient();
  const { data } = await supabase
    .from("cohorts")
    .select("*")
    .eq("id", cohortId)
    .maybeSingle();

  // Cookie points at a deleted/archived cohort → treat as unselected.
  if (!data || data.is_archived) return null;
  return data as Cohort;
}

// The cohort a student belongs to (full row), or null if somehow unassigned.
export async function getStudentCohort(studentId: string): Promise<Cohort | null> {
  const supabase = createServerClient();
  const { data: student } = await supabase
    .from("students")
    .select("cohort_id")
    .eq("id", studentId)
    .maybeSingle();

  if (!student?.cohort_id) return null;

  const { data: cohort } = await supabase
    .from("cohorts")
    .select("*")
    .eq("id", student.cohort_id)
    .maybeSingle();

  return (cohort as Cohort) ?? null;
}

type Supa = ReturnType<typeof createServerClient>;

// Replace the target cohort's sessions + achievements with a fresh copy of
// the source cohort's. Achievement copies start LOCKED (is_unlocked = false).
// Overwrites: any existing sessions/achievements in the target — and
// submissions against those achievements — are removed first.
export async function copyCohortContent(
  supabase: Supa,
  sourceCohortId: string,
  targetCohortId: string
) {
  const { data: sourceSessions } = await supabase
    .from("sessions")
    .select("session_number, title")
    .eq("cohort_id", sourceCohortId);

  const { data: targetAch } = await supabase
    .from("achievements")
    .select("id")
    .eq("cohort_id", targetCohortId);
  const targetAchIds = (targetAch ?? []).map((a) => a.id);
  if (targetAchIds.length > 0) {
    await supabase.from("submissions").delete().in("achievement_id", targetAchIds);
    await supabase.from("achievements").delete().eq("cohort_id", targetCohortId);
  }
  await supabase.from("sessions").delete().eq("cohort_id", targetCohortId);

  if (sourceSessions && sourceSessions.length > 0) {
    const sessionCopies = sourceSessions.map((s) => ({ ...s, cohort_id: targetCohortId }));
    const { error: sessErr } = await supabase.from("sessions").insert(sessionCopies);
    if (sessErr) throw new Error(sessErr.message);
  }

  const { data: sourceAch } = await supabase
    .from("achievements")
    .select("slug, session_number, block_number, title, description, xp, proof_type, proof_config, is_secret, is_active, sort_order")
    .eq("cohort_id", sourceCohortId);

  if (sourceAch && sourceAch.length > 0) {
    const achCopies = sourceAch.map((a) => ({ ...a, cohort_id: targetCohortId, is_unlocked: false }));
    const { error: achErr } = await supabase.from("achievements").insert(achCopies);
    if (achErr) throw new Error(achErr.message);
  }

  // Match the source's active session number where the copy still has it;
  // otherwise fall back to the first copied session (or none).
  const { data: sourceCohort } = await supabase
    .from("cohorts")
    .select("active_session_id")
    .eq("id", sourceCohortId)
    .single();
  const sourceActive = sourceCohort?.active_session_id ?? null;
  const stillHasIt = (sourceSessions ?? []).some((s) => s.session_number === sourceActive);
  const fallback = sourceSessions?.[0]?.session_number ?? null;
  await supabase
    .from("cohorts")
    .update({ active_session_id: stillHasIt ? sourceActive : fallback })
    .eq("id", targetCohortId);
}

// Copy ONE session's achievements from a source cohort's session into a
// specific (already-created) session_number on the target cohort. Used by
// "add a session" when the instructor picks a source to copy from. Achievement
// copies start LOCKED. Assumes the target session_number has no achievements yet.
export async function copySessionAchievements(
  supabase: Supa,
  sourceCohortId: string,
  sourceSessionNumber: number,
  targetCohortId: string,
  targetSessionNumber: number
) {
  const { data: sourceAch } = await supabase
    .from("achievements")
    .select("slug, block_number, title, description, xp, proof_type, proof_config, is_secret, is_active, sort_order")
    .eq("cohort_id", sourceCohortId)
    .eq("session_number", sourceSessionNumber);

  if (!sourceAch || sourceAch.length === 0) return;

  const copies = sourceAch.map((a) => ({
    ...a,
    cohort_id: targetCohortId,
    session_number: targetSessionNumber,
    is_unlocked: false,
  }));
  const { error } = await supabase.from("achievements").insert(copies);
  if (error) throw new Error(error.message);
}
