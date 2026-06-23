import LeaderboardView from "@/components/LeaderboardView";

export default async function CohortLeaderboardPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <LeaderboardView code={decodeURIComponent(code)} />;
}
