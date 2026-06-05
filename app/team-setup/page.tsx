"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type View = "choose" | "create" | "join";

export default function TeamSetupPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("choose");

  const [teamName, setTeamName] = useState("");
  const [emoji, setEmoji] = useState("");
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
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 mb-4 shadow">
              <span className="text-xl">⚡</span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Join or create a team</h1>
            <p className="text-slate-500 text-sm mt-1">Teams are 3 people. You earn XP together.</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setView("create")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-4 py-4 text-sm transition-colors shadow-sm"
            >
              Create a new team
            </button>
            <button
              onClick={() => setView("join")}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl px-4 py-4 text-sm transition-colors border border-slate-200 shadow-sm"
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
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <button onClick={() => setView("choose")} className="text-slate-500 text-sm mb-6 hover:text-slate-700 flex items-center gap-1">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Name your team</h1>
          <p className="text-slate-500 text-sm mb-6">Pick something good — your teammates will see it.</p>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Team name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. The Debuggers"
                  required
                  className="bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Team emoji <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  placeholder="e.g. 🚀"
                  className="bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors"
              >
                {loading ? "Creating team..." : "Create team"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <button onClick={() => setView("choose")} className="text-slate-500 text-sm mb-6 hover:text-slate-700">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Enter your team code</h1>
        <p className="text-slate-500 text-sm mb-6">Get the code from the person who created the team.</p>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Team code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. NOVA-2847"
                required
                className="bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors"
            >
              {loading ? "Joining..." : "Join team"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
