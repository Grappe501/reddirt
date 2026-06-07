/**
 * Phase 15 P1 — Unified command home closure metrics.
 */
import { buildCandidateCommandHomeFeed } from "@/lib/intelligence/v4/candidateCommandHome";
import { CANDIDATE_COMMAND_HOME_HREF } from "@/lib/intelligence/v4/phase15CandidateCommandDepth";

export type Phase15P1Progress = {
  homeHref: string;
  readinessPct: number;
  safeLineCount: number;
  blockedLineCount: number;
  todayFocusCount: number;
  claimsWired: boolean;
  homeUnified: boolean;
  overallPct: number;
};

export function computePhase15P1Progress(): Phase15P1Progress {
  const feed = buildCandidateCommandHomeFeed();
  const claimsWired = feed.claimsSummary.total > 0;
  const homeUnified = feed.homeHref === CANDIDATE_COMMAND_HOME_HREF;
  const safeLineCount = feed.safeTonight.length;
  const blockedLineCount = feed.blockedTonight.length;
  const todayFocusCount = feed.todayFocus.length;

  const checks = [
    homeUnified,
    claimsWired,
    safeLineCount >= 1,
    blockedLineCount >= 1,
    todayFocusCount >= 3,
    feed.readinessPct >= 0,
  ];
  const overallPct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return {
    homeHref: feed.homeHref,
    readinessPct: feed.readinessPct,
    safeLineCount,
    blockedLineCount,
    todayFocusCount,
    claimsWired,
    homeUnified,
    overallPct,
  };
}

export function assertPhase15P1Bar(): { ok: boolean; message: string } {
  const p = computePhase15P1Progress();
  const issues: string[] = [];
  if (!p.homeUnified) issues.push("home href");
  if (!p.claimsWired) issues.push("claims feed");
  if (p.safeLineCount < 1) issues.push("safe lines");
  if (p.blockedLineCount < 1) issues.push("blocked lines");
  if (p.todayFocusCount < 3) issues.push("today focus");
  if (issues.length === 0) return { ok: true, message: "Phase 15 P1 bar met" };
  return { ok: false, message: issues.join("; ") };
}
