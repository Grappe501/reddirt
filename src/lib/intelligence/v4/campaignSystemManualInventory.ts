/**
 * Phase 11 (P0) — Campaign system manual intelligence inventory & category depth.
 */
import {
  buildCampaignSystemNav,
  CAMPAIGN_SYSTEM_CATEGORY_LABELS,
  CAMPAIGN_SYSTEM_MANUAL_HUB_HREF,
  campaignSystemDocHref,
  type CampaignSystemCategoryId,
  type CampaignSystemNavSection,
} from "@/lib/campaign-strategy/campaign-system-nav";

export type CampaignSystemCategoryGuide = {
  categoryId: CampaignSystemCategoryId;
  label: string;
  summary: string;
  operatorUse: string[];
  intelligenceLinks: Array<{ href: string; label: string }>;
  priorityPathKeys: string[];
};

export type CampaignSystemManualSurface = {
  id: string;
  pathKey: string;
  title: string;
  categoryId: CampaignSystemCategoryId;
  href: string;
  phase11Enriched: boolean;
};

const CATEGORY_GUIDES: CampaignSystemCategoryGuide[] = [
  {
    categoryId: "root-tomes",
    label: CAMPAIGN_SYSTEM_CATEGORY_LABELS["root-tomes"],
    summary:
      "Top-level operating system docs — lifecycle manual, simulation plans, tool stack maps, morning-brief systems, and onboarding culture. Highest strategic value outside Kelly SOS reader.",
    operatorUse: [
      "Start with CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL for end-to-end campaign architecture.",
      "Pair SIMULATION_AND_FORECASTING with scenario-simulation intelligence surface.",
      "Use WORKBENCH_MORNING_BRIEF doc when wiring morning-brief staff lane to strategy command.",
    ],
    intelligenceLinks: [
      { href: CAMPAIGN_SYSTEM_MANUAL_HUB_HREF, label: "Campaign system hub" },
      { href: "/admin/intelligence/strategy-philosophy-hub", label: "Strategy & philosophy hub" },
      { href: "/admin/intelligence/scenario-simulation", label: "Scenario simulation" },
      { href: "/admin/intelligence/morning-brief", label: "Morning brief" },
    ],
    priorityPathKeys: [
      "CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL",
      "SIMULATION_AND_FORECASTING_SYSTEM_PLAN",
      "CAMPAIGN_TOOL_STACK_OPERATING_SYSTEM_MAP",
      "WORKBENCH_MORNING_BRIEF_AND_DAILY_OBJECTIVE_SYSTEM",
      "ANYONE_CAN_ONBOARD_CAMPAIGN_CULTURE_AND_PATHWAY_SYSTEM",
    ],
  },
  {
    categoryId: "chapters",
    label: CAMPAIGN_SYSTEM_CATEGORY_LABELS.chapters,
    summary: "Numbered manual chapters — dashboard hierarchy, field organizing, KPIs, technical architecture, training, future roadmap.",
    operatorUse: [
      "Cross-read chapter 06 (dashboard hierarchy) with build-audit Kelly manual chapter.",
      "Chapter 14 KPIs pairs with strategic-target-pathway NSI-7.",
      "Chapter 17 technical architecture pairs with RedDirt/county workbench audit.",
    ],
    intelligenceLinks: [
      { href: "/admin/intelligence/build-progress", label: "Build progress" },
      { href: "/admin/intelligence/strategic-target-pathway", label: "Target pathway" },
      { href: "/admin/campaign-strategy/build-audit", label: "Build audit manual" },
    ],
    priorityPathKeys: ["chapters/06-dashboard-hierarchy/README", "chapters/14-kpis-and-scorecards/README"],
  },
  {
    categoryId: "playbooks",
    label: CAMPAIGN_SYSTEM_CATEGORY_LABELS.playbooks,
    summary: "SOPs, escalation paths, training module index, dashboard attachment rules — operator execution layer.",
    operatorUse: [
      "Use TRAINING_MODULE_INDEX before assigning debate-week staff drills.",
      "ESCALATION_PATHS pairs with human action queue governance.",
      "DASHBOARD_ATTACHMENT_RULES before promoting Field Book canon bodies.",
    ],
    intelligenceLinks: [
      { href: "/admin/intelligence/action-queue", label: "Human action queue" },
      { href: "/admin/intelligence/field-book/canon", label: "Canon loop" },
      { href: "/admin/intelligence/agent-tooling", label: "Agent tooling" },
    ],
    priorityPathKeys: ["playbooks/TRAINING_MODULE_INDEX", "playbooks/ESCALATION_PATHS"],
  },
  {
    categoryId: "roles",
    label: CAMPAIGN_SYSTEM_CATEGORY_LABELS.roles,
    summary: "Per-role README guides — admin, volunteer, event lead, narrative distribution, compliance, precinct captain, etc.",
    operatorUse: [
      "Map role guides to three-lane nav profiles (Kelly / clerks / staff).",
      "narrative-distribution-lead pairs with opposition-strategy and writing-toolbox.",
      "volunteer role guide pairs with volunteer-philosophy foundation (future Phase 11B wire).",
    ],
    intelligenceLinks: [
      { href: "/admin/intelligence/field-book/role-based-nav-profiles", label: "Role-based nav" },
      { href: "/admin/intelligence/writing-toolbox", label: "Writing toolbox" },
      { href: "/admin/intelligence/opposition-strategy", label: "Opposition strategy" },
    ],
    priorityPathKeys: ["roles/narrative-distribution-lead/README", "roles/volunteer/README"],
  },
  {
    categoryId: "workflows",
    label: CAMPAIGN_SYSTEM_CATEGORY_LABELS.workflows,
    summary: "End-to-end workflows — intake, message creation, field reporting, Power of 5 onboarding, volunteer email sequences.",
    operatorUse: [
      "MESSAGE_CREATION_TO_DISTRIBUTION pairs with briefing-papers and narrative distribution command center.",
      "FIELD_REPORTING_TO_DASHBOARD_ROLLUP pairs with county clerk week and relational field manual chapter.",
      "FIRST_EMAIL_TO_ACTIVE_VOLUNTEER is staff-lane onboarding — not candidate-safe.",
    ],
    intelligenceLinks: [
      { href: "/admin/intelligence/briefing-papers", label: "Briefing papers" },
      { href: "/admin/intelligence/county-clerk-week", label: "County clerk week" },
      { href: "/admin/campaign-strategy/programs/relational-field", label: "Relational field manual" },
    ],
    priorityPathKeys: ["workflows/MESSAGE_CREATION_TO_DISTRIBUTION", "workflows/FIELD_REPORTING_TO_DASHBOARD_ROLLUP"],
  },
  {
    categoryId: "inventories",
    label: CAMPAIGN_SYSTEM_CATEGORY_LABELS.inventories,
    summary: "Documentation inventories and completion reports — meta layer for manual pass tracking.",
    operatorUse: [
      "Use DOCUMENTATION_INVENTORY to prioritize next manual promotion batches.",
      "Pass completion reports inform build-progress phase flags — do not treat as stage-safe narrative.",
    ],
    intelligenceLinks: [
      { href: "/admin/intelligence/build-progress", label: "Build progress" },
      { href: "/admin/intelligence/strategy-alignment", label: "Strategy alignment" },
    ],
    priorityPathKeys: ["inventories/DOCUMENTATION_INVENTORY"],
  },
  {
    categoryId: "maps",
    label: CAMPAIGN_SYSTEM_CATEGORY_LABELS.maps,
    summary: "Data flow, approval flow, and system wiring maps — architecture cross-reference for staff.",
    operatorUse: [
      "DATA_FLOW_MAP before editing intelligence graph entity resolution.",
      "APPROVAL_FLOW_MAP before claims promotion workflow changes.",
    ],
    intelligenceLinks: [
      { href: "/admin/intelligence/campaign-intelligence-graph", label: "Campaign intelligence graph" },
      { href: "/admin/intelligence/claims", label: "Claims ledger" },
    ],
    priorityPathKeys: ["maps/DATA_FLOW_MAP", "maps/APPROVAL_FLOW_MAP"],
  },
  {
    categoryId: "web-presentation",
    label: CAMPAIGN_SYSTEM_CATEGORY_LABELS["web-presentation"],
    summary: "Web manual IA and presentation specs — bridges public site and admin intelligence UX.",
    operatorUse: [
      "WEB_MANUAL_INFORMATION_ARCHITECTURE informs Field Book Phase E public-adaptation paths.",
      "Pair with sos-public lane coordination before any cross-lane import.",
    ],
    intelligenceLinks: [
      { href: "/admin/intelligence/field-book", label: "Field Book" },
      { href: "/admin/intelligence/build-progress", label: "Build progress" },
    ],
    priorityPathKeys: ["web-presentation/WEB_MANUAL_INFORMATION_ARCHITECTURE"],
  },
];

const PRIORITY_PATH_KEY_SET = new Set(
  CATEGORY_GUIDES.flatMap((g) => g.priorityPathKeys),
);

export function getCampaignSystemCategoryGuide(
  categoryId: CampaignSystemCategoryId,
): CampaignSystemCategoryGuide | undefined {
  return CATEGORY_GUIDES.find((g) => g.categoryId === categoryId);
}

export function listCampaignSystemCategoryGuides(): CampaignSystemCategoryGuide[] {
  return CATEGORY_GUIDES;
}

export async function buildCampaignSystemManualInventory(): Promise<{
  nav: CampaignSystemNavSection[];
  surfaces: CampaignSystemManualSurface[];
  totalFiles: number;
  categoryCounts: Record<CampaignSystemCategoryId, number>;
}> {
  const nav = await buildCampaignSystemNav();
  const surfaces: CampaignSystemManualSurface[] = [];

  for (const section of nav) {
    for (const item of section.items) {
      surfaces.push({
        id: `csm-${item.pathKey.replace(/\//g, "-")}`,
        pathKey: item.pathKey,
        title: item.label,
        categoryId: item.categoryId,
        href: campaignSystemDocHref(item.pathKey),
        phase11Enriched: PRIORITY_PATH_KEY_SET.has(item.pathKey),
      });
    }
  }

  const categoryCounts = {} as Record<CampaignSystemCategoryId, number>;
  for (const section of nav) {
    categoryCounts[section.id] = section.items.length;
  }

  return {
    nav,
    surfaces,
    totalFiles: surfaces.length,
    categoryCounts,
  };
}

export function isPriorityCampaignSystemPath(pathKey: string): boolean {
  return PRIORITY_PATH_KEY_SET.has(pathKey);
}
