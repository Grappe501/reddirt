import { notFound } from "next/navigation";

import { CommunityWorkbenchShell } from "@/components/election-plan/CommunityWorkbenchShell";
import { loadCurrentElectionPlanOperator } from "@/lib/election-plan/auth/load-current-operator";
import { loadCommunityWorkbench } from "@/lib/election-plan/community-workbench/load-workbench";
import { buildCommunityWorkbenchRegistry } from "@/lib/election-plan/community-workbench/build-registry";
import { isPrimaryCityPilotSlug, pilotWorkbenchMeta, COMMUNITY_PILOT_OPTIONAL_CITY } from "@/lib/election-plan/community-workbench/pilot";
import { evaluatePilotWorkbench } from "@/lib/election-plan/community-workbench/pilot-validation";
import { getPilotSmokePath } from "@/lib/election-plan/community-workbench/pilot-smoke-paths";
import { ensurePilotEventsSeeded } from "@/lib/election-plan/community-workbench/seed-pilot-events";
import { getFosCommunityAllocation } from "@/lib/election-plan/load-fundraising-operating-system";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return buildCommunityWorkbenchRegistry().map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const wb = await loadCommunityWorkbench(slug);
  if (!wb) return { title: "Workbench not found" };
  return {
    title: `${wb.name} · Community Workbench`,
    description: wb.tagline ?? `Local operating center for ${wb.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function CommunityWorkbenchPage({ params }: Props) {
  const { slug } = await params;
  await ensurePilotEventsSeeded();

  const [workbench, operator] = await Promise.all([
    loadCommunityWorkbench(slug),
    loadCurrentElectionPlanOperator(),
  ]);
  if (!workbench) notFound();

  let pilotSmokePath = null;
  let pilotValidation = null;
  let pilotDefects: Array<{
    id: string;
    workbenchSlug: string;
    title: string;
    body: string;
    severity: string;
    status: string;
    operatorInitials: string | null;
    createdAt: string;
  }> = [];

  if (isPrimaryCityPilotSlug(slug)) {
    const meta = pilotWorkbenchMeta(slug)!;
    pilotSmokePath = getPilotSmokePath(slug);
    pilotValidation = evaluatePilotWorkbench(workbench, meta.context);
    try {
      const rows = await prisma.communityWorkbenchPilotDefect.findMany({
        where: { workbenchSlug: slug },
        orderBy: { createdAt: "desc" },
        take: 30,
      });
      pilotDefects = rows.map((d) => ({
        id: d.id,
        workbenchSlug: d.workbenchSlug,
        title: d.title,
        body: d.body,
        severity: d.severity,
        status: d.status,
        operatorInitials: d.operatorInitials,
        createdAt: d.createdAt.toISOString(),
      }));
    } catch {
      pilotDefects = [];
    }
  } else if (slug === COMMUNITY_PILOT_OPTIONAL_CITY.slug) {
    pilotSmokePath = getPilotSmokePath(slug);
    pilotValidation = {
      ...evaluatePilotWorkbench(workbench, COMMUNITY_PILOT_OPTIONAL_CITY.context),
      kind: "optional_city" as const,
    };
  }

  const fosAllocation = getFosCommunityAllocation(slug);

  return (
    <>
      <div className="ep-classification">Internal · Community Workbench · {workbench.name}</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <CommunityWorkbenchShell
            workbench={workbench}
            operatorInitials={operator?.initials ?? null}
            pilotSmokePath={pilotSmokePath}
            pilotValidation={pilotValidation}
            pilotDefects={pilotDefects}
            fosAllocation={fosAllocation}
            showOptionalPilotBanner={slug === COMMUNITY_PILOT_OPTIONAL_CITY.slug}
          />
        </div>
      </div>
    </>
  );
}
