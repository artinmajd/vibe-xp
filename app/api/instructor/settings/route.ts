import { createServerClient } from "@/lib/supabase-server";
import { getInstructorCohort } from "@/lib/cohort";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("instructor_auth")?.value === process.env.INSTRUCTOR_PASSCODE;
}

// PATCH — update a setting on the active cohort (e.g. chat_enabled)
export async function PATCH(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const cohort = await getInstructorCohort();
  if (!cohort) return NextResponse.json({ error: "Pick a cohort first." }, { status: 400 });

  const { chat_enabled } = await request.json() as { chat_enabled?: boolean };
  if (typeof chat_enabled !== "boolean") {
    return NextResponse.json({ error: "Missing chat_enabled boolean." }, { status: 400 });
  }

  const supabase = createServerClient();

  // Chat is now a per-cohort toggle.
  const { error } = await supabase
    .from("cohorts")
    .update({ chat_enabled })
    .eq("id", cohort.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, chat_enabled });
}
