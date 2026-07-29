/**
 * Focus-point crop geometry for Evidence Workbench (Pass 5).
 * Coordinates are normalized 0–1 relative to the oriented source image.
 */

export type FocusPoint = { x: number; y: number };

export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}

export function normalizeFocus(input?: { x?: number; y?: number } | null): FocusPoint | null {
  if (!input) return null;
  if (typeof input.x !== "number" || typeof input.y !== "number") return null;
  if (!Number.isFinite(input.x) || !Number.isFinite(input.y)) return null;
  return { x: clamp01(input.x), y: clamp01(input.y) };
}

/** Map object-contain click on a displayed image to normalized source coords. */
export function clickToFocusPoint(input: {
  clientX: number;
  clientY: number;
  elementLeft: number;
  elementTop: number;
  elementWidth: number;
  elementHeight: number;
  naturalWidth: number;
  naturalHeight: number;
}): FocusPoint | null {
  const { naturalWidth: nw, naturalHeight: nh, elementWidth: ew, elementHeight: eh } = input;
  if (nw <= 0 || nh <= 0 || ew <= 0 || eh <= 0) return null;
  const scale = Math.min(ew / nw, eh / nh);
  const dispW = nw * scale;
  const dispH = nh * scale;
  const ox = (ew - dispW) / 2;
  const oy = (eh - dispH) / 2;
  const lx = input.clientX - input.elementLeft - ox;
  const ly = input.clientY - input.elementTop - oy;
  if (lx < 0 || ly < 0 || lx > dispW || ly > dispH) return null;
  return { x: clamp01(lx / dispW), y: clamp01(ly / dispH) };
}

export type CropRect = { left: number; top: number; width: number; height: number };

/**
 * Compute a cover-style crop rectangle for targetAspect (width/height),
 * centered on focus when provided; otherwise image center.
 */
export function coverCropRect(input: {
  srcWidth: number;
  srcHeight: number;
  targetAspect: number;
  focus?: FocusPoint | null;
}): CropRect {
  const srcW = Math.max(1, Math.floor(input.srcWidth));
  const srcH = Math.max(1, Math.floor(input.srcHeight));
  const aspect = input.targetAspect > 0 ? input.targetAspect : 1;
  let cropW: number;
  let cropH: number;
  if (srcW / srcH > aspect) {
    cropH = srcH;
    cropW = Math.max(1, Math.round(srcH * aspect));
  } else {
    cropW = srcW;
    cropH = Math.max(1, Math.round(srcW / aspect));
  }
  const focus = input.focus ?? { x: 0.5, y: 0.5 };
  const cx = focus.x * srcW;
  const cy = focus.y * srcH;
  let left = Math.round(cx - cropW / 2);
  let top = Math.round(cy - cropH / 2);
  left = Math.max(0, Math.min(left, srcW - cropW));
  top = Math.max(0, Math.min(top, srcH - cropH));
  return { left, top, width: cropW, height: cropH };
}

export function aspectForFocusKind(
  kind: string,
): number | null {
  switch (kind) {
    case "hero_16x9":
    case "focus_hero_16x9":
      return 16 / 9;
    case "portrait_4x5":
    case "focus_portrait_4x5":
      return 4 / 5;
    case "square_1x1":
    case "focus_square_1x1":
      return 1;
    default:
      return null;
  }
}

/** Map free-text cropAdvice to a focus crop kind. */
export function parseCropAdviceToKind(advice: string): {
  kind: "focus_hero_16x9" | "focus_portrait_4x5" | "focus_square_1x1";
  reason: string;
} {
  const t = advice.toLowerCase();
  if (/square|1\s*:\s*1|avatar|grid/.test(t)) {
    return { kind: "focus_square_1x1", reason: "cropAdvice suggests square framing" };
  }
  if (/portrait|4\s*:\s*5|9\s*:\s*16|vertical|stories|reel/.test(t)) {
    return { kind: "focus_portrait_4x5", reason: "cropAdvice suggests portrait/vertical framing" };
  }
  if (/hero|16\s*:\s*9|landscape|banner|wide|homepage/.test(t)) {
    return { kind: "focus_hero_16x9", reason: "cropAdvice suggests hero/landscape framing" };
  }
  return { kind: "focus_hero_16x9", reason: "default focus hero crop from cropAdvice" };
}
