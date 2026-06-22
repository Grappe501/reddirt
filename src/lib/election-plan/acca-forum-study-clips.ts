/**
 * ACCA 2026 SOS forum — Kelly study briefs (transcript timestamps; no video required).
 */
import { ACCA_2026_SOS_FORUM_EVENT } from "@/lib/election-plan/acca-forum-event";

/** Estimated full recording length — used to slice transcript excerpts. */
export const ACCA_FORUM_RECORDING_SECONDS = 7200;

export type AccaForumClipOpponent = "Hammer" | "Pakko" | "Kelly" | "Moderator";

export type AccaForumStudyClip = {
  id: string;
  label: string;
  opponent: AccaForumClipOpponent;
  startSeconds: number;
  durationSeconds: number;
  /** Worksheet tell checkbox ids in ElectionPlanFilmTellWorksheetPanel */
  filmTellIds?: string[];
  /** Pattern / rhetorical tells to track in the transcript excerpt */
  tellsToTrack?: string;
  /** @deprecated Use tellsToTrack — kept for migration */
  watchFor: string;
  /** One-line narrative for Kelly — what this moment means */
  narrativeLead?: string;
  kellyPivotHint: string;
  claimsNote?: string;
};

export const ACCA_FORUM_STUDY_CLIPS: AccaForumStudyClip[] = [
  {
    id: "hammer-opening-16yr",
    label: "Hammer opening — 16 years & God's will",
    opponent: "Hammer",
    startSeconds: 239,
    durationSeconds: 120,
    filmTellIds: ["hammer-voice", "hammer-rank"],
    watchFor: "Voice pace · ranking/integrity framing · bill-list setup",
    kellyPivotHint: "Clerks secured those elections — I want an office that answers their calls.",
    claimsNote: "Pattern only — verify before broadcast.",
  },
  {
    id: "hammer-work-together",
    label: "Hammer — work with clerks, not against",
    opponent: "Hammer",
    startSeconds: 371,
    durationSeconds: 75,
    watchFor: "Collaboration frame before legislation hits counties",
    kellyPivotHint: "Agree on service — add clerk partnership layer; do not only agree.",
  },
  {
    id: "pakko-competition",
    label: "Pakko opening — competition & duopoly",
    opponent: "Pakko",
    startSeconds: 595,
    durationSeconds: 90,
    filmTellIds: ["pakko-respect"],
    watchFor: "Outsider reform lane · respect without ceding SOS desk",
    kellyPivotHint: "One respect line under 15 seconds — then administrator contrast.",
  },
  {
    id: "kelly-opening-people",
    label: "Kelly opening — people & administrator frame",
    opponent: "Kelly",
    startSeconds: 728,
    durationSeconds: 120,
    watchFor: "One-word 'people' frame · civility pledge · 800-person admin beat",
    kellyPivotHint: "Mirror this tone on debate opening — no opponent names.",
  },
  {
    id: "hammer-ranking-integrity",
    label: "Hammer — number one state / Heritage ranking",
    opponent: "Hammer",
    startSeconds: 1841,
    durationSeconds: 90,
    filmTellIds: ["hammer-rank", "hammer-jaw"],
    watchFor: "Ranking cite · jaw tension · authorship = competence collapse",
    kellyPivotHint: "Clerks in your county know whether the SOS office answered the phone.",
    claimsNote: "No Heritage stats on stage unless claims-verified.",
  },
  {
    id: "hammer-bill-sponsor-list",
    label: "Hammer — primary sponsor roll call",
    opponent: "Hammer",
    startSeconds: 2116,
    durationSeconds: 90,
    filmTellIds: ["hammer-jaw"],
    watchFor: "Bill-number acceleration · author vs administrator bait",
    kellyPivotHint: "Writing law and running the office clerks depend on are different jobs.",
  },
  {
    id: "kelly-clerk-partnership",
    label: "Kelly — clerk partnership & feedback loops",
    opponent: "Kelly",
    startSeconds: 792,
    durationSeconds: 75,
    watchFor: "County visits · roundtables · service-over-politics",
    kellyPivotHint: "Reuse verbatim where claims-green — administrator, not author.",
  },
  {
    id: "hammer-closing-ranking",
    label: "Hammer closing — experience & ranking reprise",
    opponent: "Hammer",
    startSeconds: 7128,
    durationSeconds: 120,
    watchFor: "Closing bookend on 16 years · ranking · 'I wrote the law'",
    kellyPivotHint: "Clerks don't need another author in the Capitol — they need an administrator who shows up.",
    claimsNote: "Quotable contrast line — staff claims gate before stage.",
  },
];

export const DAY2_FILM_ROOM_CLIP_IDS = [
  "hammer-opening-16yr",
  "hammer-work-together",
  "pakko-competition",
  "hammer-ranking-integrity",
  "hammer-bill-sponsor-list",
] as const;

export const DAY3_SUPERIORITY_CLIP_IDS = [
  "kelly-opening-people",
  "kelly-clerk-partnership",
  "kelly-administrator-800",
  "hammer-opening-16yr",
  "hammer-bill-sponsor-list",
  "hammer-closing-ranking",
] as const;

/** Extra clip id referenced only in Day 3 list — administrator beat */
export const DAY3_ADMIN_CLIP: AccaForumStudyClip = {
  id: "kelly-administrator-800",
  label: "Kelly — 800 people & Verizon HQ administrator",
  opponent: "Kelly",
  startSeconds: 865,
  durationSeconds: 60,
  watchFor: "Nonprofit/business admin · not lifetime politician",
  kellyPivotHint: "One notecard beat — who depended on you, what broke, how you fixed it.",
};

const CLIP_INDEX = new Map<string, AccaForumStudyClip>(
  [...ACCA_FORUM_STUDY_CLIPS, DAY3_ADMIN_CLIP].map((c) => [c.id, c]),
);

export function getAccaForumStudyClip(clipId: string): AccaForumStudyClip | undefined {
  return CLIP_INDEX.get(clipId);
}

export function listAccaForumStudyClips(clipIds: readonly string[]): AccaForumStudyClip[] {
  return clipIds.map((id) => getAccaForumStudyClip(id)).filter((c): c is AccaForumStudyClip => Boolean(c));
}

export function accaForumClipYoutubeWatchUrl(clip: AccaForumStudyClip): string {
  return `${ACCA_2026_SOS_FORUM_EVENT.youtubeWatchUrl}&t=${clip.startSeconds}s`;
}

export function accaForumClipEmbedSrc(clip: AccaForumStudyClip): string {
  const end = clip.startSeconds + clip.durationSeconds;
  return `https://www.youtube.com/embed/${ACCA_2026_SOS_FORUM_EVENT.youtubeVideoId}?start=${clip.startSeconds}&end=${end}&rel=0`;
}

export function formatAccaClipTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
