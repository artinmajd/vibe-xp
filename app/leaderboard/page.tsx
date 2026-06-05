"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

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
  "text-amber-600",
  "text-zinc-500",
  "text-zinc-500",
];

const LEVEL_COLORS: Record<string, string> = {
  "Builder": "bg-zinc-700 text-zinc-300",
  "Creator": "bg-blue-900 text-blue-300",
  "Inventor": "bg-purple-900 text-purple-300",
  "Engineer": "bg-indigo-900 text-indigo-300",
  "Architect": "bg-green-900 text-green-300",
  "Founder": "bg-orange-900 text-orange-300",
  "AI Master Builder": "bg-yellow-900 text-yellow-300",
};

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

    // Detect rank changes and highlight movers
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
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500 text-xl">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col px-8 py-10">

      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Leaderboard</h1>
          {data.session && (
            <p className="text-zinc-400 text-lg mt-1">
              Session {data.session.id} — {data.session.title}
            </p>
          )}
        </div>
        <button
          onClick={toggleView}
          className="text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg transition-colors"
        >
          Showing: {view === "total" ? "Total XP" : "Session XP"}
        </button>
      </div>

      {/* Teams */}
      {data.teams.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-600 text-2xl">No teams yet.</p>
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
                    ? "bg-indigo-950 border-indigo-500 scale-[1.01]"
                    : idx === 0
                    ? "bg-zinc-900 border-yellow-700"
                    : "bg-zinc-900 border-zinc-800"
                }`}
              >
                {/* Rank */}
                <span className={`text-5xl font-black w-16 text-center ${RANK_COLORS[idx] ?? "text-zinc-500"}`}>
                  {idx + 1}
                </span>

                {/* Emoji + name */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="text-4xl">{team.emoji ?? "🏆"}</span>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold truncate">{team.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[team.levelName] ?? "bg-zinc-700 text-zinc-300"}`}>
                        {team.levelName}
                      </span>
                      {team.xpToNext !== null && (
                        <span className="text-xs text-zinc-500">
                          {team.xpToNext} XP to next level
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* XP */}
                <div className="text-right shrink-0">
                  <p className="text-4xl font-black text-indigo-400">{xp}</p>
                  <p className="text-sm text-zinc-500">XP</p>
                  {view === "total" && (
                    <p className="text-xs text-zinc-600 mt-1">
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
      <p className="text-center text-zinc-700 text-xs mt-8">
        Updates every 5 seconds
      </p>
    </main>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500 text-xl">Loading...</p>
      </main>
    }>
      <LeaderboardInner />
    </Suspense>
  );
}
