import { requireInstructor } from "@/lib/require-instructor";
import { createServerClient } from "@/lib/supabase-server";
import { getInstructorCohort } from "@/lib/cohort";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/instructor/teams — update the managed cohort's team limits.
// Rejects a limit lower than what already exists (instructor must remove
// teams/members first, then try again).
export async function PUT(req: NextRequest) {
  await requireInstructor();
  const cohort = await getInstructorCohort();
  if (!cohort) return NextResponse.json({ error: "Pick a cohort first." }, { status: 400 });

  const { max_teams, max_team_members } = await req.json() as {
    max_teams?: number;
    max_team_members?: number;
  };

  const supabase = createServerClient();
  const updates: Record<string, number> = {};

  if (max_teams !== undefined) {
    if (!Number.isInteger(max_teams) || max_teams < 1) {
      return NextResponse.json({ error: "Max teams must be a whole number of at least 1." }, { status: 400 });
    }
    const { count: teamCount } = await supabase
      .from("teams")
      .select("*", { count: "exact", head: true })
      .eq("cohort_id", cohort.id);
    if ((teamCount ?? 0) > max_teams) {
      return NextResponse.json(
        { error: `This cohort already has ${teamCount} teams. Remove teams first, then try again.` },
        { status: 409 }
      );
    }
    updates.max_teams = max_teams;
  }

  if (max_team_members !== undefined) {
    if (!Number.isInteger(max_team_members) || max_team_members < 1) {
      return NextResponse.json({ error: "Max team members must be a whole number of at least 1." }, { status: 400 });
    }
    // Every existing team in this cohort must still fit under the new limit.
    const { data: cohortTeams } = await supabase
      .from("teams")
      .select("id, name")
      .eq("cohort_id", cohort.id);
    for (const t of cohortTeams ?? []) {
      const { count: members } = await supabase
        .from("team_members")
        .select("*", { count: "exact", head: true })
        .eq("team_id", t.id);
      if ((members ?? 0) > max_team_members) {
        return NextResponse.json(
          { error: `Team "${t.name}" already has ${members} members. Remove team members first, then try again.` },
          { status: 409 }
        );
      }
    }
    updates.max_team_members = max_team_members;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { error } = await supabase.from("cohorts").update(updates).eq("id", cohort.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, ...updates });
}

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

  // Reject if destination team is already full (cohort-configured limit)
  const { data: destTeam } = await supabase
    .from("teams")
    .select("cohort_id")
    .eq("id", new_team_id)
    .single();
  const { data: destCohort } = destTeam
    ? await supabase.from("cohorts").select("max_team_members").eq("id", destTeam.cohort_id).single()
    : { data: null };
  const maxMembers = destCohort?.max_team_members ?? 3;

  const { count } = await supabase
    .from("team_members")
    .select("*", { count: "exact", head: true })
    .eq("team_id", new_team_id);

  if ((count ?? 0) >= maxMembers) {
    return NextResponse.json({ error: `That team is already full (${count}/${maxMembers}).` }, { status: 409 });
  }

  await supabase.from("students").update({ team_id: new_team_id }).eq("id", student_id);
  await supabase.from("team_members").delete().eq("student_id", student_id);

  const { error } = await supabase
    .from("team_members")
    .insert({ student_id, team_id: new_team_id });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/instructor/teams — kick a student out of their team
export async function DELETE(req: NextRequest) {
  await requireInstructor();
  const { student_id } = await req.json();
  if (!student_id) {
    return NextResponse.json({ error: "student_id is required" }, { status: 400 });
  }

  const supabase = createServerClient();
  await supabase.from("team_members").delete().eq("student_id", student_id);
  const { error } = await supabase.from("students").update({ team_id: null }).eq("id", student_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
