import { SupabaseClient } from "@supabase/supabase-js";

type NewlyUnlocked = { slug: string; title: string; xp: number };

async function alreadyAwarded(
  supabase: SupabaseClient,
  teamId: string,
  achievementId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("submissions")
    .select("id")
    .eq("team_id", teamId)
    .eq("achievement_id", achievementId)
    .maybeSingle();
  return !!data;
}

async function autoAward(
  supabase: SupabaseClient,
  teamId: string,
  achievement: { id: string; xp: number }
): Promise<void> {
  // Use any team member as the submitter
  const { data: member } = await supabase
    .from("team_members")
    .select("student_id")
    .eq("team_id", teamId)
    .limit(1)
    .single();

  if (!member) return;

  await supabase.from("submissions").insert({
    team_id: teamId,
    student_id: member.student_id,
    achievement_id: achievement.id,
    proof_data: {},
    status: "auto_approved",
    xp_awarded: achievement.xp,
  });
}

export async function checkSecretAchievements(
  teamId: string,
  supabase: SupabaseClient
): Promise<NewlyUnlocked[]> {
  const unlocked: NewlyUnlocked[] = [];

  // Load all secret achievements once
  const { data: secrets } = await supabase
    .from("achievements")
    .select("id, slug, title, xp")
    .eq("is_secret", true)
    .eq("is_active", true);

  if (!secrets) return unlocked;

  const bySlug = Object.fromEntries(secrets.map((s) => [s.slug, s]));

  // ── skeptic ───────────────────────────────────────────────────────────────
  // 3+ approved submissions from: letter-counter, double-down,
  // hallucination-hunter, contradiction-machine
  const skeptic = bySlug["skeptic"];
  if (skeptic && !(await alreadyAwarded(supabase, teamId, skeptic.id))) {
    const skepticSlugs = [
      "letter-counter",
      "double-down",
      "hallucination-hunter",
      "contradiction-machine",
    ];

    const { data: skepticAchs } = await supabase
      .from("achievements")
      .select("id")
      .in("slug", skepticSlugs);

    if (skepticAchs) {
      const { count } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("team_id", teamId)
        .in("status", ["auto_approved", "approved"])
        .in(
          "achievement_id",
          skepticAchs.map((a) => a.id)
        );

      if ((count ?? 0) >= 3) {
        await autoAward(supabase, teamId, skeptic);
        unlocked.push({ slug: skeptic.slug, title: skeptic.title, xp: skeptic.xp });
      }
    }
  }

  // ── collaborator ──────────────────────────────────────────────────────────
  // This team's code was entered by 2+ other teams in neighbor-assist
  const collaborator = bySlug["collaborator"];
  if (collaborator && !(await alreadyAwarded(supabase, teamId, collaborator.id))) {
    const { data: team } = await supabase
      .from("teams")
      .select("code")
      .eq("id", teamId)
      .single();

    const { data: neighborAch } = await supabase
      .from("achievements")
      .select("id")
      .eq("slug", "neighbor-assist")
      .maybeSingle();

    if (team && neighborAch) {
      const { data: neighborSubmissions } = await supabase
        .from("submissions")
        .select("id")
        .eq("achievement_id", neighborAch.id)
        .in("status", ["auto_approved", "approved"])
        .filter("proof_data->>code", "eq", team.code);

      if ((neighborSubmissions ?? []).length >= 2) {
        await autoAward(supabase, teamId, collaborator);
        unlocked.push({
          slug: collaborator.slug,
          title: collaborator.title,
          xp: collaborator.xp,
        });
      }
    }
  }

  // ── builders-apprentice ───────────────────────────────────────────────────
  // All 3 team members have at least one approved submission
  const apprentice = bySlug["builders-apprentice"];
  if (apprentice && !(await alreadyAwarded(supabase, teamId, apprentice.id))) {
    const { data: memberRows } = await supabase
      .from("team_members")
      .select("student_id")
      .eq("team_id", teamId);

    if (memberRows && memberRows.length === 3) {
      const memberIds = memberRows.map((m) => m.student_id);

      const { data: submittedMembers } = await supabase
        .from("submissions")
        .select("student_id")
        .eq("team_id", teamId)
        .in("status", ["auto_approved", "approved"])
        .in("student_id", memberIds);

      const uniqueSubmitters = new Set(
        (submittedMembers ?? []).map((s) => s.student_id)
      );

      if (uniqueSubmitters.size >= 3) {
        await autoAward(supabase, teamId, apprentice);
        unlocked.push({
          slug: apprentice.slug,
          title: apprentice.title,
          xp: apprentice.xp,
        });
      }
    }
  }

  return unlocked;
}
