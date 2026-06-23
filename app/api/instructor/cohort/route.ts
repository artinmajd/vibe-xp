import { requireInstructor } from "@/lib/require-instructor";
import { createServerClient } from "@/lib/supabase-server";
import { INSTRUCTOR_COHORT_COOKIE } from "@/lib/cohort";
import { NextRequest, NextResponse } from "next/server";

const WORDS = [
  "NOVA", "ORBIT", "PIXEL", "QUEST", "SPARK", "TITAN", "VOLT", "ZENITH",
  "EMBER", "FLARE", "GLYPH", "HYPER", "LUMEN", "MOSAIC", "PRISM", "RALLY",
];

function generateJoinCode(): string {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  const digits = String(Math.floor(100 + Math.random() * 900));
  return `${word}-${digits}`;
}

// GET — list all cohorts (with counts + current session) + the selected id.
export async function GET() {
  await requireInstructor();
  const supabase = createServerClient();

  const { data: cohorts } = await supabase
    .from("cohorts")
    .select("id, name, join_code, active_session_id, chat_enabled, is_archived, created_at")
    .order("created_at", { ascending: true });

  const { data: sessions } = await supabase.from("sessions").select("id, title");
  const sessionTitle = new Map((sessions ?? []).map((s) => [s.id, s.title]));

  const rows = await Promise.all(
    (cohorts ?? []).map(async (c) => {
      const [{ count: studentCount }, { count: teamCount }] = await Promise.all([
        supabase.from("students").select("*", { count: "exact", head: true }).eq("cohort_id", c.id),
        supabase.from("teams").select("*", { count: "exact", head: true }).eq("cohort_id", c.id),
      ]);
      return {
        ...c,
        studentCount: studentCount ?? 0,
        teamCount: teamCount ?? 0,
        activeSessionTitle: c.active_session_id ? sessionTitle.get(c.active_session_id) ?? null : null,
      };
    })
  );

  return NextResponse.json({ cohorts: rows });
}

// POST — { action: "create" | "switch" | "archive" | "unarchive" | "delete", ... }
export async function POST(req: NextRequest) {
  await requireInstructor();
  const body = await req.json();
  const { action } = body as { action?: string };
  const supabase = createServerClient();

  if (action === "switch") {
    const { cohort_id } = body as { cohort_id?: string };
    if (!cohort_id) return NextResponse.json({ error: "Missing cohort_id." }, { status: 400 });

    const { data: cohort } = await supabase
      .from("cohorts")
      .select("id, is_archived")
      .eq("id", cohort_id)
      .maybeSingle();
    if (!cohort || cohort.is_archived) {
      return NextResponse.json({ error: "Cohort not found." }, { status: 404 });
    }

    const res = NextResponse.json({ ok: true, cohort_id });
    res.cookies.set(INSTRUCTOR_COHORT_COOKIE, cohort_id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days — survives between class days
    });
    return res;
  }

  if (action === "create") {
    const { name } = body as { name?: string };
    let { join_code } = body as { join_code?: string };
    if (!name?.trim()) return NextResponse.json({ error: "Cohort name is required." }, { status: 400 });

    // Auto-generate a unique code if none was typed; otherwise normalize theirs.
    if (join_code?.trim()) {
      join_code = join_code.trim().toUpperCase();
    } else {
      join_code = generateJoinCode();
      let attempts = 0;
      while (attempts < 10) {
        const { data: clash } = await supabase
          .from("cohorts").select("id").eq("join_code", join_code).maybeSingle();
        if (!clash) break;
        join_code = generateJoinCode();
        attempts++;
      }
    }

    const { data: created, error } = await supabase
      .from("cohorts")
      .insert({ name: name.trim(), join_code })
      .select("id, name, join_code")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "That join code is already taken." }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, cohort: created });
  }

  if (action === "archive" || action === "unarchive") {
    const { cohort_id } = body as { cohort_id?: string };
    if (!cohort_id) return NextResponse.json({ error: "Missing cohort_id." }, { status: 400 });
    const { error } = await supabase
      .from("cohorts")
      .update({ is_archived: action === "archive" })
      .eq("id", cohort_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    const { cohort_id } = body as { cohort_id?: string };
    if (!cohort_id) return NextResponse.json({ error: "Missing cohort_id." }, { status: 400 });

    // Only empty cohorts can be hard-deleted. Otherwise archive instead.
    const [{ count: studentCount }, { count: teamCount }] = await Promise.all([
      supabase.from("students").select("*", { count: "exact", head: true }).eq("cohort_id", cohort_id),
      supabase.from("teams").select("*", { count: "exact", head: true }).eq("cohort_id", cohort_id),
    ]);
    if ((studentCount ?? 0) > 0 || (teamCount ?? 0) > 0) {
      return NextResponse.json(
        { error: "This cohort still has students or teams. Archive it instead." },
        { status: 409 }
      );
    }

    // Clean up unlock rows, then the cohort.
    await supabase.from("cohort_achievement_unlocks").delete().eq("cohort_id", cohort_id);
    const { error } = await supabase.from("cohorts").delete().eq("id", cohort_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
