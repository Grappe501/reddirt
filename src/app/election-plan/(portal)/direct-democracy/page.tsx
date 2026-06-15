import { DirectDemocracyElectionPlanPanel } from "@/components/election-plan/MovementInfrastructureModulePanels";

export const metadata = {
  title: "Direct Democracy Initiative | Election Plan",
  robots: { index: false, follow: false },
};

export default function DirectDemocracyElectionPlanPage() {
  return <DirectDemocracyElectionPlanPanel />;
}
