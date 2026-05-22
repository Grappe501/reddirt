import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";

export type PaletteQueryResult = {
  matched: boolean;
  summary: string;
  blockers: string[];
  links: { label: string; href: string }[];
  readinessHint?: string;
};

/** Deterministic plain-language routing (V1) — no LLM, no writes. */
export function routePaletteQuery(
  query: string,
  period: string,
  snapshot?: CampaignEventsDashboardSnapshot | null,
): PaletteQueryResult | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  const monthMatch = q.match(/(\d{4})[-/](\d{1,2})|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{4})?/i);
  let targetMonth = period;
  if (monthMatch) {
    if (monthMatch[1] && monthMatch[2]) {
      targetMonth = `${monthMatch[1]}-${monthMatch[2].padStart(2, "0")}`;
    } else if (/march/i.test(q)) targetMonth = "2026-03";
    else if (/april/i.test(q)) targetMonth = "2026-04";
    else if (/may/i.test(q)) targetMonth = "2026-05";
  }

  if (q.includes("reimbursement") || q.includes("reimburse") || q.includes("mileage")) {
    const blockers: string[] = [];
    if (snapshot?.needsMileageReview) blockers.push("Mileage review queue not clear");
    if ((snapshot?.actionItems?.travelReview ?? 0) > 0) {
      blockers.push(`${snapshot.actionItems.travelReview} travel review row(s)`);
    }
    if ((snapshot?.pendingApprovals ?? 0) > 0) {
      blockers.push(`${snapshot.pendingApprovals} pending approval(s)`);
    }
    const readiness =
      blockers.length === 0 ? "Likely printable — verify travel decisions on page" : "Not print-ready until blockers cleared";

    return {
      matched: true,
      summary: `Close ${targetMonth} reimbursement: review travel, then open official packet.`,
      blockers,
      links: [
        { label: "Official reimbursement", href: `/admin/campaign-events/reimbursement?month=${targetMonth}` },
        { label: "Travel report", href: `/admin/campaign-events/travel-report?month=${targetMonth}` },
        { label: "Month readiness", href: `/admin/campaign-events/month-readiness?month=${targetMonth}` },
        { label: "Candidate dashboard", href: `/admin/candidate-dashboard?month=${targetMonth}` },
      ],
      readinessHint: readiness,
    };
  }

  if (q.includes("approval") || q.includes("approve")) {
    return {
      matched: true,
      summary: "Approval workflow: month review → package preview → human send (gated).",
      blockers: snapshot?.pendingApprovals
        ? [`${snapshot.pendingApprovals} pending approval(s)`]
        : [],
      links: [
        { label: "Month review", href: `/admin/campaign-events/review?month=${targetMonth}&mode=chronological` },
        { label: "Workbench", href: `/admin/campaign-events/workbench?month=${targetMonth}` },
        { label: "AI tools (approval)", href: "/admin/campaign-events/ai-tools" },
      ],
    };
  }

  if (q.includes("calendar") || q.includes("sync") || q.includes("google")) {
    return {
      matched: true,
      summary: "Calendar truth layer: sync dashboard shows stale warnings and safe CLI steps.",
      blockers: snapshot?.calendarSync?.jsonStale ? ["Normalized JSON stale"] : [],
      links: [
        { label: "Calendar sync", href: `/admin/campaign-events/calendar-sync?month=${targetMonth}` },
        { label: "Campaign timeline", href: "/admin/campaign-calendar/timeline" },
        { label: "Command center", href: "/admin/ai-command-center" },
      ],
    };
  }

  if (q.includes("blocker") || q.includes("stuck") || q.includes("what next") || q.includes("what should")) {
    return {
      matched: true,
      summary: "System blockers and next moves live in AI command center OS control layer.",
      blockers: [],
      links: [
        { label: "AI command center", href: "/admin/ai-command-center" },
        { label: "CM dashboard", href: `/admin/campaign-manager-dashboard?month=${targetMonth}` },
      ],
    };
  }

  if (q.includes("hot wash") || q.includes("county memory")) {
    return {
      matched: true,
      summary: "Hot wash intelligence and county memory: media approval queue and event drilldown tab.",
      blockers: [],
      links: [
        { label: "Media approval", href: "/admin/campaign-events/media-approval" },
        { label: "AI command center (learning)", href: "/admin/ai-command-center" },
      ],
    };
  }

  return null;
}
