import type { RegionPowerOf5Block } from "@/lib/campaign-engine/regions/types";
import { PowerOf5DashboardPanel } from "@/components/power-of-5/PowerOf5DashboardPanel";
import type { PowerOf5OrganizingPipelineId } from "@/lib/power-of-5/pipelines";

type Props = {
  block: RegionPowerOf5Block;
  className?: string;
  compact?: boolean;
  showOrganizingPipelines?: boolean;
  activePipelineId?: PowerOf5OrganizingPipelineId;
  pipelineVariant?: "compact" | "full";
};

export function RegionPowerOf5Panel({
  block,
  className,
  compact = true,
  showOrganizingPipelines = true,
  activePipelineId,
  pipelineVariant = "compact",
}: Props) {
  return (
    <PowerOf5DashboardPanel
      className={className}
      overline={block.overline ?? "Power of 5"}
      title={block.title ?? "Relational roll-up"}
      intro={block.intro}
      items={block.items}
      kpiCompact={compact}
      showOrganizingPipelines={showOrganizingPipelines}
      activePipelineId={activePipelineId}
      pipelineVariant={pipelineVariant}
    />
  );
}
