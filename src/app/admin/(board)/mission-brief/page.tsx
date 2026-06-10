import Link from "next/link";
import { VictoryMapReviewPanel } from "@/components/admin/victory-os/VictoryMapReviewPanel";
import { WeeklyDecisionBriefPanel } from "@/components/admin/victory-os/WeeklyDecisionBriefPanel";
import { weekKeyFromParam } from "@/lib/calendar/weekly-time";
import {
  listWeeklyDecisionBriefWeekKeys,
  loadOrGenerateWeeklyDecisionBrief,
} from "@/lib/victory-os/decision-engine/load-decision-brief";
import { loadVictoryMapStatewideSummary } from "@/lib/victory-os/load-victory-map";

export const dynamic = "force-dynamic";

const DOCTRINE_DOC = "docs/campaign-events/VICTORY_OS_DOCTRINE.md";

type Props = {
  searchParams: Promise<{ week?: string; view?: string }>;
};

export default async function PathToVictoryPage({ searchParams }: Props) {
  const sp = await searchParams;
  const weekKey = weekKeyFromParam(sp.week);
  const view = sp.view === "map" ? "map" : "decisions";
  const snapshots = listWeeklyDecisionBriefWeekKeys();
  const fromSnapshot = snapshots.includes(weekKey);
  const brief = loadOrGenerateWeeklyDecisionBrief(weekKey);
  const mapSummary = loadVictoryMapStatewideSummary();

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-slate">Victory OS</p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-navy">Path to Victory</h1>
      <p className="mt-4 max-w-3xl font-body text-base leading-relaxed text-kelly-text/85">
        Monday morning starts here: the ten most important decisions to reach 50% + 1. Victory Map and calendar
        tactics are downstream.
      </p>
      <p className="mt-2 font-body text-sm text-kelly-muted">
        Doctrine:{" "}
        <code className="rounded border border-kelly-text/15 bg-kelly-page/80 px-1.5 py-0.5 text-xs">{DOCTRINE_DOC}</code>
      </p>

      <nav className="mt-8 flex gap-2 border-b border-kelly-text/10 pb-2" aria-label="Victory OS views">
        <Link
          href={`/admin/mission-brief?week=${weekKey}&view=decisions`}
          className={`rounded-t-lg px-4 py-2 font-body text-sm font-semibold ${
            view === "decisions"
              ? "border border-b-0 border-kelly-text/15 bg-white text-kelly-navy"
              : "text-kelly-muted hover:text-kelly-navy"
          }`}
        >
          Monday decisions
        </Link>
        <Link
          href={`/admin/mission-brief?week=${weekKey}&view=map`}
          className={`rounded-t-lg px-4 py-2 font-body text-sm font-semibold ${
            view === "map"
              ? "border border-b-0 border-kelly-text/15 bg-white text-kelly-navy"
              : "text-kelly-muted hover:text-kelly-navy"
          }`}
        >
          Victory Map (Layer 0)
        </Link>
      </nav>

      <div className="mt-8">
        {view === "decisions" ? (
          <WeeklyDecisionBriefPanel
            initialBrief={brief}
            weekKey={weekKey}
            snapshots={snapshots}
            fromSnapshot={fromSnapshot}
          />
        ) : (
          <VictoryMapReviewPanel
            counties={mapSummary.counties}
            dimensionCounts={mapSummary.dimensionCounts}
            mapClassificationStatus={mapSummary.mapClassificationStatus}
            updatedAt={mapSummary.updatedAt}
            statewideVoteGap={mapSummary.statewideVoteGap}
            workingTargetWithCushion={mapSummary.workingTargetWithCushion}
            currentSeasonLabel={mapSummary.currentSeason?.label ?? null}
            currentSeasonQuestion={mapSummary.currentSeason?.headlineQuestion ?? null}
          />
        )}
      </div>

      <p className="mt-10">
        <Link
          href="/admin/ai-command-center"
          className="font-body text-sm font-semibold text-kelly-navy underline underline-offset-2 hover:text-kelly-slate"
        >
          ← Back to command center
        </Link>
      </p>
    </div>
  );
}
