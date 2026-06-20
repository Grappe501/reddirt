/** Compact label for pathway progress chips — shared Day 1 / Day 2. */
export function pathwayStepChipLabel(kind: string, blockIndex: number): string {
  if (kind === "block") return `B${blockIndex + 1}`;
  if (kind === "example") return "Opt";
  if (kind === "rehearsal") return "Say";
  if (kind === "drill") return "Drill";
  return kind.slice(0, 4);
}
