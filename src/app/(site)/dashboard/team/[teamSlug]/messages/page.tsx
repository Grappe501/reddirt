import { TeamMessagesTabContent } from "@/components/dashboard/vos/TeamMessagesTabContent";

export default async function TeamMessagesPage({ params }: { params: Promise<{ teamSlug: string }> }) {
  const { teamSlug } = await params;
  return <TeamMessagesTabContent teamSlug={teamSlug} />;
}
