import type { Metadata } from "next";
import Link from "next/link";

import { EventsMobilizeCommandDashboard } from "@/components/events/EventsMobilizeCommandDashboard";
import { ElectionPlanOperatorsSubnav } from "@/components/election-plan/ElectionPlanOperatorsSubnav";
import { loadEventsCommandDashboard } from "@/lib/events/load-events-command-dashboard";

export const metadata: Metadata = {
  title: "Events & Mobilize command | Operators",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function EventsCommandOpsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const payload = await loadEventsCommandDashboard();

  return (
    <>
      <div className="ep-classification">Operators · events & Mobilize v1</div>
      <div className="px-6 pt-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Link href="/election-plan/operators" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
            ← Operators hub
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">Events & Mobilize command</h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
            Upcoming stops, Mobilize gaps, promotion readiness, and post-event closeout — events leads and Election Plan
            operators share this surface; calendar promotion execution stays in admin.
          </p>
          <div className="mt-6">
            <ElectionPlanOperatorsSubnav />
          </div>
        </div>
      </div>
      <EventsMobilizeCommandDashboard payload={payload} selectedEventId={sp.event} />
    </>
  );
}
