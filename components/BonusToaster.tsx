"use client";

import { useEffect, useRef, useState } from "react";

type Confirmation = { id: string; title: string; rank: number; bonus: number };
type Toast = { key: number; headline: string; detail: string; tone: "good" | "down" | "up" };
type SeenMap = Record<string, { rank: number; bonus: number }>;

const SEEN_KEY = "seen-confirmations";
const POLL_MS = 3000;

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

    function pushToast(t: Omit<Toast, "key">) {
      const key = keyRef.current++;
      setToasts((prev) => [...prev, { ...t, key }]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.key !== key)), 6500);
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

  const toneStyle: Record<Toast["tone"], { border: string; headline: string }> = {
    good: { border: "rgba(129,140,248,0.4)", headline: "text-white" },
    up:   { border: "rgba(52,211,153,0.45)", headline: "text-emerald-300" },
    down: { border: "rgba(251,191,36,0.45)", headline: "text-amber-300" },
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.key}
          className="animate-fade-up pointer-events-auto rounded-2xl px-5 py-3 shadow-2xl border max-w-sm"
          style={{ background: "rgba(30,27,75,0.95)", backdropFilter: "blur(12px)", borderColor: toneStyle[t.tone].border }}
        >
          <p className={`text-sm font-bold ${toneStyle[t.tone].headline}`}>{t.headline}</p>
          <p className="text-xs text-white/60 mt-0.5">{t.detail}</p>
        </div>
      ))}
    </div>
  );
}
