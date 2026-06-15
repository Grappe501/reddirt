import { notFound } from "next/navigation";

import { ForwardMotionStopCommandCenterPanel } from "@/components/election-plan/ForwardMotionStopCommandCenterPanel";
import { assembleForwardMotionStop } from "@/lib/election-plan/assemble-forward-motion-stop";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";
import {
  forwardMotionStaticParams,
  resolveForwardMotionStop,
} from "@/lib/election-plan/forward-motion-links";

type Props = { params: Promise<{ eventId: string }> };

export function generateStaticParams() {
  const data = loadElectionPlanSnapshot();
  return forwardMotionStaticParams(data);
}

export async function generateMetadata({ params }: Props) {
  const { eventId } = await params;
  const data = loadElectionPlanSnapshot();
  const stop = resolveForwardMotionStop(data, eventId);
  if (!stop) return { title: "Stop not found" };
  return {
    title: `${stop.eventName} | Stop command center`,
    description: `Forward Motion activation command center for ${stop.eventName} · ${stop.county} · ${stop.date}`,
    robots: { index: false, follow: false },
  };
}

export default async function ForwardMotionStopPage({ params }: Props) {
  const { eventId } = await params;
  const data = loadElectionPlanSnapshot();
  const stop = resolveForwardMotionStop(data, eventId);
  if (!stop) notFound();

  const view = assembleForwardMotionStop(data, stop);

  return (
    <>
      <div className="ep-classification">Internal · Forward Motion · Stop command center</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ForwardMotionStopCommandCenterPanel view={view} />
        </div>
      </div>
    </>
  );
}
