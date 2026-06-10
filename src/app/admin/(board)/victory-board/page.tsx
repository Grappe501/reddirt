import { VictoryBoardDashboard } from "@/components/admin/victory-os/victory-board-ui/VictoryBoardDashboard";
import { VictoryOsShellSuspense } from "@/components/admin/victory-os/victory-os-ui/VictoryOsShellSuspense";
import { weekKeyFromParam } from "@/lib/calendar/weekly-time";
import { isSeason5 } from "@/lib/victory-os/daily-decisions/generate-daily-decisions";
import { loadVictoryMapCounties } from "@/lib/victory-os/load-victory-map";
import { composeVictoryBoardViewModel } from "@/lib/victory-os/victory-board/compose-victory-board-view-model";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ week?: string }>;
};

export default async function VictoryBoardPage({ searchParams }: Props) {
  const sp = await searchParams;
  const weekKey = weekKeyFromParam(sp.week);
  const viewModel = composeVictoryBoardViewModel(weekKey);
  const counties = loadVictoryMapCounties();

  return (
    <div className="mx-auto max-w-7xl pb-20">
      <VictoryOsShellSuspense
        weekKey={weekKey}
        showSeason5Daily={isSeason5(new Date())}
        headline="Victory Board"
        subline="Maps and charts from decision intelligence — not raw field dumps."
      >
        <VictoryBoardDashboard initialVm={viewModel} counties={counties} />
      </VictoryOsShellSuspense>
    </div>
  );
}
