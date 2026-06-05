import { requireAuth } from "@/lib/require-auth";
import { createServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await requireAuth();
  const supabase = createServerClient();

  const { data: student } = await supabase
    .from("students")
    .select("*, teams(*)")
    .eq("id", user.id)
    .single();

  if (!student?.team_id) {
    redirect("/team-setup");
  }

  const team = student.teams as { name: string; emoji: string | null; code: string };

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">{team.emoji ?? "🏆"}</p>
        <h1 className="text-2xl font-bold mb-1">{team.name}</h1>
        <p className="text-zinc-400 text-sm mb-2">Join code: <span className="font-mono text-indigo-400">{team.code}</span></p>
        <p className="text-zinc-500 text-sm mb-8">Signed in as {student.display_name}</p>
        <a href="/logout" className="text-indigo-400 hover:underline text-sm">Log out</a>
      </div>
    </main>
  );
}
