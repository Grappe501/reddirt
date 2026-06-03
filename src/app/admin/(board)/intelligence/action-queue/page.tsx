import Link from "next/link";
import {
  groupActionsByActionType,
  groupActionsByCounty,
  groupActionsByNarrative,
  groupActionsByOwnerRole,
  loadHumanActionQueue,
  rankHumanActions,
  summarizeHumanActionQueue,
  summarizePersistedHumanActionQueue,
  syncHumanActionQueue,
} from "@/lib/intelligence/strategicDecisionSupport";
import { isIntelligenceOppositionDebateLaunchMode } from "@/lib/intelligence/intelligenceLaunchMode";
import { HumanActionQueueDashboard } from "./HumanActionQueueDashboard";

export const dynamic = "force-dynamic";
export const maxDuration = 26;

export default async function HumanActionQueuePage() {
  const launchMode = isIntelligenceOppositionDebateLaunchMode();
  const queue = launchMode ? loadHumanActionQueue() : syncHumanActionQueue();
  const summary = launchMode ? summarizePersistedHumanActionQueue() : summarizeHumanActionQueue();
  const active = queue.items.filter((row) => row.status !== "ARCHIVED" && row.status !== "DISMISSED");
  const priorityQueue = rankHumanActions(active);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">
          NSI-15 · Strategic Decision Support
        </p>
        <h1 className="font-heading text-2xl font-bold">Human Action Queue</h1>
        <p className="mt-2 max-w-4xl font-body text-sm leading-relaxed text-kelly-muted">
          Governed recommendations from scenario simulation, narrative state, media intake, citations, exports,
          and operational intelligence. Every item is a recommendation only — human operators execute through
          existing workflows.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Intelligence hub
          </Link>
          <Link href="/admin/intelligence/morning-brief" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Morning brief
          </Link>
          <Link
            href="/admin/intelligence/kim-hammer/evidence-command"
            className="rounded border px-2 py-1 font-semibold text-kelly-navy"
          >
            Evidence Command
          </Link>
          <Link href="/admin/intelligence/scenario-simulation" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Scenario simulation
          </Link>
        </div>
      </header>

      <HumanActionQueueDashboard
        summary={summary}
        priorityQueue={priorityQueue}
        byOwner={groupActionsByOwnerRole(active)}
        byCounty={groupActionsByCounty(active)}
        byNarrative={groupActionsByNarrative(active)}
        byType={groupActionsByActionType(active)}
      />
    </div>
  );
}
