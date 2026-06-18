/**
 * Map legacy admin intelligence hrefs to Election Plan operator routes.
 * Kelly operators use ELECTION_PLAN_PASSWORD — not ADMIN_SECRET.
 */
import {
  EP_DEBATE_PREP_COMMAND_HREF,
  EP_DEBATE_PREP_HREF,
  EP_DEBATE_PREP_LANES_HREF,
  EP_DEBATE_PREP_REHEARSAL_HREF,
  EP_DEBATE_PREP_TUTOR_HREF,
  EP_EXECUTIVE_BOOK_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_OPPOSITION_RESEARCH_HREF,
} from "@/lib/election-plan/debate-prep-links";

const INTENSIVE_DAY_IDS = new Set([
  "day-1-command-foundation",
  "day-2-read-the-table",
  "day-3-superiority-map",
  "day-4-forum-intelligence",
  "day-5-anticipate-and-capitalize",
  "day-6-full-simulation",
  "day-7-refine-and-steal-show",
  "day-8-command-mode-debate",
]);

function splitHref(href: string): { path: string; query: string } {
  const qIdx = href.indexOf("?");
  if (qIdx < 0) return { path: href, query: "" };
  return { path: href.slice(0, qIdx), query: href.slice(qIdx) };
}

const EXACT: Record<string, string> = {
  "/admin/election-plan": "/election-plan",
  "/admin/intelligence": EP_DEBATE_PREP_HREF,
  "/admin/intelligence/debate-prep-tutor": EP_DEBATE_PREP_TUTOR_HREF,
  "/admin/intelligence/forum-transcript-lab": EP_FORUM_TRANSCRIPT_LAB_HREF,
  "/admin/intelligence/rehearsal": EP_DEBATE_PREP_REHEARSAL_HREF,
  "/admin/intelligence/rehearsal-history": EP_DEBATE_PREP_REHEARSAL_HREF,
  "/admin/intelligence/run-of-show": EP_DEBATE_PREP_REHEARSAL_HREF,
  "/admin/intelligence/encounters": EP_DEBATE_PREP_REHEARSAL_HREF,
  "/admin/intelligence/drill-queue": EP_DEBATE_PREP_REHEARSAL_HREF,
  "/admin/intelligence/session-debrief": EP_DEBATE_PREP_REHEARSAL_HREF,
  "/admin/intelligence/ipad-drill-player": EP_DEBATE_PREP_REHEARSAL_HREF,
  "/admin/intelligence/rehearsal-coach": EP_DEBATE_PREP_REHEARSAL_HREF,
  "/admin/intelligence/debate-command": EP_DEBATE_PREP_COMMAND_HREF,
  "/admin/intelligence/debate-week-intensive": EP_DEBATE_PREP_HREF,
  "/admin/intelligence/debate-week-intensive/lanes": EP_DEBATE_PREP_LANES_HREF,
  "/admin/intelligence/debate-week-intensive/theory": EP_DEBATE_PREP_LANES_HREF,
  "/admin/intelligence/kim-hammer": EP_OPPOSITION_RESEARCH_HREF,
  "/admin/intelligence/kim-hammer/debate-prep": EP_OPPOSITION_RESEARCH_HREF,
  "/admin/intelligence/opposition-strategy": EP_OPPOSITION_RESEARCH_HREF,
  "/admin/intelligence/opponents": EP_OPPOSITION_RESEARCH_HREF,
  "/admin/intelligence/opponents/michael-packo": EP_OPPOSITION_RESEARCH_HREF,
  "/admin/intelligence/claims": EP_OPPOSITION_RESEARCH_HREF,
  "/admin/intelligence/election-funding": EP_OPPOSITION_RESEARCH_HREF,
  "/admin/intelligence/film-room": EP_FORUM_TRANSCRIPT_LAB_HREF,
  "/admin/intelligence/kelly-debate-coaching": EP_DEBATE_PREP_TUTOR_HREF,
  "/admin/intelligence/kelly-prep-week": EP_DEBATE_PREP_HREF,
  "/admin/intelligence/top-tier-prep": EP_DEBATE_PREP_COMMAND_HREF,
  "/admin/intelligence/sos-debate-questions": EP_DEBATE_PREP_COMMAND_HREF,
  "/admin/intelligence/trap-lanes": EP_DEBATE_PREP_REHEARSAL_HREF,
  "/admin/intelligence/demo-mode": EP_DEBATE_PREP_COMMAND_HREF,
  "/admin/intelligence/live-event": EP_DEBATE_PREP_COMMAND_HREF,
  "/admin/intelligence/sre-closure": EP_DEBATE_PREP_REHEARSAL_HREF,
  "/admin/intelligence/cce-closure": EP_DEBATE_PREP_COMMAND_HREF,
  "/admin/intelligence/evidence-honesty": EP_OPPOSITION_RESEARCH_HREF,
  "/admin/intelligence/staff-backstage": EP_OPPOSITION_RESEARCH_HREF,
  "/admin/intelligence/ipad-polish": EP_DEBATE_PREP_REHEARSAL_HREF,
  "/admin/intelligence/kelly-strategic-plan/framework": EP_EXECUTIVE_BOOK_HREF,
  "/admin/intelligence/strategy-philosophy-hub": EP_EXECUTIVE_BOOK_HREF,
  "/admin/mission-brief": "/election-plan/executive-book/path-to-victory",
  "/admin/county-intelligence": "/election-plan?tab=countyPlaybooks",
  "/admin/counties": "/election-plan?tab=countyPlaybooks",
};

const PREFIX: Array<{ prefix: string; target: string }> = [
  { prefix: "/admin/intelligence/kim-hammer/", target: EP_OPPOSITION_RESEARCH_HREF },
  { prefix: "/admin/intelligence/opponents/", target: EP_OPPOSITION_RESEARCH_HREF },
  { prefix: "/admin/intelligence/debate-briefings/", target: EP_DEBATE_PREP_TUTOR_HREF },
  { prefix: "/admin/intelligence/debate-depth/", target: EP_DEBATE_PREP_TUTOR_HREF },
  { prefix: "/admin/intelligence/debate-prep/", target: EP_DEBATE_PREP_TUTOR_HREF },
  { prefix: "/admin/intelligence/trap-lanes/", target: EP_DEBATE_PREP_REHEARSAL_HREF },
  { prefix: "/admin/intelligence/sos-debate-questions/", target: EP_DEBATE_PREP_COMMAND_HREF },
  { prefix: "/admin/intelligence/candidate-dossiers/", target: EP_OPPOSITION_RESEARCH_HREF },
  { prefix: "/admin/intelligence/diligence/", target: EP_OPPOSITION_RESEARCH_HREF },
  { prefix: "/admin/intelligence/county-clerk-week/", target: EP_OPPOSITION_RESEARCH_HREF },
  { prefix: "/admin/intelligence/phase-", target: EP_DEBATE_PREP_HREF },
  { prefix: "/admin/counties/", target: "/election-plan/counties/" },
];

export function epDebatePrepLaneHref(laneId: string): string {
  return `${EP_DEBATE_PREP_LANES_HREF}/${laneId}`;
}

export function epDebatePrepDayHref(dayId: string): string {
  return `/election-plan/debate-prep/days/${dayId}`;
}

export function mapAdminHrefToElectionPlan(href: string): string {
  if (!href?.startsWith("/admin")) return href;

  const { path, query } = splitHref(href);

  if (EXACT[path]) return EXACT[path] + query;

  const laneMatch = path.match(/^\/admin\/intelligence\/debate-week-intensive\/lanes\/([^/]+)$/);
  if (laneMatch?.[1]) return epDebatePrepLaneHref(laneMatch[1]) + query;

  const dayMatch = path.match(/^\/admin\/intelligence\/debate-week-intensive\/([^/]+)$/);
  if (dayMatch?.[1] && INTENSIVE_DAY_IDS.has(dayMatch[1])) {
    return epDebatePrepDayHref(dayMatch[1]) + query;
  }

  for (const { prefix, target } of PREFIX) {
    if (path.startsWith(prefix)) {
      if (prefix === "/admin/counties/") {
        const slug = path.slice(prefix.length).split("/")[0]?.replace(/-county$/, "") ?? "";
        return slug ? `/election-plan/counties/${slug}${query}` : "/election-plan?tab=countyPlaybooks" + query;
      }
      return target + query;
    }
  }

  if (path.startsWith("/admin/intelligence/")) return EP_DEBATE_PREP_HREF + query;
  if (path.startsWith("/admin/")) return "/election-plan" + query;
  return href;
}

/** @deprecated Alias — use mapAdminHrefToElectionPlan */
export function mapAdminDebateHrefToElectionPlan(href: string): string {
  return mapAdminHrefToElectionPlan(href);
}

/** Walk feed/summary objects and remap any `/admin` href strings (Election Plan bundle builder). */
export function mapAdminHrefsDeep<T>(value: T): T {
  if (typeof value === "string") {
    return (value.startsWith("/admin") ? mapAdminHrefToElectionPlan(value) : value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => mapAdminHrefsDeep(item)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = mapAdminHrefsDeep(nested);
    }
    return out as T;
  }
  return value;
}
