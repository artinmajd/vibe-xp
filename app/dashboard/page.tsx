import { requireAuth } from "@/lib/require-auth";
import { createServerClient } from "@/lib/supabase-server";
import { getTeamXP } from "@/lib/team-xp";
import { redirect } from "next/navigation";
import Link from "next/link";
import PendingPoller from "@/components/PendingPoller";
import DarkBackground from "@/components/DarkBackground";
import UnlockPoller from "@/components/UnlockPoller";
import Image from "next/image";
import TeamChat from "@/components/TeamChat";
import DashboardScrollManager from "@/components/DashboardScrollManager";
import BonusToaster from "@/components/BonusToaster";

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

  // The student's cohort drives the active session, unlock state, and chat.
  const { data: cohort } = await supabase
    .from("cohorts")
    .select("id, join_code, active_session_id, chat_enabled")
    .eq("id", student.cohort_id)
    .maybeSingle();

  const { data: session } = cohort?.active_session_id
    ? await supabase
        .from("sessions")
        .select("id, title")
        .eq("id", cohort.active_session_id)
        .maybeSingle()
    : { data: null };

  // Achievements are per-cohort now; is_unlocked lives on the row.
  const { data: achievements } = cohort
    ? await supabase
        .from("achievements")
        .select("*")
        .eq("cohort_id", cohort.id)
        .eq("session_number", session?.id ?? 1)
        .eq("is_secret", false)
        .eq("is_active", true)
        .order("sort_order")
        .order("id")
    : { data: [] };

  const unlockedSet = new Set(
    (achievements ?? []).filter((a) => a.is_unlocked).map((a) => a.id)
  );
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

  const { totalXp, memberCount, levelInfo } = await getTeamXP(team.id, members.length);
  const xpInCurrentLevel = totalXp - levelInfo.currentThreshold;
  const xpNeededForLevel = levelInfo.nextThreshold
    ? levelInfo.nextThreshold - levelInfo.currentThreshold
    : 1;
  const progress = levelInfo.nextThreshold
    ? Math.min(100, Math.round((xpInCurrentLevel / xpNeededForLevel) * 100))
    : 100;

  const levelGradient = LEVEL_GRADIENTS[levelInfo.name] ?? "from-indigo-500 to-violet-600";
  const unlockedAchievements = (achievements ?? []).filter((a) => unlockedSet.has(a.id));
  const doneCount = unlockedAchievements.filter((a) => {
    const s = mySubsMap.get(a.id);
    return s?.status === "auto_approved" || s?.status === "approved";
  }).length;

  return (
    <>
    <DashboardScrollManager />
    <BonusToaster />
    {/* Future Wrights logo — outside main so overflow-x-hidden doesn't trap fixed */}
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

    <main className="min-h-screen text-slate-900 px-4 py-10 relative overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #2e1065 40%, #1e3a8a 100%)" }}>

      <DarkBackground />

      {hasPending && <PendingPoller />}
      <UnlockPoller />

      <div className="relative z-10 max-w-2xl mx-auto flex flex-col gap-5">

        {/* ── Top bar ── */}
        <div className="animate-fade-up flex items-center justify-between relative z-10">
          <div>
            <p className="text-xs text-indigo-200/70 font-medium uppercase tracking-widest">Logged in as</p>
            <p className="text-2xl font-extrabold text-white leading-tight">{student.display_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={cohort?.join_code ? `/leaderboard/${cohort.join_code}` : "/leaderboard"}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-white/70 text-sm font-semibold hover:border-white/40 hover:text-white transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              🏆 Leaderboard
            </Link>
            <a
              href="/logout"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-white/70 text-sm font-semibold hover:border-white/40 hover:text-white transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              Log out
            </a>
          </div>
        </div>

        {/* ── Hero team card — glass ── */}
        <div className="animate-fade-up rounded-3xl overflow-hidden shadow-2xl border border-white/25"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(20px)" }}>
          <div className="px-6 pt-6 pb-5">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="text-5xl select-none">{team.emoji ?? "🏆"}</div>
                <div>
                  <h1 className="text-2xl font-extrabold text-white leading-tight">{team.name}</h1>
                  <p className="text-white/50 text-xs font-mono mt-0.5">Code: {team.code}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-white tabular-nums">{totalXp}</p>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">XP</p>
                {memberCount < 3 && (
                  <p className="text-xs text-amber-400/80 mt-1">
                    earning ×{memberCount === 1 ? "3" : "1.5"} XP
                  </p>
                )}
              </div>
            </div>

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

          {members.length > 0 && (
            <div className="px-6 pt-3 pb-4 flex items-center gap-2 flex-wrap">
              {members.map((name) => (
                <span
                  key={name}
                  className={`text-xs px-3 py-1 rounded-full font-medium border ${
                    name === student.display_name
                      ? "bg-indigo-500/30 border-indigo-400/40 text-indigo-200"
                      : "bg-white/10 border-white/15 text-white/60"
                  }`}
                >
                  {name}
                </span>
              ))}
            </div>
          )}

          <div className="px-6 py-3 flex items-center justify-between border-t border-white/10"
            style={{ background: "rgba(255,255,255,0.08)" }}>
            <span className={`text-xs font-bold px-3 py-1 rounded-full text-white bg-gradient-to-r ${levelGradient}`}>
              Level {levelInfo.level} · {levelInfo.name}
            </span>
            <span className="text-xs text-white/50 font-medium">
              {unlockedAchievements.length === 0 ? "🔒 locked" : `${doneCount} / ${unlockedAchievements.length} done`}
            </span>
          </div>
        </div>

        {/* ── Session banner ── */}
        {session && (
          <div
            className="animate-fade-up rounded-2xl px-5 py-3 flex items-center gap-3 border border-indigo-400/30"
            style={{ animationDelay: "0.05s", background: "rgba(30,27,75,0.75)" }}
          >
            <span className="text-lg">📅</span>
            <p className="text-white text-sm font-semibold">
              Session {session.id} — {session.title}
            </p>
          </div>
        )}

        {/* ── Achievements grouped by block ── */}
        {(() => {
          const allAchs = achievements ?? [];
          // Group by block_number using a Map so interleaved sort_orders
          // (which happen after instructor reorders across blocks) never fragment blocks.
          const blockMap = new Map<number, typeof allAchs>();
          for (const a of allAchs) {
            if (!blockMap.has(a.block_number)) blockMap.set(a.block_number, []);
            blockMap.get(a.block_number)!.push(a);
          }
          const blocks = Array.from(blockMap.entries())
            .sort(([a], [b]) => a - b)
            .map(([blockNum, items]) => ({
              blockNum,
              // sort_order=0 means "unordered" — put those last
              items: [...items].sort((a, b) =>
                a.sort_order === 0 ? 1 : b.sort_order === 0 ? -1 : a.sort_order - b.sort_order
              ),
            }));

          let globalIdx = 0;

          return (
            <div className="animate-fade-up flex flex-col gap-4" style={{ animationDelay: "0.1s" }}>
              {blocks.map(({ blockNum, items }) => (
                <div
                  key={blockNum}
                  className="rounded-2xl border border-indigo-400/20 overflow-hidden"
                  style={{ background: "rgba(15,13,40,0.85)" }}
                >
                  <div className="px-4 pt-4 pb-2 border-b border-white/5">
                    <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest">Block {blockNum}</h2>
                  </div>
                  <div className="flex flex-col divide-y divide-white/15">
                    {items.map((achievement) => {
                      const i = globalIdx++;
                      const isLocked = !unlockedSet.has(achievement.id);
                      const mySub = isLocked ? undefined : mySubsMap.get(achievement.id);
                      const isApproved = mySub?.status === "auto_approved" || mySub?.status === "approved";
                      const isPending = mySub?.status === "pending";
                      const teamDone = teamDoneMap.get(achievement.id) ?? 0;

                      const card = (
                        <div
                          style={{
                            animationDelay: `${0.12 + i * 0.03}s`,
                            background: isApproved
                              ? "rgba(20,40,20,0.3)"
                              : isPending
                              ? "rgba(46,28,15,0.5)"
                              : "transparent",
                          }}
                          className={`animate-fade-up flex items-center justify-between px-4 py-5 transition-all duration-200 ${
                            isLocked
                              ? "opacity-35 select-none"
                              : isApproved
                              ? ""
                              : isPending
                              ? ""
                              : "group hover:bg-indigo-500/10 cursor-pointer"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {isLocked && <span className="text-xs">🔒</span>}
                              <p className={`text-sm font-semibold truncate ${isApproved ? "text-white/40 line-through" : isLocked ? "text-white/40" : "text-white"}`}>
                                {achievement.title}
                              </p>
                              {!isLocked && achievement.proof_type === "quiz" && (
                                <span className="text-xs bg-violet-500/30 text-violet-200 border border-violet-400/30 px-2 py-0.5 rounded-full font-semibold shrink-0">
                                  Quiz
                                </span>
                              )}
                            </div>
                            {!isLocked && <p className="text-xs text-white/40 mt-0.5 truncate">{achievement.description}</p>}
                            {!isLocked && teamDone > 0 && !isApproved && (
                              <div className="flex items-center gap-1 mt-1.5">
                                {[...Array(members.length)].map((_, j) => (
                                  <div key={j} className={`w-1.5 h-1.5 rounded-full ${j < teamDone ? "bg-indigo-300" : "bg-white/15"}`} />
                                ))}
                                <span className="text-xs text-white/40 ml-1">{teamDone}/{members.length} done</span>
                              </div>
                            )}
                          </div>

                          <div className="ml-3 shrink-0 text-right">
                            {isLocked ? (
                              <span className="text-white/20 text-xs">+{achievement.xp} XP</span>
                            ) : isApproved ? (
                              <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-300 border border-green-500/30 text-xs font-bold px-2.5 py-1 rounded-full">
                                ✓ +{achievement.xp} XP
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center bg-indigo-500/25 border border-indigo-400/30 text-indigo-200 text-xs font-bold px-2.5 py-1 rounded-full group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all">
                                +{achievement.xp} XP
                              </span>
                            )}
                          </div>
                        </div>
                      );

                      return isLocked ? (
                        <div key={achievement.id}>{card}</div>
                      ) : (
                        <Link key={achievement.id} href={`/dashboard/achievement/${achievement.slug}`}>
                          {card}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* ── Footer ── */}
        <div className="pb-6">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-white/70 text-sm font-semibold hover:border-white/40 hover:text-white transition-all duration-200 w-fit"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            ← Home
          </Link>
        </div>

      </div>
      {cohort?.chat_enabled !== false && (
        <div className="hidden xl:block fixed right-6 bottom-6" style={{ zIndex: 20 }}>
          <TeamChat teamId={team.id} studentId={user.id} />
        </div>
      )}
    </main>
    </>
  );
}
