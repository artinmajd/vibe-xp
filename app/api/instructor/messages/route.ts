import { requireInstructor } from "@/lib/require-instructor";
import { createServerClient } from "@/lib/supabase-server";
import { getInstructorCohort } from "@/lib/cohort";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET — every message in the managed cohort (broadcasts + every student's
// private thread), for the Messages tab to group by student client-side.
export async function GET() {
  await requireInstructor();
  const cohort = await getInstructorCohort();
  if (!cohort) return NextResponse.json({ error: "Pick a cohort first." }, { status: 400 });

  const supabase = createServerClient();

  const { data: messages, error } = await supabase
    .from("instructor_messages")
    .select("id, student_id, sender, content, file_url, file_name, file_type, read_by_instructor, created_at")
    .eq("cohort_id", cohort.id)
    .order("created_at", { ascending: true })
    .limit(1000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ messages: messages ?? [] });
}

// POST — send a message. Omit student_id (or pass null) to broadcast to
// every student in the cohort; pass a student_id to send a private message
// to just that one student.
export async function POST(request: Request) {
  await requireInstructor();
  const cohort = await getInstructorCohort();
  if (!cohort) return NextResponse.json({ error: "Pick a cohort first." }, { status: 400 });

  const { student_id, content, file_url, file_name, file_type } = await request.json() as {
    student_id?: string | null;
    content?: string;
    file_url?: string;
    file_name?: string;
    file_type?: string;
  };

  if (!content?.trim() && !file_url) {
    return NextResponse.json({ error: "Message or file required." }, { status: 400 });
  }

  const supabase = createServerClient();

  // If targeting one student, confirm they're actually in this cohort —
  // an instructor should never be able to message across cohorts.
  if (student_id) {
    const { data: student } = await supabase
      .from("students")
      .select("id")
      .eq("id", student_id)
      .eq("cohort_id", cohort.id)
      .maybeSingle();
    if (!student) {
      return NextResponse.json({ error: "That student isn't in this cohort." }, { status: 403 });
    }
  }

  const { error } = await supabase.from("instructor_messages").insert({
    cohort_id: cohort.id,
    student_id: student_id ?? null,
    sender: "instructor",
    content: content?.trim() ?? null,
    file_url: file_url ?? null,
    file_name: file_name ?? null,
    file_type: file_type ?? null,
    read_by_instructor: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

// PATCH — mark one student's messages to the instructor as read (opening
// their thread in the Messages tab clears their unread badge).
export async function PATCH(request: Request) {
  await requireInstructor();
  const cohort = await getInstructorCohort();
  if (!cohort) return NextResponse.json({ error: "Pick a cohort first." }, { status: 400 });

  const { student_id } = await request.json() as { student_id?: string };
  if (!student_id) return NextResponse.json({ error: "Missing student_id." }, { status: 400 });

  const supabase = createServerClient();
  const { error } = await supabase
    .from("instructor_messages")
    .update({ read_by_instructor: true })
    .eq("cohort_id", cohort.id)
    .eq("student_id", student_id)
    .eq("sender", "student")
    .eq("read_by_instructor", false);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
