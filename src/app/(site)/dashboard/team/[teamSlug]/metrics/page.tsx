import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { TeamMetricsTabContent } from "@/components/dashboard/vos/TeamMetricsTabContent";
import { getTeamWorkspaceBundle } from "@/lib/dashboard/team-workspace";
import { teamAccessForSlug } from "@/lib/volunteer-ops/team-access-cookie";

export default async function TeamMetricsPage({ params }: { params: Promise<{ teamSlug: string }> }) {
  const { teamSlug } = await params;
  const jar = await cookies();
  const viewer = teamAccessForSlug(jar.get("vos_team_access")?.value, teamSlug);
  const bundle = await getTeamWorkspaceBundle(teamSlug, viewer?.userId ?? null);
  if (!bundle) notFound();
  return <TeamMetricsTabContent team={bundle.team} teamSlug={teamSlug} downstreamRoot={bundle.downstreamRoot} />;
}
