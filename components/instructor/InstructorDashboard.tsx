"use client";

import React, { useState, useEffect } from "react";
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

type AchievementRow = {
  id: string;
  title: string;
  description: string;
  xp: number;
  is_unlocked: boolean;
  is_secret: boolean;
  sort_order: number;
};

type Props = {
  pending: PendingSubmission[];
  approved: PendingSubmission[];
  teams: TeamInfo[];
  teamlessStudents: Member[];
  sessions: SessionInfo[];
  activeSession: SessionInfo | null;
  nextAchievement: AchievementPreview | null;
  lastUnlockedAchievement: AchievementPreview | null;
  sessionAchievements: AchievementRow[];
};

type Tab = "submissions" | "teams" | "achievements" | "session" | "leaderboard";
type GroupBy = "team" | "student" | "achievement";

function groupSubmissions(submissions: PendingSubmission[], groupBy: GroupBy): [string, PendingSubmission[]][] {
  const map = new Map<string, PendingSubmission[]>();
  for (const s of submissions) {
    const key = groupBy === "team" ? s.team_name : groupBy === "student" ? s.student_name : s.achievement_title;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return Array.from(map.entries());
}

function SubmissionGroups({
  submissions,
  groupBy,
  renderActions,
  onScreenshot,
  busy,
}: {
  submissions: PendingSubmission[];
  groupBy: GroupBy;
  renderActions: (s: PendingSubmission) => React.ReactNode;
  onScreenshot: (url: string | null) => void;
  busy: string | null;
}) {
  const groups = groupSubmissions(submissions, groupBy);
  return (
    <div className="flex flex-col gap-6">
      {groups.map(([label, subs]) => (
        <div key={label}>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">
            {label} · {subs.length}
          </p>
          <div className="flex flex-col gap-3">
            {subs.map((s) => (
              <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm">{s.achievement_title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {groupBy !== "student" && <>{s.student_name} · </>}
                      {groupBy !== "team" && <>{s.team_name} · </>}
                      {new Date(s.submitted_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded font-mono">{s.proof_type}</span>
                </div>
                <div className="mb-4">
                  {s.screenshot_url && (
                    <img
                      src={s.screenshot_url}
                      alt="Submission screenshot"
                      onClick={() => onScreenshot(s.screenshot_url)}
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
                {renderActions(s)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function InstructorDashboard({ pending, approved, teams, teamlessStudents, sessions, activeSession, nextAchievement, lastUnlockedAchievement, sessionAchievements }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("submissions");
  const [groupBy, setGroupBy] = useState<GroupBy>("team");

  // Achievements tab state
  const [localAchievements, setLocalAchievements] = useState<AchievementRow[]>(sessionAchievements);
  const [editingAchId, setEditingAchId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [achBusy, setAchBusy] = useState<string | null>(null);
  const [dragSrcIdx, setDragSrcIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Sync metadata (title, description, lock state) from server without clobbering local drag order
  React.useEffect(() => {
    setLocalAchievements((prev) => {
      if (prev.length === 0) return sessionAchievements;
      const serverMap = new Map(sessionAchievements.map((a) => [a.id, a]));
      const updated = prev
        .filter((a) => serverMap.has(a.id))
        .map((a) => ({ ...serverMap.get(a.id)!, sort_order: a.sort_order }));
      // Append any brand-new achievements the server added
      const newOnes = sessionAchievements.filter((a) => !prev.some((p) => p.id === a.id));
      return [...updated, ...newOnes];
    });
  }, [sessionAchievements]);

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

  async function handleRetract(id: string) {
    setBusy(id);
    await fetch("/api/instructor/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submission_id: id, action: "retract" }),
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

  async function handleSaveAchievement(id: string) {
    setAchBusy(id);
    await fetch("/api/instructor/achievements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title: editTitle, description: editDesc }),
    });
    setAchBusy(null);
    setEditingAchId(null);
    router.refresh();
  }

  async function handleReorder(newList: AchievementRow[]) {
    const updates = newList.map((a, i) => ({ id: a.id, sort_order: i + 1 }));
    await fetch("/api/instructor/achievements", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    router.refresh();
  }

  async function handleUnlock(action: "release" | "retract") {
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
                <span className="text-zinc-200">Achievements</span>
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
        {(["submissions", "teams", "achievements", "session", "leaderboard"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-indigo-500 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t === "submissions"
              ? `Submissions${pending.length > 0 ? ` (${pending.length} pending)` : ""}`
              : t === "leaderboard"
              ? "Leaderboard"
              : t === "achievements"
              ? "Achievements"
              : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="px-6 py-6 max-w-5xl mx-auto">

        {/* ── Submissions tab ── */}
        {tab === "submissions" && (
          <div>
            {/* Grouping dropdown */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs text-zinc-500">Group by:</span>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                className="bg-zinc-800 text-zinc-200 text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer border border-zinc-700"
              >
                <option value="team">Team</option>
                <option value="student">Student</option>
                <option value="achievement">Achievement</option>
              </select>
            </div>

            {/* ── Pending section ── */}
            <div className="mb-8">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                Pending · {pending.length}
              </h2>
              {pending.length === 0 ? (
                <p className="text-zinc-600 text-sm">Nothing pending. All caught up.</p>
              ) : (
                <SubmissionGroups
                  submissions={pending}
                  groupBy={groupBy}
                  renderActions={(s) => (
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
                        className="cursor-pointer bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        disabled={busy === s.id}
                        onClick={() => handleReject(s.id)}
                        className="cursor-pointer bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  onScreenshot={setLightbox}
                  busy={busy}
                />
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-800 mb-8" />

            {/* ── Approved section ── */}
            <div>
              <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                Approved · {approved.length}
              </h2>
              {approved.length === 0 ? (
                <p className="text-zinc-600 text-sm">No approved submissions yet.</p>
              ) : (
                <SubmissionGroups
                  submissions={approved}
                  groupBy={groupBy}
                  renderActions={(s) => (
                    <button
                      disabled={busy === s.id}
                      onClick={() => handleRetract(s.id)}
                      className="cursor-pointer bg-zinc-800 hover:bg-rose-900 disabled:opacity-50 text-zinc-400 hover:text-rose-300 text-xs font-semibold px-4 py-2 rounded-lg transition-colors border border-zinc-700 hover:border-rose-800"
                    >
                      {busy === s.id ? "Retracting…" : "Retract"}
                    </button>
                  )}
                  onScreenshot={setLightbox}
                  busy={busy}
                />
              )}
            </div>
          </div>
        )}

        {/* ── Achievements ── */}
        {tab === "achievements" && (
          <div>
            {!activeSession ? (
              <p className="text-zinc-500 text-sm">No active session.</p>
            ) : localAchievements.length === 0 ? (
              <p className="text-zinc-500 text-sm">No achievements for this session.</p>
            ) : (
              <>
                <p className="text-xs text-zinc-500 mb-4">
                  Drag rows to reorder. Click <span className="text-zinc-300">Edit</span> to change a title or description — students see changes within 5 seconds.
                </p>
                <div className="flex flex-col gap-2">
                  {localAchievements.map((ach, idx) => (
                    <div
                      key={ach.id}
                      draggable
                      onDragStart={() => setDragSrcIdx(idx)}
                      onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
                      onDragLeave={() => setDragOverIdx(null)}
                      onDrop={() => {
                        setDragOverIdx(null);
                        if (dragSrcIdx === null || dragSrcIdx === idx) { setDragSrcIdx(null); return; }
                        const next = [...localAchievements];
                        const [moved] = next.splice(dragSrcIdx, 1);
                        next.splice(idx, 0, moved);
                        setLocalAchievements(next);
                        setDragSrcIdx(null);
                        handleReorder(next);
                      }}
                      onDragEnd={() => { setDragSrcIdx(null); setDragOverIdx(null); }}
                      className={`bg-zinc-900 border rounded-xl p-4 transition-all ${
                        dragOverIdx === idx && dragSrcIdx !== idx
                          ? "border-indigo-500 scale-[1.01]"
                          : dragSrcIdx === idx
                          ? "border-zinc-600 opacity-50"
                          : "border-zinc-800"
                      }`}
                    >
                      {editingAchId === ach.id ? (
                        /* ── Edit mode ── */
                        <div className="flex flex-col gap-3">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Title"
                            className="bg-zinc-800 text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                          />
                          <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Description"
                            rows={2}
                            className="bg-zinc-800 text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 w-full resize-none"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              disabled={achBusy === ach.id || !editTitle.trim()}
                              onClick={() => handleSaveAchievement(ach.id)}
                              className="cursor-pointer bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                            >
                              {achBusy === ach.id ? "Saving…" : "Save"}
                            </button>
                            <button
                              onClick={() => setEditingAchId(null)}
                              className="cursor-pointer text-zinc-500 hover:text-zinc-300 text-xs px-3 py-2 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── View mode ── */
                        <div className="flex items-start gap-3">
                          {/* Drag handle */}
                          <span className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing mt-0.5 select-none text-lg leading-none">
                            ⠿
                          </span>
                          {/* Lock badge */}
                          <span className="text-base mt-0.5 select-none">{ach.is_unlocked ? "🔓" : "🔒"}</span>
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-white">{ach.title}</p>
                              {ach.is_secret && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">secret</span>
                              )}
                              <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">+{ach.xp} XP</span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5 truncate">{ach.description}</p>
                          </div>
                          <button
                            onClick={() => {
                              setEditingAchId(ach.id);
                              setEditTitle(ach.title);
                              setEditDesc(ach.description);
                            }}
                            className="cursor-pointer shrink-0 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
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

            {/* ── Students without a team ── */}
            {teamlessStudents.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">👤</span>
                  <div>
                    <p className="font-semibold">No Team</p>
                    <p className="text-xs text-zinc-500">{teamlessStudents.length} student{teamlessStudents.length !== 1 ? "s" : ""} unassigned</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {teamlessStudents.map((m) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg min-w-24">{m.name}</span>
                      <select
                        value={reassignTarget[m.id] ?? ""}
                        onChange={(e) => setReassignTarget((prev) => ({ ...prev, [m.id]: e.target.value }))}
                        className="bg-zinc-800 text-zinc-400 text-xs rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="">Assign to…</option>
                        {teams
                          .filter((t) => t.members.length < 3)
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
                          {reassigning === m.id ? "Assigning…" : "Assign"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
