import { CampaignOnboardingWizard } from "@/components/admin/campaign-tenancy/CampaignOnboardingWizard";
import { AgentObservationTracker } from "@/components/agents/AgentObservationTracker";

export const dynamic = "force-dynamic";

export default function CampaignOnboardingPage() {
  return (
    <AgentObservationTracker role="operator" pathname="/admin/campaign-onboarding">
      <CampaignOnboardingWizard />
    </AgentObservationTracker>
  );
}
