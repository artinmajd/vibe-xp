import { createServerClient } from "@/lib/supabase-server";
import { createAuthClient } from "@/lib/supabase-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET — a student's merged thread with their instructor: every broadcast
// sent to the whole cohort (student_id is null) plus any private messages
// addressed to/from this specific student, in one chronological list.
export async function GET() {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const supabase = createServerClient();

  const { data: student } = await supabase
    .from("students")
    .select("cohort_id")
    .eq("id", user.id)
    .single();

  if (!student?.cohort_id) {
    return NextResponse.json({ messages: [] });
  }

  const { data: messages, error } = await supabase
    .from("instructor_messages")
    .select("id, sender, content, file_url, file_name, file_type, created_at")
    .eq("cohort_id", student.cohort_id)
    .or(`student_id.is.null,student_id.eq.${user.id}`)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ messages: messages ?? [] });
}

// POST — a student messages their instructor. Always tagged with the
// student's own id (there's no such thing as a student broadcast).
export async function POST(request: Request) {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const supabase = createServerClient();

  const { data: student } = await supabase
    .from("students")
    .select("cohort_id")
    .eq("id", user.id)
    .single();

  if (!student?.cohort_id) {
    return NextResponse.json({ error: "You're not in a class yet." }, { status: 400 });
  }

  const { content, file_url, file_name, file_type } = await request.json() as {
    content?: string;
    file_url?: string;
    file_name?: string;
    file_type?: string;
  };

  if (!content?.trim() && !file_url) {
    return NextResponse.json({ error: "Empty message." }, { status: 400 });
  }

  const { error } = await supabase.from("instructor_messages").insert({
    cohort_id: student.cohort_id,
    student_id: user.id,
    sender: "student",
    content: content?.trim() ?? null,
    file_url: file_url ?? null,
    file_name: file_name ?? null,
    file_type: file_type ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
