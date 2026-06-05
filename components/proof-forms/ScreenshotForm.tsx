"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ScreenshotForm({ achievementSlug }: { achievementSlug: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Pick a screenshot first."); return; }
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
    const uploadBody = await uploadRes.json();

    if (!uploadRes.ok) {
      setError(uploadBody.error ?? "Upload failed. Try again.");
      setLoading(false);
      return;
    }

    const submitRes = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ achievement_slug: achievementSlug, proof_data: {}, screenshot_url: uploadBody.url }),
    });
    const submitBody = await submitRes.json();

    if (!submitRes.ok) {
      setError(submitBody.error ?? "Something broke. Try again.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-300">Screenshot</label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
          className="text-sm text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-zinc-700 file:text-white hover:file:bg-zinc-600"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors"
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
