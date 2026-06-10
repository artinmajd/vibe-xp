"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redirectAfterSubmit } from "@/lib/submit-redirect";

export default function ScreenshotForm({ achievementSlug }: { achievementSlug: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []).slice(0, 3);
    setFiles(selected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) { setError("Pick at least one screenshot."); return; }
    setError("");
    setLoading(true);

    const urls: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadBody = await uploadRes.json();
      if (!uploadRes.ok) {
        setError(uploadBody.error ?? "Upload failed. Try again.");
        setLoading(false);
        return;
      }
      urls.push(uploadBody.url);
    }

    const submitRes = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        achievement_slug: achievementSlug,
        proof_data: { screenshot_urls: urls },
        screenshot_url: urls[0],
      }),
    });
    const submitBody = await submitRes.json();

    if (!submitRes.ok) {
      setError(submitBody.error ?? "Something broke. Try again.");
      setLoading(false);
      return;
    }

    if (submitBody.status === "pending") {
      router.refresh();
    } else {
      redirectAfterSubmit(router, submitBody.newly_unlocked ?? []);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/70">
          Screenshots <span className="text-white/40 font-normal">(up to 3)</span>
        </label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={handleFileChange}
          required
          className="text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-500/30 file:text-indigo-200 file:font-medium hover:file:bg-indigo-500/50 cursor-pointer"
        />
        {files.length > 0 && (
          <div className="flex flex-col gap-1">
            {files.map((f, i) => (
              <p key={i} className="text-xs text-white/40 truncate">
                {i + 1}. {f.name}
              </p>
            ))}
            {files.length === 3 && (
              <p className="text-xs text-amber-400/70">Maximum 3 photos selected.</p>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors"
      >
        {loading ? "Uploading..." : "Submit"}
      </button>
    </form>
  );
}
