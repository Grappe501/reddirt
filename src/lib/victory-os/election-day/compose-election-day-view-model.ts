/**
 * Victory OS Sprint 5 — Election Day Operations Center view model.
 */

import { loadKellyWinTargetScenarioFile } from "@/lib/election-targets/load-win-target-scenario";
import { loadVictoryMapCounties } from "../load-victory-map";
import { electionCountdown } from "../mission-brief/election-countdown";
import type { CountyVictoryContext } from "../types";
import type {
  ElectionDayCountyCard,
  ElectionDayCountyStatus,
  ElectionDaySidePanel,
  ElectionDayViewModel,
} from "./types";

const ELECTION_YMD = "2026-11-03";

function countyStatus(ctx: CountyVictoryContext): ElectionDayCountyStatus {
  if (ctx.opsStatus === "red" && ctx.electoralImportance === "critical") return "critical";
  if (ctx.opsStatus === "yellow" || ctx.opsStatus === "red") return "watch";
  if (ctx.opsStatus === "green") return "on_track";
  return "unknown";
}

function buildCountyCard(ctx: CountyVictoryContext, winByCounty: Map<string, number>): ElectionDayCountyCard {
  const goalVotes = ctx.targetVotes ?? winByCounty.get(ctx.county) ?? 0;
  const actualVotes: number | null = null;
  const gap = actualVotes != null ? goalVotes - actualVotes : null;
  const priority = ctx.deploymentPriority.deploymentPriority;

  return {
    countySlug: ctx.countySlug,
    county: ctx.county,
    displayName: ctx.displayName,
    regionSlug: ctx.regionSlug,
    goalVotes,
    actualVotes,
    gap,
    status: countyStatus(ctx),
    opsStatus: ctx.opsStatus,
    electoralImportance: ctx.electoralImportance,
    pollWatcherCount: ctx.organizationalReadiness === "strong" ? 3 : ctx.organizationalReadiness === "moderate" ? 1 : 0,
    volunteerDeployed: Math.round(priority / 15),
    notes: actualVotes == null ? "Advisory — live turnout feed not connected" : "",
  };
}

function buildSidePanels(counties: CountyVictoryContext[]): ElectionDaySidePanel[] {
  const redOps = counties.filter((c) => c.opsStatus === "red").length;
  const weak = counties.filter((c) => c.organizationalReadiness === "weak").length;
  const critical = counties.filter((c) => c.electoralImportance === "critical").length;

  return [
    {
      id: "poll_issues",
      title: "Poll issues",
      status: redOps > 10 ? "escalation" : redOps > 3 ? "active" : "nominal",
      summary: `${redOps} counties in red ops — monitor provisional ballot and machine issues.`,
      itemCount: redOps,
    },
    {
      id: "volunteer_deployment",
      title: "Volunteer deployment",
      status: weak > 20 ? "active" : "nominal",
      summary: `${weak} counties with weak readiness — confirm poll watcher coverage.`,
      itemCount: weak,
    },
    {
      id: "legal_escalation",
      title: "Legal escalation",
      status: "nominal",
      summary: "Counsel on standby — no active escalations in advisory mode.",
      itemCount: 0,
    },
    {
      id: "transportation",
      title: "Transportation",
      status: critical > 6 ? "active" : "nominal",
      summary: "Ride-to-polls coordination for critical counties.",
      itemCount: critical,
    },
    {
      id: "media",
      title: "Media & rapid response",
      status: "nominal",
      summary: "Press hold until turnout milestones — rapid response queue empty.",
      itemCount: 0,
    },
    {
      id: "rapid_response",
      title: "Opposition rapid response",
      status: "nominal",
      summary: "Intelligence lane parallel — link from Command Center.",
      itemCount: 0,
    },
  ];
}

export function composeElectionDayViewModel(asOf = new Date()): ElectionDayViewModel {
  const ec = electionCountdown(asOf);
  const win = loadKellyWinTargetScenarioFile();
  const winByCounty = new Map((win?.counties ?? []).map((c) => [c.county, c.targetVotes ?? 0]));
  const counties = loadVictoryMapCounties({ asOf });

  const countyCards = counties
    .map((c) => buildCountyCard(c, winByCounty))
    .sort((a, b) => {
      const order: Record<ElectionDayCountyStatus, number> = { critical: 0, watch: 1, unknown: 2, on_track: 3 };
      return order[a.status] - order[b.status] || b.goalVotes - a.goalVotes;
    });

  const criticalCounties = countyCards.filter(
    (c) => c.status === "critical" || c.electoralImportance === "critical",
  ).slice(0, 12);

  const sidePanels = buildSidePanels(counties);
  const isElectionDay = ec.daysRemaining === 0;

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    publicationSafety: "INTERNAL_DRAFT",
    electionDate: ELECTION_YMD,
    isElectionDay,
    daysUntilElection: ec.daysRemaining,
    statewide: {
      goalVotes: win?.statewide.workingTargetWithCushion ?? 0,
      actualVotes: null,
      gap: null,
      workingTargetWithCushion: win?.statewide.workingTargetWithCushion ?? 0,
      advisoryNote: "Planning scenario — live turnout feed not connected. All actuals are advisory placeholders.",
    },
    countyCards,
    criticalCounties,
    sidePanels,
    intelligenceNarrative: [
      isElectionDay ? "Election Day Operations Center — LIVE" : `Election Day prep · ${ec.daysRemaining} days out`,
      `${criticalCounties.length} critical counties on watch.`,
      `${sidePanels.filter((p) => p.status === "escalation").length} panels in escalation.`,
      "Calendar ends midnight prior — this is the execution surface.",
    ].join(" "),
  };
}
