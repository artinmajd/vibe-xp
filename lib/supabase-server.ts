import { createClient } from "@supabase/supabase-js";

// Server-only client using the service-role key — bypasses RLS.
// Never import this in a 'use client' file or any browser-facing code.
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
