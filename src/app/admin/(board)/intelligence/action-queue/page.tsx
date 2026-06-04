import Link from "next/link";
import { isIntelligenceOppositionDebateLaunchMode } from "@/lib/intelligence/intelligenceLaunchMode";
import {
  buildActionQueueViewModel,
  loadSafeActionQueuePageData,
} from "@/lib/intelligence/safeHumanActionQueueLoad";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { V4OperatorGuide } from "@/components/admin/intelligence/v4/V4OperatorGuide";
import { ActionQueueDebateWeekLead } from "./ActionQueueDebateWeekLead";
import { HumanActionQueueDashboard } from "./HumanActionQueueDashboard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

export default async function HumanActionQueuePage() {
  const launchMode = isIntelligenceOppositionDebateLaunchMode();
  const safe = loadSafeActionQueuePageData();
  const { priorityQueue, byOwner, byCounty, byNarrative, byType } = buildActionQueueViewModel(safe.queue);
  const guide = getSurfaceGuide("actionQueue");

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow={launchMode ? "Debate week · staff assignments" : "NSI-15 · Strategic decision support"}
        title="Human action queue"
        description="Governed recommendations from scenarios, citations, media intake, and evidence gaps. Recommendations only — no autonomous publish or export."
        guide={guide}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/kim-hammer/evidence-command"
          className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Evidence command
        </Link>
        <Link
          href="/admin/intelligence/claims"
          className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Claims
        </Link>
      </V4PageHeader>

      {guide && !launchMode ? <V4OperatorGuide guide={guide} /> : null}

      {launchMode ? (
        <ActionQueueDebateWeekLead
          summary={safe.summary}
          usedFastPath={safe.usedFastPath}
          showV4FallbackNote={safe.indexUnavailable && safe.v4RetrievalFallback.length > 0}
        />
      ) : null}

      {safe.indexUnavailable && safe.v4RetrievalFallback.length > 0 ? (
        <section className="mb-6 rounded-xl border border-amber-200 bg-amber-50/50 p-5 text-sm">
          <h2 className="text-sm font-bold uppercase text-amber-950">v4 retrieval fallback (HIGH priority first)</h2>
          <ul className="mt-3 list-inside list-disc text-xs text-kelly-muted">
            {safe.v4RetrievalFallback.map((task) => (
              <li key={task.id}>
                [{task.priority}] {task.description} — {task.recommendedHumanAction}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs">
            Regenerate full NSI-15 queue locally:{" "}
            <code className="rounded bg-white px-1">npm run agents:test-human-action-queue</code> (dev machine only, ~60s).
          </p>
        </section>
      ) : null}

      <HumanActionQueueDashboard
        summary={safe.summary}
        priorityQueue={priorityQueue}
        byOwner={byOwner}
        byCounty={byCounty}
        byNarrative={byNarrative}
        byType={byType}
        debateWeekMode={launchMode}
      />
    </div>
  );
}
