import { createServerClient } from "@/lib/supabase-server";
import { createAuthClient } from "@/lib/supabase-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// The logged-in student's confirmed submissions, with the rank bonus they
// earned. The client compares this against what it has already shown to pop a
// snackbar for newly-confirmed ones.
export async function GET() {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ confirmations: [] });

  const supabase = createServerClient();
  const { data } = await supabase
    .from("submissions")
    .select("id, submission_rank, bonus_xp, achievements(title)")
    .eq("student_id", user.id)
    .in("status", ["auto_approved", "approved"])
    .not("submission_rank", "is", null);

  const confirmations = (data ?? []).map((s) => ({
    id: s.id,
    title: (s.achievements as unknown as { title: string } | null)?.title ?? "Achievement",
    rank: s.submission_rank as number,
    bonus: s.bonus_xp as number,
  }));

  return NextResponse.json({ confirmations });
}
