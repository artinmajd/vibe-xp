import { requireInstructor } from "@/lib/require-instructor";
import { createServerClient } from "@/lib/supabase-server";
import { getInstructorCohort, copySessionAchievements } from "@/lib/cohort";
import { NextRequest, NextResponse } from "next/server";

// GET /api/instructor/sessions?cohort_id=X — list a cohort's sessions.
// Used by the "Add Session" copy-picker to show a chosen source cohort's
// sessions (any instructor-visible cohort, not just the one being managed).
export async function GET(req: NextRequest) {
  await requireInstructor();
  const cohortId = req.nextUrl.searchParams.get("cohort_id");
  if (!cohortId) return NextResponse.json({ error: "Missing cohort_id." }, { status: 400 });

  const supabase = createServerClient();
  const { data: sessions } = await supabase
    .from("sessions")
    .select("session_number, title")
    .eq("cohort_id", cohortId)
    .order("session_number");

  return NextResponse.json({ sessions: sessions ?? [] });
}

// POST /api/instructor/sessions — add a session to the managed cohort.
// body: { title: string, source_cohort_id?: string, source_session_number?: number }
// New session_number is (current max for this cohort) + 1, or 1 if none yet.
// If a source is given, that session's achievements are copied in (locked).
export async function POST(req: NextRequest) {
  await requireInstructor();
  const cohort = await getInstructorCohort();
  if (!cohort) return NextResponse.json({ error: "Pick a cohort first." }, { status: 400 });

  const { title, source_cohort_id, source_session_number } = await req.json() as {
    title?: string;
    source_cohort_id?: string;
    source_session_number?: number;
  };
  if (!title?.trim()) return NextResponse.json({ error: "Title is required." }, { status: 400 });

  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("sessions")
    .select("session_number")
    .eq("cohort_id", cohort.id)
    .order("session_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextNumber = (existing?.session_number ?? 0) + 1;

  const { data: created, error } = await supabase
    .from("sessions")
    .insert({ cohort_id: cohort.id, session_number: nextNumber, title: title.trim() })
    .select("session_number, title")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (source_cohort_id && source_session_number !== undefined) {
    try {
      await copySessionAchievements(supabase, source_cohort_id, source_session_number, cohort.id, nextNumber);
    } catch (e) {
      return NextResponse.json(
        { error: `Session created, but copying achievements failed: ${(e as Error).message}` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true, session: created });
}

// PUT /api/instructor/sessions — reorder the managed cohort's sessions.
// body: { ordered_session_ids: string[] } — every session id for this
// cohort, in the new desired order. Renumbering cascades to achievements'
// session_number and the cohort's active_session_id in one atomic DB call.
export async function PUT(req: NextRequest) {
  await requireInstructor();
  const cohort = await getInstructorCohort();
  if (!cohort) return NextResponse.json({ error: "Pick a cohort first." }, { status: 400 });

  const { ordered_session_ids } = await req.json() as { ordered_session_ids?: string[] };
  if (!Array.isArray(ordered_session_ids) || ordered_session_ids.length === 0) {
    return NextResponse.json({ error: "Missing ordered_session_ids." }, { status: 400 });
  }

  const supabase = createServerClient();

  const { count } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("cohort_id", cohort.id);
  if (count !== ordered_session_ids.length) {
    return NextResponse.json(
      { error: "The reorder list doesn't match this cohort's current sessions. Refresh and try again." },
      { status: 400 }
    );
  }

  const { error } = await supabase.rpc("reorder_cohort_sessions", {
    p_cohort_id: cohort.id,
    p_ordered_ids: ordered_session_ids,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

// DELETE /api/instructor/sessions — remove a session from the managed cohort.
// body: { session_number: number }
// Blocked if any submissions exist against that session's achievements.
export async function DELETE(req: NextRequest) {
  await requireInstructor();
  const cohort = await getInstructorCohort();
  if (!cohort) return NextResponse.json({ error: "Pick a cohort first." }, { status: 400 });

  const { session_number } = await req.json() as { session_number?: number };
  if (session_number === undefined) {
    return NextResponse.json({ error: "Missing session_number." }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: achievements } = await supabase
    .from("achievements")
    .select("id")
    .eq("cohort_id", cohort.id)
    .eq("session_number", session_number);
  const achIds = (achievements ?? []).map((a) => a.id);

  if (achIds.length > 0) {
    const { count } = await supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .in("achievement_id", achIds);
    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: `${count} submission${count !== 1 ? "s" : ""} exist for this session. Remove them first, then try again.` },
        { status: 409 }
      );
    }
    await supabase.from("achievements").delete().eq("cohort_id", cohort.id).eq("session_number", session_number);
  }

  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("cohort_id", cohort.id)
    .eq("session_number", session_number);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If this was the active session, clear it — instructor picks a new one.
  if (cohort.active_session_id === session_number) {
    await supabase.from("cohorts").update({ active_session_id: null }).eq("id", cohort.id);
  }

  return NextResponse.json({ ok: true });
}
