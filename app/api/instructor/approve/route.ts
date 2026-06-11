import { createServerClient } from "@/lib/supabase-server";
import { applyTeamMultiplier } from "@/lib/team-xp";
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
    .select("id, team_id, achievement_id, achievements(xp)")
    .eq("id", submission_id)
    .single();

  if (!submission) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  if (action === "retract") {
    // Remove instructor_actions rows first — their FK references submissions.id
    // and would block the delete if the submission was manually approved.
    await supabase.from("instructor_actions").delete().eq("submission_id", submission_id);

    const { error: deleteError } = await supabase
      .from("submissions")
      .delete()
      .eq("id", submission_id);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, status: "retracted" });
  }

  const defaultXp = (submission.achievements as unknown as { xp: number } | null)?.xp ?? 0;
  const baseXp = action === "approve" ? (xp_override ?? defaultXp) : 0;

  let xpAwarded = baseXp;
  if (action === "approve" && baseXp > 0) {
    const { count: memberCount } = await supabase
      .from("team_members")
      .select("*", { count: "exact", head: true })
      .eq("team_id", submission.team_id);
    xpAwarded = applyTeamMultiplier(baseXp, memberCount ?? 1);
  }

  const status = action === "approve" ? "approved" : "rejected";

  const { error: updateError } = await supabase
    .from("submissions")
    .update({ status, xp_awarded: xpAwarded, reviewed_at: new Date().toISOString() })
    .eq("id", submission_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

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
