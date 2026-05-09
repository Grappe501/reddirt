import type { StrategyNavSection } from "./types";

const MANUAL_DIR = "docs/kelly-grappe-sos-strategic-plan-manual";

/** Operator / philosophy / workflows corpus (chunked for admin agents; not the Kelly SOS reader nav). */
export const CAMPAIGN_SYSTEM_MANUAL_DIR = "campaign-system-manual";

export type StrategyMdEntry = {
  section: StrategyNavSection["id"];
  path: string;
  label: string;
  /** Filename within MANUAL_DIR */
  file: string;
};

/** Single source for manual → URL → file. Order defines nav order within each section. */
export const STRATEGY_MD_ENTRIES: StrategyMdEntry[] = [
  { section: "foundation", path: "", label: "Overview", file: "README.md" },
  { section: "foundation", path: "meta", label: "Meta & disclaimers", file: "00-META-AND-DISCLAIMERS.md" },
  {
    section: "foundation",
    path: "lane",
    label: "Targets & budget (LANE)",
    file: "LANE-BUDGET-VICTORY-MATH-AND-TARGETS.md",
  },
  { section: "foundation", path: "executive-summary", label: "Executive summary", file: "01-EXECUTIVE-SUMMARY.md" },
  {
    section: "foundation",
    path: "build-audit",
    label: "RedDirt & county workbench audit",
    file: "02-BUILD-AUDIT-REDDIRT-AND-COUNTY-WORKBENCH.md",
  },
  {
    section: "foundation",
    path: "framework",
    label: "Theory of change",
    file: "03-STRATEGIC-FRAMEWORK-AND-THEORY-OF-CHANGE.md",
  },
  {
    section: "programs",
    path: "programs/registration",
    label: "Voter registration",
    file: "04-PROGRAM-VOTER-REGISTRATION-AND-TRACKING.md",
  },
  {
    section: "programs",
    path: "programs/turnout-persuasion-youth",
    label: "Turnout, persuasion, youth",
    file: "05-PROGRAM-TURNOUT-GAPS-PERSUASION-AND-YOUTH.md",
  },
  {
    section: "programs",
    path: "programs/relational-field",
    label: "Relational field & intel",
    file: "06-PROGRAM-RELATIONAL-FIELD-AND-COMMUNITY-INTELLIGENCE.md",
  },
  {
    section: "programs",
    path: "programs/comms-media",
    label: "Comms, media, collateral",
    file: "07-PROGRAM-COMMUNICATIONS-MEDIA-COLLATERAL.md",
  },
  {
    section: "programs",
    path: "programs/rural",
    label: "Rural & 75-county scale",
    file: "08-PROGRAM-RURAL-THESIS-AND-COUNTY-SCALE.md",
  },
  {
    section: "programs",
    path: "programs/faith-communities",
    label: "Faith & diverse communities",
    file: "09-PROGRAM-FAITH-AND-DIVERSE-COMMUNITIES.md",
  },
  {
    section: "programs",
    path: "programs/direct-contact",
    label: "Mail, phone, text, door",
    file: "10-PROGRAM-DIRECT-CONTACT-MAIL-PHONE-TEXT-DOOR.md",
  },
  {
    section: "programs",
    path: "programs/gotv",
    label: "GOTV & Election Day",
    file: "11-PROGRAM-GOTV-AND-ELECTION-DAY.md",
  },
  {
    section: "programs",
    path: "programs/integrity-tour",
    label: "Election integrity tour",
    file: "12-PROGRAM-ELECTION-INTEGRITY-LISTENING-TOUR.md",
  },
  {
    section: "programs",
    path: "programs/fundraising",
    label: "Fundraising & operations",
    file: "13-PROGRAM-FUNDRAISING-AND-OPERATIONS.md",
  },
  {
    section: "programs",
    path: "programs/social",
    label: "Distributed social",
    file: "14-PROGRAM-SOCIAL-MEDIA-DISTRIBUTED-NETWORK.md",
  },
  {
    section: "programs",
    path: "programs/institutional-media",
    label: "Institutional & earned media",
    file: "15-PROGRAM-INSTITUTIONAL-AND-EARNED-MEDIA.md",
  },
  {
    section: "operations",
    path: "programs/kpis",
    label: "KPIs & measurement",
    file: "16-KPIS-MEASUREMENT-AND-TOOL-MAPPING.md",
  },
  {
    section: "operations",
    path: "programs/compliance",
    label: "Compliance & governance",
    file: "17-COMPLIANCE-GOVERNANCE-AND-RISK.md",
  },
  {
    section: "operations",
    path: "programs/quarterly-rhythm",
    label: "Quarterly rhythm",
    file: "18-QUARTERLY-EXECUTION-RHYTHM.md",
  },
  {
    section: "operations",
    path: "appendix",
    label: "Glossary & references",
    file: "APPENDIX-GLOSSARY-AND-REFERENCES.md",
  },
];

const SECTION_TITLES: Record<StrategyNavSection["id"], string> = {
  foundation: "Foundation",
  programs: "Programs",
  operations: "Operations & risk",
  future: "Future data",
};

function buildNav(): StrategyNavSection[] {
  const sectionOrder: StrategyNavSection["id"][] = ["foundation", "programs", "operations"];
  return sectionOrder.map((id) => ({
    id,
    title: SECTION_TITLES[id],
    items: STRATEGY_MD_ENTRIES.filter((e) => e.section === id).map((e) => ({
      path: e.path,
      label: e.label,
    })),
  }));
}

export const STRATEGY_NAV: StrategyNavSection[] = [
  ...buildNav(),
  {
    id: "future",
    title: SECTION_TITLES.future,
    items: [{ path: "future/county-workbench", label: "County workbench analytics (placeholder)" }],
  },
];

export const STRATEGY_MANUAL_DIR = MANUAL_DIR;

const pathToFile = new Map<string, string>(STRATEGY_MD_ENTRIES.map((e) => [e.path, e.file]));
const fileToPath = new Map<string, string>(STRATEGY_MD_ENTRIES.map((e) => [e.file, e.path]));

export function getStrategyMarkdownFilename(pathKey: string): string | null {
  const key = pathKey.replace(/^\/+|\/+$/g, "");
  return pathToFile.get(key) ?? null;
}

/** Resolve sibling manual links like `./LANE-....md#anchor` to route keys. */
export function getStrategyFileToPathMap(): Map<string, string> {
  return new Map(fileToPath);
}

export function findNavLabel(path: string): string | undefined {
  const normalized = path.replace(/^\/+|\/+$/g, "");
  for (const section of STRATEGY_NAV) {
    const hit = section.items.find((i) => i.path === normalized);
    if (hit) return hit.label;
  }
  return undefined;
}