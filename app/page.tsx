import Link from "next/link";
import Image from "next/image";
import DarkBackground from "@/components/DarkBackground";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #2e1065 40%, #1e3a8a 100%)" }}>
      <DarkBackground />

      {/* Logo: cropped to content region, scaled down, with a touch of top padding */}
      <div style={{ position: "fixed", top: 18, left: 8, zIndex: 50, transform: "scale(0.55)", transformOrigin: "top left" }}>
        <img
          src="/assets/Future_Wrights.png"
          alt="Future Wrights"
          style={{
            display: "block",
            width: "340px",
            height: "60px",
            objectFit: "none",
            objectPosition: "-55px -218px",
            mixBlendMode: "screen",
          }}
        />
      </div>

      <div className="relative z-10 max-w-md w-full flex flex-col items-center gap-10">

        {/* Logo */}
        <div className="text-center">
          <Image src="/assets/logo.png" alt="vibe-xp logo" width={120} height={120} className="mx-auto mb-2 object-contain" style={{ mixBlendMode: "screen" }} />
          <h1 className="text-4xl font-extrabold tracking-tight text-white">vibe-xp</h1>
          <p className="text-white/50 mt-2 text-sm">Earn XP. Level up your team.</p>
        </div>

        {/* Student actions */}
        <div className="w-full flex flex-col gap-3">
          <p className="text-xs text-white/40 uppercase tracking-widest text-center font-medium">Students</p>
          <Link
            href="/login"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-4 py-4 text-center text-sm transition-colors shadow-sm"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="w-full text-white/80 font-semibold rounded-xl px-4 py-4 text-center text-sm transition-all border border-white/20 hover:border-white/40 hover:text-white"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            Sign up
          </Link>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-white/15" />
          <span className="text-white/30 text-xs">or</span>
          <div className="flex-1 h-px bg-white/15" />
        </div>

        {/* Instructor + leaderboard */}
        <div className="w-full flex flex-col gap-3">
          <Link
            href="/instructor"
            className="w-full text-white/60 font-medium rounded-xl px-4 py-3 text-center text-sm transition-all border border-white/15 hover:border-white/30 hover:text-white/80"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            Instructor dashboard
          </Link>
          <Link
            href="/leaderboard"
            className="w-full text-white/60 font-medium rounded-xl px-4 py-3 text-center text-sm transition-all border border-white/15 hover:border-white/30 hover:text-white/80"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            Leaderboard
          </Link>
        </div>

      </div>
    </main>
  );
}
