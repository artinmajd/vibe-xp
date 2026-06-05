"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type PendingSubmission = {
  id: string;
  team_id: string;
  team_name: string;
  student_name: string;
  achievement_title: string;
  achievement_xp: number;
  proof_type: string;
  proof_data: Record<string, unknown>;
  screenshot_url: string | null;
  submitted_at: string;
};

type TeamInfo = {
  id: string;
  name: string;
  emoji: string | null;
  code: string;
  members: string[];
  totalXp: number;
  sessionXp: number;
  levelName: string;
};

type SessionInfo = {
  id: number;
  title: string;
  is_active: boolean;
};

type Props = {
  pending: PendingSubmission[];
  teams: TeamInfo[];
  sessions: SessionInfo[];
  activeSession: SessionInfo | null;
};

type Tab = "pending" | "teams" | "session" | "leaderboard";

export default function InstructorDashboard({ pending, teams, sessions, activeSession }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pending");

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(id);
  }, [router]);
  const [busy, setBusy] = useState<string | null>(null); // id of submission/team being acted on
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [xpOverrides, setXpOverrides] = useState<Record<string, number>>({});
  const [grantAmounts, setGrantAmounts] = useState<Record<string, string>>({});
  const [grantReasons, setGrantReasons] = useState<Record<string, string>>({});

  async function handleApprove(id: string, xpOverride?: number) {
    setBusy(id);
    await fetch("/api/instructor/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submission_id: id, action: "approve", xp_override: xpOverride }),
    });
    setBusy(null);
    router.refresh();
  }

  async function handleReject(id: string) {
    setBusy(id);
    await fetch("/api/instructor/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submission_id: id, action: "reject" }),
    });
    setBusy(null);
    router.refresh();
  }

  async function handleGrantXP(teamId: string, xp: number, reason: string) {
    if (!reason.trim()) return;
    setBusy(teamId);
    await fetch("/api/instructor/grant-xp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team_id: teamId, xp, reason }),
    });
    setGrantAmounts((prev) => ({ ...prev, [teamId]: "" }));
    setGrantReasons((prev) => ({ ...prev, [teamId]: "" }));
    setBusy(null);
    router.refresh();
  }

async function handleSwitchSession(sessionId: number) {
    setBusy(`session-${sessionId}`);
    await fetch("/api/instructor/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });
    setBusy(null);
    router.refresh();
  }

  async function handleLogout() {
    await fetch("/api/instructor/logout", { method: "POST" });
    router.push("/instructor/login");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Instructor Dashboard</h1>
          {activeSession && (
            <p className="text-xs text-zinc-500">Active: Session {activeSession.id} — {activeSession.title}</p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Log out
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800 px-6 flex gap-1">
        {(["pending", "teams", "session", "leaderboard"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-indigo-500 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t === "pending" ? `Pending (${pending.length})` : t === "leaderboard" ? "Leaderboard" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="px-6 py-6 max-w-5xl mx-auto">

        {/* ── Pending submissions ── */}
        {tab === "pending" && (
          <div>
            {pending.length === 0 ? (
              <p className="text-zinc-500 text-sm">No pending submissions. You're all caught up.</p>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Group by team */}
                {Array.from(
                  pending.reduce((map, s) => {
                    if (!map.has(s.team_id)) map.set(s.team_id, { team_name: s.team_name, submissions: [] });
                    map.get(s.team_id)!.submissions.push(s);
                    return map;
                  }, new Map<string, { team_name: string; submissions: PendingSubmission[] }>())
                ).map(([teamId, { team_name, submissions }]) => (
                  <div key={teamId}>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">
                      {team_name} · {submissions.length} pending
                    </p>
                    <div className="flex flex-col gap-3">
                      {submissions.map((s) => (
                        <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-sm">{s.achievement_title}</p>
                              <p className="text-xs text-zinc-500 mt-0.5">
                                {s.student_name} · {new Date(s.submitted_at).toLocaleTimeString()}
                              </p>
                            </div>
                            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded font-mono">{s.proof_type}</span>
                          </div>

                          {/* Proof data preview */}
                          <div className="mb-4">
                            {s.screenshot_url && (
                              <img
                                src={s.screenshot_url}
                                alt="Submission screenshot"
                                onClick={() => setLightbox(s.screenshot_url)}
                                className="rounded-lg max-h-64 object-contain bg-zinc-800 w-full mb-2 cursor-zoom-in"
                              />
                            )}
                            {Object.keys(s.proof_data).length > 0 && (
                              <div className="bg-zinc-800 rounded-lg p-3 text-xs text-zinc-300 font-mono break-all">
                                {Object.entries(s.proof_data).map(([k, v]) => (
                                  <div key={k}><span className="text-zinc-500">{k}:</span> {String(v)}</div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-zinc-500">XP:</span>
                              <input
                                type="number"
                                value={xpOverrides[s.id] ?? s.achievement_xp}
                                onChange={(e) =>
                                  setXpOverrides((prev) => ({ ...prev, [s.id]: parseInt(e.target.value) || 0 }))
                                }
                                className="w-16 bg-zinc-800 text-white rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                            <button
                              disabled={busy === s.id}
                              onClick={() => handleApprove(s.id, xpOverrides[s.id] ?? s.achievement_xp)}
                              className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              disabled={busy === s.id}
                              onClick={() => handleReject(s.id)}
                              className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Teams ── */}
        {tab === "teams" && (
          <div className="flex flex-col gap-6">
            {teams.map((team) => (
              <div key={team.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{team.emoji ?? "🏆"}</span>
                    <div>
                      <p className="font-semibold">{team.name}</p>
                      <p className="text-xs text-zinc-500 font-mono">{team.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-indigo-400 font-bold">{team.totalXp} XP total</p>
                    <p className="text-xs text-zinc-500">{team.sessionXp} session · {team.levelName}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {team.members.map((m) => (
                    <span key={m} className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full">{m}</span>
                  ))}
                  {team.members.length === 0 && <span className="text-xs text-zinc-600">No members yet</span>}
                </div>

                {/* Grant / Deduct XP */}
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="number"
                    placeholder="XP (use − for deduct)"
                    value={grantAmounts[team.id] ?? ""}
                    onChange={(e) => setGrantAmounts((prev) => ({ ...prev, [team.id]: e.target.value }))}
                    className="w-36 bg-zinc-800 text-white rounded px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Reason"
                    value={grantReasons[team.id] ?? ""}
                    onChange={(e) => setGrantReasons((prev) => ({ ...prev, [team.id]: e.target.value }))}
                    className="flex-1 min-w-32 bg-zinc-800 text-white rounded px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    disabled={busy === team.id || !grantAmounts[team.id] || !grantReasons[team.id]}
                    onClick={() =>
                      handleGrantXP(team.id, parseInt(grantAmounts[team.id] ?? "0", 10), grantReasons[team.id] ?? "")
                    }
                    className="bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    Grant XP
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Session controller ── */}
        {tab === "session" && (
          <div>
            <p className="text-sm text-zinc-400 mb-6">
              Switching the active session changes which achievements students see on their dashboard. Only one session can be active at a time.
            </p>
            <div className="flex flex-col gap-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between rounded-xl px-5 py-4 border ${
                    s.is_active
                      ? "bg-indigo-950 border-indigo-700"
                      : "bg-zinc-900 border-zinc-800"
                  }`}
                >
                  <div>
                    <p className={`text-sm font-semibold ${s.is_active ? "text-indigo-300" : "text-white"}`}>
                      Session {s.id} — {s.title}
                    </p>
                    {s.is_active && <p className="text-xs text-indigo-500 mt-0.5">Currently active</p>}
                  </div>
                  {!s.is_active && (
                    <button
                      disabled={busy === `session-${s.id}`}
                      onClick={() => handleSwitchSession(s.id)}
                      className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      {busy === `session-${s.id}` ? "Switching..." : "Make active"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Leaderboard preview ── */}
        {tab === "leaderboard" && (
          <div>
            <p className="text-xs text-zinc-500 mb-3">Live preview — same view as the projector.</p>
            <iframe
              src="/leaderboard?embed=1"
              className="w-full rounded-xl border border-zinc-800"
              style={{ height: "600px" }}
            />
          </div>
        )}

      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 cursor-zoom-out p-4"
        >
          <img
            src={lightbox}
            alt="Full screen screenshot"
            className="max-w-full max-h-full rounded-lg object-contain"
          />
        </div>
      )}
    </main>
  );
}
