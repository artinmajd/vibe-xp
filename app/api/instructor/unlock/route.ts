import { requireInstructor } from "@/lib/require-instructor";
import { createServerClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/instructor/unlock
// body: { action: "release" | "retract" }
export async function POST(req: NextRequest) {
  await requireInstructor();
  const { action } = await req.json();

  const supabase = createServerClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("id, unlocked_through")
    .eq("is_active", true)
    .maybeSingle();

  if (!session) return NextResponse.json({ error: "No active session" }, { status: 404 });

  const { data: blocks } = await supabase
    .from("achievements")
    .select("block_number")
    .eq("session_number", session.id)
    .eq("is_secret", false)
    .order("block_number");

  const distinctBlocks = [...new Set((blocks ?? []).map((a) => a.block_number))];
  const current = session.unlocked_through ?? 0;

  let next: number;

  if (action === "release") {
    const nextBlock = distinctBlocks.find((b) => b > current);
    if (nextBlock === undefined) return NextResponse.json({ error: "All blocks already unlocked" }, { status: 400 });
    next = nextBlock;
  } else if (action === "retract") {
    const prevBlocks = distinctBlocks.filter((b) => b <= current);
    prevBlocks.pop(); // remove the current highest
    next = prevBlocks.length > 0 ? prevBlocks[prevBlocks.length - 1] : 0;
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await supabase.from("sessions").update({ unlocked_through: next }).eq("id", session.id);

  return NextResponse.json({ unlocked_through: next });
}
