import { CommunityWorkbenchHubPanel } from "@/components/election-plan/CommunityWorkbenchHubPanel";
import { runCommunityWorkbenchFieldQA } from "@/lib/election-plan/community-workbench/field-qa";
import { listCommunityWorkbenchHubSummaries } from "@/lib/election-plan/community-workbench/hub-summary";
import { loadPilotValidationSnapshot } from "@/lib/election-plan/community-workbench/load-pilot-status";
import { ensurePilotEventsSeeded } from "@/lib/election-plan/community-workbench/seed-pilot-events";
import { getCommunityWorkbenchCount } from "@/lib/election-plan/community-workbench/load-workbench";
import { loadCurrentElectionPlanOperator } from "@/lib/election-plan/auth/load-current-operator";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Community Workbenches | Election Plan",
  description: "Local Action Hubs — one template, unlimited communities.",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ q?: string; kind?: string }> };

function parseKindFilter(value: string | undefined): "all" | "city" | "campus" | "program" | "coalition" | "media" | "communications" {
  if (
    value === "city" ||
    value === "campus" ||
    value === "program" ||
    value === "coalition" ||
    value === "media" ||
    value === "communications"
  ) {
    return value;
  }
  return "all";
}

export default async function CommunityWorkbenchesHubPage({ searchParams }: Props) {
  const { q, kind: kindParam } = await searchParams;
  await ensurePilotEventsSeeded();

  const [workbenches, totalCount, qaChecks, pilotSnapshot, operator] = await Promise.all([
    listCommunityWorkbenchHubSummaries(),
    getCommunityWorkbenchCount(),
    Promise.resolve(runCommunityWorkbenchFieldQA()),
    loadPilotValidationSnapshot(),
    loadCurrentElectionPlanOperator(),
  ]);

  return (
    <>
      <div className="ep-classification">Internal · Community Workbench Framework v1.3</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <CommunityWorkbenchHubPanel
            workbenches={workbenches}
            totalCount={totalCount}
            initialQuery={q}
            initialKind={parseKindFilter(kindParam)}
            qaChecks={qaChecks}
            pilotSnapshot={pilotSnapshot}
            operatorInitials={operator?.initials ?? null}
          />
        </div>
      </div>
    </>
  );
}
