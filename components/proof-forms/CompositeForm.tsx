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
  const [file, setFile] = useState<File | null>(null);
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

    let screenshotUrl: string | null = null;

    if (requiredTypes.includes("screenshot") && file) {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadBody = await uploadRes.json();
      if (!uploadRes.ok) {
        setError(uploadBody.error ?? "Upload failed.");
        setLoading(false);
        return;
      }
      screenshotUrl = uploadBody.url;
    }

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        achievement_slug: achievementSlug,
        proof_data: { checked },
        screenshot_url: screenshotUrl,
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
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-white/70">Screenshot</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
            className="text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-500/30 file:text-indigo-200 file:font-medium hover:file:bg-indigo-500/50 cursor-pointer"
          />
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
