import type { EmailWorkflowInterpretationContext } from "./context";
import type {
  EmailWorkflowContextFragment,
  EmailWorkflowInterpreterExtensionResult,
  EmailWorkflowInterpretationSignals,
} from "./types";

/**
 * E-3 placeholder: policy routing (segment, team, or workflow branch). No side effects in E-2A.
 */
export function policyRoutingHookE3(_args: {
  ctx: EmailWorkflowInterpretationContext;
  fragments: EmailWorkflowContextFragment[];
  signals: EmailWorkflowInterpretationSignals;
}): unknown {
  return undefined;
}

/**
 * E-4 placeholder: connect to comms draft / template recommendation (not implemented).
 */
export function draftRecommendationHookE4(_args: {
  ctx: EmailWorkflowInterpretationContext;
  fragments: EmailWorkflowContextFragment[];
  signals: EmailWorkflowInterpretationSignals;
}): unknown {
  return undefined;
}

/**
 * Future: aggregate confidence 0..1 from fragment coverage + heuristics agreement.
 */
export function confidenceScoringHook(_args: {
  ctx: EmailWorkflowInterpretationContext;
  fragments: EmailWorkflowContextFragment[];
  signals: EmailWorkflowInterpretationSignals;
}): number | null {
  return null;
}

/**
 * Future: suggest `assignedToUserId` from org roles, thread assignee, or plan owner.
 */
export function assigneeSuggestionHook(_args: {
  ctx: EmailWorkflowInterpretationContext;
}): string | null {
  return null;
}

export function runForwardPacketPlaceholderHooks(
  ctx: EmailWorkflowInterpretationContext,
  fragments: EmailWorkflowContextFragment[],
  signals: EmailWorkflowInterpretationSignals
): EmailWorkflowInterpreterExtensionResult {
  return {
    policyRouteHint: policyRoutingHookE3({ ctx, fragments, signals }),
    draftRecommendationHint: draftRecommendationHookE4({ ctx, fragments, signals }),
    confidenceHint: confidenceScoringHook({ ctx, fragments, signals }),
    assigneeUserIdHint: assigneeSuggestionHook({ ctx }),
  };
}
