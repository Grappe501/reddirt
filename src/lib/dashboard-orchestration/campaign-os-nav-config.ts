import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";

export type CampaignOsNavLink = {
  href: string;
  label: string;
  roles?: CampaignUserRole[];
  badgeKey?: "approvals" | "travel" | "intake" | "sync" | "finance" | "hotwash";
};

export type CampaignOsNavGroup = {
  id: string;
  label: string;
  links: CampaignOsNavLink[];
};

const M = (month: string) => month;

/** Workflow-grouped Campaign OS navigation (Sprint 9). */
export function buildCampaignOsNavGroups(activeMonth = "2026-03"): CampaignOsNavGroup[] {
  const month = activeMonth;
  return [
    {
      id: "today",
      label: "Today",
      links: [
        { href: "/admin/onboarding", label: "New here? Start" },
        { href: "/admin/ai-command-center", label: "Command center" },
        { href: `/admin/campaign-manager-dashboard?month=${month}`, label: "CM dashboard", roles: ["campaign_manager", "operator"] },
        { href: `/admin/candidate-dashboard?month=${month}`, label: "Candidate dashboard", roles: ["candidate"] },
        { href: "/admin/workbench", label: "Open work (UWR)" },
      ],
    },
    {
      id: "calendar",
      label: "Calendar",
      links: [
        { href: "/admin/campaign-calendar/timeline", label: "Campaign timeline" },
        { href: `/admin/campaign-calendar/month?month=${month}`, label: "Month grid" },
        { href: `/admin/campaign-events/calendar-sync?month=${month}`, label: "Sync dashboard", badgeKey: "sync" },
        { href: "/admin/campaign-events/calendar-promotion", label: "Calendar promotion" },
        { href: "/admin/calendar-command-center/kelly", label: "Kelly cockpit" },
      ],
    },
    {
      id: "approvals",
      label: "Approvals",
      links: [
        { href: `/admin/campaign-events/review?month=${month}&mode=chronological`, label: "Month review", badgeKey: "approvals" },
        { href: `/admin/campaign-events/workbench?month=${month}`, label: "Events workbench" },
        { href: `/admin/campaign-events/month-readiness?month=${month}`, label: "Month readiness" },
      ],
    },
    {
      id: "events",
      label: "Events",
      links: [
        { href: `/admin/campaign-events/workbench?month=${month}`, label: "Workbench queue" },
        { href: `/admin/campaign-events/travel-log?month=${month}`, label: "Travel log" },
        { href: `/admin/campaign-events/review?month=${month}&mode=travel_needs_approval`, label: "Travel approvals", badgeKey: "travel" },
      ],
    },
    {
      id: "travel",
      label: "Travel",
      links: [
        { href: `/admin/campaign-events/travel-report?month=${month}`, label: "Travel report", badgeKey: "travel" },
        { href: `/admin/campaign-events/travel-log?month=${month}`, label: "Tentative travel log" },
      ],
    },
    {
      id: "reimbursements",
      label: "Reimbursements",
      links: [
        { href: `/admin/campaign-events/reimbursement?month=${month}`, label: "Official reimbursement" },
        { href: `/admin/candidate-dashboard?month=${month}`, label: "Candidate approvals" },
      ],
    },
    {
      id: "finance",
      label: "Finance",
      links: [
        { href: `/admin/campaign-events/reimbursement?month=${month}`, label: "Finance ops (reimbursement)", badgeKey: "finance" },
        { href: "/admin/financial-transactions", label: "FIN-1 transactions" },
        { href: "/admin/compliance-documents", label: "Compliance documents" },
      ],
    },
    {
      id: "counties",
      label: "Counties",
      links: [
        { href: "/admin/counties", label: "County ops bridge" },
        { href: "/admin/county-intelligence", label: "County intelligence" },
      ],
    },
    {
      id: "volunteers",
      label: "Volunteers",
      links: [
        { href: "/admin/volunteers", label: "Volunteer command center" },
        { href: "/admin/volunteers/intake", label: "Signup sheet intake" },
        { href: "/admin/relational-contacts", label: "Relational CRM" },
        { href: "/admin/asks", label: "Volunteer asks" },
      ],
    },
    {
      id: "communications",
      label: "Communications",
      links: [
        { href: "/admin/communications", label: "Communications center" },
        { href: "/admin/communications/intelligence", label: "Communications intelligence" },
        { href: "/admin/communications/studio", label: "Message Studio" },
        { href: "/admin/workbench/email-command-center", label: "Email command center" },
        { href: "/admin/workbench/comms", label: "Comms hub" },
      ],
    },
    {
      id: "hotwash",
      label: "Hot Wash",
      links: [
        { href: "/admin/campaign-events/media-approval", label: "Media approval queue", badgeKey: "hotwash" },
      ],
    },
    {
      id: "intelligence",
      label: "Intelligence",
      links: [
        { href: "/admin/ai-command-center", label: "AI command center" },
        { href: "/admin/campaign-events/ai-tools", label: "AI tool catalog" },
        { href: "/admin/intelligence", label: "Opposition intel" },
      ],
    },
    {
      id: "ai_agent",
      label: "AI Agent",
      links: [
        { href: "/admin/ai-command-center", label: "Agent runtime hub" },
        { href: "/admin/ai-command-center/memory-review", label: "Memory review" },
        { href: "/admin/onboarding", label: "New user onboarding" },
        { href: "/admin/ai-command-center/dashboard-builder", label: "Dashboard builder" },
      ],
    },
    {
      id: "system_health",
      label: "System Health",
      links: [
        { href: "/admin/ai-command-center", label: "OS control layer" },
        { href: `/admin/campaign-events/calendar-sync?month=${month}`, label: "Calendar health" },
        { href: `/admin/campaign-events/month-readiness?month=${month}`, label: "Month close readiness" },
      ],
    },
  ];
}

export function isCampaignOsPath(pathname: string): boolean {
  return (
    pathname.startsWith("/admin/campaign-") ||
    pathname.startsWith("/admin/candidate-dashboard") ||
    pathname.startsWith("/admin/campaign-manager-dashboard") ||
    pathname.startsWith("/admin/ai-command-center") ||
    pathname.startsWith("/admin/campaign-events") ||
    pathname.startsWith("/admin/campaign-calendar")
  );
}

export { M };
