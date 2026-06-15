import { ElectionPlanWorkbench } from "@/components/election-plan/ElectionPlanWorkbench";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";

export const metadata = {
  title: "Kelly Grappe Victory Plan | Secretary of State",
  description: "Arkansas Plurality Victory Plan — 20 weeks to Election Day.",
  robots: { index: false, follow: false },
};

export default function ElectionPlanPage() {
  const data = loadElectionPlanSnapshot();
  return <ElectionPlanWorkbench data={data} />;
}
