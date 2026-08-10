import { requireInstructor } from "@/lib/require-instructor";
import { createServerClient } from "@/lib/supabase-server";
import { getInstructorCohort } from "@/lib/cohort";
import { generateJoinCode } from "@/lib/team-codes";
import { NextRequest, NextResponse } from "next/server";

// POST /api/instructor/teams/create — create a new, empty team in the
// managed cohort. Mirrors the student-facing create flow (same code
// generation, same name/emoji fields, same max_teams limit) but skips
// team_members/students side effects — there's no "creator" here, members
// are added afterward via the existing reassign flow.
export async function POST(req: NextRequest) {
  await requireInstructor();
  const cohort = await getInstructorCohort();
  if (!cohort) return NextResponse.json({ error: "Pick a cohort first." }, { status: 400 });

  const { name, emoji } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Team name is required." }, { status: 400 });
  }

  const supabase = createServerClient();

  const { count } = await supabase
    .from("teams")
    .select("*", { count: "exact", head: true })
    .eq("cohort_id", cohort.id);

  if ((count ?? 0) >= cohort.max_teams) {
    return NextResponse.json({ error: `Maximum of ${cohort.max_teams} teams allowed.` }, { status: 400 });
  }

  // Generate a unique join code
  let code = generateJoinCode();
  let attempts = 0;
  while (attempts < 10) {
    const { data: existing } = await supabase.from("teams").select("id").eq("code", code).maybeSingle();
    if (!existing) break;
    code = generateJoinCode();
    attempts++;
  }

  const { data: team, error } = await supabase
    .from("teams")
    .insert({ code, name: name.trim(), emoji: emoji?.trim() || null, cohort_id: cohort.id })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "A team with that name already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, team });
}
