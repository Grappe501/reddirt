import type { StrategyDoc } from "../types";

export const appendixDocument: StrategyDoc = {
  path: "appendix",
  title: "Glossary & references",
  eyebrow: "Appendix",
  blocks: [
    {
      kind: "h2",
      text: "Glossary",
    },
    {
      kind: "table",
      headers: ["Term", "Meaning"],
      rows: [
        ["LANE", "LANE-BUDGET-VICTORY-MATH-AND-TARGETS.md — budget + victory + GOTV clock"],
        ["PTV", "Path to victory"],
        ["Lockbox", "Segregated GOTV cash (LANE §4.3)"],
        ["Allocator", "Margin burden split across tiers"],
        ["Tier 1–3", "County priority bands"],
      ],
    },
    {
      kind: "h2",
      text: "Repo references",
    },
    {
      kind: "ul",
      items: [
        "RedDirt/docs/PROJECT_MASTER_MAP.md",
        "RedDirt/docs/REDDIRT_AI_BUILD_MASTER_HANDOFF.md",
        "countyWorkbench/docs/COUNTY_WORKBENCH_MASTER_PLAN.md",
        "RedDirt/campaign-system-manual/README.md",
      ],
    },
  ],
};

export const futureCountyDocument: StrategyDoc = {
  path: "future/county-workbench",
  title: "County workbench analytics (placeholder)",
  eyebrow: "Future data",
  blocks: [
    {
      kind: "callout",
      tone: "gold",
      title: "County workbench product (separate lane)",
      body: "This placeholder stays in RedDirt until an approved integration packet. Operators: the parallel product lives under `countyWorkbench/` in the monorepo — start with `countyWorkbench/docs/COUNTY_WORKBENCH_MASTER_PLAN.md`. Do not import county workbench code into RedDirt without Steve’s sign-off.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "After full county workbench buildouts",
      body: "This section will host overlays: voter concentration hypotheses, readiness vs intelligence coverage, export drill-downs (still no public PII), and sync notes with RedDirt CountyCampaignStats. For now, use the county portal operator tools and LANE tier list as the manual crosswalk.",
    },
    {
      kind: "h2",
      text: "Planned overlays (placeholders)",
    },
    {
      kind: "ul",
      items: [
        "County-level registration velocity vs workbench public narrative",
        "Path-to-victory readiness score vs Tier assignment (flag mismatches)",
        "Regional rollup cards linked to strategy tiers",
        "Source-intake completion vs fair/LTE scheduling",
      ],
    },
    {
      kind: "h2",
      text: "Action",
    },
    {
      kind: "p",
      text: "When analytics ship, add deep links from this page to internal reports or /admin routes — keep governance: no voter PII on this surface unless explicitly scoped and access-controlled elsewhere.",
    },
  ],
};
