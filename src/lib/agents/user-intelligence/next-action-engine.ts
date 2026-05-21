import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";
import type { AgentDomain } from "../orchestration/cross-domain-context-composer";
import type { CampaignUserRole } from "./user-personas";
import { getUserPersona } from "./user-personas";
import type { UserObservationEntry } from "./user-observations";

export type NextActionUrgency = "now" | "today" | "this_week" | "when_ready";

export type NextActionCategory = "review" | "fix" | "approve" | "print" | "sync" | "promote" | "learn" | "build";

export type NextActionRecommendation = {
  id: string;
  title: string;
  why: string;
  href: string;
  urgency: NextActionUrgency;
  confidence: "high" | "medium" | "low";
  category: NextActionCategory;
  primary?: boolean;
};

export type NextActionResult = {
  role: CampaignUserRole;
  primary: NextActionRecommendation;
  secondary: NextActionRecommendation[];
  calmSummary: string;
  avoidOverwhelmNote: string;
  sprintAwareNote?: string;
};

export type NextActionEngineInput = {
  role: CampaignUserRole;
  pathname: string;
  period: string;
  snapshot?: CampaignEventsDashboardSnapshot | null;
  recentObservations?: UserObservationEntry[];
  readinessScore?: number | null;
  syncStale?: boolean;
  crossDomain?: { activeDomain: AgentDomain; blockers: string[] };
};

function rec(
  partial: Omit<NextActionRecommendation, "id"> & { id?: string },
): NextActionRecommendation {
  return {
    category: partial.category ?? "review",
    id: partial.id ?? `na_${partial.title.slice(0, 12).replace(/\W/g, "_")}`,
    ...partial,
  };
}

function observationBoost(
  candidates: NextActionRecommendation[],
  recent: UserObservationEntry[] | undefined,
  pathname: string,
): NextActionRecommendation[] {
  if (!recent?.length) return candidates;
  const clicks = recent.filter((o) => o.event === "next_action_clicked" || o.event === "dashboard_card_clicked");
  const rejected = recent.filter((o) => o.event === "suggestion_rejected").map((o) => o.meta?.actionId).filter(Boolean);
  const onPath = recent.filter((o) => o.pathname === pathname);

  return candidates
    .map((c) => {
      let score = c.primary ? 10 : 0;
      if (c.urgency === "now") score += 5;
      if (c.confidence === "high") score += 3;
      if (clicks.some((o) => o.meta?.href === c.href || o.meta?.actionId === c.id)) score += 4;
      if (rejected.includes(c.id)) score -= 8;
      if (onPath.some((o) => o.event === "flow_abandoned" && c.category === "review")) score += 2;
      return { c, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ c }) => c);
}

export function buildNextActions(input: NextActionEngineInput): NextActionResult {
  const persona = getUserPersona(input.role);
  const s = input.snapshot;
  const period = input.period;
  const recent = input.recentObservations;
  const candidates: NextActionRecommendation[] = [];

  if (s) {
    if (input.role === "candidate" && s.pendingApprovals > 0) {
      candidates.push(
        rec({
          title: `Review ${s.pendingApprovals} pending approval package${s.pendingApprovals === 1 ? "" : "s"}`,
          why: "Candidate decisions unlock travel and calendar promotion.",
          href: `/admin/campaign-events/review?month=${period}&mode=chronological`,
          urgency: "now",
          confidence: "high",
          category: "approve",
          primary: true,
        }),
      );
    }
    if (input.role === "candidate" && s.upcoming.length > 0) {
      candidates.push(
        rec({
          title: "Open today's upcoming events",
          why: `${s.upcoming.length} event(s) in the next 14 days need awareness.`,
          href: `/admin/campaign-events/${s.upcoming[0].recordId}`,
          urgency: "today",
          confidence: "medium",
          category: "review",
        }),
      );
    }
    if (input.role === "campaign_manager") {
      if (s.actionItems.travelReview > 0) {
        candidates.push(
          rec({
            title: `Clear ${s.actionItems.travelReview} travel review row(s)`,
            why: "Mileage and reimbursement depend on complete travel data.",
            href: `/admin/campaign-events/review?month=${period}&mode=travel_needs_approval&autostart=1`,
            urgency: "today",
            confidence: "high",
            category: "review",
            primary: true,
          }),
        );
      }
      if (s.needsIntakeReviewCount > 0) {
        candidates.push(
          rec({
            title: `Review ${s.needsIntakeReviewCount} website intake item(s)`,
            why: "Tentative website requests need operator review before promotion.",
            href: `/admin/campaign-events/review?month=${period}&mode=needs_intake_review&autostart=1`,
            urgency: "today",
            confidence: "high",
            category: "review",
          }),
        );
      }
      if (s.promotionReadyTentative > 0 || s.promotionFailed > 0) {
        candidates.push(
          rec({
            title:
              s.promotionFailed > 0
                ? `Retry ${s.promotionFailed} failed calendar promotion(s)`
                : `Promote ${s.promotionReadyTentative} event(s) to tentative GCal`,
            why: "Human-controlled Google writes — preview payload before Promote.",
            href: `/admin/campaign-events/calendar-promotion?month=${period}`,
            urgency: "this_week",
            confidence: "medium",
            category: "promote",
          }),
        );
      }
      if (input.syncStale || s.calendarSync?.jsonStale) {
        candidates.push(
          rec({
            title: "Resolve calendar sync stale warning",
            why: "Operators should refresh normalized JSON or run sync commands before trusting truth.",
            href: `/admin/campaign-events/calendar-sync?month=${period}`,
            urgency: "today",
            confidence: "high",
            category: "sync",
            primary: !candidates.some((c) => c.primary),
          }),
        );
      }
      if (s.intakeConflictCount > 0) {
        candidates.push(
          rec({
            title: `Resolve ${s.intakeConflictCount} schedule conflict warning(s)`,
            why: "Conflicts block confident promotion to Google Calendar.",
            href: `/admin/campaign-events/review?month=${period}&mode=intake_conflict`,
            urgency: "today",
            confidence: "medium",
            category: "fix",
          }),
        );
      }
    }
    if (input.role === "treasurer" || input.pathname.includes("reimbursement")) {
      const ready = input.crossDomain?.blockers.length === 0 && s.actionItems.travelReview === 0;
      candidates.push(
        rec({
          title: ready
            ? `Print or export ${period} reimbursement request`
            : `Complete travel approvals before ${period} reimbursement print`,
          why: ready
            ? "Official reimbursement packet is the treasurer-facing deliverable."
            : "Print/download before ready causes rework — clear travel queue first.",
          href: ready
            ? `/admin/campaign-events/reimbursement?month=${period}`
            : `/admin/campaign-events/review?month=${period}&mode=travel_needs_approval&autostart=1`,
          urgency: ready ? "this_week" : "today",
          confidence: ready ? "high" : "medium",
          category: ready ? "print" : "approve",
          primary: true,
        }),
      );
    }
  }

  if (recent?.some((o) => o.event === "no_results_search")) {
    candidates.push(
      rec({
        title: "Open month readiness (clear filters)",
        why: "Recent search had no results — readiness dashboard shows gaps by category.",
        href: `/admin/campaign-events/month-readiness?month=${period}`,
        urgency: "today",
        confidence: "medium",
        category: "learn",
      }),
    );
  }

  if (input.role === "new_admin_user") {
    candidates.push(
      rec({
        title: "Start with Campaign Manager Dashboard",
        why: "Central ops hub for queues, travel, and calendar health.",
        href: `/admin/campaign-manager-dashboard?month=${period}`,
        urgency: "now",
        confidence: "high",
        category: "learn",
        primary: true,
      }),
      rec({
        title: `Open ${period} month readiness checklist`,
        why: "Readiness score shows what blocks month close.",
        href: `/admin/campaign-events/month-readiness?month=${period}`,
        urgency: "today",
        confidence: "high",
        category: "learn",
      }),
      rec({
        title: "Use Month Review speed mode",
        why: "Sequential approve/deny/hold with minimal navigation.",
        href: `/admin/campaign-events/review?month=${period}&mode=chronological&autostart=1`,
        urgency: "when_ready",
        confidence: "medium",
        category: "review",
      }),
    );
  }

  if (input.role === "operator" && input.pathname.includes("ai-command-center")) {
    candidates.push(
      rec({
        title: "Review live observations and friction",
        why: "Sprint 2 orchestration — behavior signals drive memory candidates.",
        href: "/admin/ai-command-center#observations",
        urgency: "today",
        confidence: "medium",
        category: "learn",
        primary: true,
      }),
    );
  }

  if (!candidates.length) {
    candidates.push(
      rec({
        title: "Open events workbench",
        why: "No urgent queue detected — browse ledger for the active month.",
        href: `/admin/campaign-events/workbench?month=${period}`,
        urgency: "when_ready",
        confidence: "low",
        category: "review",
        primary: true,
      }),
    );
  }

  const ranked = observationBoost(candidates, recent, input.pathname);
  const primary = ranked.find((c) => c.primary) ?? ranked[0];
  const maxSecondary = persona.informationDensity === "low" ? 2 : persona.nextActionStyle === "one_primary" ? 2 : 4;
  const secondary = ranked.filter((c) => c.id !== primary.id).slice(0, maxSecondary);

  const calmSummary =
    persona.nextActionStyle === "one_primary"
      ? `Focus on: ${primary.title}`
      : `${primary.title} — plus ${secondary.length} optional step(s).`;

  const sprintAwareNote =
    input.crossDomain?.blockers.length
      ? `Agent Intelligence Sprint 2: ${input.crossDomain.blockers.length} cross-domain blocker(s) detected.`
      : "Agent Intelligence Sprint 2: observations improving recommendations.";

  return {
    role: input.role,
    primary: { ...primary, primary: true },
    secondary,
    calmSummary,
    avoidOverwhelmNote: persona.doNotOverwhelmRules[0] ?? "Show fewer actions when possible.",
    sprintAwareNote,
  };
}
