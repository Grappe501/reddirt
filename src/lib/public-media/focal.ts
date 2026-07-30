/**
 * Focal-point helpers — normalized 0.0–1.0 → CSS object-position.
 */

export const DEFAULT_FOCAL_X = 0.5;
export const DEFAULT_FOCAL_Y = 0.5;

export function isValidFocalCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

export function clampFocalOrThrow(value: number, label: string): number {
  if (!isValidFocalCoordinate(value)) {
    throw new Error(`${label} must be a number between 0.0 and 1.0 inclusive`);
  }
  return value;
}

export function normalizeFocal(
  value: number | null | undefined,
  fallback: number = DEFAULT_FOCAL_X,
): number {
  if (value == null) return fallback;
  if (!isValidFocalCoordinate(value)) return fallback;
  return value;
}

/** Effective crop: placement override → asset default → center. */
export function resolveEffectiveFocal(input: {
  placementFocalX?: number | null;
  placementFocalY?: number | null;
  assetFocalX?: number | null;
  assetFocalY?: number | null;
}): { x: number; y: number } {
  const x =
    input.placementFocalX != null && isValidFocalCoordinate(input.placementFocalX)
      ? input.placementFocalX
      : normalizeFocal(input.assetFocalX, DEFAULT_FOCAL_X);
  const y =
    input.placementFocalY != null && isValidFocalCoordinate(input.placementFocalY)
      ? input.placementFocalY
      : normalizeFocal(input.assetFocalY, DEFAULT_FOCAL_Y);
  return { x, y };
}

/** Convert 0–1 focal to CSS percentage string for object-position. */
export function focalToObjectPosition(x: number, y: number): string {
  const px = Math.round(normalizeFocal(x) * 100);
  const py = Math.round(normalizeFocal(y) * 100);
  return `${px}% ${py}%`;
}
