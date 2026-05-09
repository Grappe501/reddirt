import type { StrategyDoc } from "../types";

export const hubDocument: StrategyDoc = {
  path: "",
  title: "Campaign Strategy",
  subtitle:
    "Kelly Grappe for Arkansas Secretary of State — integrated strategic plan, victory math, programs, and GOTV alignment. Internal use; operational detail mirrors `docs/kelly-grappe-sos-strategic-plan-manual/`.",
  eyebrow: "Strategic layer",
  blocks: [
    {
      kind: "lead",
      text: "This is the operator-facing strategic layer: navigation mirrors the manual, with the numbers lane (LANE), program chapters, compliance, and placeholders for richer county workbench analytics as those buildouts complete.",
    },
    {
      kind: "callout",
      tone: "navy",
      title: "Internal classification",
      body: "Redact budget figures and county targeting detail before sharing outside leadership. The authoritative editable source remains the Markdown manual in the repo until you choose to sync copy here.",
    },
    {
      kind: "h2",
      text: "Start here",
    },
    {
      kind: "cards",
      items: [
        {
          title: "Targets & budget (LANE)",
          description: "Victory math, 50K registration ambition, county tiers, budget mix, GOTV lockbox, master backward clock.",
          path: "lane",
        },
        {
          title: "Executive summary",
          description: "Mission, ten synchronized programs, headline targets, risks, next actions.",
          path: "executive-summary",
        },
        {
          title: "GOTV & Election Day",
          description: "Command rhythm, phases T-56 through E-Day, legal pack, scoreboard.",
          path: "programs/gotv",
        },
        {
          title: "Build audit",
          description: "What RedDirt and county workbench can operationalize today; targets ↔ systems mapping.",
          path: "build-audit",
        },
        {
          title: "KPIs & measurement",
          description: "North-star dashboard, program scorecards, LANE crosswalk, GOTV reporting.",
          path: "programs/kpis",
        },
        {
          title: "County analytics (coming)",
          description: "Placeholder for post–county workbench enrichment: voter concentration, readiness overlays.",
          path: "future/county-workbench",
        },
      ],
    },
    {
      kind: "h2",
      text: "How this maps to the manual",
    },
    {
      kind: "ul",
      items: [
        "`docs/kelly-grappe-sos-strategic-plan-manual/README.md` — canonical TOC",
        "`LANE-BUDGET-VICTORY-MATH-AND-TARGETS.md` — numbers you edit first when strategy shifts",
        "`campaign-system-manual/` — Campaign OS owner’s manual (roles, workflows)",
      ],
    },
  ],
};
