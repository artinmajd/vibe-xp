import { createServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { user_id, email, display_name, class_code } = await request.json();

  if (!user_id || !email || !display_name) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!class_code?.trim()) {
    return NextResponse.json({ error: "Enter the class code your instructor gave you." }, { status: 400 });
  }

  const supabase = createServerClient();

  // Resolve the class code to a cohort. Codes are case-insensitive.
  const { data: cohort } = await supabase
    .from("cohorts")
    .select("id, is_archived")
    .eq("join_code", class_code.trim().toUpperCase())
    .maybeSingle();

  if (!cohort || cohort.is_archived) {
    return NextResponse.json({ error: "That class code didn't match. Double-check it with your instructor." }, { status: 404 });
  }

  const { error } = await supabase.from("students").insert({
    id: user_id,
    email,
    display_name,
    team_id: null,
    cohort_id: cohort.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
