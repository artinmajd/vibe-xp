import { requireAuth } from "@/lib/require-auth";
import { createServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DarkBackground from "@/components/DarkBackground";
import PendingPoller from "@/components/PendingPoller";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

const STATUS = {
  approved:      { label: "Approved",  cls: "bg-green-500/20 text-green-300 border-green-500/30" },
  auto_approved: { label: "Approved",  cls: "bg-green-500/20 text-green-300 border-green-500/30" },
  pending:       { label: "Pending",   cls: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  rejected:      { label: "Rejected",  cls: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  retracted:     { label: "Retracted", cls: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40" },
} as const;

export default async function SubmissionsPage() {
  const user = await requireAuth();
  const supabase = createServerClient();

  const { data: student } = await supabase
    .from("students")
    .select("team_id, cohort_id, teams(name, emoji)")
    .eq("id", user.id)
    .single();

  if (!student?.team_id) redirect("/team-setup");

  const team = student.teams as unknown as { name: string; emoji: string | null };

  const { data: subsRaw } = await supabase
    .from("submissions")
    .select("id, student_id, xp_awarded, bonus_xp, submission_rank, status, submitted_at, students(display_name), achievements(title, session_number)")
    .eq("team_id", student.team_id)
    .order("submitted_at", { ascending: false });

  // Sessions are per-cohort now — scope to the student's cohort, key by session_number.
  const { data: sessionsRaw } = await supabase
    .from("sessions")
    .select("session_number, title")
    .eq("cohort_id", student.cohort_id);
  const sessionTitle = new Map((sessionsRaw ?? []).map((s) => [s.session_number, s.title]));

  const subs = (subsRaw ?? []).map((s) => {
    const ach = s.achievements as unknown as { title: string; session_number: number } | null;
    return {
      id: s.id,
      isMine: s.student_id === user.id,
      name: (s.students as unknown as { display_name: string } | null)?.display_name ?? "Unknown",
      title: ach?.title ?? "Unknown",
      sessionNumber: ach?.session_number ?? 0,
      xp: s.xp_awarded as number,
      bonus: (s.bonus_xp ?? 0) as number,
      rank: s.submission_rank as number | null,
      status: (s.status as keyof typeof STATUS) ?? "pending",
      submittedAt: s.submitted_at as string,
    };
  });

  const totalXp = subs.reduce((sum, s) => sum + s.xp, 0);
  const totalBonus = subs.reduce((sum, s) => sum + s.bonus, 0);

  // Group by session, newest-first within each group, and order the groups by
  // their most recent submission (the session they last worked on, on top).
  const groupMap = new Map<number, typeof subs>();
  for (const s of subs) {
    if (!groupMap.has(s.sessionNumber)) groupMap.set(s.sessionNumber, []);
    groupMap.get(s.sessionNumber)!.push(s);
  }
  const groups = Array.from(groupMap.entries())
    .map(([sessionNumber, items]) => ({
      sessionNumber,
      title: sessionTitle.get(sessionNumber) ?? null,
      items,
      xp: items.reduce((sum, s) => sum + s.xp, 0),
    }))
    // Newest session first (highest number), down to session 1.
    .sort((a, b) => b.sessionNumber - a.sessionNumber);

  return (
    <main className="min-h-screen px-4 py-10 relative overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #2e1065 40%, #1e3a8a 100%)" }}>
      <DarkBackground />
      {/* Live-refresh so instructor approve/reject/retract shows up automatically */}
      <PendingPoller />

      <div className="relative z-10 max-w-2xl mx-auto flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-white/50 text-sm hover:text-white/80 inline-flex items-center gap-1">
            ← Back to dashboard
          </Link>
        </div>

        <div className="animate-fade-up">
          <h1 className="text-2xl font-extrabold text-white leading-tight flex items-center gap-2">
            <span>{team.emoji ?? "📋"}</span> {team.name} — Submissions
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Every submission from your team, newest first.
          </p>
        </div>

        {/* Summary */}
        <div className="animate-fade-up flex gap-3" style={{ animationDelay: "0.05s" }}>
          <div className="flex-1 rounded-2xl border border-white/15 px-5 py-4"
            style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>
            <p className="text-3xl font-black text-white tabular-nums">{totalXp}</p>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">Total XP earned</p>
          </div>
          <div className="flex-1 rounded-2xl border border-emerald-400/25 px-5 py-4"
            style={{ background: "rgba(16,40,28,0.6)", backdropFilter: "blur(20px)" }}>
            <p className="text-3xl font-black text-emerald-300 tabular-nums">+{totalBonus}</p>
            <p className="text-emerald-300/60 text-xs font-semibold uppercase tracking-wide">Speed bonus XP</p>
          </div>
          <div className="flex-1 rounded-2xl border border-white/15 px-5 py-4"
            style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>
            <p className="text-3xl font-black text-white tabular-nums">{subs.length}</p>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">Submissions</p>
          </div>
        </div>

        {/* Rows */}
        {subs.length === 0 ? (
          <div className="rounded-2xl border border-white/15 px-6 py-10 text-center"
            style={{ background: "rgba(255,255,255,0.08)" }}>
            <p className="text-white/40 text-sm">No submissions yet. Go earn some XP!</p>
          </div>
        ) : (
          <div className="animate-fade-up flex flex-col gap-6" style={{ animationDelay: "0.1s" }}>
            {groups.map((group) => (
              <div key={group.sessionNumber} className="flex flex-col gap-2.5">
                {/* Session header */}
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Session {group.sessionNumber}{group.title ? ` — ${group.title}` : ""}
                  </h2>
                  <span className="text-xs text-white/30 font-semibold tabular-nums">{group.xp} XP</span>
                </div>

                {group.items.map((s) => {
                  const status = STATUS[s.status] ?? STATUS.pending;
                  const base = s.xp - s.bonus;
                  const when = new Date(s.submittedAt);
                  return (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-white/12 px-5 py-4 flex items-center justify-between gap-4"
                      style={{ background: "rgba(15,13,40,0.85)" }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-white truncate">{s.title}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.cls}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-white/45 mt-1">
                          <span className={s.isMine ? "text-indigo-300 font-medium" : ""}>
                            {s.name}{s.isMine ? " (you)" : ""}
                          </span>
                          {" · "}
                          {when.toLocaleDateString([], { month: "short", day: "numeric" })}
                          {" "}
                          {when.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                          {s.rank !== null && (
                            <> {" · "}<span className="text-white/60">submitted {ordinal(s.rank)}</span></>
                          )}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-lg font-black text-white tabular-nums leading-none">
                          {s.xp > 0 ? `+${s.xp}` : "—"}
                          {s.xp > 0 && <span className="text-xs font-semibold text-white/40"> XP</span>}
                        </p>
                        {s.bonus > 0 && (
                          <p className="text-xs font-bold text-emerald-400 mt-1">
                            +{s.bonus} bonus
                          </p>
                        )}
                        {s.bonus > 0 && (
                          <p className="text-[10px] text-white/30 mt-0.5">{base} base + {s.bonus} bonus</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        <div className="pb-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-white/70 text-sm font-semibold hover:border-white/40 hover:text-white transition-all duration-200 w-fit"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
