/** Compact label for pathway progress chips — shared Day 1–5. */
export function pathwayStepChipLabel(kind: string, blockIndex: number): string {
  if (kind === "block") return `B${blockIndex + 1}`;
  if (kind === "example") return "Opt";
  if (kind === "rehearsal") return "Say";
  if (kind === "drill" || kind === "command-drill") return "Drill";
  if (kind === "micro-lesson") return "Les";
  if (kind === "close") return "End";
  return kind.slice(0, 4);
}
