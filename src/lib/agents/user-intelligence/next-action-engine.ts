import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";
import type { CampaignUserRole } from "./user-personas";
import { getUserPersona } from "./user-personas";
import type { UserObservationEntry } from "./user-observations";

export type NextActionUrgency = "now" | "today" | "this_week" | "when_ready";

export type NextActionRecommendation = {
  id: string;
  title: string;
  why: string;
  href: string;
  urgency: NextActionUrgency;
  confidence: "high" | "medium" | "low";
  primary?: boolean;
};

export type NextActionResult = {
  role: CampaignUserRole;
  primary: NextActionRecommendation;
  secondary: NextActionRecommendation[];
  calmSummary: string;
  avoidOverwhelmNote: string;
};

export type NextActionEngineInput = {
  role: CampaignUserRole;
  pathname: string;
  period: string;
  snapshot?: CampaignEventsDashboardSnapshot | null;
  recentObservations?: UserObservationEntry[];
  readinessScore?: number | null;
  syncStale?: boolean;
};

function rec(
  partial: Omit<NextActionRecommendation, "id"> & { id?: string },
): NextActionRecommendation {
  return { id: partial.id ?? `na_${partial.title.slice(0, 12).replace(/\W/g, "_")}`, ...partial };
}

export function buildNextActions(input: NextActionEngineInput): NextActionResult {
  const persona = getUserPersona(input.role);
  const s = input.snapshot;
  const period = input.period;
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
        }),
      );
    }
    if (input.role === "campaign_manager") {
      if (s.actionItems.travelReview > 0) {
        candidates.push(
          rec({
            title: `Clear ${s.actionItems.travelReview} travel review row(s)`,
            why: "Mileage and reimbursement depend on complete travel data.",
            href: `/admin/campaign-events/travel-report?month=${period}`,
            urgency: "today",
            confidence: "high",
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
          }),
        );
      }
    }
    if (input.role === "treasurer" || input.pathname.includes("reimbursement")) {
      candidates.push(
        rec({
          title: `Print or export ${period} reimbursement request`,
          why: "Official reimbursement packet is the treasurer-facing deliverable.",
          href: `/admin/campaign-events/reimbursement?month=${period}`,
          urgency: "this_week",
          confidence: "high",
          primary: true,
        }),
      );
    }
  }

  if (input.role === "new_admin_user") {
    candidates.push(
      rec({
        title: "Start with Campaign Manager Dashboard",
        why: "Central ops hub for queues, travel, and calendar health.",
        href: `/admin/campaign-manager-dashboard?month=${period}`,
        urgency: "now",
        confidence: "high",
        primary: true,
      }),
      rec({
        title: `Open ${period} month readiness checklist`,
        why: "Readiness score shows what blocks month close.",
        href: `/admin/campaign-events/month-readiness?month=${period}`,
        urgency: "today",
        confidence: "high",
      }),
      rec({
        title: "Use Month Review speed mode",
        why: "Sequential approve/deny/hold with minimal navigation.",
        href: `/admin/campaign-events/review?month=${period}&mode=chronological&autostart=1`,
        urgency: "when_ready",
        confidence: "medium",
      }),
    );
  }

  if (input.role === "operator" && input.pathname.includes("ai-command-center")) {
    candidates.push(
      rec({
        title: "Review campaign gap analyzer output",
        why: "Highest-impact build/ops gap for Agent Intelligence sprints.",
        href: "/admin/ai-command-center#gaps",
        urgency: "today",
        confidence: "medium",
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
        primary: true,
      }),
    );
  }

  const primary = candidates.find((c) => c.primary) ?? candidates[0];
  const secondary = candidates.filter((c) => c.id !== primary.id).slice(0, persona.nextActionStyle === "one_primary" ? 2 : 4);

  const maxSecondary = persona.informationDensity === "low" ? 2 : 4;
  const calmSummary =
    persona.nextActionStyle === "one_primary"
      ? `Focus on: ${primary.title}`
      : `${primary.title} — plus ${Math.min(secondary.length, maxSecondary)} optional step(s).`;

  return {
    role: input.role,
    primary: { ...primary, primary: true },
    secondary: secondary.slice(0, maxSecondary),
    calmSummary,
    avoidOverwhelmNote: persona.doNotOverwhelmRules[0] ?? "Show fewer actions when possible.",
  };
}
