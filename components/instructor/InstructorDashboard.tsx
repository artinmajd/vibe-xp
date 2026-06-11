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

type NewQuestion = {
  question: string;
  options: string[];
  correct_index: number;
  xp: number;
};

type AchievementRow = {
  id: string;
  title: string;
  description: string;
  xp: number;
  is_unlocked: boolean;
  is_secret: boolean;
  sort_order: number;
  block_number: number;
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
  chatEnabled: boolean;
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
                  {(() => {
                    const urls: string[] = Array.isArray(s.proof_data.screenshot_urls)
                      ? (s.proof_data.screenshot_urls as string[])
                      : s.screenshot_url
                      ? [s.screenshot_url]
                      : [];
                    return urls.length > 0 ? (
                      <div className={`grid gap-2 mb-2 ${urls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                        {urls.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt={`Screenshot ${i + 1}`}
                            onClick={() => onScreenshot(url)}
                            className="rounded-lg max-h-48 object-contain bg-zinc-800 w-full cursor-zoom-in"
                          />
                        ))}
                      </div>
                    ) : null;
                  })()}
                  {(() => {
                    const displayData = Object.fromEntries(
                      Object.entries(s.proof_data).filter(([k]) => k !== "screenshot_urls")
                    );
                    if (Object.keys(displayData).length === 0) return null;

                    // Flatten one level: { values: { "Field": "Answer" } } → individual rows
                    const rows: { label: string; value: string }[] = [];
                    for (const [k, v] of Object.entries(displayData)) {
                      if (v !== null && typeof v === "object" && !Array.isArray(v)) {
                        for (const [subK, subV] of Object.entries(v as Record<string, unknown>)) {
                          rows.push({ label: subK, value: String(subV) });
                        }
                      } else if (Array.isArray(v)) {
                        rows.push({ label: k, value: (v as unknown[]).join(", ") });
                      } else {
                        rows.push({ label: k, value: String(v) });
                      }
                    }

                    return (
                      <div className="bg-zinc-800 rounded-lg p-3 text-xs text-zinc-300 font-mono break-all">
                        {rows.map(({ label, value }) => (
                          <div key={label}><span className="text-zinc-500">{label}:</span> {value}</div>
                        ))}
                      </div>
                    );
                  })()}
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

export default function InstructorDashboard({ pending, approved, teams, teamlessStudents, sessions, activeSession, nextAchievement, lastUnlockedAchievement, sessionAchievements, chatEnabled: initialChatEnabled }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("submissions");
  const [chatEnabled, setChatEnabled] = useState(initialChatEnabled);
  const [groupBy, setGroupBy] = useState<GroupBy>("team");

  // Achievements tab state
  const [localAchievements, setLocalAchievements] = useState<AchievementRow[]>(sessionAchievements);
  const [editingAchId, setEditingAchId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editBlock, setEditBlock] = useState(1);

  // Create form state
  const [creating, setCreating] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newBlock, setNewBlock] = useState(1);
  const [newXp, setNewXp] = useState(5);
  const [newFormType, setNewFormType] = useState("screenshot");
  const [newNeedsApproval, setNewNeedsApproval] = useState(true);
  // Type-specific config state
  const [newMinWords, setNewMinWords] = useState(0);
  const [newChecklistItems, setNewChecklistItems] = useState<string[]>(["Item 1"]);
  const [newFieldNames, setNewFieldNames] = useState<string[]>(["Field 1"]);
  const [newCompositeItems, setNewCompositeItems] = useState<string[]>(["Item 1"]);
  const [newQuestions, setNewQuestions] = useState<NewQuestion[]>([
    { question: "", options: ["", ""], correct_index: 0, xp: 5 },
  ]);
  const [achBusy, setAchBusy] = useState<string | null>(null);
  // Per-block drag state — prevents cross-block drops corrupting sort_order
  const [dragInfo, setDragInfo] = useState<{ blockNum: number; idx: number } | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<{ blockNum: number; idx: number } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    const res = await fetch("/api/instructor/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submission_id: id, action: "retract" }),
    });
    setBusy(null);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(body.error ?? "Retract failed — check the console.");
      return;
    }
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

  async function handleToggleLock(id: string) {
    setAchBusy(id);
    await fetch("/api/instructor/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", achievement_id: id }),
    });
    setAchBusy(null);
    router.refresh();
  }

  async function handleSaveAchievement(id: string) {
    setAchBusy(id);
    await fetch("/api/instructor/achievements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title: editTitle, description: editDesc, block_number: editBlock }),
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

  // Achievements grouped by block_number, sorted by block number.
  // Recalculated whenever localAchievements changes.
  const achievementBlocks = React.useMemo(() => {
    const blockMap = new Map<number, AchievementRow[]>();
    for (const a of localAchievements) {
      if (!blockMap.has(a.block_number)) blockMap.set(a.block_number, []);
      blockMap.get(a.block_number)!.push(a);
    }
    return Array.from(blockMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([blockNum, items]) => ({ blockNum, items }));
  }, [localAchievements]);

  function handleBlockDrop(blockNum: number, dropIdx: number) {
    if (!dragInfo || dragInfo.blockNum !== blockNum || dragInfo.idx === dropIdx) {
      setDragInfo(null);
      setDragOverInfo(null);
      return;
    }
    const blockItems = localAchievements.filter((a) => a.block_number === blockNum);
    const reordered = [...blockItems];
    const [moved] = reordered.splice(dragInfo.idx, 1);
    reordered.splice(dropIdx, 0, moved);

    // Rebuild flat list: blocks in ascending block_number order, each block in its new order.
    // This keeps sort_orders block-clustered after reassignment (1..k for block 1, k+1..m for block 2, …).
    const sortedBlockNums = Array.from(new Set(localAchievements.map((a) => a.block_number))).sort((a, b) => a - b);
    const newFlatList: AchievementRow[] = [];
    for (const bn of sortedBlockNums) {
      if (bn === blockNum) {
        newFlatList.push(...reordered);
      } else {
        newFlatList.push(...localAchievements.filter((a) => a.block_number === bn));
      }
    }

    setLocalAchievements(newFlatList);
    setDragInfo(null);
    setDragOverInfo(null);
    handleReorder(newFlatList);
  }

  async function handleDeleteAchievement(id: string) {
    setDeleteError(null);
    setAchBusy(id);
    const res = await fetch("/api/instructor/achievements", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setAchBusy(null);
    setConfirmDeleteId(null);
    if (!res.ok) {
      const body = await res.json();
      setDeleteError(body.error ?? "Delete failed.");
    } else {
      router.refresh();
    }
  }

  function resetCreateForm() {
    setCreating(false);
    setNewTitle("");
    setNewDesc("");
    setNewBlock(1);
    setNewXp(5);
    setNewFormType("screenshot");
    setNewNeedsApproval(true);
    setNewMinWords(0);
    setNewChecklistItems(["Item 1"]);
    setNewFieldNames(["Field 1"]);
    setNewCompositeItems(["Item 1"]);
    setNewQuestions([{ question: "", options: ["", ""], correct_index: 0, xp: 5 }]);
  }

  async function handleCreateAchievement() {
    if (!newTitle.trim()) return;
    setCreateBusy(true);

    // Build type-specific config extras
    function buildExtra(): Record<string, unknown> {
      if (newFormType === "text") return { min_words: newMinWords };
      if (newFormType === "checklist") return { items: newChecklistItems.filter((i) => i.trim()) };
      if (newFormType === "fields") return { fields: newFieldNames.filter((f) => f.trim()) };
      if (newFormType === "composite") return {
        require: ["screenshot", "checklist"],
        items: newCompositeItems.filter((i) => i.trim()),
      };
      return {};
    }

    let proof_type: string;
    let proof_config: Record<string, unknown>;
    let xp = newXp;

    if (newFormType === "quiz") {
      proof_type = "quiz";
      proof_config = { questions: newQuestions };
      xp = newQuestions.reduce((sum, q) => sum + q.xp, 0);
    } else if (newNeedsApproval) {
      proof_type = "instructor_flag";
      proof_config = { form_type: newFormType, ...buildExtra() };
    } else {
      proof_type = newFormType;
      proof_config = buildExtra();
    }

    const res = await fetch("/api/instructor/achievements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim(),
        description: newDesc.trim(),
        block_number: newBlock,
        xp,
        proof_type,
        proof_config,
      }),
    });

    setCreateBusy(false);
    if (res.ok) {
      resetCreateForm();
      router.refresh();
    }
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

  async function handleToggleChat() {
    const next = !chatEnabled;
    setChatEnabled(next);
    const res = await fetch("/api/instructor/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_enabled: next }),
    });
    if (!res.ok) setChatEnabled(!next); // revert on failure
  }

  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastBusy, setBroadcastBusy] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);
  const [broadcastPendingFile, setBroadcastPendingFile] = useState<{ url: string; name: string; type: string } | null>(null);
  const broadcastFileRef = React.useRef<HTMLInputElement>(null);

  async function handleBroadcastFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBroadcastError(null);
    setBroadcastBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/instructor/broadcasts/upload", { method: "POST", body: fd });
    const body = await res.json();
    setBroadcastBusy(false);
    e.target.value = "";
    if (!res.ok) { setBroadcastError(body.error ?? "Upload failed."); return; }
    setBroadcastPendingFile({ url: body.url, name: body.name, type: body.type });
  }

  async function handleBroadcast() {
    if ((!broadcastText.trim() && !broadcastPendingFile) || broadcastBusy) return;
    setBroadcastBusy(true);
    setBroadcastError(null);
    const res = await fetch("/api/instructor/broadcasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: broadcastText.trim() || null,
        file_url: broadcastPendingFile?.url ?? null,
        file_name: broadcastPendingFile?.name ?? null,
        file_type: broadcastPendingFile?.type ?? null,
      }),
    });
    setBroadcastBusy(false);
    if (res.ok) {
      setBroadcastText("");
      setBroadcastPendingFile(null);
      setBroadcastSent(true);
      setTimeout(() => setBroadcastSent(false), 2000);
    } else {
      const body = await res.json();
      setBroadcastError(body.error ?? "Failed to send.");
    }
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
          {/* Chat toggle */}
          {activeSession && (
            <button
              onClick={handleToggleChat}
              className="cursor-pointer flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-all"
              style={chatEnabled
                ? { borderColor: "rgb(63,63,70)", background: "rgb(9,9,11)", color: "rgb(161,161,170)" }
                : { borderColor: "rgb(239,68,68,0.5)", background: "rgba(239,68,68,0.08)", color: "rgb(252,165,165)" }
              }
            >
              <span>{chatEnabled ? "💬" : "🔇"}</span>
              <span>Chat {chatEnabled ? "On" : "Off"}</span>
            </button>
          )}

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

      {/* Broadcast bar */}
      <div className="border-b border-zinc-800 px-6 py-3 flex flex-col gap-2" style={{ background: "rgba(251,191,36,0.04)" }}>
        <div className="flex items-center gap-3">
          <span className="text-base shrink-0" title="Broadcast to all students">📢</span>
          <input
            type="text"
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleBroadcast(); } }}
            placeholder="Broadcast a message to all students…"
            className="flex-1 bg-zinc-900 border border-zinc-700 focus:border-amber-500/50 text-white placeholder-zinc-600 rounded-lg px-3 py-2 text-sm outline-none transition-colors"
          />
          <input
            ref={broadcastFileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
            className="hidden"
            onChange={handleBroadcastFileChange}
          />
          <button
            onClick={() => broadcastFileRef.current?.click()}
            disabled={broadcastBusy}
            title="Attach file"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800 transition-colors disabled:opacity-40"
          >
            <span className="text-base">📎</span>
          </button>
          <button
            onClick={handleBroadcast}
            disabled={(!broadcastText.trim() && !broadcastPendingFile) || broadcastBusy}
            className="shrink-0 text-xs font-semibold px-4 py-2 rounded-lg transition-all disabled:opacity-40"
            style={{
              background: broadcastSent ? "rgba(34,197,94,0.2)" : "rgba(251,191,36,0.15)",
              border: `1px solid ${broadcastSent ? "rgba(34,197,94,0.4)" : "rgba(251,191,36,0.3)"}`,
              color: broadcastSent ? "rgb(134,239,172)" : "rgb(253,230,138)",
            }}
          >
            {broadcastBusy ? "Sending…" : broadcastSent ? "✓ Sent" : "Send"}
          </button>
        </div>

        {/* Pending file preview */}
        {broadcastPendingFile && (
          <div className="ml-8 flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-500/20 bg-amber-500/5">
            {broadcastPendingFile.type.startsWith("image/") ? (
              <img src={broadcastPendingFile.url} alt="preview" className="h-10 w-16 object-cover rounded" />
            ) : (
              <span className="text-lg">📎</span>
            )}
            <span className="text-xs text-amber-200/70 truncate flex-1" style={{ maxWidth: "300px" }}>
              {broadcastPendingFile.name}
            </span>
            <button
              onClick={() => setBroadcastPendingFile(null)}
              className="text-zinc-500 hover:text-zinc-300 text-sm leading-none"
            >
              ×
            </button>
          </div>
        )}

        {broadcastError && (
          <div className="ml-8 flex items-center justify-between text-xs text-rose-400 px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5">
            <span>{broadcastError}</span>
            <button onClick={() => setBroadcastError(null)} className="text-rose-600 hover:text-rose-400 ml-3">×</button>
          </div>
        )}
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
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs text-zinc-500">
                    Drag rows to reorder within a block. Use <span className="text-zinc-300">Edit</span> to change title, description, or move to a different block.
                  </p>
                  {!creating && (
                    <button
                      onClick={() => setCreating(true)}
                      className="cursor-pointer shrink-0 ml-4 text-xs font-semibold bg-indigo-700 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      + New Achievement
                    </button>
                  )}
                </div>

                {/* ── Create form ── */}
                {creating && (
                  <div className="bg-zinc-900 border border-indigo-600/40 rounded-xl p-5 mb-6">
                    <p className="text-sm font-bold text-white mb-4">New Achievement</p>

                    <div className="flex flex-col gap-3">
                      {/* Title */}
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Title"
                        className="bg-zinc-800 text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                      />

                      {/* Description */}
                      <textarea
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="Description"
                        rows={2}
                        className="bg-zinc-800 text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 w-full resize-none"
                      />

                      {/* Block + XP row */}
                      <div className="flex gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-zinc-500 shrink-0">Block</label>
                          <select
                            value={newBlock}
                            onChange={(e) => setNewBlock(parseInt(e.target.value))}
                            className="bg-zinc-800 text-zinc-200 text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer border border-zinc-700"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                              <option key={n} value={n}>Block {n}</option>
                            ))}
                          </select>
                        </div>
                        {newFormType !== "quiz" ? (
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-zinc-500 shrink-0">XP</label>
                            <input
                              type="number"
                              value={newXp}
                              min={1}
                              onChange={(e) => setNewXp(parseInt(e.target.value) || 1)}
                              className="w-20 bg-zinc-800 text-white rounded px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 border border-zinc-700"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-zinc-500 shrink-0">XP</label>
                            <span className="text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 rounded px-3 py-2">
                              {newQuestions.reduce((s, q) => s + q.xp, 0)} (sum of question XP)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Submission type + approval */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-zinc-500 shrink-0">Student submits</label>
                          <select
                            value={newFormType}
                            onChange={(e) => setNewFormType(e.target.value)}
                            className="bg-zinc-800 text-zinc-200 text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer border border-zinc-700"
                          >
                            <option value="screenshot">Screenshot</option>
                            <option value="url">URL</option>
                            <option value="text">Text response</option>
                            <option value="checklist">Checklist</option>
                            <option value="fields">Fill in fields</option>
                            <option value="composite">Screenshot + Checklist</option>
                            <option value="quiz">Quiz (auto-graded)</option>
                          </select>
                        </div>
                        {newFormType !== "quiz" && (
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={newNeedsApproval}
                              onChange={(e) => setNewNeedsApproval(e.target.checked)}
                              className="w-4 h-4 rounded accent-indigo-500"
                            />
                            <span className="text-xs text-zinc-300">Needs instructor approval</span>
                          </label>
                        )}
                        {newFormType === "quiz" && (
                          <span className="text-xs text-zinc-500">Auto-graded — no approval needed</span>
                        )}
                      </div>

                      {/* ── Type-specific config ── */}

                      {/* text: minimum word count */}
                      {newFormType === "text" && (
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-zinc-500 shrink-0">Minimum words</label>
                          <input
                            type="number"
                            value={newMinWords}
                            min={0}
                            onChange={(e) => setNewMinWords(parseInt(e.target.value) || 0)}
                            className="w-20 bg-zinc-800 text-white rounded px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 border border-zinc-700"
                          />
                          {newMinWords === 0 && (
                            <span className="text-xs text-zinc-600">No minimum</span>
                          )}
                        </div>
                      )}

                      {/* checklist: list of items */}
                      {newFormType === "checklist" && (
                        <div className="flex flex-col gap-1.5">
                          <p className="text-xs text-zinc-500">Checklist items</p>
                          {newChecklistItems.map((item, i) => (
                            <div key={i} className="flex gap-1.5 items-center">
                              <input
                                value={item}
                                onChange={(e) => setNewChecklistItems((prev) => { const n = [...prev]; n[i] = e.target.value; return n; })}
                                placeholder={`Item ${i + 1}`}
                                className="flex-1 bg-zinc-700 text-white rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                              {newChecklistItems.length > 1 && (
                                <button onClick={() => setNewChecklistItems((prev) => prev.filter((_, j) => j !== i))} className="text-zinc-500 hover:text-rose-400 text-sm px-1">×</button>
                              )}
                            </div>
                          ))}
                          <button onClick={() => setNewChecklistItems((prev) => [...prev, ""])} className="text-xs text-indigo-400 hover:text-indigo-300 text-left">+ Add item</button>
                        </div>
                      )}

                      {/* fields: list of field names */}
                      {newFormType === "fields" && (
                        <div className="flex flex-col gap-1.5">
                          <p className="text-xs text-zinc-500">Field names</p>
                          {newFieldNames.map((name, i) => (
                            <div key={i} className="flex gap-1.5 items-center">
                              <input
                                value={name}
                                onChange={(e) => setNewFieldNames((prev) => { const n = [...prev]; n[i] = e.target.value; return n; })}
                                placeholder={`Field ${i + 1}`}
                                className="flex-1 bg-zinc-700 text-white rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                              {newFieldNames.length > 1 && (
                                <button onClick={() => setNewFieldNames((prev) => prev.filter((_, j) => j !== i))} className="text-zinc-500 hover:text-rose-400 text-sm px-1">×</button>
                              )}
                            </div>
                          ))}
                          <button onClick={() => setNewFieldNames((prev) => [...prev, ""])} className="text-xs text-indigo-400 hover:text-indigo-300 text-left">+ Add field</button>
                        </div>
                      )}

                      {/* composite: checklist items (screenshot is always included) */}
                      {newFormType === "composite" && (
                        <div className="flex flex-col gap-1.5">
                          <p className="text-xs text-zinc-500">Checklist items <span className="text-zinc-600">(screenshot is always required)</span></p>
                          {newCompositeItems.map((item, i) => (
                            <div key={i} className="flex gap-1.5 items-center">
                              <input
                                value={item}
                                onChange={(e) => setNewCompositeItems((prev) => { const n = [...prev]; n[i] = e.target.value; return n; })}
                                placeholder={`Item ${i + 1}`}
                                className="flex-1 bg-zinc-700 text-white rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                              {newCompositeItems.length > 1 && (
                                <button onClick={() => setNewCompositeItems((prev) => prev.filter((_, j) => j !== i))} className="text-zinc-500 hover:text-rose-400 text-sm px-1">×</button>
                              )}
                            </div>
                          ))}
                          <button onClick={() => setNewCompositeItems((prev) => [...prev, ""])} className="text-xs text-indigo-400 hover:text-indigo-300 text-left">+ Add item</button>
                        </div>
                      )}

                      {/* quiz: question builder */}
                      {newFormType === "quiz" && (
                        <div className="flex flex-col gap-3">
                          <p className="text-xs text-zinc-500">Questions</p>
                          {newQuestions.map((q, qi) => (
                            <div key={qi} className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 flex flex-col gap-2">
                              {/* Question text + XP + remove */}
                              <div className="flex gap-2 items-start">
                                <input
                                  value={q.question}
                                  onChange={(e) => setNewQuestions((prev) => prev.map((x, i) => i === qi ? { ...x, question: e.target.value } : x))}
                                  placeholder={`Question ${qi + 1}`}
                                  className="flex-1 bg-zinc-700 text-white rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-xs text-zinc-500">XP</span>
                                  <input
                                    type="number"
                                    value={q.xp}
                                    min={1}
                                    onChange={(e) => setNewQuestions((prev) => prev.map((x, i) => i === qi ? { ...x, xp: parseInt(e.target.value) || 1 } : x))}
                                    className="w-14 bg-zinc-700 text-white rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                                  />
                                </div>
                                {newQuestions.length > 1 && (
                                  <button
                                    onClick={() => setNewQuestions((prev) => prev.filter((_, i) => i !== qi))}
                                    className="text-zinc-500 hover:text-rose-400 text-sm px-1 shrink-0"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                              {/* Options */}
                              <div className="flex flex-col gap-1 pl-1">
                                {q.options.map((opt, oi) => (
                                  <div key={oi} className="flex gap-2 items-center">
                                    <input
                                      type="radio"
                                      name={`correct-${qi}`}
                                      checked={q.correct_index === oi}
                                      onChange={() => setNewQuestions((prev) => prev.map((x, i) => i === qi ? { ...x, correct_index: oi } : x))}
                                      className="accent-emerald-500 shrink-0"
                                      title="Mark as correct"
                                    />
                                    <input
                                      value={opt}
                                      onChange={(e) => setNewQuestions((prev) => prev.map((x, i) => {
                                        if (i !== qi) return x;
                                        const opts = [...x.options];
                                        opts[oi] = e.target.value;
                                        return { ...x, options: opts };
                                      }))}
                                      placeholder={`Option ${oi + 1}`}
                                      className="flex-1 bg-zinc-700 text-white rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    {q.options.length > 2 && (
                                      <button
                                        onClick={() => setNewQuestions((prev) => prev.map((x, i) => {
                                          if (i !== qi) return x;
                                          const opts = x.options.filter((_, j) => j !== oi);
                                          return { ...x, options: opts, correct_index: Math.min(x.correct_index, opts.length - 1) };
                                        }))}
                                        className="text-zinc-600 hover:text-rose-400 text-sm px-0.5 shrink-0"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                ))}
                                {q.options.length < 4 && (
                                  <button
                                    onClick={() => setNewQuestions((prev) => prev.map((x, i) => i === qi ? { ...x, options: [...x.options, ""] } : x))}
                                    className="text-xs text-zinc-600 hover:text-zinc-400 text-left mt-0.5 ml-5"
                                  >
                                    + option
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-zinc-600 pl-1">● = correct answer</p>
                            </div>
                          ))}
                          <button
                            onClick={() => setNewQuestions((prev) => [...prev, { question: "", options: ["", ""], correct_index: 0, xp: 5 }])}
                            className="text-xs text-indigo-400 hover:text-indigo-300 text-left"
                          >
                            + Add question
                          </button>
                        </div>
                      )}

                      {/* Summary badge */}
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        <span className="text-xs text-zinc-500">Will create:</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-300 font-mono">
                          {newFormType === "quiz"
                            ? "quiz"
                            : newNeedsApproval
                            ? `instructor_flag › ${newFormType}`
                            : newFormType}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Block {newBlock}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-400">
                          +{newXp} XP
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25">
                          Locked on creation
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          disabled={createBusy || (() => {
                            if (!newTitle.trim()) return true;
                            if (newFormType === "checklist" && !newChecklistItems.some((i) => i.trim())) return true;
                            if (newFormType === "fields" && !newFieldNames.some((f) => f.trim())) return true;
                            if (newFormType === "composite" && !newCompositeItems.some((i) => i.trim())) return true;
                            if (newFormType === "quiz" && (newQuestions.length === 0 || newQuestions.some((q) => !q.question.trim() || q.options.length < 2))) return true;
                            return false;
                          })()}
                          onClick={handleCreateAchievement}
                          className="cursor-pointer bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          {createBusy ? "Creating…" : "Create Achievement"}
                        </button>
                        <button
                          onClick={resetCreateForm}
                          className="cursor-pointer text-zinc-500 hover:text-zinc-300 text-xs px-3 py-2 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {deleteError && (
                  <div className="flex items-center justify-between bg-rose-950 border border-rose-800 rounded-lg px-4 py-3 mb-4 text-sm text-rose-300">
                    <span>{deleteError}</span>
                    <button onClick={() => setDeleteError(null)} className="text-rose-500 hover:text-rose-300 ml-4 text-xs">Dismiss</button>
                  </div>
                )}

                <div className="flex flex-col gap-8">
                  {achievementBlocks.map(({ blockNum, items }) => (
                    <div key={blockNum}>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                        Block {blockNum} · {items.length} achievement{items.length !== 1 ? "s" : ""}
                      </p>
                      <div className="flex flex-col gap-2">
                        {items.map((ach, idx) => {
                          const isDragging = dragInfo?.blockNum === blockNum && dragInfo?.idx === idx;
                          const isDragOver = dragOverInfo?.blockNum === blockNum && dragOverInfo?.idx === idx && !isDragging;
                          return (
                            <div
                              key={ach.id}
                              draggable
                              onDragStart={() => setDragInfo({ blockNum, idx })}
                              onDragOver={(e) => { e.preventDefault(); setDragOverInfo({ blockNum, idx }); }}
                              onDragLeave={() => setDragOverInfo(null)}
                              onDrop={() => handleBlockDrop(blockNum, idx)}
                              onDragEnd={() => { setDragInfo(null); setDragOverInfo(null); }}
                              className={`bg-zinc-900 border rounded-xl p-4 transition-all ${
                                isDragOver
                                  ? "border-indigo-500 scale-[1.01]"
                                  : isDragging
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
                                    <label className="text-xs text-zinc-500 shrink-0">Block</label>
                                    <select
                                      value={editBlock}
                                      onChange={(e) => setEditBlock(parseInt(e.target.value))}
                                      className="bg-zinc-800 text-zinc-200 text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer border border-zinc-700"
                                    >
                                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                        <option key={n} value={n}>Block {n}</option>
                                      ))}
                                    </select>
                                  </div>
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
                                  <span className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing mt-0.5 select-none text-lg leading-none">
                                    ⠿
                                  </span>
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
                                    disabled={achBusy === ach.id}
                                    onClick={() => handleToggleLock(ach.id)}
                                    className={`cursor-pointer shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                                      ach.is_unlocked
                                        ? "bg-emerald-900/50 hover:bg-emerald-900 text-emerald-300 border border-emerald-800"
                                        : "bg-red-900/50 hover:bg-red-900 text-red-300 border border-red-800"
                                    }`}
                                  >
                                    {ach.is_unlocked ? "Unlocked" : "Locked"}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingAchId(ach.id);
                                      setEditTitle(ach.title);
                                      setEditDesc(ach.description);
                                      setEditBlock(ach.block_number);
                                    }}
                                    className="cursor-pointer shrink-0 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    Edit
                                  </button>
                                  {confirmDeleteId === ach.id ? (
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        disabled={achBusy === ach.id}
                                        onClick={() => handleDeleteAchievement(ach.id)}
                                        className="cursor-pointer text-xs bg-rose-800 hover:bg-rose-700 disabled:opacity-50 text-rose-200 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                                      >
                                        {achBusy === ach.id ? "Deleting…" : "Confirm"}
                                      </button>
                                      <button
                                        onClick={() => setConfirmDeleteId(null)}
                                        className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1.5 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => { setConfirmDeleteId(ach.id); setDeleteError(null); }}
                                      className="cursor-pointer shrink-0 text-xs text-zinc-600 hover:text-rose-400 px-2 py-1.5 rounded-lg transition-colors"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
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
