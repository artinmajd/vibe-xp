"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DarkBackground from "@/components/DarkBackground";

type TeamRow = {
  teamId: string;
  name: string;
  emoji: string | null;
  sessionXp: number;
  totalXp: number;
  level: number;
  levelName: string;
  xpToNext: number | null;
};

type LeaderboardData = {
  teams: TeamRow[];
  session: { id: number; title: string } | null;
};

const RANK_COLORS = [
  "text-yellow-400",
  "text-zinc-300",
  "text-amber-500",
  "text-white/40",
  "text-white/40",
];

const LEVEL_COLORS: Record<string, string> = {
  "Builder":          "bg-white/10 text-white/60",
  "Creator":          "bg-blue-500/20 text-blue-300",
  "Inventor":         "bg-violet-500/20 text-violet-300",
  "Engineer":         "bg-indigo-500/20 text-indigo-300",
  "Architect":        "bg-emerald-500/20 text-emerald-300",
  "Founder":          "bg-orange-500/20 text-orange-300",
  "AI Master Builder":"bg-yellow-500/20 text-yellow-300",
};

const bgStyle = { background: "linear-gradient(135deg, #1e1b4b 0%, #2e1065 40%, #1e3a8a 100%)" };

function LeaderboardInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = (searchParams.get("view") ?? "total") as "total" | "session";

  const [data, setData] = useState<LeaderboardData | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const prevOrderRef = useRef<string[]>([]);

  const fetchLeaderboard = useCallback(async () => {
    const res = await fetch(`/api/leaderboard?view=${view}`);
    if (!res.ok) return;
    const newData: LeaderboardData = await res.json();

    const newOrder = newData.teams.map((t) => t.teamId);
    const prev = prevOrderRef.current;
    if (prev.length > 0) {
      const movers = newOrder.filter(
        (id, idx) => prev.indexOf(id) !== -1 && prev.indexOf(id) !== idx
      );
      if (movers.length > 0) {
        setHighlightedIds(new Set(movers));
        setTimeout(() => setHighlightedIds(new Set()), 2000);
      }
    }
    prevOrderRef.current = newOrder;
    setData(newData);
  }, [view]);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  function toggleView() {
    router.push(`/leaderboard?view=${view === "total" ? "session" : "total"}`);
  }

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center relative overflow-hidden" style={bgStyle}>
        <DarkBackground />
        <p className="relative z-10 text-white/40 text-xl">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white flex flex-col px-8 py-10 relative overflow-hidden" style={bgStyle}>
      <DarkBackground />

      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Leaderboard</h1>
            {data.session && (
              <p className="text-white/50 text-lg mt-1">
                Session {data.session.id} — {data.session.title}
              </p>
            )}
          </div>
          <button
            onClick={toggleView}
            className="cursor-pointer text-sm text-white/70 px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 hover:text-white transition-all"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            Showing: {view === "total" ? "Total XP" : "Session XP"}
          </button>
        </div>

        {/* Teams */}
        {data.teams.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/30 text-2xl">No teams yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 flex-1">
            {data.teams.map((team, idx) => {
              const isHighlighted = highlightedIds.has(team.teamId);
              const xp = view === "session" ? team.sessionXp : team.totalXp;

              return (
                <div
                  key={team.teamId}
                  className={`flex items-center gap-6 rounded-2xl px-8 py-6 border transition-all duration-500 ${
                    isHighlighted
                      ? "border-indigo-400/60 scale-[1.01]"
                      : idx === 0
                      ? "border-yellow-500/30"
                      : "border-white/10"
                  }`}
                  style={{
                    background: isHighlighted
                      ? "rgba(99,102,241,0.25)"
                      : idx === 0
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(30,27,75,0.75)",
                    backdropFilter: idx === 0 ? "blur(20px)" : undefined,
                  }}
                >
                  {/* Rank */}
                  <span className={`text-5xl font-black w-16 text-center ${RANK_COLORS[idx] ?? "text-white/30"}`}>
                    {idx + 1}
                  </span>

                  {/* Emoji + name */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="text-4xl">{team.emoji ?? "🏆"}</span>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold truncate">{team.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border border-white/10 ${LEVEL_COLORS[team.levelName] ?? "bg-white/10 text-white/50"}`}>
                          {team.levelName}
                        </span>
                        {team.xpToNext !== null && (
                          <span className="text-xs text-white/30">
                            {team.xpToNext} XP to next level
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right shrink-0">
                    <p className="text-4xl font-black text-white">{xp}</p>
                    <p className="text-sm text-white/40">XP</p>
                    {view === "total" && (
                      <p className="text-xs text-white/25 mt-1">
                        {team.sessionXp} this session
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-white/20 text-xs mt-8">
          Updates every 5 seconds
        </p>
      </div>
    </main>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #2e1065 40%, #1e3a8a 100%)" }}>
        <DarkBackground />
        <p className="relative z-10 text-white/40 text-xl">Loading...</p>
      </main>
    }>
      <LeaderboardInner />
    </Suspense>
  );
}
