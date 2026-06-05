import { createServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { user_id, email, display_name } = await request.json();

  if (!user_id || !email || !display_name) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const supabase = createServerClient();

  const { error } = await supabase.from("students").insert({
    id: user_id,
    email,
    display_name,
    team_id: null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
