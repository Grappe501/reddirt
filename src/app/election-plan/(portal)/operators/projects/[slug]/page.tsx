import Link from "next/link";
import { notFound } from "next/navigation";

import { ElectionPlanOperatorsSubnav } from "@/components/election-plan/ElectionPlanOperatorsSubnav";
import { CampaignProjectBoardPanel } from "@/components/volunteers/CampaignProjectsPanel";
import { loadCampaignProjectBoard } from "@/lib/volunteers/campaign-projects";

export const metadata = {
  title: "Project board | Operators",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ project?: string }>;
};

export default async function OperatorsProjectDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const payload = await loadCampaignProjectBoard(slug);

  if (!payload.project) notFound();

  const returnTo = `/election-plan/operators/projects/${slug}`;

  return (
    <>
      <div className="ep-classification">Internal · Operators command</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Link href="/election-plan/operators/projects" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
            ← All projects
          </Link>
          <div className="mt-6">
            <ElectionPlanOperatorsSubnav />
          </div>
          <div className="mt-6">
            <CampaignProjectBoardPanel payload={payload} returnTo={returnTo} notice={query.project ?? null} />
          </div>
        </div>
      </div>
    </>
  );
}
