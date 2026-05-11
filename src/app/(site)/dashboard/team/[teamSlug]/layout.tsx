import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { TeamDashboardChrome } from "@/components/dashboard/vos/TeamDashboardChrome";
import { getTeamWorkspaceBundle } from "@/lib/dashboard/team-workspace";
import { teamAccessForSlug } from "@/lib/volunteer-ops/team-access-cookie";

type Props = { children: ReactNode; params: Promise<{ teamSlug: string }> };

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { teamSlug } = await params;
  const jar = await cookies();
  const viewer = teamAccessForSlug(jar.get("vos_team_access")?.value, teamSlug);
  const bundle = await getTeamWorkspaceBundle(teamSlug, viewer?.userId ?? null);
  if (!bundle) return { title: "Team workspace" };
  return { title: `${bundle.team.displayName} · Team workspace` };
}

export default async function TeamWorkspaceLayout({ children, params }: Props) {
  const { teamSlug } = await params;
  const jar = await cookies();
  const viewer = teamAccessForSlug(jar.get("vos_team_access")?.value, teamSlug);
  const bundle = await getTeamWorkspaceBundle(teamSlug, viewer?.userId ?? null);
  if (!bundle) notFound();
  return (
    <TeamDashboardChrome team={bundle.team} teamSlug={teamSlug} viewerUserId={viewer?.userId ?? null}>
      {children}
    </TeamDashboardChrome>
  );
}
