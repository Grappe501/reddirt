import { DailyBriefDashboard } from "@/components/admin/victory-os/daily-brief-ui/DailyBriefDashboard";
import { VictoryOsShellSuspense } from "@/components/admin/victory-os/victory-os-ui/VictoryOsShellSuspense";
import { composeDailyBriefViewModel } from "@/lib/victory-os/daily-decisions/load-daily-brief";
import { isSeason5 } from "@/lib/victory-os/daily-decisions/generate-daily-decisions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ day?: string }>;
};

export default async function DailyBriefPage({ searchParams }: Props) {
  const sp = await searchParams;
  const vm = composeDailyBriefViewModel(sp.day);

  return (
    <div className="mx-auto max-w-7xl pb-20">
      <VictoryOsShellSuspense
        weekKey={vm.weekKey}
        showSeason5Daily={isSeason5(new Date())}
        headline="Daily brief"
        subline="Season 5 cadence — where to deploy Kelly today. Derived from weekly Top 10 decisions."
      >
        <DailyBriefDashboard vm={vm} />
      </VictoryOsShellSuspense>
    </div>
  );
}
