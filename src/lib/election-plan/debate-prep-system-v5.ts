/**
 * Debate Prep System v5 — Election Plan primary orchestration layer.
 * Unifies command course, tutor, forum lab, rehearsal engine, and opposition crosswalk.
 */
import { buildCandidateCommandHomeFeed } from "@/lib/intelligence/v4/candidateCommandHome";
import { DEBATE_PREP_TUTOR_V5_VERSION, TUTOR_HUB_WELCOME } from "@/lib/intelligence/v4/debatePrepTutorGuideV5";
import { DEBATE_DATE, DEBATE_WEEK_INTENSIVE_DAYS, DEBATE_WEEK_INTENSIVE_PRIMER } from "@/lib/intelligence/v4/debateWeekIntensive2026";
import { DEBATE_INTENSIVE_V3_LABEL } from "@/lib/intelligence/v4/debateWeekIntensive2026V3";
import { loadKellyDebateIntensiveProgress } from "@/lib/intelligence/v4/kellyDebateIntensiveProgress";
import { loadForumTranscriptLab } from "@/lib/intelligence/v4/forumTranscriptLab";
import { buildCceClosureSummary } from "@/lib/intelligence/v4/phase15P9Closure";
import { buildSreClosureSummary } from "@/lib/intelligence/v4/phase16P9Closure";
import {
  EP_DEBATE_PREP_COMMAND_HREF,
  EP_DEBATE_PREP_HREF,
  EP_DEBATE_PREP_LANES_HREF,
  EP_DEBATE_PREP_REHEARSAL_HREF,
  EP_DEBATE_PREP_TUTOR_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_OPPOSITION_RESEARCH_HREF,
} from "@/lib/election-plan/debate-prep-links";

export const DEBATE_PREP_SYSTEM_V5_VERSION = "debate-prep-system-v5.0-election-plan";

export type DebatePrepV5ModuleId =
  | "command-course"
  | "command-home"
  | "ai-tutor"
  | "forum-lab"
  | "rehearsal"
  | "drill-lanes"
  | "opposition";

export type DebatePrepV5Module = {
  id: DebatePrepV5ModuleId;
  label: string;
  tagline: string;
  href: string;
  lane: "kelly" | "staff";
  status: "ready" | "in-progress" | "not-started";
  statusNote?: string;
};

export type DebatePrepSystemV5Snapshot = {
  version: string;
  debateDate: string;
  headline: string;
  intro: string;
  readinessPct: number;
  readinessLabel: string;
  todayFocus: string | null;
  intensiveDaysComplete: number;
  intensiveDaysTotal: number;
  forumTranscriptReady: boolean;
  forumAnalysisReady: boolean;
  modules: DebatePrepV5Module[];
  tutorVersion: string;
  intensiveV3Label: string;
  governance: string;
};

export function buildDebatePrepSystemV5Snapshot(referenceDate?: string): DebatePrepSystemV5Snapshot {
  const ref = referenceDate ?? process.env.DEBATE_WEEK_TODAY ?? "2026-06-19";
  const feed = buildCandidateCommandHomeFeed();
  const progress = loadKellyDebateIntensiveProgress();
  const forum = loadForumTranscriptLab();
  const todayPlan = DEBATE_WEEK_INTENSIVE_DAYS.find((d) => d.calendarDate === ref);

  const forumTranscriptReady = Boolean(forum.transcriptText && forum.transcriptText.length > 50);
  const forumAnalysisReady = forum.analysisStatus === "ready" || forum.deepAnalysisStatus === "ready";

  const modules: DebatePrepV5Module[] = [
    {
      id: "command-course",
      label: "7-day command course",
      tagline: DEBATE_WEEK_INTENSIVE_PRIMER.headline,
      href: EP_DEBATE_PREP_HREF,
      lane: "kelly",
      status: progress.completedDays.length > 0 ? "in-progress" : "not-started",
      statusNote: `${progress.completedDays.length}/${DEBATE_WEEK_INTENSIVE_DAYS.length} days marked complete`,
    },
    {
      id: "command-home",
      label: "Tonight's command home",
      tagline: "Readiness, safe lines, blocked lines, top-tier prep",
      href: EP_DEBATE_PREP_COMMAND_HREF,
      lane: "kelly",
      status: feed.readinessPct >= 70 ? "ready" : "in-progress",
      statusNote: `${feed.readinessPct}% · ${feed.readinessLabel}`,
    },
    {
      id: "ai-tutor",
      label: "AI debate prep tutor",
      tagline: TUTOR_HUB_WELCOME.headline,
      href: EP_DEBATE_PREP_TUTOR_HREF,
      lane: "kelly",
      status: "ready",
      statusNote: "5 / 15 / 30 min coach + professor modes",
    },
    {
      id: "forum-lab",
      label: "Forum transcript lab",
      tagline: "ACCA three-way panel · capitalize playbook",
      href: EP_FORUM_TRANSCRIPT_LAB_HREF,
      lane: "kelly",
      status: forumAnalysisReady ? "ready" : forumTranscriptReady ? "in-progress" : "not-started",
      statusNote: forumAnalysisReady
        ? "Analysis ready"
        : forumTranscriptReady
          ? "Transcript ready — run analyze"
          : "Drop video or paste transcript",
    },
    {
      id: "rehearsal",
      label: "Rehearsal & drill queue",
      tagline: "SRE stage rehearsal engine · encounters · iPad drill player",
      href: EP_DEBATE_PREP_REHEARSAL_HREF,
      lane: "kelly",
      status: feed.rehearsalLauncher.encounterCount > 0 ? "in-progress" : "not-started",
      statusNote: feed.rehearsalLauncher.tonightReminder,
    },
    {
      id: "drill-lanes",
      label: "Drill-down lanes",
      tagline: DEBATE_INTENSIVE_V3_LABEL,
      href: EP_DEBATE_PREP_LANES_HREF,
      lane: "kelly",
      status: progress.completedLanes.length > 0 ? "in-progress" : "not-started",
      statusNote: `${progress.completedLanes.length} lanes completed`,
    },
    {
      id: "opposition",
      label: "Opposition research",
      tagline: "Hammer modules · dossiers · claims gate",
      href: EP_OPPOSITION_RESEARCH_HREF,
      lane: "staff",
      status: "ready",
      statusNote: "Staff lane — verify before stage",
    },
  ];

  return {
    version: DEBATE_PREP_SYSTEM_V5_VERSION,
    debateDate: DEBATE_DATE,
    headline: "Debate Prep System v5",
    intro:
      "Election Plan is the primary operator surface — command course, conversational tutor, forum intelligence, rehearsal engine, and opposition crosswalk in one lane.",
    readinessPct: feed.readinessPct,
    readinessLabel: feed.readinessLabel,
    todayFocus: todayPlan
      ? `${todayPlan.title} — ${todayPlan.subtitle}`
      : feed.todayFocus[0] ?? null,
    intensiveDaysComplete: progress.completedDays.length,
    intensiveDaysTotal: DEBATE_WEEK_INTENSIVE_DAYS.length,
    forumTranscriptReady,
    forumAnalysisReady,
    modules,
    tutorVersion: DEBATE_PREP_TUTOR_V5_VERSION,
    intensiveV3Label: DEBATE_INTENSIVE_V3_LABEL,
    governance: TUTOR_HUB_WELCOME.governance,
  };
}

export function buildDebatePrepCommandHomeBundle() {
  return {
    feed: buildCandidateCommandHomeFeed(),
    cceClosure: buildCceClosureSummary(),
    sreClosure: buildSreClosureSummary(),
  };
}
