import { createServerClient } from "@/lib/supabase-server";
import { createAuthClient } from "@/lib/supabase-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("team_id");
  if (!teamId) return NextResponse.json({ error: "Missing team_id." }, { status: 400 });

  const supabase = createServerClient();

  // Verify the requesting student actually belongs to this team.
  const { data: student } = await supabase
    .from("students")
    .select("team_id")
    .eq("id", user.id)
    .single();

  if (student?.team_id !== teamId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { data: messages, error } = await supabase
    .from("team_messages")
    .select("id, student_id, display_name, content, file_url, file_name, file_type, created_at")
    .eq("team_id", teamId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ messages: messages ?? [] });
}

export async function POST(request: Request) {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const supabase = createServerClient();

  // Look up the student — also provides display_name and team membership proof.
  const { data: student } = await supabase
    .from("students")
    .select("team_id, display_name, cohort_id")
    .eq("id", user.id)
    .single();

  if (!student?.team_id) {
    return NextResponse.json({ error: "You're not on a team yet." }, { status: 400 });
  }

  const body = await request.json();
  const { team_id, content, file_url, file_name, file_type } = body as {
    team_id: string;
    content?: string;
    file_url?: string;
    file_name?: string;
    file_type?: string;
  };

  if (team_id !== student.team_id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (!content?.trim() && !file_url) {
    return NextResponse.json({ error: "Empty message." }, { status: 400 });
  }

  // Reject if the student's cohort has chat disabled.
  const { data: cohort } = await supabase
    .from("cohorts")
    .select("chat_enabled")
    .eq("id", student.cohort_id)
    .maybeSingle();

  if (cohort?.chat_enabled === false) {
    return NextResponse.json({ error: "Chat is currently disabled." }, { status: 403 });
  }

  const { error } = await supabase.from("team_messages").insert({
    team_id,
    student_id: user.id,
    display_name: student.display_name,
    content: content?.trim() ?? null,
    file_url: file_url ?? null,
    file_name: file_name ?? null,
    file_type: file_type ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
