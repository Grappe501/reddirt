import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { TeamOverviewContent } from "@/components/dashboard/vos/TeamOverviewContent";
import { loadCountyRegistrationGoalCardData } from "@/lib/campaign-engine/county-registration-goal-load";
import { isValidArkansasCountySlug } from "@/lib/county/arkansas-county-registry";
import { getTeamWorkspaceBundle } from "@/lib/dashboard/team-workspace";
import { teamAccessForSlug } from "@/lib/volunteer-ops/team-access-cookie";
import { inferTeamCountyRegistrySlug } from "@/lib/volunteer-ops/team-county-inference";
import type { VolunteerRole } from "@/types/dashboard";

const CORE: VolunteerRole[] = ["events", "social-media", "power-of-5"];

export default async function TeamOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ teamSlug: string }>;
  searchParams: Promise<{ as?: string; staff?: string }>;
}) {
  const { teamSlug } = await params;
  const sp = await searchParams;
  const jar = await cookies();
  const viewer = teamAccessForSlug(jar.get("vos_team_access")?.value, teamSlug);
  const bundle = await getTeamWorkspaceBundle(teamSlug, viewer?.userId ?? null);
  if (!bundle) notFound();
  const filled = new Set(bundle.team.members.map((m) => m.role));
  const openRoles = CORE.filter((r) => !filled.has(r));

  const mockViewerOverride = sp.as?.trim() || null;
  const staffView = sp.staff === "1";
  const adminIds = bundle.team.adminMemberIds ?? [];
  const viewerIsCampaignAdmin =
    staffView || Boolean(viewer?.userId && adminIds.includes(viewer.userId));

  const viewerMemberId = bundle.team.isDatabaseBacked
    ? (viewer?.userId ?? null)
    : (mockViewerOverride ?? bundle.team.members[0]?.volunteerId ?? null);

  const explicitCounty = bundle.team.linkedCountySlug;
  const countyRegistrySlug =
    explicitCounty && isValidArkansasCountySlug(explicitCounty)
      ? explicitCounty
      : inferTeamCountyRegistrySlug({ slug: bundle.team.slug, geography: bundle.team.geography });
  const countyGoalData = await loadCountyRegistrationGoalCardData(countyRegistrySlug);

  return (
    <TeamOverviewContent
      team={bundle.team}
      teamSlug={teamSlug}
      downstreamRoot={bundle.downstreamRoot}
      viewerUserId={viewer?.userId ?? null}
      viewerMemberId={viewerMemberId}
      viewerIsCampaignAdmin={viewerIsCampaignAdmin}
      openRoles={openRoles}
      signupSuggestions={bundle.signupSuggestions ?? []}
      countyGoalData={countyGoalData}
    />
  );
}
