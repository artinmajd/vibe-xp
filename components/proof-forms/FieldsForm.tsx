"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redirectAfterSubmit } from "@/lib/submit-redirect";

export default function FieldsForm({
  achievementSlug,
  fields,
}: {
  achievementSlug: string;
  fields: string[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function setValue(field: string, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ achievement_slug: achievementSlug, proof_data: { values } }),
    });
    const body = await res.json();

    if (!res.ok) {
      setError(body.error ?? "Something broke. Try again.");
      setLoading(false);
      return;
    }

    redirectAfterSubmit(router, body.newly_unlocked ?? []);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {fields.map((field) => (
        <div key={field} className="flex flex-col gap-1">
          <label className="text-sm text-zinc-300">{field}</label>
          <input
            type="text"
            value={values[field] ?? ""}
            onChange={(e) => setValue(field, e.target.value)}
            required
            className="bg-zinc-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      ))}
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
