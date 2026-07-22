import { createServerClient } from "@/lib/supabase-server";
import { createAuthClient } from "@/lib/supabase-auth";
import { NextResponse } from "next/server";

async function autoAwardTeamNames(supabase: ReturnType<typeof createServerClient>, teamId: string, cohortId: string) {
  // "team-names" is per-cohort now — scope the lookup to this team's cohort.
  const { data: achievement } = await supabase
    .from("achievements")
    .select("id, xp")
    .eq("slug", "team-names")
    .eq("cohort_id", cohortId)
    .maybeSingle();

  if (!achievement) return;

  // Award to every team member individually
  const { data: members } = await supabase
    .from("team_members")
    .select("student_id")
    .eq("team_id", teamId);

  for (const member of members ?? []) {
    const { data: existing } = await supabase
      .from("submissions")
      .select("id")
      .eq("student_id", member.student_id)
      .eq("achievement_id", achievement.id)
      .maybeSingle();

    if (existing) continue;

    await supabase.from("submissions").insert({
      team_id: teamId,
      student_id: member.student_id,
      achievement_id: achievement.id,
      proof_data: {},
      status: "auto_approved",
      xp_awarded: achievement.xp,
    });
  }
}

export async function POST(request: Request) {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const { code } = await request.json();

  if (!code?.trim()) {
    return NextResponse.json({ error: "Join code is required." }, { status: 400 });
  }

  const supabase = createServerClient();

  // Check student is not already on a team
  const { data: student } = await supabase
    .from("students")
    .select("team_id, cohort_id")
    .eq("id", user.id)
    .single();

  if (student?.team_id) {
    return NextResponse.json({ error: "You're already on a team." }, { status: 400 });
  }

  // Look up the team by code
  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  if (!team) {
    return NextResponse.json({ error: "Team not found. Double-check the code." }, { status: 404 });
  }

  // A student can only join a team in their own class.
  if (team.cohort_id !== student?.cohort_id) {
    return NextResponse.json({ error: "That team is in a different class." }, { status: 400 });
  }

  // Team size limit is configured per cohort.
  const { data: cohortRow } = await supabase
    .from("cohorts")
    .select("max_team_members")
    .eq("id", team.cohort_id)
    .single();
  const maxMembers = cohortRow?.max_team_members ?? 3;

  // Check current member count
  const { count } = await supabase
    .from("team_members")
    .select("*", { count: "exact", head: true })
    .eq("team_id", team.id);

  if ((count ?? 0) >= maxMembers) {
    return NextResponse.json({ error: `This team already has ${maxMembers} members.` }, { status: 400 });
  }

  const { error: memberError } = await supabase
    .from("team_members")
    .insert({ team_id: team.id, student_id: user.id });

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  // Update student's team_id
  await supabase.from("students").update({ team_id: team.id }).eq("id", user.id);

  // Auto-award team-names when the team reaches the cohort's max (team complete)
  const newCount = (count ?? 0) + 1;
  if (newCount === maxMembers) {
    await autoAwardTeamNames(supabase, team.id, team.cohort_id);
  }

  return NextResponse.json({ team });
}
