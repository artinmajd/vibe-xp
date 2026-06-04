import { createClient } from "@supabase/supabase-js";

// Browser-safe client using the anon key — for Supabase Auth only.
// Never use this for direct database reads or writes.
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
