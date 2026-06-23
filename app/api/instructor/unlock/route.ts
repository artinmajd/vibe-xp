import { requireInstructor } from "@/lib/require-instructor";
import { createServerClient } from "@/lib/supabase-server";
import { getInstructorCohort, getUnlockedAchievementIds, setAchievementUnlocked } from "@/lib/cohort";
import { NextRequest, NextResponse } from "next/server";

// POST /api/instructor/unlock
// body: { action: "release" | "retract" | "lock_all" | "unlock_all" }
//   OR: { action: "toggle", achievement_id: string }
//
// Unlock state is per-cohort (cohort_achievement_unlocks). The cohort + its
// current session come from the instructor's cohort cookie.
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
    .select("id, title")
    .eq("session_number", cohort.active_session_id)
    .eq("is_secret", false)
    .eq("is_active", true)
    .order("sort_order")
    .order("id");

  const list = achievements ?? [];
  const unlockedSet = await getUnlockedAchievementIds(cohort.id, list.map((a) => a.id));

  // Direct per-achievement toggle — bypasses sequential logic
  if (action === "toggle") {
    if (!achievement_id) return NextResponse.json({ error: "Missing achievement_id" }, { status: 400 });
    const ach = list.find((a) => a.id === achievement_id)
      ?? (await supabase.from("achievements").select("id, title").eq("id", achievement_id).maybeSingle()).data;
    if (!ach) return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
    const next = !unlockedSet.has(achievement_id);
    await setAchievementUnlocked(cohort.id, achievement_id, next);
    return NextResponse.json({ achievement_id: ach.id, title: ach.title, is_unlocked: next });
  }

  if (action === "release") {
    const next = list.find((a) => !unlockedSet.has(a.id));
    if (!next) return NextResponse.json({ error: "All achievements already unlocked" }, { status: 400 });
    await setAchievementUnlocked(cohort.id, next.id, true);
    return NextResponse.json({ achievement_id: next.id, title: next.title });
  } else if (action === "retract") {
    const unlocked = list.filter((a) => unlockedSet.has(a.id));
    const last = unlocked[unlocked.length - 1];
    if (!last) return NextResponse.json({ error: "Nothing to retract" }, { status: 400 });
    await setAchievementUnlocked(cohort.id, last.id, false);
    return NextResponse.json({ achievement_id: last.id, title: last.title });
  } else if (action === "unlock_all" || action === "lock_all") {
    const target = action === "unlock_all";
    const rows = list.map((a) => ({
      cohort_id: cohort.id,
      achievement_id: a.id,
      is_unlocked: target,
    }));
    if (rows.length > 0) {
      await supabase
        .from("cohort_achievement_unlocks")
        .upsert(rows, { onConflict: "cohort_id,achievement_id" });
    }
    return NextResponse.json({ action });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
