import { createServerClient } from "@/lib/supabase-server";
import { getInstructorCohort } from "@/lib/cohort";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("instructor_auth")?.value === process.env.INSTRUCTOR_PASSCODE;
}

// POST — create a new achievement in the active cohort's current session.
// New achievements start locked for every cohort (no unlock row == locked).
export async function POST(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const cohort = await getInstructorCohort();
  if (!cohort) return NextResponse.json({ error: "Pick a cohort first." }, { status: 400 });
  if (!cohort.active_session_id) {
    return NextResponse.json({ error: "No active session for this cohort." }, { status: 400 });
  }

  const { title, description, block_number, xp, proof_type, proof_config } = await request.json();
  if (!title?.trim() || !proof_type) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const supabase = createServerClient();
  const session = { id: cohort.active_session_id };

  // Unique slug derived from title (within this cohort) — append -2, -3, … if taken
  const base = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  let slug = base;
  let suffix = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data: existing } = await supabase
      .from("achievements").select("id").eq("slug", slug).eq("cohort_id", cohort.id).maybeSingle();
    if (!existing) break;
    slug = `${base}-${suffix++}`;
  }

  // Place at end of list (highest sort_order for this cohort + session)
  const { data: maxRow } = await supabase
    .from("achievements")
    .select("sort_order")
    .eq("cohort_id", cohort.id)
    .eq("session_number", session.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sort_order = (maxRow?.sort_order ?? 0) + 1;

  const { data: created, error } = await supabase
    .from("achievements")
    .insert({
      cohort_id: cohort.id,
      slug,
      session_number: session.id,
      block_number: block_number ?? 1,
      title: title.trim(),
      description: description?.trim() ?? "",
      xp: xp ?? 5,
      proof_type,
      proof_config: proof_config ?? {},
      is_active: true,
      is_secret: false,
      is_unlocked: false,
      sort_order,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: created.id, slug });
}

// DELETE — remove an achievement (blocked if submissions exist)
export async function DELETE(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const cohort = await getInstructorCohort();
  if (!cohort) return NextResponse.json({ error: "Pick a cohort first." }, { status: 400 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const supabase = createServerClient();

  const { count } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("achievement_id", id);

  if (count && count > 0) {
    return NextResponse.json(
      { error: `${count} submission${count !== 1 ? "s" : ""} exist for this achievement. Retract them first.` },
      { status: 409 }
    );
  }

  // Scope the delete to the managed cohort.
  const { error } = await supabase.from("achievements").delete().eq("id", id).eq("cohort_id", cohort.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// PATCH — update a single achievement's title and/or description
export async function PATCH(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const cohort = await getInstructorCohort();
  if (!cohort) return NextResponse.json({ error: "Pick a cohort first." }, { status: 400 });

  const { id, title, description, block_number } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  const supabase = createServerClient();
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (block_number !== undefined) updates.block_number = block_number;

  const { error } = await supabase
    .from("achievements")
    .update(updates)
    .eq("id", id)
    .eq("cohort_id", cohort.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// PUT — batch-update sort_order for a list of achievements
export async function PUT(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const cohort = await getInstructorCohort();
  if (!cohort) return NextResponse.json({ error: "Pick a cohort first." }, { status: 400 });

  const { updates } = await request.json() as { updates: { id: string; sort_order: number }[] };
  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: "Missing updates." }, { status: 400 });
  }

  const supabase = createServerClient();
  const results = await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from("achievements").update({ sort_order }).eq("id", id).eq("cohort_id", cohort.id)
    )
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
