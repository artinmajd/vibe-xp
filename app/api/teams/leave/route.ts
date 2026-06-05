import { createServerClient } from "@/lib/supabase-server";
import { createAuthClient } from "@/lib/supabase-auth";
import { NextResponse } from "next/server";

export async function POST() {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const supabase = createServerClient();

  // Remove from team_members
  await supabase.from("team_members").delete().eq("student_id", user.id);

  // Clear team_id on student — submissions stay intact, they belong to the team
  await supabase.from("students").update({ team_id: null }).eq("id", user.id);

  return NextResponse.json({ ok: true });
}
