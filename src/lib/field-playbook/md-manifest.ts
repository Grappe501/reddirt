export type FieldPlaybookNavSectionId =
  | "overview"
  | "structure"
  | "roles"
  | "rhythm"
  | "coordination"
  | "rollout"
  | "metrics"
  | "recruitment";

export type FieldPlaybookNavSection = {
  id: FieldPlaybookNavSectionId;
  title: string;
  items: { path: string; label: string }[];
};

const PLAYBOOK_DIR = "field-structure/playbook";

export type FieldPlaybookMdEntry = {
  section: FieldPlaybookNavSectionId;
  path: string;
  label: string;
  file: string;
};

export const FIELD_PLAYBOOK_MD_ENTRIES: FieldPlaybookMdEntry[] = [
  { section: "overview", path: "", label: "Overview", file: "README.md" },
  {
    section: "overview",
    path: "overview/self-building-team-system",
    label: "Self-Building Team System",
    file: "overview/self-building-team-system.md",
  },
  {
    section: "structure",
    path: "structure/fractal-overview",
    label: "Fractal model (how layers fit)",
    file: "structure/01-fractal-overview.md",
  },
  {
    section: "structure",
    path: "structure/state-team",
    label: "State team",
    file: "structure/02-state-team.md",
  },
  {
    section: "structure",
    path: "structure/county-team",
    label: "County team",
    file: "structure/03-county-team.md",
  },
  {
    section: "structure",
    path: "structure/city-team",
    label: "City / town team",
    file: "structure/04-city-team.md",
  },
  {
    section: "structure",
    path: "structure/precinct-team",
    label: "Precinct team",
    file: "structure/05-precinct-team.md",
  },
  {
    section: "structure",
    path: "structure/neighborhood-team",
    label: "Neighborhood / block team",
    file: "structure/06-neighborhood-team.md",
  },
  {
    section: "roles",
    path: "roles/overview",
    label: "Three roles (summary)",
    file: "roles/00-roles-overview.md",
  },
  {
    section: "roles",
    path: "roles/events-coordinator",
    label: "Events coordinator",
    file: "roles/01-events-coordinator.md",
  },
  {
    section: "roles",
    path: "roles/events-hosting-playbook",
    label: "Events · hosting playbook (step-by-step)",
    file: "roles/01b-events-hosting-playbook.md",
  },
  {
    section: "roles",
    path: "roles/house-party-playbook",
    label: "Events · house party playbook",
    file: "roles/01c-house-party-playbook.md",
  },
  {
    section: "roles",
    path: "roles/fundraising-receptions-county",
    label: "Events · fundraising receptions & county goals",
    file: "roles/01d-fundraising-receptions-county.md",
  },
  {
    section: "roles",
    path: "roles/weekend-community-immersion",
    label: "Events · Weekend Community Immersion",
    file: "roles/01e-weekend-community-immersion.md",
  },
  {
    section: "roles",
    path: "roles/two-day-city-immersion",
    label: "Events · two-day city immersion",
    file: "roles/01f-two-day-city-immersion.md",
  },
  {
    section: "roles",
    path: "roles/travel-rhythm-model",
    label: "Events · travel rhythm model",
    file: "roles/01g-travel-rhythm-model.md",
  },
  {
    section: "roles",
    path: "roles/faith-community-visits",
    label: "Events · faith community visits",
    file: "roles/01h-faith-community-visits.md",
  },
  {
    section: "roles",
    path: "roles/small-format-gatherings",
    label: "Events · coffee, lunch, appetizers, clergy coffee",
    file: "roles/01i-small-format-gatherings.md",
  },
  {
    section: "roles",
    path: "roles/festivals-fairs-local-guide",
    label: "Events · festivals, fairs & local guide",
    file: "roles/01j-festivals-fairs-local-guide.md",
  },
  {
    section: "roles",
    path: "roles/county-clerk-visit-checklist",
    label: "Events · County Clerk visit checklist",
    file: "roles/01k-county-clerk-visit-checklist.md",
  },
  {
    section: "roles",
    path: "roles/social-coordinator",
    label: "Social media coordinator",
    file: "roles/02-social-media-coordinator.md",
  },
  {
    section: "roles",
    path: "roles/social-amplifier-playbook",
    label: "Social · amplifier playbook (step-by-step)",
    file: "roles/02b-social-amplifier-playbook.md",
  },
  {
    section: "roles",
    path: "roles/social-advanced-local-press",
    label: "Social · local media & press graphics (advanced)",
    file: "roles/02c-social-advanced-local-press.md",
  },
  {
    section: "roles",
    path: "roles/power-of-five-coordinator",
    label: "Power of 5 / relational coordinator",
    file: "roles/03-power-of-five-coordinator.md",
  },
  {
    section: "roles",
    path: "roles/relational-touch-playbook",
    label: "Relational · contact playbook (step-by-step)",
    file: "roles/03b-relational-touch-playbook.md",
  },
  {
    section: "roles",
    path: "roles/p5-vr-event-operations",
    label: "P5 / VR · registration events & polling-place readiness",
    file: "roles/03c-p5-vr-event-operations.md",
  },
  {
    section: "roles",
    path: "roles/youth-semester-campus-execution",
    label: "Youth · semester rhythm & campus challenges",
    file: "roles/06-youth-semester-campus-execution.md",
  },
  {
    section: "roles",
    path: "roles/womens-outreach-execution",
    label: "Women’s Outreach · family events & listening sessions",
    file: "roles/07-womens-outreach-execution.md",
  },
  {
    section: "rhythm",
    path: "rhythm/one-hour-week",
    label: "The one-hour week (tasks)",
    file: "rhythm/01-one-hour-week.md",
  },
  {
    section: "rhythm",
    path: "rhythm/weekly-huddle",
    label: "Weekly huddle agenda",
    file: "rhythm/02-weekly-huddle.md",
  },
  {
    section: "coordination",
    path: "coordination/campaign-coordinator",
    label: "Campaign coordinator support",
    file: "coordination/01-campaign-coordinator.md",
  },
  {
    section: "coordination",
    path: "coordination/community-region-leadership",
    label: "Community region leadership · training scaffold",
    file: "coordination/02-community-region-leadership.md",
  },
  {
    section: "rollout",
    path: "rollout/thirty-sixty-ninety",
    label: "30 · 60 · 90 day rollout",
    file: "rollout/01-thirty-sixty-ninety.md",
  },
  {
    section: "metrics",
    path: "metrics/key-metrics",
    label: "Key metrics & reporting",
    file: "metrics/01-key-metrics.md",
  },
  {
    section: "recruitment",
    path: "recruitment/pitch-and-faq",
    label: "Recruitment pitch & FAQ",
    file: "recruitment/01-pitch-and-faq.md",
  },
];

const SECTION_TITLES: Record<FieldPlaybookNavSectionId, string> = {
  overview: "Start here",
  structure: "Fractal structure",
  roles: "Three-person roles",
  rhythm: "Weekly rhythm",
  coordination: "Campaign coordination",
  rollout: "Rollout",
  metrics: "Metrics",
  recruitment: "Recruitment",
};

function buildNav(): FieldPlaybookNavSection[] {
  const sectionOrder: FieldPlaybookNavSectionId[] = [
    "overview",
    "structure",
    "roles",
    "rhythm",
    "coordination",
    "rollout",
    "metrics",
    "recruitment",
  ];
  return sectionOrder.map((id) => ({
    id,
    title: SECTION_TITLES[id],
    items: FIELD_PLAYBOOK_MD_ENTRIES.filter((e) => e.section === id).map((e) => ({
      path: e.path,
      label: e.label,
    })),
  }));
}

export const FIELD_PLAYBOOK_NAV: FieldPlaybookNavSection[] = buildNav();

export const FIELD_PLAYBOOK_MANUAL_DIR = PLAYBOOK_DIR;

const pathToFile = new Map<string, string>(FIELD_PLAYBOOK_MD_ENTRIES.map((e) => [e.path, e.file]));
const fileToPath = new Map<string, string>(FIELD_PLAYBOOK_MD_ENTRIES.map((e) => [e.file, e.path]));

export function getFieldPlaybookMarkdownFilename(pathKey: string): string | null {
  const key = pathKey.replace(/^\/+|\/+$/g, "");
  return pathToFile.get(key) ?? null;
}

export function getFieldPlaybookFileToPathMap(): Map<string, string> {
  return new Map(fileToPath);
}

export function findFieldPlaybookNavLabel(path: string): string | undefined {
  const normalized = path.replace(/^\/+|\/+$/g, "");
  for (const section of FIELD_PLAYBOOK_NAV) {
    const hit = section.items.find((i) => i.path === normalized);
    if (hit) return hit.label;
  }
  return undefined;
}
