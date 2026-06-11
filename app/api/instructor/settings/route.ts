import { createServerClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("instructor_auth")?.value === process.env.INSTRUCTOR_PASSCODE;
}

// PATCH — update a setting on the active session (e.g. chat_enabled)
export async function PATCH(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { chat_enabled } = await request.json() as { chat_enabled?: boolean };
  if (typeof chat_enabled !== "boolean") {
    return NextResponse.json({ error: "Missing chat_enabled boolean." }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("is_active", true)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ error: "No active session." }, { status: 400 });
  }

  const { error } = await supabase
    .from("sessions")
    .update({ chat_enabled })
    .eq("id", session.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, chat_enabled });
}
