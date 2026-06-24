import Link from "next/link";

import { ElectionPlanOperatorsSubnav } from "@/components/election-plan/ElectionPlanOperatorsSubnav";
import { CampaignProjectsListPanel } from "@/components/volunteers/CampaignProjectsPanel";
import { loadCampaignProjectList } from "@/lib/volunteers/campaign-projects";

export const metadata = {
  title: "Projects | Operators",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams?: Promise<{ project?: string }>;
};

export default async function OperatorsProjectsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const payload = await loadCampaignProjectList();

  return (
    <>
      <div className="ep-classification">Internal · Operators command</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <Link href="/election-plan/operators" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
            ← Operators hub
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">Campaign projects</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--ep-navy-muted)]">
            Asana-style coordinated pushes — link tasks, lanes, and counties for multi-week ops (VR drives, coalition builds,
            Labor Day readiness).
          </p>
          <div className="mt-6">
            <ElectionPlanOperatorsSubnav />
          </div>
          <div className="mt-6">
            <CampaignProjectsListPanel
              payload={payload}
              returnTo="/election-plan/operators/projects"
              notice={params.project ?? null}
            />
          </div>
        </div>
      </div>
    </>
  );
}
