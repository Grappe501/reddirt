import { MondayBriefCommandCenter } from "@/components/admin/victory-os/mission-brief-ui/MondayBriefCommandCenter";
import { StatewideMissionsPanel } from "@/components/admin/victory-os/StatewideMissionsPanel";
import { TacticLinkagePanel } from "@/components/admin/victory-os/TacticLinkagePanel";
import { VictoryMapReviewPanel } from "@/components/admin/victory-os/VictoryMapReviewPanel";
import { VictoryOsShellSuspense } from "@/components/admin/victory-os/victory-os-ui/VictoryOsShellSuspense";
import { weekKeyFromParam } from "@/lib/calendar/weekly-time";
import { isSeason5 } from "@/lib/victory-os/daily-decisions/generate-daily-decisions";
import { composeMondayBriefViewModel } from "@/lib/victory-os/mission-brief/compose-monday-brief-view-model";
import { composeTacticLinkageViewModel } from "@/lib/victory-os/tactic-linkage/load-tactic-linkage";
import { loadVictoryMapStatewideSummary } from "@/lib/victory-os/load-victory-map";

export const dynamic = "force-dynamic";

type View = "brief" | "missions" | "map" | "tactics";

type Props = {
  searchParams: Promise<{ week?: string; view?: string }>;
};

function resolveView(raw: string | undefined): View {
  if (raw === "missions") return "missions";
  if (raw === "map") return "map";
  if (raw === "tactics") return "tactics";
  return "brief";
}

export default async function PathToVictoryPage({ searchParams }: Props) {
  const sp = await searchParams;
  const weekKey = weekKeyFromParam(sp.week);
  const view = resolveView(sp.view);
  const vm = composeMondayBriefViewModel(weekKey);
  const mapSummary = view === "map" ? loadVictoryMapStatewideSummary() : null;
  const tacticsVm = view === "tactics" ? composeTacticLinkageViewModel(weekKey) : null;
  const season5 = isSeason5(new Date());

  return (
    <div className="mx-auto max-w-7xl pb-20">
      <VictoryOsShellSuspense
        weekKey={weekKey}
        showSeason5Daily={season5}
        headline={view === "brief" ? "Monday brief · Path to Victory" : undefined}
        subline={
          view === "brief"
            ? "The ten most important decisions this week to reach 50% + 1 — not what's on the calendar."
            : undefined
        }
      >
        {view === "brief" ? (
          <MondayBriefCommandCenter initialVm={vm} />
        ) : view === "tactics" && tacticsVm ? (
          <TacticLinkagePanel vm={tacticsVm} />
        ) : (
          <div className="mt-2">
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
        )}
      </VictoryOsShellSuspense>
    </div>
  );
}
