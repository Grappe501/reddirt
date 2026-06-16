import { CommunityWorkbenchHubPanel } from "@/components/election-plan/CommunityWorkbenchHubPanel";
import { runCommunityWorkbenchFieldQA } from "@/lib/election-plan/community-workbench/field-qa";
import { listCommunityWorkbenchHubSummaries } from "@/lib/election-plan/community-workbench/hub-summary";
import { getCommunityWorkbenchCount } from "@/lib/election-plan/community-workbench/load-workbench";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Community Workbenches | Election Plan",
  description: "Local Action Hubs — one template, unlimited communities.",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function CommunityWorkbenchesHubPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const [workbenches, totalCount, qaChecks] = await Promise.all([
    listCommunityWorkbenchHubSummaries(),
    getCommunityWorkbenchCount(),
    Promise.resolve(runCommunityWorkbenchFieldQA()),
  ]);

  return (
    <>
      <div className="ep-classification">Internal · Community Workbench Framework v1.2</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <CommunityWorkbenchHubPanel
            workbenches={workbenches}
            totalCount={totalCount}
            initialQuery={q}
            qaChecks={qaChecks}
          />
        </div>
      </div>
    </>
  );
}
