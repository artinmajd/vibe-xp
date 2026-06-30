import { requireInstructor } from "@/lib/require-instructor";
import { createServerClient } from "@/lib/supabase-server";
import { getInstructorCohort } from "@/lib/cohort";
import { NextRequest, NextResponse } from "next/server";

// POST /api/instructor/unlock
// body: { action: "release" | "retract" | "lock_all" | "unlock_all" }
//   OR: { action: "toggle", achievement_id: string }
//
// Achievements are per-cohort; is_unlocked lives on the row. Everything here
// is scoped to the instructor's cohort and its current session.
export async function POST(req: NextRequest) {
  await requireInstructor();

  const cohort = await getInstructorCohort();
  if (!cohort) return NextResponse.json({ error: "Pick a cohort first." }, { status: 400 });
  if (!cohort.active_session_id) {
    return NextResponse.json({ error: "No active session for this cohort." }, { status: 404 });
  }

  const { action, achievement_id } = await req.json();
  const supabase = createServerClient();

  // Order by sort_order to match the instructor page's "next/last" preview.
  const { data: achievements } = await supabase
    .from("achievements")
    .select("id, title, is_unlocked")
    .eq("cohort_id", cohort.id)
    .eq("session_number", cohort.active_session_id)
    .eq("is_secret", false)
    .eq("is_active", true)
    .order("sort_order")
    .order("id");

  const list = achievements ?? [];

  // Direct per-achievement toggle — bypasses sequential logic
  if (action === "toggle") {
    if (!achievement_id) return NextResponse.json({ error: "Missing achievement_id" }, { status: 400 });
    const ach = list.find((a) => a.id === achievement_id)
      ?? (await supabase.from("achievements").select("id, title, is_unlocked").eq("id", achievement_id).eq("cohort_id", cohort.id).maybeSingle()).data;
    if (!ach) return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
    const next = !ach.is_unlocked;
    await supabase.from("achievements").update({ is_unlocked: next }).eq("id", achievement_id).eq("cohort_id", cohort.id);
    return NextResponse.json({ achievement_id: ach.id, title: ach.title, is_unlocked: next });
  }

  if (action === "release") {
    const next = list.find((a) => !a.is_unlocked);
    if (!next) return NextResponse.json({ error: "All achievements already unlocked" }, { status: 400 });
    await supabase.from("achievements").update({ is_unlocked: true }).eq("id", next.id).eq("cohort_id", cohort.id);
    return NextResponse.json({ achievement_id: next.id, title: next.title });
  } else if (action === "retract") {
    const unlocked = list.filter((a) => a.is_unlocked);
    const last = unlocked[unlocked.length - 1];
    if (!last) return NextResponse.json({ error: "Nothing to retract" }, { status: 400 });
    await supabase.from("achievements").update({ is_unlocked: false }).eq("id", last.id).eq("cohort_id", cohort.id);
    return NextResponse.json({ achievement_id: last.id, title: last.title });
  } else if (action === "unlock_all" || action === "lock_all") {
    await supabase
      .from("achievements")
      .update({ is_unlocked: action === "unlock_all" })
      .eq("cohort_id", cohort.id)
      .eq("session_number", cohort.active_session_id)
      .eq("is_active", true);
    return NextResponse.json({ action });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
