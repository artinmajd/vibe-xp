"use client";

import { useEffect, useRef, useState } from "react";

type Confirmation = { id: string; title: string; rank: number; bonus: number };
type Toast = { key: number; headline: string; detail: string; tone: "good" | "down" | "up"; exiting: boolean };
type SeenMap = Record<string, { rank: number; bonus: number }>;

const SEEN_KEY = "seen-confirmations";
const POLL_MS = 3000;
const TOAST_MS = 15000; // stay on screen 15s
const EXIT_MS = 400;    // matches .animate-toast-out duration

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

// Polls for the student's confirmed submissions and pops a snackbar when one is
// newly confirmed — or when its rank changes later (because an earlier-submitted
// entry got confirmed and bumped it). Ranking is by submission time, so a late
// approval of an early submission can shuffle others; the correction toast keeps
// students informed. Seen ranks persist in localStorage; the first run seeds
// silently so history doesn't all toast at once.
export default function BonusToaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const keyRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    function loadSeen(): SeenMap {
      try {
        const raw = localStorage.getItem(SEEN_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
      } catch {
        return {};
      }
    }
    function saveSeen(seen: SeenMap) {
      try { localStorage.setItem(SEEN_KEY, JSON.stringify(seen)); } catch { /* ignore */ }
    }

    function pushToast(t: Omit<Toast, "key" | "exiting">) {
      const key = keyRef.current++;
      setToasts((prev) => [...prev, { ...t, key, exiting: false }]);
      // After 15s, play the fly-down exit, then remove.
      setTimeout(() => {
        setToasts((prev) => prev.map((x) => (x.key === key ? { ...x, exiting: true } : x)));
        setTimeout(() => setToasts((prev) => prev.filter((x) => x.key !== key)), EXIT_MS);
      }, TOAST_MS);
    }

    function toastForNew(c: Confirmation) {
      pushToast({
        tone: "good",
        headline: c.bonus > 0 ? `+${c.bonus} bonus XP! 🚀` : "Confirmed ✓",
        detail: `${c.title} — you submitted ${ordinal(c.rank)}${c.bonus > 0 ? "" : " (no bonus this time)"}`,
      });
    }
    function toastForChange(c: Confirmation, prevBonus: number) {
      if (c.bonus < prevBonus) {
        pushToast({
          tone: "down",
          headline: "Rank update",
          detail: `Someone who submitted earlier came through — ${c.title} is now ${ordinal(c.rank)}, bonus adjusted to +${c.bonus}.`,
        });
      } else {
        pushToast({
          tone: "up",
          headline: "Moved up! ⬆️",
          detail: `${c.title} is now ${ordinal(c.rank)} — bonus is +${c.bonus}.`,
        });
      }
    }

    const firstRun = localStorage.getItem(SEEN_KEY) === null;

    async function poll(silent: boolean) {
      let confirmations: Confirmation[] = [];
      try {
        const res = await fetch("/api/my-confirmations");
        if (!res.ok) return;
        confirmations = (await res.json()).confirmations ?? [];
      } catch {
        return;
      }
      if (cancelled) return;

      const prev = loadSeen();
      const next: SeenMap = {};
      for (const c of confirmations) {
        const before = prev[c.id];
        if (!silent) {
          if (!before) toastForNew(c);
          else if (before.rank !== c.rank || before.bonus !== c.bonus) toastForChange(c, before.bonus);
        }
        next[c.id] = { rank: c.rank, bonus: c.bonus };
      }
      saveSeen(next);
    }

    poll(firstRun);
    const id = setInterval(() => poll(false), POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (toasts.length === 0) return null;

  const headlineColor: Record<Toast["tone"], string> = {
    good: "text-emerald-300",
    up:   "text-emerald-300",
    down: "text-amber-300",
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.key}
          className={`${t.exiting ? "animate-toast-out" : "animate-toast-in"} pointer-events-auto rounded-2xl px-5 py-3 border-2 max-w-sm`}
          style={{
            background: "rgba(20,30,25,0.95)",
            backdropFilter: "blur(12px)",
            borderColor: "#4ade80",
            boxShadow: "0 0 18px rgba(74,222,128,0.85), 0 0 42px rgba(34,197,94,0.5)",
          }}
        >
          <p className={`text-sm font-bold ${headlineColor[t.tone]}`}>{t.headline}</p>
          <p className="text-xs text-white/70 mt-0.5">{t.detail}</p>
        </div>
      ))}
    </div>
  );
}
