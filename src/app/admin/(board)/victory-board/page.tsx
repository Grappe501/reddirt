import { VictoryBoardDashboard } from "@/components/admin/victory-os/victory-board-ui/VictoryBoardDashboard";
import { weekKeyFromParam } from "@/lib/calendar/weekly-time";
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
      <VictoryBoardDashboard initialVm={viewModel} counties={counties} />
    </div>
  );
}
