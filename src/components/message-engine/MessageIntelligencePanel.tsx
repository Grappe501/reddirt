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
  /** Public county briefings: swap field vocabulary for civic education wording. */
  audience?: "default" | "publicBriefing";
};

/**
 * Message Content Engine — thematic snapshot for dashboards and public briefing shells.
 * Aggregate-only; labeled preview until conversation logging feeds these panels.
 */
export function MessageIntelligencePanel({ className, scope, audience = "default" }: Props) {
  const model = getMessageIntelligenceDemoModel(scope);
  const titleText =
    audience === "publicBriefing"
      ? `Narrative shelf — themes voters might hear (${model.scopeLabel})`
      : `Field narrative snapshot — ${model.scopeLabel}`;

  return (
    <div className={cn("space-y-6", className)}>
      <CountySectionHeader
        overline={audience === "publicBriefing" ? "What people are discussing" : "Message intelligence"}
        title={titleText}
        description={
          <span className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <span>
              {audience === "publicBriefing"
                ? "Theme blends, illustrative categories, and gap notes meant for readers learning the race — "
                : "Themes, category mix, pipeline movement, narrative gaps, and follow-up depth — "}
              <strong className="text-kelly-text/85">aggregates only</strong>{" "}
              {audience === "publicBriefing"
                ? "on this public briefing. Nothing here is individualized voter outreach."
                : "on public routes. No individual-level conversation data."}
            </span>
            <CountySourceBadge source="demo" note="Illustrative preview — data integration in progress until logged feeds qualify." />
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
