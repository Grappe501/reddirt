import type { UserObservationEntry } from "./user-observations";

export type FrictionSeverity = "low" | "medium" | "high";

export type WorkflowFrictionSignal = {
  frictionType: string;
  affectedRoute: string;
  affectedObjectId?: string | null;
  severity: FrictionSeverity;
  suggestedUxFix: string;
  suggestedAiTool: string;
  suggestedNextAction: string;
  occurrenceCount: number;
};

function countByKey(obs: UserObservationEntry[], keyFn: (o: UserObservationEntry) => string): Map<string, number> {
  const m = new Map<string, number>();
  for (const o of obs) {
    const k = keyFn(o);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

export function detectWorkflowFriction(
  observations: UserObservationEntry[],
  opts?: { pathname?: string; recordId?: string | null },
): WorkflowFrictionSignal[] {
  const recent = observations.slice(-120);
  const filtered = opts?.pathname
    ? recent.filter((o) => !o.pathname || o.pathname === opts.pathname)
    : recent;
  const signals: WorkflowFrictionSignal[] = [];

  const pageReturns = countByKey(filtered, (o) => o.pathname ?? "unknown");
  for (const [route, count] of pageReturns) {
    if (count >= 4 && route !== "unknown") {
      signals.push({
        frictionType: "repeated_page_visits",
        affectedRoute: route,
        severity: count >= 8 ? "high" : "medium",
        suggestedUxFix: "Surface primary next action higher; reduce duplicate navigation.",
        suggestedAiTool: "adaptive-next-action-engine",
        suggestedNextAction: "Open recommended next from Agent panel",
        occurrenceCount: count,
      });
    }
  }

  const abandoned = filtered.filter(
    (o) => o.event === "flow_abandoned" || o.event === "abandoned_flow" || o.event === "review_queue_started",
  );
  if (abandoned.length >= 2) {
    signals.push({
      frictionType: "abandoned_review_queue",
      affectedRoute: abandoned[abandoned.length - 1]?.pathname ?? "/admin/campaign-events/review",
      severity: "high",
      suggestedUxFix: "Resume Month Review with autostart=1; show queue count in header.",
      suggestedAiTool: "workflow-friction-detector",
      suggestedNextAction: "Return to travel_needs_approval queue",
      occurrenceCount: abandoned.length,
    });
  }

  const noResults = filtered.filter((o) => o.event === "no_results_search");
  if (noResults.length >= 2) {
    signals.push({
      frictionType: "search_no_results",
      affectedRoute: noResults[noResults.length - 1]?.pathname ?? "/admin/campaign-events/workbench",
      severity: "medium",
      suggestedUxFix: "Broaden default filters or show empty-state guidance.",
      suggestedAiTool: "microcopy-context-router",
      suggestedNextAction: "Clear filters and open month readiness",
      occurrenceCount: noResults.length,
    });
  }

  const helpHovers = filtered.filter((o) => o.event === "help_hover_opened");
  if (helpHovers.length >= 5) {
    signals.push({
      frictionType: "frequent_help_hovers",
      affectedRoute: helpHovers[helpHovers.length - 1]?.pathname ?? "",
      severity: "low",
      suggestedUxFix: "Expand microcopy on this surface; add inline checklist.",
      suggestedAiTool: "hover-help-router",
      suggestedNextAction: "Review microcopy registry terms for this page",
      occurrenceCount: helpHovers.length,
    });
  }

  const promoBlocked = filtered.filter((o) => o.event === "promotion_attempted");
  if (promoBlocked.length >= 2) {
    signals.push({
      frictionType: "promotion_attempts_blocked",
      affectedRoute: "/admin/campaign-events/calendar-promotion",
      severity: "medium",
      suggestedUxFix: "Show readiness blockers before Promote modal.",
      suggestedAiTool: "promotion-readiness-checker",
      suggestedNextAction: "Fix approval/sync blockers then preview payload",
      occurrenceCount: promoBlocked.length,
    });
  }

  const printEarly = filtered.filter((o) => o.event === "print_clicked" || o.event === "download_clicked");
  const needsReview = filtered.some((o) => o.meta?.reimbursementStatus === "needs_review");
  if (printEarly.length >= 2 && needsReview) {
    signals.push({
      frictionType: "print_before_ready",
      affectedRoute: "/admin/campaign-events/reimbursement",
      severity: "medium",
      suggestedUxFix: "Gate print CTA until month status is ready/finalized.",
      suggestedAiTool: "mr-reimbursement-status-checker",
      suggestedNextAction: "Complete travel approvals first",
      occurrenceCount: printEarly.length,
    });
  }

  const fieldOverrides = filtered.filter((o) => o.event === "field_overridden" || o.event === "correction_started");
  const byField = countByKey(fieldOverrides, (o) => String(o.meta?.field ?? o.recordId ?? "unknown"));
  for (const [field, count] of byField) {
    if (count >= 3 && field !== "unknown") {
      signals.push({
        frictionType: "repeated_field_corrections",
        affectedRoute: fieldOverrides[fieldOverrides.length - 1]?.pathname ?? "",
        affectedObjectId: field,
        severity: "medium",
        suggestedUxFix: "Add inference assist or validation on this field.",
        suggestedAiTool: "mr-rt-miles",
        suggestedNextAction: `Fix ${field} in travel log / month review`,
        occurrenceCount: count,
      });
    }
  }

  return signals.sort((a, b) => severityRank(b.severity) - severityRank(a.severity)).slice(0, 8);
}

function severityRank(s: FrictionSeverity): number {
  return s === "high" ? 3 : s === "medium" ? 2 : 1;
}
