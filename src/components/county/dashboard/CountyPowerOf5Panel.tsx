import type { CountyDashboardKpiItem } from "@/lib/campaign-engine/county-dashboards/types";
import { PowerOf5DashboardPanel } from "@/components/power-of-5/PowerOf5DashboardPanel";
import type { PowerOf5OrganizingPipelineId } from "@/lib/power-of-5/pipelines";

type Props = {
  overline?: string;
  title?: string;
  impactExplanation?: string;
  intro: string;
  items: CountyDashboardKpiItem[];
  className?: string;
  kpiCompact?: boolean;
  showOrganizingPipelines?: boolean;
  activePipelineId?: PowerOf5OrganizingPipelineId;
  pipelineVariant?: "compact" | "full";
};

/** County v2 wrapper — delegates to shared `PowerOf5DashboardPanel` for ladder + KPI grid parity with state/region. */
export function CountyPowerOf5Panel(props: Props) {
  return <PowerOf5DashboardPanel {...props} />;
}
