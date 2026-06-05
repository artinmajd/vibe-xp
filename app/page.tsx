import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full flex flex-col items-center gap-10">

        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4 shadow-lg">
            <span className="text-3xl">⚡</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">vibe-xp</h1>
          <p className="text-slate-500 mt-2 text-sm">Earn XP. Level up your team.</p>
        </div>

        {/* Student actions */}
        <div className="w-full flex flex-col gap-3">
          <p className="text-xs text-slate-400 uppercase tracking-widest text-center font-medium">Students</p>
          <Link
            href="/login"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-4 py-4 text-center text-sm transition-colors shadow-sm"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl px-4 py-4 text-center text-sm transition-colors border border-slate-200 shadow-sm"
          >
            Sign up
          </Link>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-slate-400 text-xs">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Instructor + leaderboard */}
        <div className="w-full flex flex-col gap-3">
          <Link
            href="/instructor"
            className="w-full bg-white hover:bg-slate-50 text-slate-600 font-medium rounded-xl px-4 py-3 text-center text-sm transition-colors border border-slate-200 shadow-sm"
          >
            Instructor dashboard
          </Link>
          <Link
            href="/leaderboard"
            className="w-full bg-white hover:bg-slate-50 text-slate-600 font-medium rounded-xl px-4 py-3 text-center text-sm transition-colors border border-slate-200 shadow-sm"
          >
            Leaderboard
          </Link>
        </div>

      </div>
    </main>
  );
}
