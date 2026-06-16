import { notFound } from "next/navigation";

import { VoterContactCapturePanel } from "@/components/election-plan/VoterContactCapturePanel";
import { loadCurrentElectionPlanOperator } from "@/lib/election-plan/auth/load-current-operator";
import { loadCommunityWorkbench } from "@/lib/election-plan/community-workbench/load-workbench";
import { getQuitmanBonusPlan } from "@/lib/election-plan/load-win-quitman-operation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ event?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const wb = await loadCommunityWorkbench(slug);
  if (!wb) return { title: "Not found" };
  return {
    title: `Capture contact · ${wb.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function VoterContactCapturePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { event: eventSlug } = await searchParams;

  if (slug !== "quitman") {
    notFound();
  }

  const [workbench, operator] = await Promise.all([
    loadCommunityWorkbench(slug),
    loadCurrentElectionPlanOperator(),
  ]);
  if (!workbench) notFound();

  const plan = getQuitmanBonusPlan();
  const tonight = plan.houseParties.events.find((e) => e.status === "tonight");
  const eventLabel = tonight
    ? `${tonight.label} · ${tonight.hostName} hosting · ${tonight.countyLead} county lead`
    : plan.tonightEvent.label;

  return (
    <>
      <div className="ep-classification">Internal · Field capture · {workbench.name}</div>
      <div className="ep-chapter-body px-4 py-8 sm:px-6 lg:px-10">
        <VoterContactCapturePanel
          plan={plan}
          operatorInitials={operator?.initials ?? null}
          eventSlug={eventSlug ?? tonight?.id}
          eventLabel={eventLabel}
        />
      </div>
    </>
  );
}
