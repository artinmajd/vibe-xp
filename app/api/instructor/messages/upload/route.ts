import { requireInstructor } from "@/lib/require-instructor";
import { createServerClient } from "@/lib/supabase-server";
import { MAX_UPLOAD_BYTES, ALLOWED_UPLOAD_TYPES, UPLOAD_TYPE_ERROR } from "@/lib/upload-constraints";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await requireInstructor();

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large. Max 10 MB." }, { status: 400 });
  }

  if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
    return NextResponse.json({ error: UPLOAD_TYPE_ERROR }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `messages/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = createServerClient();
  const { error } = await supabase.storage
    .from("screenshots")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage
    .from("screenshots")
    .getPublicUrl(path);

  return NextResponse.json({ url: publicUrl, name: file.name, type: file.type });
}
