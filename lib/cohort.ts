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

// Read the per-cohort unlock state for a set of achievements as a Set of
// unlocked achievement ids. Missing row == locked.
export async function getUnlockedAchievementIds(
  cohortId: string,
  achievementIds: string[]
): Promise<Set<string>> {
  if (achievementIds.length === 0) return new Set();
  const supabase = createServerClient();
  const { data } = await supabase
    .from("cohort_achievement_unlocks")
    .select("achievement_id, is_unlocked")
    .eq("cohort_id", cohortId)
    .eq("is_unlocked", true)
    .in("achievement_id", achievementIds);

  return new Set((data ?? []).map((r) => r.achievement_id));
}

// Set a single achievement's unlock state for a cohort (upsert).
export async function setAchievementUnlocked(
  cohortId: string,
  achievementId: string,
  isUnlocked: boolean
): Promise<void> {
  const supabase = createServerClient();
  await supabase
    .from("cohort_achievement_unlocks")
    .upsert(
      { cohort_id: cohortId, achievement_id: achievementId, is_unlocked: isUnlocked },
      { onConflict: "cohort_id,achievement_id" }
    );
}
