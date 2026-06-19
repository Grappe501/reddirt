/** Election Plan — debate prep & opposition routes (primary operator surface). */

export const EP_DEBATE_PREP_HREF = "/election-plan/debate-prep";
export const EP_DEBATE_PREP_COMMAND_HREF = "/election-plan/debate-prep/command";
export const EP_DEBATE_PREP_TUTOR_HREF = "/election-plan/debate-prep/tutor";
export const EP_DEBATE_PREP_REHEARSAL_HREF = "/election-plan/debate-prep/rehearsal";
export const EP_DEBATE_PREP_WAR_ROOM_HREF = "/election-plan/debate-prep/war-room";
export const EP_DEBATE_PREP_PACKAGE_PROGRESS_API = "/api/election-plan/debate-prep-package/progress";
export const EP_DEBATE_PREP_LANES_HREF = "/election-plan/debate-prep/lanes";
export const EP_TRAP_LANES_HREF = "/election-plan/debate-prep/trap-lanes";
export const EP_DEBATE_TECHNIQUES_HREF = "/election-plan/debate-prep/techniques";
export const EP_FORUM_TRANSCRIPT_LAB_HREF = "/election-plan/debate-prep/forum-lab";
export const EP_OPPOSITION_RESEARCH_HREF = "/election-plan/opposition-research";
export const EP_EXECUTIVE_BOOK_HREF = "/election-plan/executive-book";

export const EP_FORUM_TRANSCRIPT_LAB_API = "/api/election-plan/forum-transcript-lab";
export const EP_DEBATE_PREP_TUTOR_API = "/api/election-plan/debate-prep-tutor";
export const EP_DEBATE_PREP_PROGRESS_API = "/api/election-plan/debate-week-intensive/progress";

export function epTrapLaneHref(laneId: string): string {
  return `${EP_TRAP_LANES_HREF}/${laneId}`;
}

export function epDebateTechniqueHref(topicId: string): string {
  return `${EP_DEBATE_TECHNIQUES_HREF}/${topicId}`;
}
