import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";

// Browser-safe client using the anon key — for Supabase Auth only.
// Uses @supabase/ssr so the session is stored in cookies (readable server-side).
// Never use this for direct database reads or writes.
export function createBrowserClient() {
  return createSSRBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
