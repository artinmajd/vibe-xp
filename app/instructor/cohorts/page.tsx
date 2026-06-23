import { requireInstructor } from "@/lib/require-instructor";
import { createServerClient } from "@/lib/supabase-server";
import { INSTRUCTOR_COHORT_COOKIE } from "@/lib/cohort";
import { cookies } from "next/headers";
import CohortManager from "@/components/instructor/CohortManager";

export const dynamic = "force-dynamic";

export default async function CohortsPage() {
  await requireInstructor();
  const supabase = createServerClient();

  const cookieStore = await cookies();
  const selectedCohortId = cookieStore.get(INSTRUCTOR_COHORT_COOKIE)?.value ?? null;

  const { data: cohorts } = await supabase
    .from("cohorts")
    .select("id, name, join_code, active_session_id, chat_enabled, is_archived, created_at")
    .order("created_at", { ascending: true });

  const { data: sessions } = await supabase.from("sessions").select("id, title");
  const sessionTitle = new Map((sessions ?? []).map((s) => [s.id, s.title]));

  const rows = await Promise.all(
    (cohorts ?? []).map(async (c) => {
      const [{ count: studentCount }, { count: teamCount }] = await Promise.all([
        supabase.from("students").select("*", { count: "exact", head: true }).eq("cohort_id", c.id),
        supabase.from("teams").select("*", { count: "exact", head: true }).eq("cohort_id", c.id),
      ]);
      return {
        id: c.id,
        name: c.name,
        join_code: c.join_code,
        active_session_id: c.active_session_id,
        chat_enabled: c.chat_enabled,
        is_archived: c.is_archived,
        studentCount: studentCount ?? 0,
        teamCount: teamCount ?? 0,
        activeSessionTitle: c.active_session_id ? sessionTitle.get(c.active_session_id) ?? null : null,
      };
    })
  );

  // If the selected cohort was archived/deleted, treat as none selected.
  const stillValid = rows.some((r) => r.id === selectedCohortId && !r.is_archived);

  return <CohortManager cohorts={rows} selectedCohortId={stillValid ? selectedCohortId : null} />;
}
