"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DarkBackground from "@/components/DarkBackground";

type View = "choose" | "create" | "join";

const inputClass = "bg-white/10 border border-white/20 text-white placeholder:text-white/30 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent";
const bgStyle = { background: "linear-gradient(135deg, #1e1b4b 0%, #2e1065 40%, #1e3a8a 100%)" };
const cardStyle = { background: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" };

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
      <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={bgStyle}>
        <DarkBackground />
        <div className="relative z-10 w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/">
              <Image src="/assets/logo.png" alt="vibe-xp logo" width={120} height={120} className="mx-auto mb-2 object-contain" style={{ mixBlendMode: "screen" }} />
            </Link>
            <h1 className="text-2xl font-bold text-white">Join or create a team</h1>
            <p className="text-white/50 text-sm mt-1">Join up with your classmates. You earn XP together.</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setView("create")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-4 py-4 text-sm transition-colors cursor-pointer"
            >
              Create a new team
            </button>
            <button
              onClick={() => setView("join")}
              className="text-white/80 font-semibold rounded-xl px-4 py-4 text-sm transition-all border border-white/20 hover:border-white/40 hover:text-white cursor-pointer"
              style={{ background: "rgba(255,255,255,0.08)" }}
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
      <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={bgStyle}>
        <DarkBackground />
        <div className="relative z-10 w-full max-w-sm">
          <button onClick={() => setView("choose")} className="text-white/50 text-sm mb-6 hover:text-white/80 flex items-center gap-1 cursor-pointer">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white mb-1">Name your team</h1>
          <p className="text-white/50 text-sm mb-6">Pick something good — your teammates will see it.</p>

          <div className="rounded-2xl border border-white/15 p-6" style={cardStyle}>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-white/70">Team name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. The Debuggers"
                  required
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-white/70">
                  Team emoji <span className="text-white/30 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  placeholder="e.g. 🚀"
                  className={inputClass}
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
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={bgStyle}>
      <DarkBackground />
      <div className="relative z-10 w-full max-w-sm">
        <button onClick={() => setView("choose")} className="text-white/50 text-sm mb-6 hover:text-white/80 cursor-pointer">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-white mb-1">Enter your team code</h1>
        <p className="text-white/50 text-sm mb-6">Get the code from the person who created the team.</p>

        <div className="rounded-2xl border border-white/15 p-6" style={cardStyle}>
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-white/70">Team code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. NOVA-2847"
                required
                className={`${inputClass} font-mono`}
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
      </div>
    </main>
  );
}
