import type { CampaignOsNavLink } from "@/lib/dashboard-orchestration/campaign-os-nav-config";

export type PhaseACommandNavItem = {
  href: string;
  label: string;
  badgeKey?: CampaignOsNavLink["badgeKey"];
  description?: string;
};

/** Phase A + upgrade tracks — pinned to top of sidebar and horizontal subnav. */
export const PHASE_A_COMMAND_NAV_ITEMS: PhaseACommandNavItem[] = [
  {
    href: "/admin/intelligence/supreme-workbench",
    label: "Supreme workbench",
    badgeKey: "opposition",
    description: "Unified command — readiness, trap lanes, Phase A upgrade pass, build gaps.",
  },
  {
    href: "/admin/intelligence/diligence",
    label: "Diligence hub",
    badgeKey: "opposition",
    description: "Phase A — five-search court/financial checklists for Kelly, Hammer, and Pakko.",
  },
  {
    href: "/admin/intelligence/field-book",
    label: "The Field Book",
    badgeKey: "opposition",
    description: "Campaign encyclopedia — four upgrade phases with cross-linked articles.",
  },
  {
    href: "/admin/intelligence/build-progress",
    label: "Build progress",
    description: "Master intelligence stack tracker — tiers, link audit, Phase A completion.",
  },
  {
    href: "/admin/intelligence/candidate-dossiers",
    label: "Candidate dossiers",
    badgeKey: "opposition",
    description:
      "Kelly alignment profile plus Hammer and Pakko opponent dossiers — claims, strengths, lead stories.",
  },
  {
    href: "/admin/intelligence/opponents/michael-packo",
    label: "Pakko command center",
    badgeKey: "opposition",
    description:
      "Phase 0 front door — Dr. Michael Pakko dossier, quote ledger, contrast, diligence, and coaching links.",
  },
];

export const PHASE_A_COMMAND_HREFS = new Set(PHASE_A_COMMAND_NAV_ITEMS.map((i) => i.href));
