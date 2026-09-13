export const TRAFFIC_ANALYSIS_MODE_IDS = [
  "command",
  "seo",
  "journeys",
  "conversion",
  "publish",
  "visitors",
] as const;

export type TrafficAnalysisMode = (typeof TRAFFIC_ANALYSIS_MODE_IDS)[number];

export const TRAFFIC_ANALYSIS_MODES: Array<{
  id: TrafficAnalysisMode;
  title: string;
  blurb: string;
  focus: string;
}> = [
  {
    id: "command",
    title: "Command brief",
    blurb: "The whole window: health, leaks, audience, tonight's moves.",
    focus: "Write an operator command brief. Rank what is working, what is leaking, who is showing up, and the next six moves.",
  },
  {
    id: "seo",
    title: "SEO / search",
    blurb: "How search lands, whether it holds, and the next click.",
    focus: "Analyze only search / SEO. Name landing pages, bounce, next clicks, and engines. Do not invent search queries. Say if SEO is invisible because referrers are missing.",
  },
  {
    id: "journeys",
    title: "Journeys & leaks",
    blurb: "Where people came from, every page they opened, where they left.",
    focus: "Analyze journeys and leaks. Name landing → next → exit patterns. Say which pages trap people and which pages lead deeper.",
  },
  {
    id: "conversion",
    title: "Forms & conversion",
    blurb: "Starts, finishes, and the paths that convert.",
    focus: "Analyze forms and conversion. Compare starts vs finishes. Name the paths that convert and the landings that never reach a form.",
  },
  {
    id: "publish",
    title: "What to share",
    blurb: "Which live pages to post tonight and copy you can paste.",
    focus: "Recommend what to share tonight. Only name pages that already have hits. Include utm advice and paste-ready lines. No unsourced claims.",
  },
  {
    id: "visitors",
    title: "Visitor-by-visitor",
    blurb: "Read the visit log like an analyst, especially the last 24 hours.",
    focus: "Read the provided journeys one by one. Cluster similar visits. Call out deep visits, bounces, returning people, and odd paths. Never invent a person or a name.",
  },
];

export function parseTrafficAnalysisMode(raw: string | undefined): TrafficAnalysisMode {
  const id = (raw ?? "").trim();
  return TRAFFIC_ANALYSIS_MODE_IDS.includes(id as TrafficAnalysisMode) ? (id as TrafficAnalysisMode) : "command";
}

export function trafficAnalysisModeMeta(mode: TrafficAnalysisMode) {
  return TRAFFIC_ANALYSIS_MODES.find((row) => row.id === mode) ?? TRAFFIC_ANALYSIS_MODES[0]!;
}
