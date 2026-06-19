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
export const EP_DEBATE_PREP_BRIEFINGS_HREF = "/election-plan/debate-prep/briefings";
export const EP_DEBATE_PREP_PSYCHOLOGY_HREF = "/election-plan/debate-prep/psychology-manual";
export const EP_OPPOSITION_RESEARCH_HREF = "/election-plan/opposition-research";
export const EP_EXECUTIVE_BOOK_HREF = "/election-plan/executive-book";

export function epOppositionResearchModuleHref(moduleId: string): string {
  return `${EP_OPPOSITION_RESEARCH_HREF}/${moduleId}`;
}

export const EP_FORUM_TRANSCRIPT_LAB_API = "/api/election-plan/forum-transcript-lab";
export const EP_DEBATE_PREP_TUTOR_API = "/api/election-plan/debate-prep-tutor";
export const EP_DEBATE_PREP_PROGRESS_API = "/api/election-plan/debate-week-intensive/progress";

export const DEBATE_PREP_PACKAGE_LABEL = "Debate prep v8";

export function epTrapLaneHref(laneId: string): string {
  return `${EP_TRAP_LANES_HREF}/${laneId}`;
}

export function epDebateTechniqueHref(topicId: string): string {
  return `${EP_DEBATE_TECHNIQUES_HREF}/${topicId}`;
}

export function epDebatePrepBriefingHref(briefingId: string): string {
  return `${EP_DEBATE_PREP_BRIEFINGS_HREF}/${briefingId}`;
}

export function epDebatePrepPsychologySectionHref(sectionId: string): string {
  return `${EP_DEBATE_PREP_PSYCHOLOGY_HREF}/${sectionId}`;
}

export function epDebatePrepDayHref(dayId: string): string {
  return `/election-plan/debate-prep/days/${dayId}`;
}

export function epDebatePrepDayConceptHref(dayId: string, conceptId: string): string {
  return `${epDebatePrepDayHref(dayId)}/concepts/${conceptId}`;
}

export function epDebatePrepDayBlockHref(dayId: string, blockId: string): string {
  return `${epDebatePrepDayHref(dayId)}/blocks/${blockId}`;
}

export function epDebatePrepDayExampleHref(dayId: string, exampleId: string): string {
  return `${epDebatePrepDayHref(dayId)}/examples/${exampleId}`;
}

export function epDebatePrepDayRehearsalHref(dayId: string, scriptId: string): string {
  return `${epDebatePrepDayHref(dayId)}/rehearsal/${scriptId}`;
}

export function epDebatePrepDayMicroLessonHref(dayId: string, lessonId: string): string {
  return `${epDebatePrepDayHref(dayId)}/micro-lessons/${lessonId}`;
}

export function epDebatePrepDayDrillHref(dayId: string, drillId: string): string {
  return `${epDebatePrepDayHref(dayId)}/drills/${drillId}`;
}

export const EP_FORUM_LAB_INTEGRATION_HREF = `${EP_FORUM_TRANSCRIPT_LAB_HREF}/integration`;
export const EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF = `${EP_FORUM_TRANSCRIPT_LAB_HREF}/election-law-study`;

export function epForumLabIntegrationDayHref(dayNumber: number): string {
  return `${EP_FORUM_LAB_INTEGRATION_HREF}/${dayNumber}`;
}

export function epForumLabElectionLawTopicHref(topicId: string): string {
  return `${EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF}/${topicId}`;
}
