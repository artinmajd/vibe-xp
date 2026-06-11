import { createServerClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("instructor_auth")?.value === process.env.INSTRUCTOR_PASSCODE;
}

export async function POST(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json() as {
    content?: string;
    file_url?: string;
    file_name?: string;
    file_type?: string;
  };

  const content = body.content?.trim() || "";
  const file_url = body.file_url?.trim() || null;

  if (!content && !file_url) {
    return NextResponse.json({ error: "Message or file required." }, { status: 400 });
  }

  const supabase = createServerClient();

  const { error } = await supabase.from("instructor_broadcasts").insert({
    content,
    file_url,
    file_name: body.file_name?.trim() || null,
    file_type: body.file_type?.trim() || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
