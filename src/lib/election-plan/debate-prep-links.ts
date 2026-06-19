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
export const EP_OPPONENT_BIOS_HREF = "/election-plan/debate-prep/opponent-bios";

export function epOpponentBioHref(opponentId: string): string {
  return `${EP_OPPONENT_BIOS_HREF}/${opponentId}`;
}

export const EP_DEBATE_QUESTIONS_HREF = "/election-plan/debate-prep/questions";
export const EP_DEBATE_PREP_BRIEFINGS_HREF = "/election-plan/debate-prep/briefings";
export const EP_DEBATE_PREP_PSYCHOLOGY_HREF = "/election-plan/debate-prep/psychology-manual";
export const EP_OPPOSITION_RESEARCH_HREF = "/election-plan/opposition-research";
export const EP_EXECUTIVE_BOOK_HREF = "/election-plan/executive-book";

export function epOppositionResearchModuleHref(moduleId: string): string {
  return `${EP_OPPOSITION_RESEARCH_HREF}/${moduleId}`;
}

export const EP_LEGISLATIVE_INTEL_HREF = "/election-plan/debate-prep/legislative-intel";
export const EP_VOTER_AUDIENCES_HREF = "/election-plan/debate-prep/voter-audiences";

export function epVoterAudienceProfileHref(profileId: string): string {
  return `${EP_VOTER_AUDIENCES_HREF}/${profileId}`;
}

export function epLegislativeIntel2021Href(): string {
  return `${EP_LEGISLATIVE_INTEL_HREF}/2021-integrity`;
}

export function epLegislativeIntel2025Href(): string {
  return `${EP_LEGISLATIVE_INTEL_HREF}/2025-direct-democracy`;
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

export function epDebateQuestionHref(questionId: string): string {
  return `${EP_DEBATE_QUESTIONS_HREF}/${questionId}`;
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
export const EP_FORUM_LAB_ANALYSIS_HREF = `${EP_FORUM_TRANSCRIPT_LAB_HREF}/analysis`;

export function epForumLabIntegrationDayHref(dayNumber: number): string {
  return `${EP_FORUM_LAB_INTEGRATION_HREF}/${dayNumber}`;
}

export function epForumLabElectionLawTopicHref(topicId: string): string {
  return `${EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF}/${topicId}`;
}

export function epForumLabAnalysisCategoryHref(categoryId: string): string {
  return `${EP_FORUM_LAB_ANALYSIS_HREF}/${categoryId}`;
}

export function epForumLabAnalysisItemHref(categoryId: string, itemId: string): string {
  return `${EP_FORUM_LAB_ANALYSIS_HREF}/${categoryId}/${itemId}`;
}

export const EP_FORUM_LAB_CAPITALIZE_MOVES_HREF = `${EP_FORUM_TRANSCRIPT_LAB_HREF}/capitalize-moves`;

export function epForumLabCapitalizeMoveHref(moveId: string): string {
  return `${EP_FORUM_LAB_CAPITALIZE_MOVES_HREF}/${moveId}`;
}

export const EP_FORUM_LAB_DEEP_ANALYSIS_HREF = `${EP_FORUM_TRANSCRIPT_LAB_HREF}/deep-analysis`;

export function epForumLabDeepAnalysisLessonHref(lessonId: string): string {
  return `${EP_FORUM_LAB_DEEP_ANALYSIS_HREF}/${lessonId}`;
}

export const EP_FORUM_LAB_PREDICTED_SCRIPT_HREF = `${EP_FORUM_TRANSCRIPT_LAB_HREF}/predicted-script`;

export function epForumLabPredictedScriptPhaseHref(phaseId: string): string {
  return `${EP_FORUM_LAB_PREDICTED_SCRIPT_HREF}/${phaseId}`;
}
