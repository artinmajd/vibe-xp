import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { passcode } = await request.json();

  if (!passcode || passcode !== process.env.INSTRUCTOR_PASSCODE) {
    return NextResponse.json({ error: "Wrong passcode." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("instructor_auth", passcode, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours — one class session
  });

  return response;
}
