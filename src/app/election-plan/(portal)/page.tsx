import { ElectionPlanWorkbench } from "@/components/election-plan/ElectionPlanWorkbench";
import { loadCoalitionCommandHub } from "@/lib/election-plan/community-workbench/load-coalition-command-hub";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kelly Grappe Victory Plan | Secretary of State",
  description: "Arkansas Plurality Victory Plan — 20 weeks to Election Day.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function ElectionPlanPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const [data, coalitionHub] = await Promise.all([loadElectionPlanSnapshot(), loadCoalitionCommandHub()]);
  return <ElectionPlanWorkbench data={data} coalitionHub={coalitionHub} initialTab={tab} />;
}
