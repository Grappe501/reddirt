import { RoleOnboardingWizard } from "@/components/admin/onboarding/RoleOnboardingWizard";
import { AgentObservationTracker } from "@/components/agents/AgentObservationTracker";

export const dynamic = "force-dynamic";

export default function RoleOnboardingPage() {
  return (
    <AgentObservationTracker role="operator" pathname="/admin/onboarding">
      <RoleOnboardingWizard />
    </AgentObservationTracker>
  );
}
