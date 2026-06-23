"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CohortRow = {
  id: string;
  name: string;
  join_code: string;
  active_session_id: number | null;
  chat_enabled: boolean;
  is_archived: boolean;
  studentCount: number;
  teamCount: number;
  activeSessionTitle: string | null;
};

export default function CohortManager({
  cohorts,
  selectedCohortId,
}: {
  cohorts: CohortRow[];
  selectedCohortId: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");

  const active = cohorts.filter((c) => !c.is_archived);
  const archived = cohorts.filter((c) => c.is_archived);

  async function post(body: Record<string, unknown>) {
    setError(null);
    const res = await fetch("/api/instructor/cohort", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Something broke.");
      return false;
    }
    return true;
  }

  async function handleSwitch(id: string) {
    setBusy(`switch-${id}`);
    const ok = await post({ action: "switch", cohort_id: id });
    setBusy(null);
    if (ok) router.push("/instructor");
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setBusy("create");
    const ok = await post({ action: "create", name: newName.trim(), join_code: newCode.trim() || undefined });
    setBusy(null);
    if (ok) {
      setNewName("");
      setNewCode("");
      setCreating(false);
      router.refresh();
    }
  }

  async function handleArchive(id: string, archive: boolean) {
    setBusy(`archive-${id}`);
    const ok = await post({ action: archive ? "archive" : "unarchive", cohort_id: id });
    setBusy(null);
    if (ok) router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this cohort permanently? Only empty cohorts can be deleted.")) return;
    setBusy(`delete-${id}`);
    const ok = await post({ action: "delete", cohort_id: id });
    setBusy(null);
    if (ok) router.refresh();
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Cohorts</h1>
        {selectedCohortId && (
          <a href="/instructor" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Back to dashboard
          </a>
        )}
      </div>

      <div className="px-6 py-6 max-w-3xl mx-auto flex flex-col gap-6">
        {error && (
          <div className="flex items-center justify-between bg-rose-950 border border-rose-800 rounded-lg px-4 py-3 text-sm text-rose-300">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-300 ml-4 text-xs">Dismiss</button>
          </div>
        )}

        {!selectedCohortId && (
          <p className="text-sm text-zinc-400">
            Pick a cohort to manage. Everything in the dashboard — leaderboard, sessions, unlocks — scopes to your choice. It&apos;s remembered in this browser until you switch.
          </p>
        )}

        {/* Active cohorts */}
        <div className="flex flex-col gap-3">
          {active.length === 0 && (
            <p className="text-sm text-zinc-500">No cohorts yet. Create one below.</p>
          )}
          {active.map((c) => {
            const isSelected = c.id === selectedCohortId;
            return (
              <div
                key={c.id}
                className={`bg-zinc-900 border rounded-xl p-5 flex items-center justify-between gap-4 ${
                  isSelected ? "border-indigo-500" : "border-zinc-800"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{c.name}</p>
                    {isSelected && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        managing
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Class code <span className="font-mono text-zinc-300">{c.join_code}</span> ·{" "}
                    {c.studentCount} student{c.studentCount !== 1 ? "s" : ""} · {c.teamCount} team{c.teamCount !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {c.activeSessionTitle ? `On: ${c.activeSessionTitle}` : "No session set yet"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!isSelected && (
                    <button
                      disabled={busy === `switch-${c.id}`}
                      onClick={() => handleSwitch(c.id)}
                      className="cursor-pointer text-xs font-semibold bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {busy === `switch-${c.id}` ? "…" : "Manage"}
                    </button>
                  )}
                  <button
                    disabled={busy === `archive-${c.id}`}
                    onClick={() => handleArchive(c.id, true)}
                    className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1.5 transition-colors"
                  >
                    Archive
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create */}
        {creating ? (
          <div className="bg-zinc-900 border border-indigo-600/40 rounded-xl p-5 flex flex-col gap-3">
            <p className="text-sm font-bold">New cohort</p>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Cohort name (e.g. Spring 2026 — Tuesdays)"
              className="bg-zinc-800 text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex flex-col gap-1">
              <input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="Class code (optional — auto-generated if blank)"
                className="bg-zinc-800 text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
              <p className="text-xs text-zinc-600">Students type this code when they sign up.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={busy === "create" || !newName.trim()}
                onClick={handleCreate}
                className="cursor-pointer text-xs font-semibold bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {busy === "create" ? "Creating…" : "Create cohort"}
              </button>
              <button onClick={() => setCreating(false)} className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-300 px-3 py-2">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="cursor-pointer self-start text-xs font-semibold bg-indigo-700 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            + New cohort
          </button>
        )}

        {/* Archived */}
        {archived.length > 0 && (
          <div className="flex flex-col gap-3 mt-4">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Archived</p>
            {archived.map((c) => (
              <div key={c.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-zinc-400">{c.name}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {c.studentCount} student{c.studentCount !== 1 ? "s" : ""} · {c.teamCount} team{c.teamCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    disabled={busy === `archive-${c.id}`}
                    onClick={() => handleArchive(c.id, false)}
                    className="cursor-pointer text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1.5 transition-colors"
                  >
                    Unarchive
                  </button>
                  <button
                    disabled={busy === `delete-${c.id}` || c.studentCount > 0 || c.teamCount > 0}
                    title={c.studentCount > 0 || c.teamCount > 0 ? "Cohort still has students or teams" : "Delete permanently"}
                    onClick={() => handleDelete(c.id)}
                    className="cursor-pointer text-xs text-rose-500 hover:text-rose-300 disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1.5 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
