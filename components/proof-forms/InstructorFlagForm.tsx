"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InstructorFlagForm({
  achievementSlug,
  description,
}: {
  achievementSlug: string;
  description?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ achievement_slug: achievementSlug, proof_data: {} }),
    });
    const body = await res.json();

    if (!res.ok) {
      setError(body.error ?? "Something broke. Try again.");
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {description && (
        <p className="text-sm text-slate-600">{description}</p>
      )}
      <p className="text-sm text-slate-500">
        Tap the button below when you're ready — your instructor will review and award your XP.
      </p>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors"
      >
        {loading ? "Submitting..." : "I'm ready — flag my instructor ✋"}
      </button>
    </form>
  );
}
