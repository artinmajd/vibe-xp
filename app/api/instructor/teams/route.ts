import { requireInstructor } from "@/lib/require-instructor";
import { createServerClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/instructor/teams — update team name and/or emoji
export async function PATCH(req: NextRequest) {
  await requireInstructor();
  const { team_id, name, emoji } = await req.json();
  if (!team_id || !name?.trim()) {
    return NextResponse.json({ error: "team_id and name are required" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("teams")
    .update({ name: name.trim(), emoji: emoji ?? null })
    .eq("id", team_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// POST /api/instructor/teams — reassign a student to a different team
export async function POST(req: NextRequest) {
  await requireInstructor();
  const { student_id, new_team_id } = await req.json();
  if (!student_id || !new_team_id) {
    return NextResponse.json({ error: "student_id and new_team_id are required" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Update students.team_id
  await supabase.from("students").update({ team_id: new_team_id }).eq("id", student_id);

  // Remove from old team_members record
  await supabase.from("team_members").delete().eq("student_id", student_id);

  // Insert into new team
  const { error } = await supabase
    .from("team_members")
    .insert({ student_id, team_id: new_team_id });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
