import { SLIDES } from "./content";

/** One-hour track: 55 min weighted content + 5 min initial Q&A. Optional +15 after. */
export const MEETING_CONTENT_MINUTES = 55;
export const INITIAL_QA_MINUTES = 5;
export const MEETING_HOUR_MINUTES = MEETING_CONTENT_MINUTES + INITIAL_QA_MINUTES; // 60
export const EXTENDED_QA_MINUTES = 15;
export const TOTAL_WITH_EXTENDED_MINUTES = MEETING_HOUR_MINUTES + EXTENDED_QA_MINUTES; // 75

export type TimeSegment = {
  id: string;
  label: string;
  minutes: number;
  /** Path for content slides; null for post-content Q&A phases */
  path: string | null;
  speaker?: string;
};

/**
 * Weighted toward Kelly vision/elections, Chance youth, Steve campaign teams & strategy.
 * Sum of content segments = 55. Then initial Q&A (5) inside the hour.
 */
export const TIME_SEGMENTS: TimeSegment[] = [
  { id: "welcome", label: "Welcome", minutes: 3, path: "/", speaker: "Steve" },
  { id: "why", label: "Why We Are Here", minutes: 3, path: "/why", speaker: "Steve" },
  { id: "vision", label: "Kelly’s Vision", minutes: 8, path: "/vision", speaker: "Kelly" },
  { id: "elections", label: "Elections & Citizen Power", minutes: 6, path: "/elections", speaker: "Kelly" },
  { id: "strategy", label: "Operation Arkansas", minutes: 5, path: "/strategy", speaker: "Steve" },
  { id: "events", label: "Event Model + Sept 17 Rally", minutes: 4, path: "/events", speaker: "Steve" },
  { id: "youth", label: "Youth Coalition", minutes: 7, path: "/youth", speaker: "Chance" },
  { id: "local", label: "Local Teams", minutes: 5, path: "/local", speaker: "Carol" },
  { id: "campaign", label: "Campaign Teams", minutes: 7, path: "/campaign", speaker: "Steve" },
  { id: "strike-team", label: "Strike Teams", minutes: 2, path: "/strike-team", speaker: "Steve" },
  { id: "calendar", label: "Calendar", minutes: 3, path: "/calendar", speaker: "Steve" },
  { id: "join", label: "Commitment / Join", minutes: 2, path: "/join", speaker: "Kelly" },
  { id: "qa", label: "Initial Q&A", minutes: INITIAL_QA_MINUTES, path: null, speaker: "All" },
  {
    id: "qa-extended",
    label: "Optional extended Q&A",
    minutes: EXTENDED_QA_MINUTES,
    path: null,
    speaker: "All",
  },
];

const CONTENT_SEGMENTS = TIME_SEGMENTS.filter((s) => s.path !== null);

export function assertTimeTrack(): void {
  const contentSum = CONTENT_SEGMENTS.reduce((n, s) => n + s.minutes, 0);
  if (contentSum !== MEETING_CONTENT_MINUTES) {
    console.warn(`Time track content minutes sum to ${contentSum}, expected ${MEETING_CONTENT_MINUTES}`);
  }
}

export function segmentForPath(pathname: string): TimeSegment | undefined {
  return CONTENT_SEGMENTS.find((s) => s.path === pathname);
}

export function cumulativeStartMinutes(segmentId: string): number {
  let t = 0;
  for (const s of TIME_SEGMENTS) {
    if (s.id === segmentId) return t;
    t += s.minutes;
  }
  return t;
}

export function formatClock(totalSeconds: number): string {
  const sign = totalSeconds < 0 ? "-" : "";
  const abs = Math.abs(totalSeconds);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return `${sign}${m}:${s.toString().padStart(2, "0")}`;
}

export const STORAGE_START = "kickoff-meeting-start-ms";

export function getMeetingStart(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_START);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function setMeetingStart(ms: number | null): void {
  try {
    if (ms == null) localStorage.removeItem(STORAGE_START);
    else localStorage.setItem(STORAGE_START, String(ms));
  } catch {
    /* ignore */
  }
}

export type ClockPhase =
  | { kind: "segment"; segment: TimeSegment; segmentRemainingSec: number; hourRemainingSec: number }
  | { kind: "initial-qa"; remainingSec: number; hourRemainingSec: number }
  | { kind: "extended-qa"; remainingSec: number }
  | { kind: "complete" };

export function clockPhaseAt(elapsedSec: number, pathname: string): ClockPhase {
  const hourTotalSec = MEETING_HOUR_MINUTES * 60;
  const contentSec = MEETING_CONTENT_MINUTES * 60;
  const extendedEnd = TOTAL_WITH_EXTENDED_MINUTES * 60;

  if (elapsedSec >= extendedEnd) return { kind: "complete" };

  if (elapsedSec >= hourTotalSec) {
    return {
      kind: "extended-qa",
      remainingSec: extendedEnd - elapsedSec,
    };
  }

  if (elapsedSec >= contentSec) {
    return {
      kind: "initial-qa",
      remainingSec: hourTotalSec - elapsedSec,
      hourRemainingSec: hourTotalSec - elapsedSec,
    };
  }

  // Prefer the segment for the current page; fall back to elapsed-based segment
  const byPath = segmentForPath(pathname);
  let segment = byPath;
  if (!segment) {
    let acc = 0;
    for (const s of CONTENT_SEGMENTS) {
      const end = acc + s.minutes * 60;
      if (elapsedSec < end) {
        segment = s;
        break;
      }
      acc = end;
    }
    segment = segment ?? CONTENT_SEGMENTS[CONTENT_SEGMENTS.length - 1];
  }

  const startMin = cumulativeStartMinutes(segment.id);
  const segmentElapsed = elapsedSec - startMin * 60;
  const segmentRemainingSec = segment.minutes * 60 - segmentElapsed;

  return {
    kind: "segment",
    segment,
    segmentRemainingSec,
    hourRemainingSec: hourTotalSec - elapsedSec,
  };
}

export function timeTrackSummary(): { id: string; label: string; minutes: number; speaker?: string }[] {
  return TIME_SEGMENTS.filter((s) => s.id !== "qa-extended").map((s) => ({
    id: s.id,
    label: s.label,
    minutes: s.minutes,
    speaker: s.speaker,
  }));
}

/** Keep slide metadata aligned for menus */
export function slideIdsInTimeOrder(): string[] {
  return CONTENT_SEGMENTS.map((s) => s.id).filter((id) => SLIDES.some((sl) => sl.id === id));
}
