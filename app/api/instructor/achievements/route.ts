import { createServerClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("instructor_auth")?.value === process.env.INSTRUCTOR_PASSCODE;
}

// PATCH — update a single achievement's title and/or description
export async function PATCH(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id, title, description } = await request.json();
  if (!id || (!title && description === undefined)) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const supabase = createServerClient();
  const updates: Record<string, string> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;

  const { error } = await supabase
    .from("achievements")
    .update(updates)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// PUT — batch-update sort_order for a list of achievements
export async function PUT(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { updates } = await request.json() as { updates: { id: string; sort_order: number }[] };
  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: "Missing updates." }, { status: 400 });
  }

  const supabase = createServerClient();
  const results = await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from("achievements").update({ sort_order }).eq("id", id)
    )
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
