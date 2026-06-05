"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redirectAfterSubmit } from "@/lib/submit-redirect";

export default function TextForm({
  achievementSlug,
  minWords,
}: {
  achievementSlug: string;
  minWords: number;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const meetsThreshold = wordCount >= minWords;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ achievement_slug: achievementSlug, proof_data: { text } }),
    });
    const body = await res.json();

    if (!res.ok) {
      setError(body.error ?? "Something broke. Try again.");
      setLoading(false);
      return;
    }

    if (body.status === "pending") {
      router.refresh();
    } else {
      redirectAfterSubmit(router, body.newly_unlocked ?? []);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <label className="text-sm text-zinc-300">Your text</label>
          <span className={`text-xs font-mono ${meetsThreshold ? "text-green-400" : "text-zinc-500"}`}>
            {wordCount} / {minWords} words
          </span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder={`Write at least ${minWords} words...`}
          required
          className="bg-zinc-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading || !meetsThreshold}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors"
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
