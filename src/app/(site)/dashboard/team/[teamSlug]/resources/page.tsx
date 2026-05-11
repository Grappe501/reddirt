import { TeamResourcesTabContent } from "@/components/dashboard/vos/TeamResourcesTabContent";

export default async function TeamResourcesPage({ params }: { params: Promise<{ teamSlug: string }> }) {
  const { teamSlug } = await params;
  return <TeamResourcesTabContent teamSlug={teamSlug} />;
}
