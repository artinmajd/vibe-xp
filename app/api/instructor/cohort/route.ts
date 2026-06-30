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

// Replace the target cohort's achievements with a fresh copy of the source
// cohort's. Copies start LOCKED (is_unlocked = false). Overwrites: any existing
// achievements in the target — and submissions against them — are removed.
async function copyAchievements(
  supabase: ReturnType<typeof createServerClient>,
  sourceCohortId: string,
  targetCohortId: string
) {
  const { data: source } = await supabase
    .from("achievements")
    .select("slug, session_number, block_number, title, description, xp, proof_type, proof_config, is_secret, is_active, sort_order")
    .eq("cohort_id", sourceCohortId);

  // Clear the target: remove submissions tied to its achievements, then the rows.
  const { data: targetAch } = await supabase
    .from("achievements")
    .select("id")
    .eq("cohort_id", targetCohortId);
  const targetAchIds = (targetAch ?? []).map((a) => a.id);
  if (targetAchIds.length > 0) {
    await supabase.from("submissions").delete().in("achievement_id", targetAchIds);
    await supabase.from("achievements").delete().eq("cohort_id", targetCohortId);
  }

  if (source && source.length > 0) {
    const copies = source.map((a) => ({ ...a, cohort_id: targetCohortId, is_unlocked: false }));
    const { error } = await supabase.from("achievements").insert(copies);
    if (error) throw new Error(error.message);
  }
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
    const { name, copy_from_cohort_id } = body as { name?: string; copy_from_cohort_id?: string };
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

    // Optionally seed the new cohort's catalog from an existing one.
    if (copy_from_cohort_id) {
      try {
        await copyAchievements(supabase, copy_from_cohort_id, created.id);
      } catch (e) {
        return NextResponse.json(
          { error: `Cohort created, but copying achievements failed: ${(e as Error).message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true, cohort: created });
  }

  if (action === "copy") {
    const { cohort_id, source_cohort_id } = body as { cohort_id?: string; source_cohort_id?: string };
    if (!cohort_id || !source_cohort_id) {
      return NextResponse.json({ error: "Missing cohort_id or source_cohort_id." }, { status: 400 });
    }
    if (cohort_id === source_cohort_id) {
      return NextResponse.json({ error: "Can't copy a cohort onto itself." }, { status: 400 });
    }
    try {
      await copyAchievements(supabase, source_cohort_id, cohort_id);
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
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

    // Remove the cohort's achievements, then the cohort. (An empty cohort has
    // no teams, so no submissions reference these achievements.)
    await supabase.from("achievements").delete().eq("cohort_id", cohort_id);
    const { error } = await supabase.from("cohorts").delete().eq("id", cohort_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
