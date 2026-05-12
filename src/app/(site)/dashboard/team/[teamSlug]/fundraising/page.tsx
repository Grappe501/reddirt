import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { TeamFundraisingTabContent } from "@/components/dashboard/vos/TeamFundraisingTabContent";
import { getTeamWorkspaceBundle } from "@/lib/dashboard/team-workspace";
import { teamAccessForSlug } from "@/lib/volunteer-ops/team-access-cookie";

type Props = { params: Promise<{ teamSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { teamSlug } = await params;
  const jar = await cookies();
  const viewer = teamAccessForSlug(jar.get("vos_team_access")?.value, teamSlug);
  const bundle = await getTeamWorkspaceBundle(teamSlug, viewer?.userId ?? null);
  if (!bundle) return { title: "Fundraising" };
  return { title: `Fundraising · ${bundle.team.displayName}` };
}

export default async function TeamFundraisingPage({ params }: Props) {
  const { teamSlug } = await params;
  const jar = await cookies();
  const viewer = teamAccessForSlug(jar.get("vos_team_access")?.value, teamSlug);
  const bundle = await getTeamWorkspaceBundle(teamSlug, viewer?.userId ?? null);
  if (!bundle) notFound();

  return <TeamFundraisingTabContent team={bundle.team} teamSlug={teamSlug} />;
}
