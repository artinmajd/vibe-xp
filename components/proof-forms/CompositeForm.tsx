"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redirectAfterSubmit } from "@/lib/submit-redirect";

export default function CompositeForm({
  achievementSlug,
  require: requiredTypes,
  items,
}: {
  achievementSlug: string;
  require: string[];
  items?: string[];
}) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggle(item: string) {
    setChecked((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const screenshotUrls: string[] = [];

    if (requiredTypes.includes("screenshot") && files.length > 0) {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadBody = await uploadRes.json();
        if (!uploadRes.ok) {
          setError(uploadBody.error ?? "Upload failed.");
          setLoading(false);
          return;
        }
        screenshotUrls.push(uploadBody.url);
      }
    }

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        achievement_slug: achievementSlug,
        proof_data: { checked, ...(screenshotUrls.length > 0 && { screenshot_urls: screenshotUrls }) },
        screenshot_url: screenshotUrls[0] ?? null,
      }),
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

  const allChecked = (items ?? []).every((item) => checked.includes(item));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {requiredTypes.includes("screenshot") && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white/70">
            Screenshots <span className="text-white/40 font-normal">(up to 3)</span>
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 3))}
            required
            className="text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-500/30 file:text-indigo-200 file:font-medium hover:file:bg-indigo-500/50 cursor-pointer"
          />
          {files.length > 0 && (
            <div className="flex flex-col gap-1">
              {files.map((f, i) => (
                <p key={i} className="text-xs text-white/40 truncate">{i + 1}. {f.name}</p>
              ))}
              {files.length === 3 && (
                <p className="text-xs text-amber-400/70">Maximum 3 photos selected.</p>
              )}
            </div>
          )}
        </div>
      )}

      {requiredTypes.includes("checklist") && items && items.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-white/70">Checklist</p>
          {items.map((item) => (
            <label key={item} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checked.includes(item)}
                onChange={() => toggle(item)}
                className="w-4 h-4 rounded accent-indigo-500"
              />
              <span className="text-sm text-white/80">{item}</span>
            </label>
          ))}
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading || (requiredTypes.includes("checklist") && !allChecked)}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors"
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
