"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type View = "choose" | "create" | "join";

export default function TeamSetupPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("choose");

  // Create team state
  const [teamName, setTeamName] = useState("");
  const [emoji, setEmoji] = useState("");

  // Join team state
  const [code, setCode] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/teams/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: teamName, emoji }),
    });

    const body = await res.json();

    if (!res.ok) {
      setError(body.error ?? "Something broke. Try again, or grab an instructor.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/teams/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const body = await res.json();

    if (!res.ok) {
      setError(body.error ?? "Something broke. Try again, or grab an instructor.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  if (view === "choose") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-2">Join or create a team</h1>
          <p className="text-zinc-400 text-sm mb-8">Teams are 3 people. You earn XP together.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setView("create")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors"
            >
              Create a new team
            </button>
            <button
              onClick={() => setView("join")}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors"
            >
              Join an existing team
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (view === "create") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-sm">
          <button onClick={() => setView("choose")} className="text-zinc-500 text-sm mb-6 hover:text-zinc-300">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white mb-2">Name your team</h1>
          <p className="text-zinc-400 text-sm mb-8">Pick something good — your teammates will see it.</p>

          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-zinc-300">Team name</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. The Debuggers"
                required
                className="bg-zinc-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-zinc-300">Team emoji <span className="text-zinc-500">(optional)</span></label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="e.g. 🚀"
                className="bg-zinc-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors"
            >
              {loading ? "Creating team..." : "Create team"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <button onClick={() => setView("choose")} className="text-zinc-500 text-sm mb-6 hover:text-zinc-300">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-white mb-2">Enter your team code</h1>
        <p className="text-zinc-400 text-sm mb-8">Get the code from the person who created the team.</p>

        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-300">Team code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. NOVA-2847"
              required
              className="bg-zinc-800 text-white rounded-lg px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors"
          >
            {loading ? "Joining..." : "Join team"}
          </button>
        </form>
      </div>
    </main>
  );
}
