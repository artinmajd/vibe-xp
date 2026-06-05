import { createServerClient } from "@/lib/supabase-server";
import { createAuthClient } from "@/lib/supabase-auth";
import { NextResponse } from "next/server";

const WORDS = [
  "NOVA", "BOLT", "APEX", "FLUX", "VEGA", "ZION", "ECHO", "HALO",
  "IRIS", "JADE", "KITE", "LYNX", "MIST", "NEON", "ONYX", "PIKE",
  "QUILL", "REEF", "SAGE", "TIDE", "URSA", "VALE", "WAVE", "XENO",
  "YARN", "ZEST", "ARC", "BAY", "CREST", "DAWN",
];

function generateJoinCode(): string {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `${word}-${digits}`;
}

export async function POST(request: Request) {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const { name, emoji } = await request.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Team name is required." }, { status: 400 });
  }

  const supabase = createServerClient();

  // Check student is not already on a team
  const { data: student } = await supabase
    .from("students")
    .select("team_id")
    .eq("id", user.id)
    .single();

  if (student?.team_id) {
    return NextResponse.json({ error: "You're already on a team." }, { status: 400 });
  }

  // Check team limit
  const maxTeams = parseInt(process.env.MAX_TEAMS ?? "5");
  const { count } = await supabase
    .from("teams")
    .select("*", { count: "exact", head: true });

  if ((count ?? 0) >= maxTeams) {
    return NextResponse.json({ error: `Maximum of ${maxTeams} teams allowed.` }, { status: 400 });
  }

  // Generate a unique join code
  let code = generateJoinCode();
  let attempts = 0;
  while (attempts < 10) {
    const { data: existing } = await supabase
      .from("teams")
      .select("id")
      .eq("code", code)
      .maybeSingle();
    if (!existing) break;
    code = generateJoinCode();
    attempts++;
  }

  // Create the team
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({ code, name: name.trim(), emoji: emoji?.trim() || null })
    .select()
    .single();

  if (teamError) {
    if (teamError.code === "23505") {
      return NextResponse.json({ error: "A team with that name already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: teamError.message }, { status: 500 });
  }

  // Add creator as first member
  await supabase.from("team_members").insert({ team_id: team.id, student_id: user.id });

  // Update student's team_id
  await supabase.from("students").update({ team_id: team.id }).eq("id", user.id);

  return NextResponse.json({ team });
}
