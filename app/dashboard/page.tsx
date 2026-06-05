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
      style={{ background: "linear-gradient(135deg, #eef2ff 0%, #faf5ff 50%, #f0fdf4 100%)" }}>

      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="absolute top-1/2 -left-48 w-[400px] h-[400px] rounded-full bg-violet-300/20 blur-3xl" />
        <div className="absolute -bottom-32 right-1/3 w-[350px] h-[350px] rounded-full bg-emerald-200/20 blur-3xl" />
      </div>

      <Suspense>
        <SecretUnlockedToast />
      </Suspense>
      {hasPending && <PendingPoller />}

      <div className="max-w-2xl mx-auto flex flex-col gap-5">

        {/* ── Top bar ── */}
        <div className="animate-fade-up flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Logged in as</p>
            <p className="text-2xl font-extrabold text-slate-900 leading-tight">{student.display_name} 👋</p>
          </div>
          <a
            href="/logout"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-500 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
          >
            <span>👋</span> Log out
          </a>
        </div>

        {/* ── Hero team card ── */}
        <div className="animate-fade-up rounded-3xl overflow-hidden shadow-lg">
          {/* Gradient top */}
          <div className={`bg-gradient-to-br from-indigo-600 to-violet-600 px-6 pt-6 pb-8 relative`}>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-8 w-32 h-32 bg-white/5 rounded-full translate-y-10" />

            <div className="relative flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-5xl drop-shadow-sm select-none">{team.emoji ?? "🏆"}</div>
                <div>
                  <h1 className="text-2xl font-extrabold text-white leading-tight">{team.name}</h1>
                  <p className="text-indigo-200 text-xs font-mono mt-0.5">Code: {team.code}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-white tabular-nums">{totalXp}</p>
                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wide">XP</p>
              </div>
            </div>

            {/* Members */}
            <div className="relative flex flex-wrap gap-2 mb-5">
              {members.map((name) => (
                <span
                  key={name}
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    name === student.display_name
                      ? "bg-white text-indigo-700"
                      : "bg-white/20 text-white"
                  }`}
                >
                  {name}
                </span>
              ))}
            </div>

            {/* XP bar */}
            {levelInfo.nextThreshold && (
              <div className="relative">
                <div className="flex justify-between text-xs text-indigo-200 mb-1.5">
                  <span className="font-semibold">{levelInfo.name}</span>
                  <span>{levelInfo.xpToNext} XP to next level</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full animate-xp-fill"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(to right, #a5b4fc, #e879f9)",
                      boxShadow: "0 0 10px rgba(167,139,250,0.6)",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Level + progress footer */}
          <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-slate-100">
            <span className={`text-xs font-bold px-3 py-1 rounded-full text-white bg-gradient-to-r ${levelGradient}`}>
              Level {levelInfo.level} · {levelInfo.name}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {doneCount} / {(achievements ?? []).length} done
            </span>
          </div>
        </div>

        {/* ── Session banner ── */}
        {session && (
          <div
            className="animate-fade-up rounded-2xl px-5 py-3 flex items-center gap-3"
            style={{ animationDelay: "0.05s", background: "linear-gradient(to right, #4f46e5, #7c3aed)" }}
          >
            <span className="text-lg">📅</span>
            <p className="text-white text-sm font-semibold">
              Session {session.id} — {session.title}
            </p>
          </div>
        )}

        {/* ── Achievements ── */}
        <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Achievements</h2>
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
                  style={{ animationDelay: `${0.12 + i * 0.03}s` }}
                  className={`animate-fade-up group flex items-center justify-between rounded-2xl px-4 py-4 border transition-all duration-200 ${
                    isApproved
                      ? "bg-white/70 border-green-200"
                      : isPending
                      ? "bg-amber-50 border-amber-300"
                      : "bg-white border-slate-200 hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-300"
                  }`}
                >
                  {/* Left accent strip */}
                  <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all ${
                    isApproved ? "bg-green-400" : isPending ? "bg-amber-400" : "bg-transparent group-hover:bg-indigo-400"
                  }`} style={{ position: "relative", marginLeft: "-16px", marginRight: "12px", width: "3px", flexShrink: 0 }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold truncate ${isApproved ? "text-slate-400 line-through" : "text-slate-900"}`}>
                        {achievement.title}
                      </p>
                      {achievement.proof_type === "quiz" && (
                        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold shrink-0">
                          Quiz
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{achievement.description}</p>
                    {teamDone > 0 && !isApproved && (
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(3)].map((_, j) => (
                          <div key={j} className={`w-1.5 h-1.5 rounded-full ${j < teamDone ? "bg-indigo-400" : "bg-slate-200"}`} />
                        ))}
                        <span className="text-xs text-slate-400 ml-1">{teamDone}/3 done</span>
                      </div>
                    )}
                  </div>

                  <div className="ml-3 shrink-0 text-right">
                    {isApproved ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        ✓ +{mySub?.xp_awarded} XP
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center gap-1.5 text-amber-600 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
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
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Secret Achievements</h2>
            <div className="flex flex-col gap-2">
              {earnedSecrets.map((s) => {
                const a = s.achievements as unknown as { title: string; description: string } | null;
                if (!a) return null;
                return (
                  <div key={s.achievement_id}
                    className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl px-4 py-4"
                  >
                    <p className="text-sm font-bold text-amber-800">⭐ {a.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{a.description}</p>
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
