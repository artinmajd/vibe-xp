import { requireAuth } from "@/lib/require-auth";
import { createServerClient } from "@/lib/supabase-server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ScreenshotForm from "@/components/proof-forms/ScreenshotForm";
import UrlForm from "@/components/proof-forms/UrlForm";
import TextForm from "@/components/proof-forms/TextForm";
import ChecklistForm from "@/components/proof-forms/ChecklistForm";
import FieldsForm from "@/components/proof-forms/FieldsForm";
import CompositeForm from "@/components/proof-forms/CompositeForm";
import QuizForm from "@/components/proof-forms/QuizForm";
import PendingPoller from "@/components/PendingPoller";
import DarkBackground from "@/components/DarkBackground";
import { QuizQuestion } from "@/lib/quiz-xp";

export default async function AchievementPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireAuth();
  const supabase = createServerClient();

  const { data: student } = await supabase
    .from("students")
    .select("team_id, cohort_id")
    .eq("id", user.id)
    .single();

  if (!student?.team_id) redirect("/team-setup");

  const { count: memberCount } = await supabase
    .from("team_members")
    .select("*", { count: "exact", head: true })
    .eq("team_id", student.team_id);

  // Achievements are per-cohort: scope the lookup to the student's cohort.
  const { data: achievement } = await supabase
    .from("achievements")
    .select("*")
    .eq("slug", slug)
    .eq("cohort_id", student.cohort_id)
    .eq("is_active", true)
    .maybeSingle();

  if (!achievement) notFound();

  if (!achievement.is_unlocked) redirect("/dashboard");

  const { data: submission } = await supabase
    .from("submissions")
    .select("*")
    .eq("student_id", user.id)
    .eq("achievement_id", achievement.id)
    .maybeSingle();

  const { data: teamSubs } = await supabase
    .from("submissions")
    .select("student_id")
    .eq("team_id", student.team_id)
    .eq("achievement_id", achievement.id)
    .in("status", ["auto_approved", "approved"]);

  const teamDoneCount = (teamSubs ?? []).length;

  const config = achievement.proof_config as Record<string, unknown>;

  function renderForm() {
    switch (achievement.proof_type) {
      case "screenshot":
        return <ScreenshotForm achievementSlug={slug} />;
      case "url":
        return <UrlForm achievementSlug={slug} />;
      case "text":
        return <TextForm achievementSlug={slug} minWords={(config.min_words as number) ?? 0} />;
      case "checklist":
        return <ChecklistForm achievementSlug={slug} items={(config.items as string[]) ?? []} />;
      case "fields":
        return <FieldsForm achievementSlug={slug} fields={(config.fields as string[]) ?? []} />;
      case "composite":
        return (
          <CompositeForm
            achievementSlug={slug}
            require={(config.require as string[]) ?? []}
            items={(config.items as string[]) ?? []}
            fields={(config.fields as string[]) ?? []}
          />
        );
      case "quiz":
        return (
          <QuizForm
            achievementSlug={slug}
            questions={(config.questions as QuizQuestion[]) ?? []}
          />
        );
      case "instructor_flag": {
        const formType = (config.form_type as string) ?? "screenshot";
        switch (formType) {
          case "text":
            return <TextForm achievementSlug={slug} minWords={(config.min_words as number) ?? 0} />;
          case "checklist":
            return <ChecklistForm achievementSlug={slug} items={(config.items as string[]) ?? []} />;
          case "fields":
            return <FieldsForm achievementSlug={slug} fields={(config.fields as string[]) ?? []} />;
          case "url":
            return <UrlForm achievementSlug={slug} />;
          case "composite":
            return (
              <CompositeForm
                achievementSlug={slug}
                require={(config.require as string[]) ?? []}
                items={(config.items as string[]) ?? []}
                fields={(config.fields as string[]) ?? []}
              />
            );
          default:
            return <ScreenshotForm achievementSlug={slug} />;
        }
      }
      default:
        return <p className="text-white/50 text-sm">Unknown proof type.</p>;
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 relative overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #2e1065 40%, #1e3a8a 100%)" }}>
      <DarkBackground />

      <div className="relative z-10 max-w-lg mx-auto">
        <Link href="/dashboard" className="text-white/50 text-sm hover:text-white/80 mb-8 inline-flex items-center gap-1">
          ← Back to dashboard
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2.5 py-1 rounded-full">
              +{achievement.xp} XP
            </span>
            {achievement.proof_type === "quiz" && (
              <span className="text-xs font-semibold bg-violet-500/30 text-violet-200 border border-violet-400/30 px-2.5 py-1 rounded-full">
                Quiz
              </span>
            )}
            {achievement.proof_type === "instructor_flag" && (
              <span className="text-xs font-semibold bg-amber-500/25 text-amber-200 border border-amber-400/30 px-2.5 py-1 rounded-full">
                Needs approval
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{achievement.title}</h1>
          <p className="text-white/50 text-sm">{achievement.description}</p>
        </div>

        {/* Submission state */}
        {submission?.status === "auto_approved" || submission?.status === "approved" ? (
          <div className="rounded-2xl p-6 border border-green-500/30"
            style={{ background: "rgba(30,27,75,0.75)" }}>
            <p className="text-green-300 font-bold text-lg mb-1">Nice — +{achievement.xp} XP 🎉</p>
            <p className="text-white/40 text-sm">
              Submitted {new Date(submission.submitted_at).toLocaleDateString()}
            </p>
          </div>
        ) : submission?.status === "pending" ? (
          <div className="rounded-2xl p-6 border border-amber-500/30"
            style={{ background: "rgba(30,27,75,0.75)" }}>
            <PendingPoller />
            <p className="text-amber-300 font-semibold mb-1">Submitted — waiting for review</p>
            <p className="text-white/40 text-sm">Your instructor will approve this soon.</p>
          </div>
        ) : (
          <div className="rounded-2xl p-6 border border-white/15"
            style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
            {submission?.status === "rejected" && (
              <p className="text-red-400 text-sm mb-4">Try again.</p>
            )}
            {renderForm()}
          </div>
        )}

        {/* Team progress */}
        {teamDoneCount > 0 && (
          <p className="text-xs text-white/30 mt-3 px-1">
            {teamDoneCount} / {memberCount ?? teamDoneCount} teammates done
          </p>
        )}
      </div>
    </main>
  );
}
