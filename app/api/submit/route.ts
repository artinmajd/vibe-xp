import { createServerClient } from "@/lib/supabase-server";
import { createAuthClient } from "@/lib/supabase-auth";
import { runValidator } from "@/lib/dispatch-validator";
import { applyTeamMultiplier } from "@/lib/team-xp";
import { Achievement } from "@/lib/types";
import { calcTotalQuizXP, QuizQuestion, QuizAnswer } from "@/lib/quiz-xp";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const { achievement_slug, proof_data, screenshot_url } = await request.json();

  if (!achievement_slug) {
    return NextResponse.json({ error: "Missing achievement_slug." }, { status: 400 });
  }

  const supabase = createServerClient();

  // Look up student and team
  const { data: student } = await supabase
    .from("students")
    .select("team_id")
    .eq("id", user.id)
    .single();

  if (!student?.team_id) {
    return NextResponse.json({ error: "You're not on a team yet." }, { status: 400 });
  }

  const teamId = student.team_id;

  // Team size at this moment — used for fairness multiplier
  const { count: memberCount } = await supabase
    .from("team_members")
    .select("*", { count: "exact", head: true })
    .eq("team_id", teamId);

  // Load achievement
  const { data: achievement } = await supabase
    .from("achievements")
    .select("*")
    .eq("slug", achievement_slug)
    .eq("is_active", true)
    .single();

  if (!achievement) {
    return NextResponse.json({ error: "Achievement not found." }, { status: 404 });
  }

  // Check for existing submission by this student
  const { data: existing } = await supabase
    .from("submissions")
    .select("id, status, xp_awarded")
    .eq("student_id", user.id)
    .eq("achievement_id", achievement.id)
    .maybeSingle();

  if (existing && existing.status !== "rejected") {
    return NextResponse.json(
      { error: "You already submitted this one.", already_done: true },
      { status: 409 }
    );
  }

  // Run validator
  const validationResult = await runValidator(
    achievement as Achievement,
    proof_data ?? {},
    screenshot_url ?? null,
    teamId,
    supabase
  );

  // Determine status and XP
  const isInstructorFlag = achievement.proof_type === "instructor_flag";
  const isQuiz = achievement.proof_type === "quiz";
  let status: string;
  let xpAwarded: number;

  if (isInstructorFlag) {
    status = "pending";
    xpAwarded = 0;
  } else if (validationResult.valid) {
    status = "auto_approved";
    if (isQuiz) {
      const config = achievement.proof_config as { questions: QuizQuestion[] };
      const answers = (proof_data?.answers ?? []) as QuizAnswer[];
      xpAwarded = calcTotalQuizXP(config.questions ?? [], answers);
    } else {
      xpAwarded = achievement.xp;
    }
    xpAwarded = applyTeamMultiplier(xpAwarded, memberCount ?? 1);
  } else {
    return NextResponse.json({ error: validationResult.reason }, { status: 422 });
  }

  // Insert or update (if resubmitting after rejection)
  const { error: insertError } = existing
    ? await supabase.from("submissions").update({
        student_id: user.id,
        proof_data: proof_data ?? {},
        screenshot_url: screenshot_url ?? null,
        status,
        xp_awarded: xpAwarded,
        reviewed_at: null,
      }).eq("id", existing.id)
    : await supabase.from("submissions").insert({
        team_id: teamId,
        student_id: user.id,
        achievement_id: achievement.id,
        proof_data: proof_data ?? {},
        screenshot_url: screenshot_url ?? null,
        status,
        xp_awarded: xpAwarded,
      });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "You already submitted this one.", already_done: true },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    status,
    xp_awarded: xpAwarded,
    message: xpAwarded > 0 ? `Nice — +${xpAwarded} XP.` : "Submitted! Your instructor will review it.",
    newly_unlocked: [],
  });
}
