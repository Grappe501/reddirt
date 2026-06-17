import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  getExecutiveBookChapter,
  listExecutiveBookChapterSlugs as allExecutiveBookSlugs,
  getCanonicalExecutiveBookChapter,
  type ExecutiveBookChapterSlug,
} from "./executiveBookChapters";
import { getCountyPartyIntelligenceRollup } from "./load-county-party-intelligence";
import { getCountyVictoryTargetsRollup } from "./load-county-victory-targets";
import { getExecutiveBookBudgetLeadership } from "./load-executive-book-budget-leadership";
import {
  extractExecutiveBookToc,
  getAdjacentExecutiveBookChapters,
  getRelatedExecutiveBookChapters,
  getExecutiveBookPillar,
  EXECUTIVE_BOOK_EDITION,
  type ExecutiveBookTocEntry,
} from "./executiveBookNav";

const EXEC_BOOK_ROOT = path.join(
  process.cwd(),
  "docs/strategic-plan/plurality-victory-plan",
);
const V1_META_DIR = path.join(EXEC_BOOK_ROOT, "executive-book-v1");
const BUDGET_SUMMARY_PATH = path.join(process.cwd(), "data/campaign-brain/budget/budget-summary.json");
const GOTV_SUMMARY_PATH = path.join(process.cwd(), "data/campaign-brain/gotv/gotv-operations-plan.json");
const PO5_SUMMARY_PATH = path.join(process.cwd(), "data/campaign-brain/relational-organizing/power-of-5-executive-chapter.json");
const SFA_SUMMARY_PATH = path.join(process.cwd(), "data/campaign-brain/students-for-arkansas/students-for-arkansas.json");
const CV_SUMMARY_PATH = path.join(process.cwd(), "data/campaign-brain/citizen-voices/citizen-voices-network.json");

function readJsonFile<T>(fileName: string): T | null {
  const p = path.join(V1_META_DIR, fileName);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8")) as T;
}

function readBudgetSummary(): {
  disclaimer?: string;
  salaryTotal?: number;
  salaryMonthly?: number;
  travelConservative?: number;
  travelAggressive?: number;
  materialsMid?: number;
  postcardMid?: number;
  sherwoodNetMid?: number;
  bareMinimumTotal?: number;
  workingCampaignTotal?: number;
  aggressiveStatewideTotal?: number;
  monthlyBurnWorking?: number;
  generatedAt?: string;
  workingCampaignRangeLow?: number;
  workingCampaignRangeHigh?: number;
  fieldStrategyTotal?: number;
  digitalProgramTotal?: number;
  mediaOutreachTotal?: number;
  complianceTotal?: number;
} | null {
  if (!existsSync(BUDGET_SUMMARY_PATH)) return null;
  return JSON.parse(readFileSync(BUDGET_SUMMARY_PATH, "utf8"));
}

function readGotvSummary(): {
  electionDay?: string;
  earlyVotingStart?: string;
  winCondition?: { hciGoal?: number; hciCurrent?: number; lane2TurnoutTarget?: number; registrationGoal?: number };
  dailyMetrics?: Array<{ metric: string; goal: string | number; current: string | number }>;
  electionDayChecklist?: Array<{ item: string; status: string }>;
  generatedAt?: string;
} | null {
  if (!existsSync(GOTV_SUMMARY_PATH)) return null;
  return JSON.parse(readFileSync(GOTV_SUMMARY_PATH, "utf8"));
}

function readPo5Summary(): ExecutiveBookChapterPayload["powerOf5Summary"] | null {
  if (!existsSync(PO5_SUMMARY_PATH)) return null;
  return JSON.parse(readFileSync(PO5_SUMMARY_PATH, "utf8"));
}

function readStudentsSummary(): ExecutiveBookChapterPayload["studentsForArkansasSummary"] | null {
  if (!existsSync(SFA_SUMMARY_PATH)) return null;
  return JSON.parse(readFileSync(SFA_SUMMARY_PATH, "utf8"));
}

function readCitizenVoicesSummary(): ExecutiveBookChapterPayload["citizenVoicesSummary"] | null {
  if (!existsSync(CV_SUMMARY_PATH)) return null;
  const cv = JSON.parse(readFileSync(CV_SUMMARY_PATH, "utf8")) as {
    networkName?: string;
    metrics?: {
      foundingWritersCurrent?: number;
      foundingWritersGoal?: number;
      lettersSubmitted?: number;
      lettersSubmittedGoal?: number;
      outletsInInventory?: number;
      countiesRepresented?: number;
      countiesGoal?: number;
    };
  };
  if (!cv.metrics) return null;
  return {
    networkName: cv.networkName ?? "Citizen Voices Network",
    foundingWritersCurrent: cv.metrics.foundingWritersCurrent ?? 0,
    foundingWritersGoal: cv.metrics.foundingWritersGoal ?? 20,
    lettersSubmitted: cv.metrics.lettersSubmitted ?? 0,
    lettersSubmittedGoal: cv.metrics.lettersSubmittedGoal ?? 200,
    outletsInInventory: cv.metrics.outletsInInventory ?? 0,
    countiesRepresented: cv.metrics.countiesRepresented ?? 0,
    countiesGoal: cv.metrics.countiesGoal ?? 75,
  };
}

function readMarkdown(markdownFile: string): string | null {
  const p = path.normalize(path.join(EXEC_BOOK_ROOT, markdownFile));
  if (!p.startsWith(EXEC_BOOK_ROOT)) return null;
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf8");
}

function chapterSlugMatches(slug: ExecutiveBookChapterSlug, ...candidates: string[]): boolean {
  return candidates.includes(slug);
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export type ExecutiveBookBudgetSummary = {
  disclaimer: string;
  salaryFloor: number;
  salaryMonthly: number;
  travelConservative: number;
  travelAggressive: number;
  materialsMid: number;
  postcardMid: number;
  sherwoodNetMid: number;
  bareMinimumTotal: number;
  workingCampaignTotal: number;
  aggressiveStatewideTotal: number;
  monthlyBurnWorking: number;
  workingCampaignRangeLow?: number;
  workingCampaignRangeHigh?: number;
  fieldStrategyTotal?: number;
  digitalProgramTotal?: number;
  mediaOutreachTotal?: number;
  complianceTotal?: number;
};

export type ExecutiveBookChapterPayload = {
  slug: ExecutiveBookChapterSlug;
  number: number;
  title: string;
  subtitle: string;
  markdown: string;
  generatedAt: string | null;
  liveStrip: Array<{ label: string; value: string; detail?: string }>;
  scorecardRows?: Array<{ metric: string; goal: string | number; current: string | number }>;
  ownershipRows?: Array<{
    function: string;
    owner: string;
    backup: string;
    status: string;
    weeklyDeliverable?: string;
  }>;
  influenceGroups?: Array<{ title: string; tier: number; weeklyConversationTarget: number }>;
  budgetSummary?: ExecutiveBookBudgetSummary;
  gotvMetrics?: Array<{ metric: string; goal: string | number; current: string | number }>;
  electionDayChecklist?: Array<{ item: string; status: string }>;
  powerOf5Summary?: {
    generatedAt?: string;
    chapterTitle?: string;
    doctrine: string;
    objective?: string;
    smallRoomsPrinciple?: string;
    networkGoal: number;
    countyHostsGoal?: number;
    hciGoal: number;
    hciCurrent: number;
    powerOf5Commitments: number;
    conversations: number;
    foundingLeaders: number;
    foundingLeadersGoal: number;
    operatingFunnel?: string[];
    threeAsks?: string[];
    eventPyramid?: Array<{ tier: string; purpose: string; examples: string[] }>;
    surrogateTiers?: Array<{ tier: number; name: string; role: string; examples?: string[] }>;
    relationshipLadder: string[];
    bigTableWelcome: string[];
  };
  studentsForArkansasSummary?: {
    generatedAt?: string;
    programName?: string;
    doctrine?: string;
    foundingCoChairs?: Array<{
      id: string;
      name: string | null;
      title: string;
      status: string;
      leadCampus?: string;
      campusFocus?: string[];
    }>;
    campusRoles?: string[];
    internshipTracks?: Array<{ id: string; label: string; activities: string[] }>;
    fundraisingCommissionPercent?: number;
    powerOf5Integration?: string;
    milestones?: Record<string, unknown>;
    metrics?: {
      coChairsConfirmed: number;
      coChairsGoal: number;
      campusLeaders: number;
      campusLeadersLaborDayGoal: number;
      studentVolunteers: number;
      voterRegistrations: number;
      activeCampuses: number;
      campusesInInventory: number;
    };
  };
  citizenVoicesSummary?: {
    networkName: string;
    foundingWritersCurrent: number;
    foundingWritersGoal: number;
    lettersSubmitted: number;
    lettersSubmittedGoal: number;
    outletsInInventory: number;
    countiesRepresented: number;
    countiesGoal: number;
  };
  pillar: string;
  edition: string;
  osRoute: string | null;
  tableOfContents: ExecutiveBookTocEntry[];
  navigation: {
    prev: { slug: ExecutiveBookChapterSlug; number: number; title: string; href: string } | null;
    next: { slug: ExecutiveBookChapterSlug; number: number; title: string; href: string } | null;
  };
  relatedChapters: Array<{ slug: ExecutiveBookChapterSlug; number: number; title: string; href: string }>;
};

export function loadExecutiveBookChapter(slug: string): ExecutiveBookChapterPayload | null {
  const resolved = getExecutiveBookChapter(slug);
  if (!resolved) return null;
  const chapter = getCanonicalExecutiveBookChapter(resolved.slug);

  const markdown = readMarkdown(chapter.markdownFile);
  if (!markdown) return null;

  const summary = readJsonFile<{ generatedAt?: string }>("executive-book-v1.summary.json");
  const scorecard = readJsonFile<{
    weekOf?: string;
    rows?: Array<{ metric: string; goal: string | number; current: string | number }>;
  }>("weekly-scorecard.json");
  const ownership = readJsonFile<{
    assignments?: ExecutiveBookChapterPayload["ownershipRows"];
    unassignedCount?: number;
  }>("ownership-matrix.json");
  const contact = readJsonFile<{
    influenceGroups?: Array<{ title: string; tier: number; weeklyConversationTarget: number }>;
  }>("executive-contact-plan.json");
  const audit = readJsonFile<{
    version?: string;
    status?: string;
    unassignedOwners?: number;
    laborDayDeadline?: string;
  }>("executive-book-completion-audit.json");
  const budget = readBudgetSummary();
  const gotv = readGotvSummary();
  const po5 = readPo5Summary();
  const sfa = readStudentsSummary();
  const citizenVoices = readCitizenVoicesSummary();
  const adjacent = getAdjacentExecutiveBookChapters(chapter.slug);
  const related = getRelatedExecutiveBookChapters(chapter.slug);
  const tableOfContents = extractExecutiveBookToc(markdown);

  const liveStrip: ExecutiveBookChapterPayload["liveStrip"] = [];
  let budgetSummary: ExecutiveBookBudgetSummary | undefined;

  if (chapter.slug === "doctrine") {
    liveStrip.push(
      { label: "Standard", value: "Movement", detail: "Not a campaign" },
      { label: "Immersion missions", value: "7", detail: "One mission per county" },
      { label: "Fundraising", value: "Open doors", detail: "Introductions over call time" },
    );
  }

  if (chapterSlugMatches(chapter.slug, "leadership-development", "ownership") && ownership?.assignments) {
    const assigned = ownership.assignments.length - (ownership.unassignedCount ?? 0);
    liveStrip.push(
      { label: "Assigned", value: String(assigned) },
      { label: "Unassigned", value: String(ownership.unassignedCount ?? 0) },
      { label: "Functions", value: String(ownership.assignments.length) },
    );
  }

  if (chapterSlugMatches(chapter.slug, "coalition-strategy", "influence-map") && contact?.influenceGroups) {
    for (const g of contact.influenceGroups.slice(0, 6)) {
      liveStrip.push({ label: g.title, value: `Tier ${g.tier}`, detail: `${g.weeklyConversationTarget}/wk` });
    }
  }

  if (chapterSlugMatches(chapter.slug, "labor-day-readiness", "labor-day")) {
    liveStrip.push(
      { label: "Pathway", value: "72/75 Active" },
      { label: "Labor Day gate", value: audit?.laborDayDeadline ?? "2026-09-07" },
    );
    const party = getCountyPartyIntelligenceRollup();
    liveStrip.push({ label: "Meeting candidates", value: String(party.meetingCandidates) });
  }

  if (chapterSlugMatches(chapter.slug, "accountability-reporting", "scorecard", "audit") && scorecard?.rows) {
    for (const row of ["HCI", "Founding Leaders", "Counties Covered", "Verified Events"]) {
      const match = scorecard.rows.find((r) => r.metric === row);
      if (match) {
        liveStrip.push({
          label: match.metric,
          value: String(match.current),
          detail: `Goal: ${match.goal}`,
        });
      }
    }
    const party = getCountyPartyIntelligenceRollup();
    liveStrip.push({ label: "County party scrape", value: `${party.fetchedOk}/75` });
  }

  if (chapterSlugMatches(chapter.slug, "accountability-reporting", "audit") && audit) {
    liveStrip.push(
      { label: "Version", value: audit.version ?? "2.0" },
      { label: "Status", value: (audit.status ?? "operational").replace(/_/g, " ") },
      { label: "TBD owners", value: String(audit.unassignedOwners ?? 0) },
    );
  }

  if (chapterSlugMatches(chapter.slug, "media-storytelling", "message")) {
    liveStrip.push(
      { label: "Doctrine pillars", value: "8" },
      { label: "Audience", value: "Every room" },
    );
  }

  if (chapterSlugMatches(chapter.slug, "path-to-victory", "county-victory-targets")) {
    const rollup = getCountyVictoryTargetsRollup();
    const party = getCountyPartyIntelligenceRollup();
    liveStrip.push(
      { label: "Counties", value: String(rollup.countyCount) },
      { label: "Total growth needed", value: `+${rollup.totalGrowthNeeded.toLocaleString("en-US")}` },
      { label: "Party chairs ingested", value: String(party.chairsFound) },
      { label: "Parseable meetings", value: String(party.parseableMeetings) },
    );
  }

  if (chapterSlugMatches(chapter.slug, "fundraising-operating-system", "budget") && budget) {
    const leadership = getExecutiveBookBudgetLeadership();
    budgetSummary = {
      disclaimer:
        budget.disclaimer ??
        "Planning targets only — not guaranteed costs or fundraising outcomes. Unknown vendor expenses marked needs_quote.",
      salaryFloor: budget.salaryTotal ?? 72000,
      salaryMonthly: budget.salaryMonthly ?? 12000,
      travelConservative: budget.travelConservative ?? 0,
      travelAggressive: budget.travelAggressive ?? 0,
      materialsMid: budget.materialsMid ?? 0,
      postcardMid: Math.round(budget.postcardMid ?? 0),
      sherwoodNetMid: budget.sherwoodNetMid ?? 0,
      bareMinimumTotal: budget.bareMinimumTotal ?? 0,
      workingCampaignTotal: budget.workingCampaignTotal ?? 0,
      aggressiveStatewideTotal: budget.aggressiveStatewideTotal ?? 0,
      monthlyBurnWorking: budget.monthlyBurnWorking ?? 0,
      workingCampaignRangeLow: budget.workingCampaignRangeLow,
      workingCampaignRangeHigh: budget.workingCampaignRangeHigh,
      fieldStrategyTotal: budget.fieldStrategyTotal,
      digitalProgramTotal: budget.digitalProgramTotal,
      mediaOutreachTotal: budget.mediaOutreachTotal,
      complianceTotal: budget.complianceTotal,
    };
    liveStrip.push(
      { label: "Remaining to raise", value: fmt(leadership.fundraising.remainingToRaise) },
      { label: "Working campaign", value: fmt(budgetSummary.workingCampaignTotal) },
      { label: "Raised to date", value: fmt(leadership.fundraising.raisedToDate) },
    );
  }

  if (chapterSlugMatches(chapter.slug, "ppen", "power-of-5") && po5) {
    liveStrip.push(
      { label: "Objective", value: "Relationships", detail: po5.objective ?? "Meaningful relationships" },
      { label: "Network goal", value: po5.networkGoal.toLocaleString("en-US") },
      { label: "County hosts", value: String(po5.countyHostsGoal ?? 75), detail: "Planning target" },
    );
  }

  if (chapterSlugMatches(chapter.slug, "community-strategy", "students-for-arkansas") && sfa?.metrics) {
    liveStrip.push(
      { label: "Co-chairs", value: `${sfa.metrics.coChairsConfirmed}/${sfa.metrics.coChairsGoal}` },
      { label: "Volunteers", value: String(sfa.metrics.studentVolunteers), detail: `Labor Day: ${(sfa.milestones && (sfa.milestones as { laborDay?: { studentVolunteers?: number } }).laborDay?.studentVolunteers) ?? 100}` },
      { label: "Registrations", value: String(sfa.metrics.voterRegistrations), detail: "Goal: 5,000+" },
    );
  }

  if (chapterSlugMatches(chapter.slug, "election-day-operations", "gotv") && gotv) {
    liveStrip.push(
      { label: "Election Day", value: gotv.electionDay ?? "2026-11-03" },
      { label: "Early voting", value: gotv.earlyVotingStart ?? "2026-10-20" },
      {
        label: "HCI",
        value: String(gotv.winCondition?.hciCurrent ?? 0),
        detail: `Goal: ${gotv.winCondition?.hciGoal ?? 250000}`,
      },
    );
  }

  return {
    slug: chapter.slug,
    number: chapter.number,
    title: chapter.title,
    subtitle: chapter.subtitle,
    markdown,
    generatedAt: sfa?.generatedAt ?? po5?.generatedAt ?? gotv?.generatedAt ?? budget?.generatedAt ?? summary?.generatedAt ?? null,
    liveStrip,
    scorecardRows: chapterSlugMatches(chapter.slug, "accountability-reporting", "scorecard")
      ? scorecard?.rows
      : undefined,
    ownershipRows: chapterSlugMatches(chapter.slug, "leadership-development", "ownership")
      ? ownership?.assignments
      : undefined,
    influenceGroups: chapterSlugMatches(chapter.slug, "coalition-strategy", "influence-map")
      ? contact?.influenceGroups
      : undefined,
    budgetSummary,
    powerOf5Summary: chapterSlugMatches(chapter.slug, "ppen", "power-of-5") ? po5 ?? undefined : undefined,
    studentsForArkansasSummary: chapterSlugMatches(chapter.slug, "community-strategy", "students-for-arkansas")
      ? sfa ?? undefined
      : undefined,
    gotvMetrics: chapterSlugMatches(chapter.slug, "election-day-operations", "gotv") ? gotv?.dailyMetrics : undefined,
    electionDayChecklist: chapterSlugMatches(chapter.slug, "election-day-operations", "gotv")
      ? gotv?.electionDayChecklist
      : undefined,
    citizenVoicesSummary: chapterSlugMatches(chapter.slug, "ppen", "power-of-5") ? citizenVoices ?? undefined : undefined,
    pillar: getExecutiveBookPillar(chapter.slug),
    edition: EXECUTIVE_BOOK_EDITION.version,
    osRoute: chapter.osRoute ?? null,
    tableOfContents,
    navigation: {
      prev: adjacent.prev
        ? { slug: adjacent.prev.slug, number: adjacent.prev.number, title: adjacent.prev.title, href: adjacent.prev.href }
        : null,
      next: adjacent.next
        ? { slug: adjacent.next.slug, number: adjacent.next.number, title: adjacent.next.title, href: adjacent.next.href }
        : null,
    },
    relatedChapters: related.map((c) => ({
      slug: c.slug,
      number: c.number,
      title: c.title,
      href: c.href,
    })),
  };
}

export { getExecutiveBookChapter } from "./executiveBookChapters";

export function listExecutiveBookChapterSlugs(): ExecutiveBookChapterSlug[] {
  return allExecutiveBookSlugs();
}
