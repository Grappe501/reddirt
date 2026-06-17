/**
 * Scaffold Executive Book 2.0 chapter markdown (Campaign OS manual).
 * Run: npx tsx scripts/campaign-brain/scaffold-executive-book-v2.ts
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "docs/strategic-plan/plurality-victory-plan/executive-book-v2");

type ChapterScaffold = {
  file: string;
  title: string;
  sections: string[];
  osLink?: { label: string; href: string };
  docs?: string[];
};

const CHAPTERS: ChapterScaffold[] = [
  {
    file: "02-COUNTY-STRATEGY.md",
    title: "Chapter 2 — County Strategy",
    sections: [
      "County classifications (Tier A–D)",
      "County Workbench doctrine — intelligence vs community execution",
      "Battlefield counties",
      "Growth counties",
      "Maintenance counties",
      "County scorecards and VCI",
    ],
    osLink: { label: "County intelligence index", href: "/election-plan?tab=countyPlaybooks" },
    docs: ["docs/COUNTY_WORKBENCH_V4_DOCTRINE.md", "docs/COUNTY_WORKBENCH_V3_ELECTION_PLAN.md"],
  },
  {
    file: "03-COMMUNITY-STRATEGY.md",
    title: "Chapter 3 — Community Strategy",
    sections: [
      "Community Workbench doctrine",
      "City plans and vote-share stretch goals",
      "Campus plans",
      "Program workbenches (Direct Democracy, Election Integrity, etc.)",
      "Event workbenches — event leadership ≠ city leadership",
    ],
    osLink: { label: "Community Workbench hub", href: "/election-plan/workbenches" },
    docs: ["docs/COMMUNITY_WORKBENCH_V1_3_PILOT.md"],
  },
  {
    file: "04-COALITION-STRATEGY.md",
    title: "Chapter 4 — Coalition Strategy",
    sections: [
      "Coalition Command doctrine",
      "African American outreach",
      "Hispanic outreach",
      "Faith outreach",
      "Muslim outreach",
      "Veterans · Labor · Educators · Youth · Disability · Small business",
    ],
    osLink: { label: "Coalition Command hub", href: "/election-plan?tab=coalitionCommand" },
  },
  {
    file: "05-PPEN.md",
    title: "Chapter 5 — People Power Execution Network (PPEN)",
    sections: [
      "Person Layer — identity and consent",
      "Participation Layer — activation and access levels",
      "Relationship Layer — My Five and trusted networks",
      "Impact Layer — votes, volunteers, leaders, dollars",
      "My Journey · My Five · Help 10 Participate",
      "Leadership pathways and network multiplication",
    ],
    osLink: { label: "People Power tab", href: "/election-plan?tab=peoplePower" },
    docs: ["docs/PPEN_A0B_PARTICIPANT_IDENTITY_LAYER.md", "docs/PPEN_A0C_VOLUNTEER_INTAKE_ACTIVATION.md"],
  },
  {
    file: "07-COUNTY-WORKBENCH-SYSTEM.md",
    title: "Chapter 7 — County Workbench System",
    sections: [
      "County intelligence operating center",
      "Leadership and open positions",
      "Fundraising county rollups",
      "Relationships and field log",
      "Events and calendar binding",
      "Elections · demographics · economy · officials",
      "Intelligence gathering and data gaps",
    ],
    osLink: { label: "Example county operating center", href: "/election-plan/counties/pulaski" },
    docs: ["docs/COUNTY_WORKBENCH_V4_DOCTRINE.md"],
  },
  {
    file: "08-COMMUNITY-WORKBENCH-SYSTEM.md",
    title: "Chapter 8 — Community Workbench System",
    sections: [
      "City execution model",
      "Readiness model (bottleneck radar)",
      "Events and committees",
      "Relationships and local intel",
      "Reporting and field log",
      "Special KPI projects",
    ],
    osLink: { label: "Jacksonville city workbench (pilot)", href: "/election-plan/workbenches/jacksonville" },
  },
  {
    file: "09-EVENT-OPERATIONS.md",
    title: "Chapter 9 — Event Operations",
    sections: [
      "Grassroots & Guitar Strings model ($20K profit opportunity)",
      "House party model",
      "County fairs · Chamber events · Forums · Town halls",
      "Run of show",
      "Assignments",
      "AAR process",
      "Event leadership ≠ city leadership",
    ],
    osLink: {
      label: "Grassroots & Guitar Strings event workbench",
      href: "/election-plan/workbenches/sherwood/events/grassroots-and-guitar-strings",
    },
  },
  {
    file: "10-VOTER-ENGAGEMENT.md",
    title: "Chapter 10 — Voter Engagement",
    sections: [
      "Help 10 Participate",
      "Registration verification",
      "Vote plans",
      "Polling information",
      "Election reminders",
      "Nonpartisan voter support",
    ],
    osLink: { label: "People Power", href: "/election-plan?tab=peoplePower" },
  },
  {
    file: "11-CAMPAIGN-COMMUNICATIONS-HUB.md",
    title: "Chapter 11 — Campaign Communications Hub (CCH)",
    sections: [
      "Communications doctrine",
      "Substack architecture",
      "Public feed · Insider feed",
      "Contact acquisition",
      "Segmentation",
    ],
    osLink: { label: "Communications workbenches", href: "/election-plan/workbenches?kind=communications" },
  },
  {
    file: "12-SOCIAL-MEDIA-OPERATING-SYSTEM.md",
    title: "Chapter 12 — Social Media Operating System",
    sections: [
      "Content Studio",
      "Platform workbenches",
      "Creator network",
      "Story Corps integration",
      "Rapid response",
      "Approval and distribution workflow",
    ],
    osLink: { label: "Social media workbenches", href: "/election-plan/workbenches?kind=social" },
  },
  {
    file: "14-COMMUNICATIONS-CALENDAR.md",
    title: "Chapter 14 — Communications Calendar",
    sections: [
      "Daily rhythm",
      "Weekly rhythm",
      "County communications",
      "Coalition communications",
      "Event communications",
    ],
    osLink: { label: "Field calendar", href: "/election-plan?tab=fieldCalendar" },
  },
  {
    file: "16-FUNDRAISING-OPPORTUNITIES.md",
    title: "Chapter 16 — Fundraising Opportunities",
    sections: [
      "Opportunity architecture — not the same as base goals",
      "House parties",
      "Major donor meetings",
      "Sponsorships",
      "Grassroots events (G&G)",
      "Campus and coalition fundraising",
      "Online fundraising",
    ],
    osLink: { label: "Sherwood fundraising block", href: "/election-plan/workbenches/sherwood#fundraising" },
  },
  {
    file: "17-FUNDRAISING-LEADERSHIP.md",
    title: "Chapter 17 — Fundraising Leadership",
    sections: [
      "County fundraising leads",
      "Community fundraising leads",
      "Event fundraising leads",
      "Opportunity ownership",
      "Accountability systems",
    ],
    osLink: { label: "Leadership hub", href: "/election-plan/leadership" },
  },
  {
    file: "18-VOLUNTEER-ONBOARDING.md",
    title: "Chapter 18 — Volunteer Onboarding & Activation",
    sections: [
      "Recruitment funnel",
      "Activation workflow",
      "Access levels",
      "Training and certifications",
      "Placement",
    ],
    osLink: { label: "Operator access", href: "/election-plan/operators" },
    docs: ["docs/PPEN_A0C_VOLUNTEER_INTAKE_ACTIVATION.md"],
  },
  {
    file: "19-TECHNOLOGY-DATA-SYSTEMS.md",
    title: "Chapter 19 — Technology & Data Systems",
    sections: [
      "Election Plan OS",
      "County Workbench (in-plan)",
      "Community Workbench",
      "Coalition Command",
      "PPEN",
      "CCH · SMOS · FOS",
      "CRM and Discord integration roadmap",
    ],
    osLink: { label: "Admin Election Plan hub", href: "/admin/election-plan" },
  },
  {
    file: "21-IMMERSION-COUNTY-MISSIONS.md",
    title: "Chapter 21 — Immersion County Missions",
    sections: [
      "Quitman — Montgomery County leadership",
      "Jacksonville — city workbench pilot",
      "Sherwood — city plan vs G&G event (separate surfaces)",
      "Mt. Ida",
      "Jonesboro",
      "Benton County",
      "Future immersion counties",
    ],
    osLink: { label: "Immersion missions hub", href: "/election-plan/immersion-missions" },
  },
  {
    file: "22-CAMPAIGN-CALENDAR.md",
    title: "Chapter 22 — Campaign Calendar",
    sections: [
      "County visit sequence",
      "Leadership deadlines",
      "Hiring deadlines",
      "Fundraising deadlines",
      "Event deadlines",
    ],
    osLink: { label: "Executive field calendar", href: "/election-plan?tab=fieldCalendar" },
  },
  {
    file: "APPENDIX-H-WORKBENCH-ARCHITECTURE.md",
    title: "Appendix H — Workbench Architecture",
    sections: [
      "Campaign OS stack",
      "State → County → Community → Event hierarchy",
      "Election Plan portal routes",
      "Data integrity doctrine",
      "Legacy systems (reference only)",
      "Glossary cross-links",
    ],
    osLink: { label: "Election Plan home", href: "/election-plan" },
  },
];

function renderChapter(c: ChapterScaffold): string {
  const lines = [
    `# ${c.title}`,
    "",
    "> **Executive Book 2.0** · Campaign Operating System manual · Internal leadership briefing",
    "",
    "This chapter is part of the operating manual for the full Campaign OS — not a standalone campaign plan PDF.",
    "",
  ];
  if (c.osLink) {
    lines.push(
      "**Live system:**",
      `[${c.osLink.label}](${c.osLink.href}) in the Election Plan portal.`,
      "",
    );
  }
  lines.push("## Sections in this chapter", "");
  for (const s of c.sections) {
    lines.push("- " + s);
  }
  lines.push("", "## Operator notes", "");
  lines.push(
    "Scaffold status: **draft** — prose expands as each workbench ships record-backed metrics. Do not invent county or coalition statistics here; link to live workbench surfaces instead.",
  );
  if (c.docs?.length) {
    lines.push("", "## Related build docs", "");
    for (const d of c.docs) {
      lines.push(["- ", "`", d, "`"].join(""));
    }
  }
  lines.push("");
  return lines.join("\n");
}

function main(): void {
  mkdirSync(OUT, { recursive: true });

  for (const ch of CHAPTERS) {
    const target = path.join(OUT, ch.file);
    if (existsSync(target)) {
      console.log(`skip (exists): ${ch.file}`);
      continue;
    }
    writeFileSync(target, renderChapter(ch), "utf8");
    console.log(`wrote: ${ch.file}`);
  }

  const readme = `# Executive Book 2.0 — The Arkansas Way to Win

> **Campaign Operating System manual** · Internal · Election Plan portal

Executive Book 1.x was a leadership briefing. **Executive Book 2.0** is the operating manual for the full Campaign OS:

\`\`\`text
Campaign Plan  →  Campaign Operating System
\`\`\`

## Structure

| Part | Chapters | Focus |
|------|----------|--------|
| Doctrine | 0 | Movement philosophy |
| Part I — Victory Strategy | 1–6 | Math, counties, communities, coalitions, PPEN, leadership |
| Part II — Field Operations | 7–10 | County & community workbenches, events, voter engagement |
| Part III — Communications | 11–14 | CCH, SMOS, storytelling, calendar |
| Part IV — Fundraising | 15–17 | FOS, opportunities, leadership |
| Part V — Infrastructure | 18–20 | Onboarding, technology, accountability |
| Part VI — Execution | 21–24 | Immersion, calendar, Labor Day, Election Day |
| Appendices | H+ | Architecture, registries, glossary |

## Portal routes

Each chapter: \`/election-plan/executive-book/{slug}\`

Hub: \`/election-plan/executive-book\`

## Build

\`\`\`bash
npm run campaign-brain:executive-book:v2:scaffold   # chapter scaffolds (this folder)
npm run campaign-brain:executive-book:completion    # v1 JSON companions
npm run election-plan:build
\`\`\`

V1 prose chapters remain in \`../executive-book-v1/\` and are linked from the V2 registry where content already exists.
`;

  writeFileSync(path.join(OUT, "README.md"), readme, "utf8");

  writeFileSync(
    path.join(OUT, "executive-book-v2.summary.json"),
    JSON.stringify(
      {
        version: "2.0",
        edition: "2.0",
        status: "operational_scaffold",
        laborDayDeadline: "2026-09-07",
        completenessEstimate: "35%",
        chapterCount: 26,
        note: "V2 OS manual — scaffolds + migrated V1 prose. PPEN and Leadership chapters are priority rewrites.",
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log("Executive Book 2.0 scaffold complete.");
}

main();
