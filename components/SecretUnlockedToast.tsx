"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

type Secret = { slug: string; title: string; xp: number };

export default function SecretUnlockedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [secrets, setSecrets] = useState<Secret[]>([]);

  useEffect(() => {
    const raw = searchParams.get("unlocked");
    if (!raw) return;

    try {
      const parsed: Secret[] = JSON.parse(decodeURIComponent(raw));
      if (parsed.length > 0) {
        setSecrets(parsed);
        // Remove the param from URL without a page reload
        const params = new URLSearchParams(searchParams.toString());
        params.delete("unlocked");
        const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
        router.replace(newUrl);
      }
    } catch {
      // ignore malformed param
    }
  }, [searchParams, router, pathname]);

  if (secrets.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-zinc-900 border border-yellow-600 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <p className="text-4xl mb-4">⭐</p>
        <h2 className="text-xl font-bold text-yellow-300 mb-2">Secret unlocked!</h2>
        {secrets.map((s) => (
          <div key={s.slug} className="mt-3">
            <p className="text-white font-semibold">{s.title}</p>
            <p className="text-yellow-400 text-sm">+{s.xp} XP</p>
          </div>
        ))}
        <button
          onClick={() => setSecrets([])}
          className="mt-6 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg px-6 py-2 text-sm transition-colors"
        >
          Let's go!
        </button>
      </div>
    </div>
  );
}
