export const MOVEMENT_PHILOSOPHY_HUB_HREF = "/admin/intelligence/movement-philosophy";

export type MovementPhilosophyEntry = {
  pathKey: string;
  label: string;
  summary: string;
  /** Path under `docs/` */
  sourceFile: string;
};

export const MOVEMENT_PHILOSOPHY_ENTRIES: MovementPhilosophyEntry[] = [
  {
    pathKey: "README",
    label: "Philosophy index",
    summary: "Core ideas consistent across site, field, and communications.",
    sourceFile: "philosophy/README.md",
  },
  {
    pathKey: "vision-and-goals",
    label: "Vision and goals",
    summary: "North star, taglines, short/medium/long-term goals — power back block by block.",
    sourceFile: "philosophy/vision-and-goals.md",
  },
  {
    pathKey: "core-principles",
    label: "Core principles",
    summary: "Movement architecture — pain → purpose → possibility, community-centered power, organizing + tech.",
    sourceFile: "philosophy/core-principles.md",
  },
  {
    pathKey: "positioning-and-coalition",
    label: "Positioning and coalition",
    summary: "Framing inside Arkansas, coalition guardrails, naming directions, homepage narrative spine.",
    sourceFile: "philosophy/positioning-and-coalition.md",
  },
  {
    pathKey: "volunteer-philosophy-foundation",
    label: "Volunteer philosophy foundation (VOL-CORE-1)",
    summary: "Campaign culture and tone translated into volunteer system behavior — trust, calm leadership, people-powered organizing.",
    sourceFile: "volunteer-philosophy-foundation.md",
  },
];

export function movementPhilosophyDocHref(pathKey: string): string {
  const key = pathKey.replace(/^\/+|\/+$/g, "");
  return key ? `${MOVEMENT_PHILOSOPHY_HUB_HREF}/${key}` : MOVEMENT_PHILOSOPHY_HUB_HREF;
}

export function findMovementPhilosophyEntry(pathKey: string): MovementPhilosophyEntry | undefined {
  const key = pathKey.replace(/^\/+|\/+$/g, "") || "README";
  return MOVEMENT_PHILOSOPHY_ENTRIES.find((e) => e.pathKey === key);
}

export function listMovementPhilosophyPathKeys(): string[] {
  return MOVEMENT_PHILOSOPHY_ENTRIES.map((e) => e.pathKey);
}
