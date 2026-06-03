import type { CampaignOsNavGroup } from "@/lib/dashboard-orchestration/campaign-os-nav-config";
import {
  buildDebateWeekNavGroups,
  DEBATE_WEEK_ROUTES,
  isDebateWeekRoute,
  type DebateWeekRoute,
} from "@/lib/intelligence/debate-week-nav";

/** Emergency internal launch — opposition + debate prep workbench only. */
export const INTELLIGENCE_LAUNCH_MODE_ENV = "NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE";
export const INTELLIGENCE_LAUNCH_MODE_OPPOSITION_DEBATE = "opposition_debate";

/** @deprecated Use DEBATE_WEEK_ROUTES — kept for existing imports. */
export const INTELLIGENCE_LAUNCH_ROUTES = DEBATE_WEEK_ROUTES;

export type IntelligenceLaunchRoute = DebateWeekRoute;

export function isIntelligenceOppositionDebateLaunchMode(): boolean {
  return process.env[INTELLIGENCE_LAUNCH_MODE_ENV] === INTELLIGENCE_LAUNCH_MODE_OPPOSITION_DEBATE;
}

/** Default post-login destination when debate launch mode is active. */
export function getAdminLoginDefaultPath(): string {
  return isIntelligenceOppositionDebateLaunchMode() ? "/admin/intelligence" : "/admin/content";
}

export function isIntelligenceLaunchRoute(pathname: string): boolean {
  return isDebateWeekRoute(pathname);
}

/** Campaign OS sidebar — opposition + debate prep only when launch mode is on. */
export function buildOppositionDebateLaunchNavGroups(): CampaignOsNavGroup[] {
  return buildDebateWeekNavGroups();
}

export function shouldSkipCountyIntelligenceForLaunch(): boolean {
  return isIntelligenceOppositionDebateLaunchMode();
}

/** Skip hundreds of public SSG paths during Netlify deploy to keep ___netlify-server-handler under 250 MB. */
export function skipPublicStaticGenerationForNetlifyLaunch(): boolean {
  return isIntelligenceOppositionDebateLaunchMode();
}

export const INTELLIGENCE_LAUNCH_BANNER =
  "Emergency Debate Launch Mode: Internal workbench only. Evidence confidence varies. Do not publish claims without review.";
