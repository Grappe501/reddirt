import { ElectionDayOpsCenter } from "@/components/admin/victory-os/election-day-ui/ElectionDayOpsCenter";
import { VictoryOsShellSuspense } from "@/components/admin/victory-os/victory-os-ui/VictoryOsShellSuspense";
import { composeElectionDayViewModel } from "@/lib/victory-os/election-day/compose-election-day-view-model";
import { isSeason5 } from "@/lib/victory-os/daily-decisions/generate-daily-decisions";
import { weekKeyFromDate } from "@/lib/calendar/weekly-time";

export const dynamic = "force-dynamic";

export default async function ElectionDayPage() {
  const vm = composeElectionDayViewModel();

  return (
    <div className="mx-auto max-w-7xl pb-20">
      <VictoryOsShellSuspense
        weekKey={weekKeyFromDate(new Date())}
        showSeason5Daily={isSeason5(new Date())}
        headline="Election Day ops"
        subline="Arkansas Election Operations Center — not a calendar. County cards, side panels, advisory turnout."
      >
        <ElectionDayOpsCenter vm={vm} />
      </VictoryOsShellSuspense>
    </div>
  );
}
