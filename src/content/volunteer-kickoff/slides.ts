export type KickoffSlideId =
  | "welcome"
  | "why"
  | "vision"
  | "elections"
  | "strategy"
  | "events"
  | "youth"
  | "local"
  | "campaign"
  | "strike-team"
  | "calendar"
  | "join";

export type KickoffSlide = {
  id: KickoffSlideId;
  /** Path under /volunteer-kickoff (empty string = index) */
  path: string;
  title: string;
  navLabel: string;
  speaker?: string;
  minutes?: string;
};

export const KICKOFF_SLIDES: readonly KickoffSlide[] = [
  {
    id: "welcome",
    path: "",
    title: "75 Counties. One Arkansas. One Team.",
    navLabel: "Welcome",
    speaker: "Steve",
    minutes: "0:00–0:04",
  },
  {
    id: "why",
    path: "why",
    title: "The Campaign Has Reached a Turning Point",
    navLabel: "Why We Are Here",
    speaker: "Steve",
    minutes: "0:04–0:12",
  },
  {
    id: "vision",
    path: "vision",
    title: "Trust Comes Before Politics",
    navLabel: "Kelly’s Vision",
    speaker: "Kelly",
    minutes: "0:04–0:12",
  },
  {
    id: "elections",
    path: "elections",
    title: "Secure Elections. Accessible Elections. Local Trust.",
    navLabel: "Elections",
    speaker: "Kelly",
    minutes: "0:12–0:18",
  },
  {
    id: "strategy",
    path: "strategy",
    title: "County by County. Community by Community.",
    navLabel: "Strategy",
    speaker: "Steve",
    minutes: "0:18–0:25",
  },
  {
    id: "events",
    path: "events",
    title: "Help Bring the Campaign to Your Community",
    navLabel: "Event Model",
    speaker: "Steve",
    minutes: "0:25–0:28",
  },
  {
    id: "youth",
    path: "youth",
    title: "Building the Next Generation of Arkansas Leadership",
    navLabel: "Youth Coalition",
    speaker: "Chance Bradford",
    minutes: "0:25–0:32",
  },
  {
    id: "local",
    path: "local",
    title: "Build the Campaign Where You Live",
    navLabel: "Local Teams",
    speaker: "Carol Egan",
    minutes: "0:32–0:37",
  },
  {
    id: "campaign",
    path: "campaign",
    title: "Help Operate the Statewide Campaign",
    navLabel: "Campaign Teams",
    speaker: "Steve",
    minutes: "0:37–0:50",
  },
  {
    id: "strike-team",
    path: "strike-team",
    title: "Five Teams. Every Saturday. Communities Across Arkansas.",
    navLabel: "Strike Teams",
    speaker: "Steve",
    minutes: "0:45–0:50",
  },
  {
    id: "calendar",
    path: "calendar",
    title: "Where We Are Going Next",
    navLabel: "Calendar",
    speaker: "Steve",
    minutes: "0:50–0:55",
  },
  {
    id: "join",
    path: "join",
    title: "Where Will You Help Build This Campaign?",
    navLabel: "Join Us",
    speaker: "Kelly",
    minutes: "0:55–1:00",
  },
] as const;

export const KICKOFF_BASE = "/volunteer-kickoff";

export function kickoffHref(path: string): string {
  if (!path) return KICKOFF_BASE;
  return `${KICKOFF_BASE}/${path}`;
}

export function slideIndexByPath(pathSegment: string | undefined): number {
  const key = pathSegment ?? "";
  const idx = KICKOFF_SLIDES.findIndex((s) => s.path === key);
  return idx >= 0 ? idx : 0;
}

export function getSlide(id: KickoffSlideId): KickoffSlide {
  const slide = KICKOFF_SLIDES.find((s) => s.id === id);
  if (!slide) throw new Error(`Unknown kickoff slide: ${id}`);
  return slide;
}
