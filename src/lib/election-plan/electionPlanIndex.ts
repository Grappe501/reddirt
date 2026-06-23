import type { ElectionPlanArchitectureSection } from "./types";

/** Static table-of-contents for the 300-page plan architecture (Tab 10). */
export const ELECTION_PLAN_ARCHITECTURE: ElectionPlanArchitectureSection[] = [
  {
    id: "executive-mission",
    title: "Executive Mission Briefing",
    description: "Why Kelly can win a plurality · campaign phase · Brain status",
    path: "docs/strategic-plan/plurality-victory-plan/executive-mission-briefing",
  },
  {
    id: "part-i",
    title: "Part I — Theory of Victory",
    description: "Four lanes · Big Table Democrat · coalition identity",
    path: "docs/strategic-plan/plurality-victory-plan/part-i-theory-of-victory",
    children: [
      {
        id: "four-lanes",
        title: "Four-Lane Model",
        description: "Retention · Reactivation · Registration · Conversion",
        path: "docs/strategic-plan/plurality-victory-plan/part-i-theory-of-victory/chapter-01-four-lane-model",
      },
      {
        id: "how-we-win-candidate",
        title: "How We Win — Candidate Version",
        description: "Kelly's north star for every room — 10 minutes from the heart",
        path: "/election-plan/how-we-win/candidate-version",
      },
      {
        id: "big-table",
        title: "Big Table Democrat Doctrine",
        description: "Working-class coalition · dignity · nonpartisan local offices",
        path: "/election-plan/big-table-doctrine",
      },
    ],
  },
  {
    id: "part-ii",
    title: "Part II — Electoral Math",
    description: "Drop-off · registration · scenarios · opportunity scorecard",
    path: "docs/strategic-plan/plurality-victory-plan/part-ii-electoral-math",
    children: [
      {
        id: "drop-off",
        title: "Democratic Drop-Off",
        description: "102,070 raw · 51,051 @ 50%",
        path: "docs/strategic-plan/plurality-victory-plan/part-ii-electoral-math/chapter-04-democratic-drop-off",
      },
      {
        id: "registration",
        title: "50,000 New Voter Plan",
        description: "County allocation · weekly pace",
        path: "docs/strategic-plan/plurality-victory-plan/part-ii-electoral-math/chapter-05-fifty-thousand-new-voter-plan",
      },
      {
        id: "scenarios",
        title: "Scenario Engine",
        description: "Conservative · Expected · Aggressive",
        path: "docs/campaign-brain/scenario-engine",
      },
    ],
  },
  {
    id: "part-iii",
    title: "Part III — Arkansas Battlefield",
    description: "Top 125 priority cities · Top 10 deep dives · 75 county playbooks",
    path: "docs/strategic-plan/plurality-victory-plan/part-iii-arkansas-battlefield",
    children: [
      {
        id: "top-40",
        title: "Top 125 City Strategy",
        description: "207,507 vote target",
        path: "docs/strategic-plan/plurality-victory-plan/part-iii-arkansas-battlefield/chapter-07-top-40-city-strategy",
      },
      {
        id: "county-playbooks",
        title: "75 County Playbooks",
        description: "VCI-ranked missions",
        path: "docs/strategic-plan/plurality-victory-plan/part-iii-arkansas-battlefield/chapter-09-seventy-five-county-playbook",
      },
    ],
  },
  {
    id: "part-iv",
    title: "Part IV — 20-Week Execution",
    description: "Cluster-week approach · candidates until Calendar Truth",
    path: "docs/strategic-plan/plurality-victory-plan/part-iv-twenty-week-execution",
  },
  {
    id: "part-v",
    title: "Part V — Secretary of State Strategy",
    description: "Office-specific lane · clerks · election integrity",
    path: "docs/strategic-plan/plurality-victory-plan/part-v-secretary-of-state-strategy",
  },
  {
    id: "part-vi",
    title: "Part VI — Campaign Dashboard",
    description: "Command center · four lanes · clusters",
    path: "docs/strategic-plan/plurality-victory-plan/command-center",
  },
  {
    id: "appendices",
    title: "Appendices A–N",
    description: "Reference tables · methodology · data sources",
    path: "docs/strategic-plan/plurality-victory-plan/appendices",
  },
  {
    id: "campaign-brain",
    title: "Campaign Brain",
    description: "Decision intelligence · weekly brief · learning loops",
    path: "docs/campaign-brain",
  },
  {
    id: "calendar-truth",
    title: "Operation Calendar Truth",
    description: "Verification sprint · field workbench · exit criteria",
    path: "docs/campaign-brain/operations/OPERATION-CALENDAR-TRUTH.md",
  },
  {
    id: "relational",
    title: "Relational Organizing Engine",
    description: "Relationship Capital · fifth execution engine",
    path: "docs/campaign-brain/relational-organizing",
  },
  {
    id: "executive-book-v1",
    title: "Executive Book V1.0",
    description: "Ownership · contacts · Labor Day · scorecard · Kelly message",
    path: "docs/strategic-plan/plurality-victory-plan/executive-book-v1",
    children: [
      {
        id: "who-owns-what",
        title: "WHO OWNS WHAT",
        description: "Leadership ownership matrix — one name per function",
        path: "docs/strategic-plan/plurality-victory-plan/executive-book-v1/01-WHO-OWNS-WHAT",
      },
      {
        id: "executive-contacts",
        title: "Executive Contact Plan",
        description: "Prioritized statewide relationship targets",
        path: "docs/strategic-plan/plurality-victory-plan/executive-book-v1/02-EXECUTIVE-CONTACT-PLAN",
      },
      {
        id: "labor-day",
        title: "September Readiness — Labor Day",
        description: "Readiness gate before persuasion season",
        path: "docs/strategic-plan/plurality-victory-plan/executive-book-v1/03-SEPTEMBER-READINESS-LABOR-DAY",
      },
      {
        id: "weekly-scorecard",
        title: "Weekly Success Scorecard",
        description: "Monday leadership metrics",
        path: "docs/strategic-plan/plurality-victory-plan/executive-book-v1/04-WEEKLY-SUCCESS-SCORECARD",
      },
      {
        id: "kelly-message",
        title: "The Kelly Grappe Message",
        description: "North-star candidate messaging doctrine",
        path: "docs/strategic-plan/plurality-victory-plan/executive-book-v1/05-THE-KELLY-GRAPPE-MESSAGE",
      },
      {
        id: "completion-audit",
        title: "Executive Book Completion Audit",
        description: "V1.0 readiness assessment · shift to execution",
        path: "docs/strategic-plan/plurality-victory-plan/executive-book-v1/EXECUTIVE-BOOK-COMPLETION-AUDIT",
      },
    ],
  },
  {
    id: "governance",
    title: "Governance Checkpoint",
    description: "Brain health · Monday rhythm · leadership directive",
    path: "docs/campaign-brain/governance",
  },
];
