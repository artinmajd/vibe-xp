import { createServerClient } from "@/lib/supabase-server";
import DarkBackground from "@/components/DarkBackground";
import Link from "next/link";

export const dynamic = "force-dynamic";

const bgStyle = { background: "linear-gradient(135deg, #1e1b4b 0%, #2e1065 40%, #1e3a8a 100%)" };

export default async function LeaderboardIndexPage() {
  const supabase = createServerClient();

  const { data: cohorts } = await supabase
    .from("cohorts")
    .select("id, name, join_code, created_at")
    .eq("is_archived", false)
    .order("created_at", { ascending: true });

  const list = cohorts ?? [];

  return (
    <main className="min-h-screen text-white flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden" style={bgStyle}>
      <DarkBackground />

      <div className="relative z-10 w-full max-w-md">
        <h1 className="text-3xl font-black tracking-tight mb-2 text-center">Leaderboard</h1>
        <p className="text-white/50 text-sm text-center mb-8">Pick a class to see its standings.</p>

        {list.length === 0 ? (
          <p className="text-white/30 text-center">No classes yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {list.map((c) => (
              <Link
                key={c.id}
                href={`/leaderboard/${c.join_code}`}
                className="flex items-center justify-between px-5 py-4 rounded-2xl border border-white/15 hover:border-white/35 transition-all"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <span className="font-semibold">{c.name}</span>
                <span className="text-xs font-mono text-white/40">{c.join_code}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-white/70 text-sm font-semibold hover:border-white/40 hover:text-white transition-all"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            ← Main Menu
          </Link>
        </div>
      </div>
    </main>
  );
}
