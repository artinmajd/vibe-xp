import { requireInstructor } from "@/lib/require-instructor";
import { createServerClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/instructor/unlock
// body: { action: "release" | "retract" }
//   OR: { action: "toggle", achievement_id: string }
export async function POST(req: NextRequest) {
  await requireInstructor();
  const { action, achievement_id } = await req.json();

  const supabase = createServerClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("is_active", true)
    .maybeSingle();

  if (!session) return NextResponse.json({ error: "No active session" }, { status: 404 });

  // Direct per-achievement toggle — bypasses sequential logic
  if (action === "toggle") {
    if (!achievement_id) return NextResponse.json({ error: "Missing achievement_id" }, { status: 400 });
    const { data: ach } = await supabase
      .from("achievements")
      .select("id, title, is_unlocked")
      .eq("id", achievement_id)
      .single();
    if (!ach) return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
    await supabase.from("achievements").update({ is_unlocked: !ach.is_unlocked }).eq("id", achievement_id);
    return NextResponse.json({ achievement_id: ach.id, title: ach.title, is_unlocked: !ach.is_unlocked });
  }

  const { data: achievements } = await supabase
    .from("achievements")
    .select("id, title, is_unlocked")
    .eq("session_number", session.id)
    .eq("is_secret", false)
    .eq("is_active", true)
    .order("block_number")
    .order("id");

  const list = achievements ?? [];

  if (action === "release") {
    const next = list.find((a) => !a.is_unlocked);
    if (!next) return NextResponse.json({ error: "All achievements already unlocked" }, { status: 400 });
    await supabase.from("achievements").update({ is_unlocked: true }).eq("id", next.id);
    return NextResponse.json({ achievement_id: next.id, title: next.title });
  } else if (action === "retract") {
    const unlocked = list.filter((a) => a.is_unlocked);
    const last = unlocked[unlocked.length - 1];
    if (!last) return NextResponse.json({ error: "Nothing to retract" }, { status: 400 });
    await supabase.from("achievements").update({ is_unlocked: false }).eq("id", last.id);
    return NextResponse.json({ achievement_id: last.id, title: last.title });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
