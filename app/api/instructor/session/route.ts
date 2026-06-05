import { createServerClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get("instructor_auth")?.value !== process.env.INSTRUCTOR_PASSCODE) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { session_id } = await request.json();

  if (!session_id) {
    return NextResponse.json({ error: "Missing session_id." }, { status: 400 });
  }

  const supabase = createServerClient();

  // Deactivate all sessions first, then activate the target.
  // The partial unique index on is_active=true enforces only one active at a time.
  await supabase.from("sessions").update({ is_active: false }).neq("id", 0);

  const { error } = await supabase
    .from("sessions")
    .update({ is_active: true })
    .eq("id", session_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("instructor_actions").insert({
    instructor_email: "instructor",
    action: "switch_session",
    note: `Switched to session ${session_id}`,
  });

  return NextResponse.json({ ok: true });
}
