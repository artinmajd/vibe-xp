import { requireAuth } from "@/lib/require-auth";
import { createServerClient } from "@/lib/supabase-server";
import { getTeamXP } from "@/lib/team-xp";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import SecretUnlockedToast from "@/components/SecretUnlockedToast";
import PendingPoller from "@/components/PendingPoller";

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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-4 py-10">
      <Suspense>
        <SecretUnlockedToast />
      </Suspense>
      {hasPending && <PendingPoller />}
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Team header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl">{team.emoji ?? "🏆"}</span>
                <h1 className="text-2xl font-bold text-slate-900">{team.name}</h1>
              </div>
              <p className="text-slate-400 text-sm font-mono">Code: {team.code}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-indigo-600">{totalXp} XP</p>
              <p className="text-sm text-slate-500">{levelInfo.name}</p>
            </div>
          </div>

          {levelInfo.nextThreshold && (
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Level {levelInfo.level}</span>
                <span>{levelInfo.xpToNext} XP to Level {levelInfo.level + 1}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {members.map((name) => (
              <span
                key={name}
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  name === student.display_name
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Active session */}
        {session && (
          <div className="bg-indigo-600 rounded-xl px-5 py-3">
            <p className="text-white text-sm font-semibold">
              Session {session.id} — {session.title}
            </p>
          </div>
        )}

        {/* Achievements */}
        <div>
          <h2 className="text-base font-semibold text-slate-700 mb-3 px-1">Achievements</h2>
          <div className="flex flex-col gap-2">
            {(achievements ?? []).map((achievement) => {
              const mySub = mySubsMap.get(achievement.id);
              const isApproved = mySub?.status === "auto_approved" || mySub?.status === "approved";
              const isPending = mySub?.status === "pending";
              const teamDone = teamDoneMap.get(achievement.id) ?? 0;

              return (
                <Link
                  key={achievement.id}
                  href={`/dashboard/achievement/${achievement.slug}`}
                  className={`flex items-center justify-between rounded-xl px-4 py-4 border transition-colors ${
                    isApproved
                      ? "bg-white border-green-200 opacity-70"
                      : isPending
                      ? "bg-white border-amber-300"
                      : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${isApproved ? "text-slate-400 line-through" : "text-slate-900"}`}>
                        {achievement.title}
                      </p>
                      {achievement.proof_type === "quiz" && (
                        <span className="text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-medium">
                          Quiz
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{achievement.description}</p>
                    {teamDone > 0 && !isApproved && (
                      <p className="text-xs text-slate-400 mt-1">{teamDone}/3 teammates done</p>
                    )}
                  </div>
                  <div className="ml-4 shrink-0 text-right">
                    {isApproved ? (
                      <span className="text-green-600 text-xs font-semibold">+{mySub?.xp_awarded} XP ✓</span>
                    ) : isPending ? (
                      <span className="text-amber-500 text-xs font-medium">Pending</span>
                    ) : (
                      <span className="text-indigo-600 text-xs font-semibold">+{achievement.xp} XP</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Earned secrets */}
        {earnedSecrets.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-slate-700 mb-3 px-1">Secret Achievements</h2>
            <div className="flex flex-col gap-2">
              {earnedSecrets.map((s) => {
                const a = s.achievements as unknown as { title: string; description: string } | null;
                if (!a) return null;
                return (
                  <div key={s.achievement_id} className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4">
                    <p className="text-sm font-semibold text-amber-700">⭐ {a.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{a.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-4 text-sm text-slate-400 pb-4">
          <a href="/logout" className="hover:text-slate-600">Log out</a>
          <form action="/api/teams/leave" method="POST">
            <button type="submit" className="hover:text-red-500">Leave team</button>
          </form>
        </div>

      </div>
    </main>
  );
}
