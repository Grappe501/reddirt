import { DashboardBuilderClient } from "@/components/admin/dashboard-builder/DashboardBuilderClient";
import { AgentObservationTracker } from "@/components/agents/AgentObservationTracker";

export const dynamic = "force-dynamic";

export default function DashboardBuilderPage() {
  return (
    <AgentObservationTracker role="operator" pathname="/admin/ai-command-center/dashboard-builder">
      <DashboardBuilderClient />
    </AgentObservationTracker>
  );
}
