import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full flex flex-col items-center gap-10">

        {/* Logo / title */}
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-indigo-400">vibe-xp</h1>
          <p className="text-zinc-400 mt-2 text-sm">Earn XP. Level up your team.</p>
        </div>

        {/* Student actions */}
        <div className="w-full flex flex-col gap-3">
          <p className="text-xs text-zinc-500 uppercase tracking-widest text-center">Students</p>
          <Link
            href="/login"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-4 py-4 text-center text-sm transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl px-4 py-4 text-center text-sm transition-colors border border-zinc-700"
          >
            Sign up
          </Link>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-zinc-600 text-xs">or</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Instructor + leaderboard */}
        <div className="w-full flex flex-col gap-3">
          <Link
            href="/instructor"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold rounded-xl px-4 py-4 text-center text-sm transition-colors border border-zinc-800"
          >
            Instructor dashboard
          </Link>
          <Link
            href="/leaderboard"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold rounded-xl px-4 py-4 text-center text-sm transition-colors border border-zinc-800"
          >
            Leaderboard
          </Link>
        </div>

      </div>
    </main>
  );
}
