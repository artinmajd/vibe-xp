"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeaveTeamButton({ teamName }: { teamName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLeave() {
    setLoading(true);
    const res = await fetch("/api/teams/leave", { method: "POST" });
    if (res.ok) {
      router.push("/team-setup");
    } else {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-white text-red-500 text-sm font-semibold hover:bg-red-50 hover:border-red-300 transition-all duration-200"
      >
        <span>🚪</span> Leave team
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-fade-up">
            <div className="text-4xl mb-4 text-center">🚪</div>
            <h2 className="text-xl font-bold text-slate-900 text-center mb-2">Leave the team?</h2>
            <p className="text-slate-500 text-sm text-center mb-6">
              Are you sure you want to leave <span className="font-semibold text-slate-700">{teamName}</span>? Your submissions stay on the team record.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleLeave}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-xl py-3 text-sm transition-colors"
              >
                {loading ? "Leaving..." : "Yes, leave team"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl py-3 text-sm transition-colors"
              >
                Stay on the team
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
