import { createServerClient } from "@/lib/supabase-server";
import { getInstructorCohort } from "@/lib/cohort";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get("instructor_auth")?.value !== process.env.INSTRUCTOR_PASSCODE) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const cohort = await getInstructorCohort();
  if (!cohort) return NextResponse.json({ error: "Pick a cohort first." }, { status: 400 });

  const { session_id } = await request.json();

  if (!session_id) {
    return NextResponse.json({ error: "Missing session_id." }, { status: 400 });
  }

  const supabase = createServerClient();

  // Active session is now per-cohort: point this cohort at the chosen session.
  const { error } = await supabase
    .from("cohorts")
    .update({ active_session_id: session_id })
    .eq("id", cohort.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("instructor_actions").insert({
    instructor_email: "instructor",
    action: "switch_session",
    note: `Cohort ${cohort.name} → session ${session_id}`,
  });

  return NextResponse.json({ ok: true });
}
