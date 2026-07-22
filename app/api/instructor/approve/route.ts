import { createServerClient } from "@/lib/supabase-server";
import { applyTeamMultiplier } from "@/lib/team-xp";
import { rerankAchievement } from "@/lib/rank-bonus";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get("instructor_auth")?.value !== process.env.INSTRUCTOR_PASSCODE) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { submission_id, action, xp_override, note } = await request.json();

  if (!submission_id || !["approve", "reject", "retract"].includes(action)) {
    return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select("id, team_id, achievement_id, achievements(xp, cohort_id)")
    .eq("id", submission_id)
    .single();

  if (!submission) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  const ach = submission.achievements as unknown as { xp: number; cohort_id: string } | null;

  if (action === "retract") {
    // Keep the row (so it stays visible, tagged "Retracted"), just strip its XP
    // and rank. It leaves the confirmed set, so others re-rank up. The student
    // can resubmit, which reuses this row.
    const { error: retractError } = await supabase
      .from("submissions")
      .update({ status: "retracted", xp_awarded: 0, submission_rank: null, bonus_xp: 0, reviewed_at: new Date().toISOString() })
      .eq("id", submission_id);
    if (retractError) {
      return NextResponse.json({ error: retractError.message }, { status: 500 });
    }
    if (ach?.cohort_id) await rerankAchievement(supabase, submission.achievement_id, ach.cohort_id);

    await supabase.from("instructor_actions").insert({
      instructor_email: "instructor",
      submission_id,
      team_id: submission.team_id,
      action: "retract",
      xp_delta: 0,
      note: note ?? null,
    });
    return NextResponse.json({ ok: true, status: "retracted" });
  }

  const defaultXp = ach?.xp ?? 0;
  const baseXp = action === "approve" ? (xp_override ?? defaultXp) : 0;

  // Base XP only here; the rank bonus (by submit order) is added by the re-rank.
  let xpAwarded = baseXp;
  if (action === "approve" && baseXp > 0) {
    const { count: memberCount } = await supabase
      .from("team_members")
      .select("*", { count: "exact", head: true })
      .eq("team_id", submission.team_id);
    let maxTeamMembers = 3;
    if (ach?.cohort_id) {
      const { data: cohortLimits } = await supabase
        .from("cohorts")
        .select("max_team_members")
        .eq("id", ach.cohort_id)
        .single();
      maxTeamMembers = cohortLimits?.max_team_members ?? 3;
    }
    xpAwarded = applyTeamMultiplier(baseXp, memberCount ?? 1, maxTeamMembers);
  }

  const status = action === "approve" ? "approved" : "rejected";

  const { error: updateError } = await supabase
    .from("submissions")
    .update({
      status,
      xp_awarded: xpAwarded,
      submission_rank: null,
      bonus_xp: 0,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submission_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Re-rank: approving adds this submission (and may bump later submitters down);
  // rejecting removes it from the confirmed set (others move up).
  if (ach?.cohort_id) await rerankAchievement(supabase, submission.achievement_id, ach.cohort_id);

  await supabase.from("instructor_actions").insert({
    instructor_email: "instructor",
    submission_id,
    team_id: submission.team_id,
    action,
    xp_delta: xpAwarded,
    note: note ?? null,
  });

  return NextResponse.json({ ok: true, status, xp_awarded: xpAwarded });
}
