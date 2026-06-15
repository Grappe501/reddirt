import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  EXECUTIVE_BOOK_CHAPTERS,
  getExecutiveBookChapter,
  type ExecutiveBookChapterSlug,
} from "./executiveBookChapters";

const EXEC_BOOK_DIR = path.join(
  process.cwd(),
  "docs/strategic-plan/plurality-victory-plan/executive-book-v1",
);
const BUDGET_SUMMARY_PATH = path.join(process.cwd(), "data/campaign-brain/budget/budget-summary.json");

function readJsonFile<T>(fileName: string): T | null {
  const p = path.join(EXEC_BOOK_DIR, fileName);
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
} | null {
  if (!existsSync(BUDGET_SUMMARY_PATH)) return null;
  return JSON.parse(readFileSync(BUDGET_SUMMARY_PATH, "utf8"));
}

function readMarkdown(fileName: string): string | null {
  const p = path.join(EXEC_BOOK_DIR, fileName);
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf8");
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
};

export function loadExecutiveBookChapter(slug: string): ExecutiveBookChapterPayload | null {
  const chapter = getExecutiveBookChapter(slug);
  if (!chapter) return null;

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

  const liveStrip: ExecutiveBookChapterPayload["liveStrip"] = [];
  let budgetSummary: ExecutiveBookBudgetSummary | undefined;

  if (chapter.slug === "ownership" && ownership?.assignments) {
    const assigned = ownership.assignments.length - (ownership.unassignedCount ?? 0);
    liveStrip.push(
      { label: "Assigned", value: String(assigned) },
      { label: "Unassigned", value: String(ownership.unassignedCount ?? 0) },
      { label: "Functions", value: String(ownership.assignments.length) },
    );
  }

  if (chapter.slug === "influence-map" && contact?.influenceGroups) {
    for (const g of contact.influenceGroups.slice(0, 6)) {
      liveStrip.push({ label: g.title, value: `Tier ${g.tier}`, detail: `${g.weeklyConversationTarget}/wk` });
    }
  }

  if (chapter.slug === "labor-day") {
    liveStrip.push(
      { label: "Pathway", value: "72/75 Active" },
      { label: "Labor Day gate", value: audit?.laborDayDeadline ?? "2026-09-07" },
    );
  }

  if (chapter.slug === "scorecard" && scorecard?.rows) {
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
  }

  if (chapter.slug === "message") {
    liveStrip.push(
      { label: "Doctrine pillars", value: "8" },
      { label: "Audience", value: "Every room" },
    );
  }

  if (chapter.slug === "audit" && audit) {
    liveStrip.push(
      { label: "Version", value: audit.version ?? "1.0" },
      { label: "Status", value: (audit.status ?? "operational").replace(/_/g, " ") },
      { label: "TBD owners", value: String(audit.unassignedOwners ?? 0) },
    );
  }

  if (chapter.slug === "budget" && budget) {
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
    };
    liveStrip.push(
      { label: "Salary floor", value: fmt(budgetSummary.salaryFloor) },
      { label: "Working campaign", value: fmt(budgetSummary.workingCampaignTotal) },
      { label: "Monthly burn", value: fmt(budgetSummary.monthlyBurnWorking) },
    );
  }

  return {
    slug: chapter.slug,
    number: chapter.number,
    title: chapter.title,
    subtitle: chapter.subtitle,
    markdown,
    generatedAt: budget?.generatedAt ?? summary?.generatedAt ?? null,
    liveStrip,
    scorecardRows: chapter.slug === "scorecard" ? scorecard?.rows : undefined,
    ownershipRows: chapter.slug === "ownership" ? ownership?.assignments : undefined,
    influenceGroups: chapter.slug === "influence-map" ? contact?.influenceGroups : undefined,
    budgetSummary,
  };
}

export function listExecutiveBookChapterSlugs(): ExecutiveBookChapterSlug[] {
  return EXECUTIVE_BOOK_CHAPTERS.map((c) => c.slug);
}
