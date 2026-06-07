export const STRATEGY_DOCTRINE_DIR = "data/strategy-doctrine";

export const STRATEGY_DOCTRINE_HUB_HREF = "/admin/intelligence/strategy-doctrine";

export type StrategyDoctrineJsonEntry = {
  pathKey: string;
  fileName: string;
  label: string;
  summary: string;
  category: "registry" | "values" | "field" | "turnout" | "operations" | "research";
  registryDoctrineIds: string[];
};

export const STRATEGY_DOCTRINE_JSON_ENTRIES: StrategyDoctrineJsonEntry[] = [
  {
    pathKey: "campaign-strategic-doctrine-registry",
    fileName: "campaign-strategic-doctrine-registry.json",
    label: "Strategic doctrine registry (SDI-1)",
    summary: "Master registry — all campaign doctrines, review status, narrative links, and source paths.",
    category: "registry",
    registryDoctrineIds: [],
  },
  {
    pathKey: "steve-strategy-doctrine",
    fileName: "steve-strategy-doctrine.json",
    label: "Steve strategy doctrine",
    summary: "Structured intake — unity, eye-to-eye campaigning, balls-and-strikes SOS, guardrails.",
    category: "values",
    registryDoctrineIds: ["doctrine-steve-strategy-json", "doctrine-steve-strategy"],
  },
  {
    pathKey: "arkansas-grassroots-principles",
    fileName: "arkansas-grassroots-principles.json",
    label: "Arkansas grassroots principles",
    summary: "County differences, relationships as infrastructure, local visibility, process legitimacy.",
    category: "field",
    registryDoctrineIds: ["doctrine-grassroots-principles"],
  },
  {
    pathKey: "relational-organizing-playbook",
    fileName: "relational-organizing-playbook.json",
    label: "Relational organizing playbook",
    summary: "Captain ladders, phone trees, trusted-network outreach patterns under guardrails.",
    category: "field",
    registryDoctrineIds: ["doctrine-relational-organizing"],
  },
  {
    pathKey: "event-visibility-playbook",
    fileName: "event-visibility-playbook.json",
    label: "Event visibility playbook",
    summary: "Fairs, festivals, civic clubs, courthouse days — presence before pitch.",
    category: "field",
    registryDoctrineIds: [],
  },
  {
    pathKey: "gotv-backward-calendar-model",
    fileName: "gotv-backward-calendar-model.json",
    label: "GOTV backward calendar model",
    summary: "Election-day-backward planning windows with compliance review gates.",
    category: "turnout",
    registryDoctrineIds: ["doctrine-gotv-backward-planning"],
  },
  {
    pathKey: "poll-watcher-coverage-model",
    fileName: "poll-watcher-coverage-model.json",
    label: "Poll watcher coverage model",
    summary: "County polling-location observer coverage template and gap tracking.",
    category: "operations",
    registryDoctrineIds: [],
  },
  {
    pathKey: "county-strategy-source-index",
    fileName: "county-strategy-source-index.json",
    label: "County strategy source index",
    summary: "Internal and public source map for county strategy and campaign brain artifacts.",
    category: "research",
    registryDoctrineIds: [],
  },
  {
    pathKey: "rockefeller-grassroots-case-study",
    fileName: "rockefeller-grassroots-case-study.json",
    label: "Rockefeller grassroots case study",
    summary: "Historical reform campaign lessons — county persistence, coalition building, sourced context.",
    category: "research",
    registryDoctrineIds: [],
  },
];

export function strategyDoctrineDocHref(pathKey: string): string {
  const key = pathKey.replace(/^\/+|\/+$/g, "");
  return key ? `${STRATEGY_DOCTRINE_HUB_HREF}/${key}` : STRATEGY_DOCTRINE_HUB_HREF;
}

export function findStrategyDoctrineEntry(pathKey: string): StrategyDoctrineJsonEntry | undefined {
  const key = pathKey.replace(/^\/+|\/+$/g, "") || "campaign-strategic-doctrine-registry";
  return STRATEGY_DOCTRINE_JSON_ENTRIES.find((e) => e.pathKey === key);
}

export function listStrategyDoctrinePathKeys(): string[] {
  return STRATEGY_DOCTRINE_JSON_ENTRIES.map((e) => e.pathKey);
}
