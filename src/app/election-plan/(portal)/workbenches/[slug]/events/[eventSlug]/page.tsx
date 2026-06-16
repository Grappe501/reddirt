import { notFound } from "next/navigation";

import { CommunityEventWorkbenchShell } from "@/components/election-plan/CommunityEventWorkbenchShell";
import { loadCurrentElectionPlanOperator } from "@/lib/election-plan/auth/load-current-operator";
import { getEventPilotSmokePath } from "@/lib/election-plan/community-workbench/pilot-smoke-paths";
import { evaluatePilotEvent } from "@/lib/election-plan/community-workbench/pilot-validation";
import { pilotEventMeta } from "@/lib/election-plan/community-workbench/pilot";
import { loadCommunityWorkbenchEvent } from "@/lib/election-plan/community-workbench/load-workbench-event";
import { ensurePilotEventsSeeded } from "@/lib/election-plan/community-workbench/seed-pilot-events";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string; eventSlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug, eventSlug } = await params;
  await ensurePilotEventsSeeded();
  const view = await loadCommunityWorkbenchEvent(slug, eventSlug);
  if (!view) return { title: "Event not found" };
  return {
    title: `${view.event.title} · Event Workbench`,
    description: `Event ops for ${view.event.title} on ${view.workbench.name} workbench`,
    robots: { index: false, follow: false },
  };
}

export default async function CommunityWorkbenchEventPage({ params }: Props) {
  const { slug, eventSlug } = await params;
  await ensurePilotEventsSeeded();

  const [view, operator] = await Promise.all([
    loadCommunityWorkbenchEvent(slug, eventSlug),
    loadCurrentElectionPlanOperator(),
  ]);
  if (!view || !view.pilotSeed) notFound();

  const meta = pilotEventMeta(eventSlug);
  const pilotSmokePath = getEventPilotSmokePath(eventSlug);
  const pilotValidation = evaluatePilotEvent(
    {
      workbenchSlug: slug,
      eventSlug,
      name: view.event.title,
      context: meta?.context ?? "Event workbench pilot",
    },
    view.event,
    view.committee,
  );

  if (!pilotSmokePath) notFound();

  return (
    <>
      <div className="ep-classification">
        Internal · Event Workbench · {view.event.title}
      </div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <CommunityEventWorkbenchShell
            workbench={view.workbench}
            event={view.event}
            eventSlug={eventSlug}
            committee={view.committee}
            pilotSeed={view.pilotSeed}
            operatorInitials={operator?.initials ?? null}
            pilotSmokePath={pilotSmokePath}
            pilotValidation={pilotValidation}
          />
        </div>
      </div>
    </>
  );
}
