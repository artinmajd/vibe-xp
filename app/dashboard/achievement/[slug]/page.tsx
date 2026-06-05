import { requireAuth } from "@/lib/require-auth";
import { createServerClient } from "@/lib/supabase-server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ScreenshotForm from "@/components/proof-forms/ScreenshotForm";
import UrlForm from "@/components/proof-forms/UrlForm";
import TextForm from "@/components/proof-forms/TextForm";
import ChecklistForm from "@/components/proof-forms/ChecklistForm";
import FieldsForm from "@/components/proof-forms/FieldsForm";
import CodeEntryForm from "@/components/proof-forms/CodeEntryForm";
import CompositeForm from "@/components/proof-forms/CompositeForm";

export default async function AchievementPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireAuth();
  const supabase = createServerClient();

  // Get student and team
  const { data: student } = await supabase
    .from("students")
    .select("team_id")
    .eq("id", user.id)
    .single();

  if (!student?.team_id) redirect("/team-setup");

  // Get achievement
  const { data: achievement } = await supabase
    .from("achievements")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!achievement) notFound();

  // Get existing submission for this team
  const { data: submission } = await supabase
    .from("submissions")
    .select("*")
    .eq("team_id", student.team_id)
    .eq("achievement_id", achievement.id)
    .maybeSingle();

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
      case "code_entry":
        return <CodeEntryForm achievementSlug={slug} />;
      case "composite":
        return (
          <CompositeForm
            achievementSlug={slug}
            require={(config.require as string[]) ?? []}
            items={(config.items as string[]) ?? []}
          />
        );
      case "instructor_flag":
        return (
          <p className="text-zinc-400 text-sm">
            This achievement is awarded automatically or by your instructor — nothing to submit here.
          </p>
        );
      default:
        return <p className="text-zinc-500 text-sm">Unknown proof type.</p>;
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 py-12">
      <div className="max-w-lg mx-auto">
        <Link href="/dashboard" className="text-zinc-500 text-sm hover:text-zinc-300 mb-8 inline-block">
          ← Back to dashboard
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono bg-indigo-900 text-indigo-300 px-2 py-1 rounded">
              +{achievement.xp} XP
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{achievement.title}</h1>
          <p className="text-zinc-400 text-sm">{achievement.description}</p>
        </div>

        {submission ? (
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            {submission.status === "auto_approved" || submission.status === "approved" ? (
              <div>
                <p className="text-green-400 font-semibold text-lg mb-1">Nice — +{submission.xp_awarded} XP 🎉</p>
                <p className="text-zinc-500 text-sm">
                  Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                </p>
              </div>
            ) : submission.status === "pending" ? (
              <div>
                <p className="text-yellow-400 font-semibold mb-1">Submitted — waiting for review</p>
                <p className="text-zinc-500 text-sm">Your instructor will approve this soon.</p>
              </div>
            ) : (
              <div>
                <p className="text-red-400 font-semibold mb-1">Not approved</p>
                <p className="text-zinc-500 text-sm">Grab an instructor to find out why.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            {renderForm()}
          </div>
        )}
      </div>
    </main>
  );
}
