import { EmailCommandCenterReadinessView } from "@/components/admin/email-command-center/EmailCommandCenterReadinessView";
import { getCampaignMemoryReadiness } from "@/lib/email-command-center/ai-campaign-memory-readiness";
import { getEmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";

export const dynamic = "force-dynamic";

export default async function EmailCommandCenterReadinessPage() {
  const [snapshot, campaignMemoryReadiness] = await Promise.all([
    getEmailCommandCenterSnapshot(),
    getCampaignMemoryReadiness(),
  ]);
  return (
    <EmailCommandCenterReadinessView snapshot={snapshot} campaignMemoryReadiness={campaignMemoryReadiness} />
  );
}
