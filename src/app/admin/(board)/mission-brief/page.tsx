import Link from "next/link";
import { MondayBriefCommandCenter } from "@/components/admin/victory-os/mission-brief-ui/MondayBriefCommandCenter";
import { StatewideMissionsPanel } from "@/components/admin/victory-os/StatewideMissionsPanel";
import { VictoryMapReviewPanel } from "@/components/admin/victory-os/VictoryMapReviewPanel";
import { weekKeyFromParam } from "@/lib/calendar/weekly-time";
import { composeMondayBriefViewModel } from "@/lib/victory-os/mission-brief/compose-monday-brief-view-model";
import { loadVictoryMapStatewideSummary } from "@/lib/victory-os/load-victory-map";

export const dynamic = "force-dynamic";

const DOCTRINE_DOC = "docs/campaign-events/VICTORY_OS_DOCTRINE.md";

type View = "brief" | "missions" | "map";

type Props = {
  searchParams: Promise<{ week?: string; view?: string }>;
};

function resolveView(raw: string | undefined): View {
  if (raw === "missions") return "missions";
  if (raw === "map") return "map";
  return "brief";
}

export default async function PathToVictoryPage({ searchParams }: Props) {
  const sp = await searchParams;
  const weekKey = weekKeyFromParam(sp.week);
  const view = resolveView(sp.view);
  const vm = composeMondayBriefViewModel(weekKey);
  const mapSummary = view === "map" ? loadVictoryMapStatewideSummary() : null;

  const tabClass = (v: View) =>
    view === v
      ? "border border-b-0 border-kelly-text/15 bg-white text-kelly-navy"
      : "text-kelly-muted hover:text-kelly-navy";

  return (
    <div className="mx-auto max-w-7xl pb-20">
      {view === "brief" ? (
        <MondayBriefCommandCenter initialVm={vm} />
      ) : (
        <>
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-slate">Victory OS</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-navy">Path to Victory</h1>
          <p className="mt-2 font-body text-sm text-kelly-muted">
            Doctrine:{" "}
            <code className="rounded border border-kelly-text/15 bg-kelly-page/80 px-1.5 py-0.5 text-xs">{DOCTRINE_DOC}</code>
          </p>

          <nav className="mt-8 flex flex-wrap gap-2 border-b border-kelly-text/10 pb-2" aria-label="Victory OS views">
            <Link href={`/admin/mission-brief?week=${weekKey}`} className={`rounded-t-lg px-4 py-2 font-body text-sm font-semibold ${tabClass("brief")}`}>
              Monday brief
            </Link>
            <Link href={`/admin/mission-brief?week=${weekKey}&view=missions`} className={`rounded-t-lg px-4 py-2 font-body text-sm font-semibold ${tabClass("missions")}`}>
              County missions
            </Link>
            <Link href={`/admin/mission-brief?week=${weekKey}&view=map`} className={`rounded-t-lg px-4 py-2 font-body text-sm font-semibold ${tabClass("map")}`}>
              Victory Map
            </Link>
          </nav>

          <div className="mt-8">
            {view === "missions" ? (
              <StatewideMissionsPanel registry={vm.missionRegistry} priorityStacks={vm.priorityStacks} weekKey={weekKey} />
            ) : mapSummary ? (
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
            ) : null}
          </div>

          <p className="mt-10">
            <Link href={`/admin/mission-brief?week=${weekKey}`} className="font-body text-sm font-semibold text-kelly-navy underline">
              ← Back to Monday brief
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
