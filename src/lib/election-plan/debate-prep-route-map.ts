/** Map admin intelligence debate-prep hrefs to Election Plan operator routes. */
import {
  EP_DEBATE_PREP_COMMAND_HREF,
  EP_DEBATE_PREP_HREF,
  EP_DEBATE_PREP_LANES_HREF,
  EP_DEBATE_PREP_REHEARSAL_HREF,
  EP_DEBATE_PREP_TUTOR_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_OPPOSITION_RESEARCH_HREF,
} from "@/lib/election-plan/debate-prep-links";

const EXACT: Record<string, string> = {
  "/admin/intelligence/debate-prep-tutor": EP_DEBATE_PREP_TUTOR_HREF,
  "/admin/intelligence/forum-transcript-lab": EP_FORUM_TRANSCRIPT_LAB_HREF,
  "/admin/intelligence/rehearsal": EP_DEBATE_PREP_REHEARSAL_HREF,
  "/admin/intelligence/debate-command": EP_DEBATE_PREP_COMMAND_HREF,
  "/admin/intelligence/debate-week-intensive": EP_DEBATE_PREP_HREF,
  "/admin/intelligence/debate-week-intensive/lanes": EP_DEBATE_PREP_LANES_HREF,
  "/admin/intelligence/kim-hammer/debate-prep": EP_OPPOSITION_RESEARCH_HREF,
  "/admin/intelligence/opposition-strategy": EP_OPPOSITION_RESEARCH_HREF,
};

const PREFIX: Array<{ prefix: string; target: string }> = [
  { prefix: "/admin/intelligence/kim-hammer", target: EP_OPPOSITION_RESEARCH_HREF },
];

export function mapAdminDebateHrefToElectionPlan(href: string): string {
  if (EXACT[href]) return EXACT[href];
  for (const { prefix, target } of PREFIX) {
    if (href.startsWith(prefix)) return target;
  }
  return href;
}

export function epDebatePrepLaneHref(laneId: string): string {
  return `${EP_DEBATE_PREP_LANES_HREF}/${laneId}`;
}

export function epDebatePrepDayHref(dayId: string): string {
  return `/election-plan/debate-prep/days/${dayId}`;
}
