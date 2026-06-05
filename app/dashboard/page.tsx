import { requireAuth } from "@/lib/require-auth";
import { createServerClient } from "@/lib/supabase-server";
import { getTeamXP } from "@/lib/team-xp";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import SecretUnlockedToast from "@/components/SecretUnlockedToast";
import PendingPoller from "@/components/PendingPoller";
import LeaveTeamButton from "@/components/LeaveTeamButton";

const LEVEL_GRADIENTS: Record<string, string> = {
  "Builder":          "from-slate-400 to-slate-500",
  "Creator":          "from-blue-400 to-cyan-500",
  "Inventor":         "from-violet-500 to-purple-600",
  "Engineer":         "from-indigo-500 to-blue-600",
  "Architect":        "from-emerald-500 to-teal-600",
  "Founder":          "from-orange-400 to-rose-500",
  "AI Master Builder":"from-yellow-400 to-orange-500",
};

export default async function DashboardPage() {
  const user = await requireAuth();
  const supabase = createServerClient();

  const { data: student } = await supabase
    .from("students")
    .select("*, teams(*)")
    .eq("id", user.id)
    .single();

  if (!student?.team_id) redirect("/team-setup");

  const team = student.teams as {
    id: string;
    name: string;
    emoji: string | null;
    code: string;
  };

  const { data: membersRaw } = await supabase
    .from("team_members")
    .select("student_id, students(display_name)")
    .eq("team_id", team.id);

  const members = (membersRaw ?? []).map((m) => {
    const s = m.students as unknown as { display_name: string } | null;
    return s?.display_name ?? "Unknown";
  });

  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .eq("session_number", session?.id ?? 1)
    .eq("is_secret", false)
    .eq("is_active", true)
    .order("block_number");

  const achievementIds = (achievements ?? []).map((a) => a.id);
  const { data: allTeamSubs } = achievementIds.length
    ? await supabase
        .from("submissions")
        .select("achievement_id, status, xp_awarded, student_id")
        .eq("team_id", team.id)
        .in("achievement_id", achievementIds)
    : { data: [] };

  const mySubsMap = new Map(
    (allTeamSubs ?? [])
      .filter((s) => s.student_id === user.id)
      .map((s) => [s.achievement_id, s])
  );

  const teamDoneMap = new Map<string, number>();
  for (const s of allTeamSubs ?? []) {
    if (s.status === "auto_approved" || s.status === "approved") {
      teamDoneMap.set(s.achievement_id, (teamDoneMap.get(s.achievement_id) ?? 0) + 1);
    }
  }

  const hasPending = (allTeamSubs ?? []).some(
    (s) => s.student_id === user.id && s.status === "pending"
  );

  const { data: secretSubmissions } = await supabase
    .from("submissions")
    .select("achievement_id, achievements(title, description, xp_awarded)")
    .eq("team_id", team.id)
    .in("status", ["auto_approved", "approved"]);

  const earnedSecrets = (secretSubmissions ?? []).filter((s) => {
    const a = s.achievements as unknown as { title: string; description: string; xp_awarded: number } | null;
    return !!a;
  });

  const { totalXp, levelInfo } = await getTeamXP(team.id);
  const xpInCurrentLevel = totalXp - levelInfo.currentThreshold;
  const xpNeededForLevel = levelInfo.nextThreshold
    ? levelInfo.nextThreshold - levelInfo.currentThreshold
    : 1;
  const progress = levelInfo.nextThreshold
    ? Math.min(100, Math.round((xpInCurrentLevel / xpNeededForLevel) * 100))
    : 100;

  const levelGradient = LEVEL_GRADIENTS[levelInfo.name] ?? "from-indigo-500 to-violet-600";
  const doneCount = (achievements ?? []).filter((a) => {
    const s = mySubsMap.get(a.id);
    return s?.status === "auto_approved" || s?.status === "approved";
  }).length;

  return (
    <main className="min-h-screen text-slate-900 px-4 py-10 relative overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #2e1065 40%, #1e3a8a 100%)" }}>

      {/* Animated blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Large blobs */}
        <div className="blob-1 absolute top-[10%] left-[15%] w-[320px] h-[320px] rounded-full bg-indigo-500/50 blur-[40px]" />
        <div className="blob-2 absolute top-[30%] right-[10%] w-[380px] h-[380px] rounded-full bg-violet-600/45 blur-[50px]" />
        <div className="blob-3 absolute bottom-[10%] left-[25%] w-[300px] h-[300px] rounded-full bg-blue-500/45 blur-[40px]" />
        {/* Smaller accent blobs */}
        <div className="blob-4 absolute top-[60%] right-[30%] w-[180px] h-[180px] rounded-full bg-purple-400/55 blur-[30px]" />
        <div className="blob-5 absolute top-[5%] right-[40%] w-[150px] h-[150px] rounded-full bg-sky-400/45 blur-[25px]" />
        <div className="blob-6 absolute bottom-[25%] right-[5%] w-[200px] h-[200px] rounded-full bg-fuchsia-500/50 blur-[35px]" />
      </div>

      {/* Glass overlay so content sits on frosted glass */}
      <div className="pointer-events-none fixed inset-0 backdrop-blur-[2px]" />

      <Suspense>
        <SecretUnlockedToast />
      </Suspense>
      {hasPending && <PendingPoller />}

      <div className="max-w-2xl mx-auto flex flex-col gap-5">

        {/* ── Top bar ── */}
        <div className="animate-fade-up flex items-center justify-between relative z-10">
          <div>
            <p className="text-xs text-indigo-200/70 font-medium uppercase tracking-widest">Logged in as</p>
            <p className="text-2xl font-extrabold text-white leading-tight">{student.display_name}</p>
          </div>
          <a
            href="/logout"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-white/80 text-sm font-semibold hover:bg-white/20 transition-all duration-200"
          >
            Log out
          </a>
        </div>

        {/* ── Hero team card ── */}
        <div className="animate-fade-up rounded-3xl overflow-hidden shadow-2xl border border-white/20"
          style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)" }}>
          <div className="px-6 pt-6 pb-5 relative">
            <div className="relative flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="text-5xl drop-shadow-sm select-none">{team.emoji ?? "🏆"}</div>
                <div>
                  <h1 className="text-2xl font-extrabold text-white leading-tight">{team.name}</h1>
                  <p className="text-white/50 text-xs font-mono mt-0.5">Code: {team.code}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-white tabular-nums">{totalXp}</p>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">XP</p>
              </div>
            </div>

            {/* XP bar */}
            {levelInfo.nextThreshold && (
              <div>
                <div className="flex justify-between text-xs text-white/60 mb-1.5">
                  <span className="font-semibold text-white/80">{levelInfo.name}</span>
                  <span>{levelInfo.xpToNext} XP to next level</span>
                </div>
                <div className="h-3 bg-white/15 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full animate-xp-fill"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(to right, #a5b4fc, #e879f9)",
                      boxShadow: "0 0 12px rgba(167,139,250,0.7)",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Level footer */}
          <div className="px-6 py-3 flex items-center justify-between border-t border-white/10">
            <span className={`text-xs font-bold px-3 py-1 rounded-full text-white bg-gradient-to-r ${levelGradient}`}>
              Level {levelInfo.level} · {levelInfo.name}
            </span>
            <span className="text-xs text-white/50 font-medium">
              {doneCount} / {(achievements ?? []).length} done
            </span>
          </div>
        </div>

        {/* ── Session banner ── */}
        {session && (
          <div
            className="animate-fade-up rounded-2xl px-5 py-3 flex items-center gap-3 border border-white/15"
            style={{ animationDelay: "0.05s", background: "rgba(255,255,255,0.10)", backdropFilter: "blur(16px)" }}
          >
            <span className="text-lg">📅</span>
            <p className="text-white text-sm font-semibold">
              Session {session.id} — {session.title}
            </p>
          </div>
        )}

        {/* ── Achievements ── */}
        <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3 px-1">Achievements</h2>
          <div className="flex flex-col gap-2">
            {(achievements ?? []).map((achievement, i) => {
              const mySub = mySubsMap.get(achievement.id);
              const isApproved = mySub?.status === "auto_approved" || mySub?.status === "approved";
              const isPending = mySub?.status === "pending";
              const teamDone = teamDoneMap.get(achievement.id) ?? 0;

              return (
                <Link
                  key={achievement.id}
                  href={`/dashboard/achievement/${achievement.slug}`}
                  style={{
                    animationDelay: `${0.12 + i * 0.03}s`,
                    background: isApproved
                      ? "rgba(255,255,255,0.08)"
                      : isPending
                      ? "rgba(251,191,36,0.12)"
                      : "rgba(255,255,255,0.10)",
                    backdropFilter: "blur(16px)",
                  }}
                  className={`animate-fade-up group flex items-center justify-between rounded-2xl px-4 py-4 border transition-all duration-200 ${
                    isApproved
                      ? "border-green-400/30"
                      : isPending
                      ? "border-amber-400/40"
                      : "border-white/15 hover:-translate-y-0.5 hover:shadow-lg hover:border-white/30 hover:bg-white/15"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold truncate ${isApproved ? "text-white/40 line-through" : "text-white"}`}>
                        {achievement.title}
                      </p>
                      {achievement.proof_type === "quiz" && (
                        <span className="text-xs bg-violet-500/30 text-violet-200 border border-violet-400/30 px-2 py-0.5 rounded-full font-semibold shrink-0">
                          Quiz
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5 truncate">{achievement.description}</p>
                    {teamDone > 0 && !isApproved && (
                      <div className="flex items-center gap-1 mt-1.5">
                        {[...Array(3)].map((_, j) => (
                          <div key={j} className={`w-1.5 h-1.5 rounded-full ${j < teamDone ? "bg-indigo-300" : "bg-white/20"}`} />
                        ))}
                        <span className="text-xs text-white/40 ml-1">{teamDone}/3 done</span>
                      </div>
                    )}
                  </div>

                  <div className="ml-3 shrink-0 text-right">
                    {isApproved ? (
                      <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-300 border border-green-400/30 text-xs font-bold px-2.5 py-1 rounded-full">
                        ✓ +{mySub?.xp_awarded} XP
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-white/10 border border-white/20 text-white/80 text-xs font-bold px-2.5 py-1 rounded-full group-hover:bg-indigo-500/60 group-hover:border-indigo-400/50 group-hover:text-white transition-all">
                        +{achievement.xp} XP
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Secret achievements ── */}
        {earnedSecrets.length > 0 && (
          <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3 px-1">Secret Achievements</h2>
            <div className="flex flex-col gap-2">
              {earnedSecrets.map((s) => {
                const a = s.achievements as unknown as { title: string; description: string } | null;
                if (!a) return null;
                return (
                  <div key={s.achievement_id}
                    className="border border-amber-400/30 rounded-2xl px-4 py-4"
                    style={{ background: "rgba(251,191,36,0.12)", backdropFilter: "blur(16px)" }}
                  >
                    <p className="text-sm font-bold text-amber-200">⭐ {a.title}</p>
                    <p className="text-xs text-white/50 mt-0.5">{a.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex justify-end pb-6">
          <LeaveTeamButton teamName={team.name} />
        </div>

      </div>
    </main>
  );
}
