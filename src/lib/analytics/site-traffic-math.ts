export function pctChange(current: number, prior: number): number | null {
  if (prior <= 0) return current > 0 ? 100 : null;
  return ((current - prior) / prior) * 100;
}
