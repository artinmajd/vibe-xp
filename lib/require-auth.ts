import { createAuthClient } from "@/lib/supabase-auth";
import { redirect } from "next/navigation";

// Call at the top of any server component or route handler that requires login.
// Returns the authenticated user, or redirects to /login.
export async function requireAuth() {
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
