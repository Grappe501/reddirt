/** Cross-module course progress refresh — no imports from day pathway files. */
export const DEBATE_COURSE_PROGRESS_EVENT = "kelly-debate-course-progress";

export function notifyDebateCourseProgressChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(DEBATE_COURSE_PROGRESS_EVENT));
}
