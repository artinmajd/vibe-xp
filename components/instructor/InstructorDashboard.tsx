"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Member = { id: string; name: string };

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
  members: Member[];
  totalXp: number;
  sessionXp: number;
  levelName: string;
};

type SessionInfo = {
  id: number;
  title: string;
  is_active: boolean;
  unlocked_through: number;
};

type AchievementPreview = { id: string; title: string };

type Props = {
  pending: PendingSubmission[];
  teams: TeamInfo[];
  sessions: SessionInfo[];
  activeSession: SessionInfo | null;
  nextAchievement: AchievementPreview | null;
  lastUnlockedAchievement: AchievementPreview | null;
};

type Tab = "pending" | "teams" | "session" | "leaderboard";

export default function InstructorDashboard({ pending, teams, sessions, activeSession, nextAchievement, lastUnlockedAchievement }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pending");

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(id);
  }, [router]);

  const [busy, setBusy] = useState<string | null>(null);
  const [unlockMenuOpen, setUnlockMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [xpOverrides, setXpOverrides] = useState<Record<string, number>>({});
  const [grantAmounts, setGrantAmounts] = useState<Record<string, string>>({});
  const [grantReasons, setGrantReasons] = useState<Record<string, string>>({});

  // Team editing
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [reassigning, setReassigning] = useState<string | null>(null);
  const [reassignTarget, setReassignTarget] = useState<Record<string, string>>({});
  const [kicking, setKicking] = useState<string | null>(null);

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

  async function handleSaveTeam(teamId: string) {
    setBusy(`edit-${teamId}`);
    await fetch("/api/instructor/teams", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team_id: teamId, name: editName, emoji: editEmoji }),
    });
    setBusy(null);
    setEditingTeam(null);
    router.refresh();
  }

  async function handleReassign(studentId: string) {
    const newTeamId = reassignTarget[studentId];
    if (!newTeamId) return;
    setReassigning(studentId);
    await fetch("/api/instructor/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: studentId, new_team_id: newTeamId }),
    });
    setReassigning(null);
    setReassignTarget((prev) => { const n = { ...prev }; delete n[studentId]; return n; });
    router.refresh();
  }

  async function handleKick(studentId: string) {
    setKicking(studentId);
    await fetch("/api/instructor/teams", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: studentId }),
    });
    setKicking(null);
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

  async function handleUnlock(action: "release" | "retract") {
    setUnlockMenuOpen(false);
    setBusy(`unlock-${action}`);
    await fetch("/api/instructor/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(null);
    router.refresh();
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

        <div className="flex items-center gap-3">
          {/* Unlock controls */}
          {activeSession && (
            <div className="relative">
              <button
                onClick={() => setUnlockMenuOpen((o) => !o)}
                className="cursor-pointer flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800 transition-all"
              >
                <span>{lastUnlockedAchievement ? "🔓" : "🔒"}</span>
                <span className="text-zinc-200 max-w-[160px] truncate">
                  {lastUnlockedAchievement
                    ? lastUnlockedAchievement.title
                    : "All locked"}
                </span>
                <span className="text-zinc-500 text-xs">▾</span>
              </button>

              {unlockMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUnlockMenuOpen(false)} />
                  <div className="absolute right-0 mt-1 w-72 rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl z-20 overflow-hidden">
                    {/* Release Next */}
                    <button
                      onClick={() => handleUnlock("release")}
                      disabled={busy === "unlock-release" || !nextAchievement}
                      className="cursor-pointer w-full text-left px-4 py-3.5 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-b border-zinc-800"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-emerald-400">Release Next</span>
                        <span className="text-xs text-zinc-500">unlock →</span>
                      </div>
                      <div className="mt-1 text-sm text-zinc-200 truncate">
                        {nextAchievement ? nextAchievement.title : "Nothing left to unlock"}
                      </div>
                    </button>
                    {/* Retract Last */}
                    <button
                      onClick={() => handleUnlock("retract")}
                      disabled={busy === "unlock-retract" || !lastUnlockedAchievement}
                      className="cursor-pointer w-full text-left px-4 py-3.5 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-rose-400">Retract Last</span>
                        <span className="text-xs text-zinc-500">← lock</span>
                      </div>
                      <div className="mt-1 text-sm text-zinc-200 truncate">
                        {lastUnlockedAchievement ? lastUnlockedAchievement.title : "Nothing to retract"}
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            onClick={handleLogout}
            className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Log out
          </button>
        </div>
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

                {/* Header — view or edit mode */}
                {editingTeam === team.id ? (
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="text"
                      value={editEmoji}
                      onChange={(e) => setEditEmoji(e.target.value)}
                      placeholder="Emoji"
                      className="w-14 bg-zinc-800 text-white rounded px-2 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 text-center"
                    />
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Team name"
                      className="flex-1 bg-zinc-800 text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      disabled={busy === `edit-${team.id}` || !editName.trim()}
                      onClick={() => handleSaveTeam(team.id)}
                      className="bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                    >
                      {busy === `edit-${team.id}` ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingTeam(null)}
                      className="text-zinc-500 hover:text-zinc-300 text-xs px-2 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{team.emoji ?? "🏆"}</span>
                      <div>
                        <p className="font-semibold">{team.name}</p>
                        <p className="text-xs text-zinc-500 font-mono">{team.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-indigo-400 font-bold">{team.totalXp} XP total</p>
                        <p className="text-xs text-zinc-500">{team.sessionXp} session · {team.levelName}</p>
                      </div>
                      <button
                        onClick={() => { setEditingTeam(team.id); setEditName(team.name); setEditEmoji(team.emoji ?? ""); }}
                        className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}

                {/* Members with reassign controls */}
                <div className="flex flex-col gap-2 mb-4">
                  {team.members.length === 0 && <span className="text-xs text-zinc-600">No members yet</span>}
                  {team.members.map((m) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg min-w-24">{m.name}</span>
                      <select
                        value={reassignTarget[m.id] ?? ""}
                        onChange={(e) => setReassignTarget((prev) => ({ ...prev, [m.id]: e.target.value }))}
                        className="bg-zinc-800 text-zinc-400 text-xs rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="">Move to…</option>
                        {teams
                          .filter((t) => t.id !== team.id && t.members.length < 3)
                          .map((t) => (
                            <option key={t.id} value={t.id}>{t.emoji ?? "🏆"} {t.name}</option>
                          ))}
                      </select>
                      {reassignTarget[m.id] && (
                        <button
                          disabled={reassigning === m.id}
                          onClick={() => handleReassign(m.id)}
                          className="bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          {reassigning === m.id ? "Moving…" : "Move"}
                        </button>
                      )}
                      <button
                        disabled={kicking === m.id}
                        onClick={() => handleKick(m.id)}
                        className="ml-auto text-xs bg-zinc-800 hover:bg-red-900 disabled:opacity-50 text-zinc-500 hover:text-red-300 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {kicking === m.id ? "Kicking…" : "Kick"}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Grant / Deduct XP */}
                <div className="flex items-center gap-2 flex-wrap border-t border-zinc-800 pt-4">
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
