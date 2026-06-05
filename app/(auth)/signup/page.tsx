"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";
import Link from "next/link";
import Image from "next/image";
import DarkBackground from "@/components/DarkBackground";

const inputClass = "bg-white/10 border border-white/20 text-white placeholder:text-white/30 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createBrowserClient();
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? "Something broke. Try again, or grab an instructor.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/students/create-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: data.user.id, email, display_name: displayName }),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? "Something broke. Try again, or grab an instructor.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #2e1065 40%, #1e3a8a 100%)" }}>
      <DarkBackground />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/assets/logo.png" alt="vibe-xp logo" width={120} height={120} className="mx-auto mb-2 object-contain" style={{ mixBlendMode: "screen" }} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-white/50 mt-1 text-sm">Join your team and start earning XP.</p>
        </div>

        <div className="rounded-2xl border border-white/15 p-6"
          style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-white/70">Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Artin"
                required
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-white/70">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="firstname.lastname@class.local"
                required
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-white/70">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password"
                required
                className={inputClass}
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors"
            >
              {loading ? "Creating account..." : "Let's go"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-white/40">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-300 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
