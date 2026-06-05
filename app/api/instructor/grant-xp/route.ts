import { createServerClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get("instructor_auth")?.value !== process.env.INSTRUCTOR_PASSCODE) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { team_id, xp, reason } = await request.json();

  if (!team_id || xp === undefined || !reason) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const supabase = createServerClient();

  const { error } = await supabase.from("manual_xp_grants").insert({
    team_id,
    xp,
    reason,
    granted_by: "instructor",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("instructor_actions").insert({
    instructor_email: "instructor",
    team_id,
    action: xp >= 0 ? "grant_xp" : "deduct_xp",
    xp_delta: xp,
    note: reason,
  });

  return NextResponse.json({ ok: true });
}
