import { CountySectionHeader } from "@/components/county/dashboard/CountySectionHeader";
import { CountySourceBadge } from "@/components/county/dashboard/countyDashboardFormat";
import {
  getMessageIntelligenceDemoModel,
  type MessageIntelligenceScope,
} from "@/lib/message-engine/message-intelligence-dashboard";
import { cn } from "@/lib/utils";
import { MessagePerformancePreview } from "./MessagePerformancePreview";
import { NarrativeGapPanel } from "./NarrativeGapPanel";

type Props = {
  className?: string;
  /** Geographic / ladder scope — selects deterministic demo mix. */
  scope: MessageIntelligenceScope;
};

/**
 * Message Content Engine — intelligence strip for organizing dashboards.
 * Aggregate-only; labeled preview until conversation logging feeds these panels.
 */
export function MessageIntelligencePanel({ className, scope }: Props) {
  const model = getMessageIntelligenceDemoModel(scope);

  return (
    <div className={cn("space-y-6", className)}>
      <CountySectionHeader
        overline="Message intelligence"
        title={`Field narrative snapshot — ${model.scopeLabel}`}
        description={
          <span className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <span>
              Themes, category mix, pipeline movement, narrative gaps, and follow-up depth —{" "}
              <strong className="text-kelly-text/85">aggregates only</strong> on public routes. No individual-level conversation data.
            </span>
            <CountySourceBadge source="demo" note="Illustrative preview — replace with logged aggregates when pipelines connect." />
          </span>
        }
      />
      <MessagePerformancePreview
        windowLabel={model.windowLabel}
        themes={model.themes}
        categoriesInUse={model.categoriesInUse}
        pipelineMovement={model.pipelineMovement}
      />
      <NarrativeGapPanel
        windowLabel={model.windowLabel}
        narrativeGaps={model.narrativeGaps}
        fieldMessageOfWeek={model.fieldMessageOfWeek}
        followUpNeeds={model.followUpNeeds}
      />
    </div>
  );
}
