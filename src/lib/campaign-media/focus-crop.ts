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

/** Normalized crop in source image space (0–1). V2.2 true crop. */
export type NormalizedCropRect = { x: number; y: number; w: number; h: number };

const MIN_NORM_CROP = 0.04;

export function clampNorm(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

/** Validate / clamp a normalized crop rect; returns undefined if unusable. */
export function normalizeCropRect(raw: unknown): NormalizedCropRect | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const x = clampNorm(Number(o.x));
  const y = clampNorm(Number(o.y));
  let w = Number(o.w);
  let h = Number(o.h);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return undefined;
  w = Math.min(1 - x, Math.max(MIN_NORM_CROP, w));
  h = Math.min(1 - y, Math.max(MIN_NORM_CROP, h));
  if (w < MIN_NORM_CROP || h < MIN_NORM_CROP) return undefined;
  return { x, y, w, h };
}

export function pixelRectFromNormalized(
  n: NormalizedCropRect,
  srcWidth: number,
  srcHeight: number,
): CropRect {
  const srcW = Math.max(1, Math.floor(srcWidth));
  const srcH = Math.max(1, Math.floor(srcHeight));
  let left = Math.round(n.x * srcW);
  let top = Math.round(n.y * srcH);
  let width = Math.round(n.w * srcW);
  let height = Math.round(n.h * srcH);
  width = Math.max(1, Math.min(width, srcW - left));
  height = Math.max(1, Math.min(height, srcH - top));
  left = Math.max(0, Math.min(left, srcW - width));
  top = Math.max(0, Math.min(top, srcH - height));
  return { left, top, width, height };
}

export function normalizedFromPixelRect(
  rect: CropRect,
  srcWidth: number,
  srcHeight: number,
): NormalizedCropRect {
  const srcW = Math.max(1, srcWidth);
  const srcH = Math.max(1, srcHeight);
  return normalizeCropRect({
    x: rect.left / srcW,
    y: rect.top / srcH,
    w: rect.width / srcW,
    h: rect.height / srcH,
  }) ?? { x: 0, y: 0, w: 1, h: 1 };
}

/** Cover-style crop as normalized rect (focus fallback). */
export function normalizedCoverCrop(input: {
  srcWidth: number;
  srcHeight: number;
  targetAspect: number;
  focus?: FocusPoint | null;
}): NormalizedCropRect {
  const px = coverCropRect(input);
  return normalizedFromPixelRect(px, input.srcWidth, input.srcHeight);
}

/** Keep aspect; move by normalized deltas. */
export function moveNormalizedCrop(
  rect: NormalizedCropRect,
  dx: number,
  dy: number,
): NormalizedCropRect {
  const x = clampNorm(Math.min(rect.x + dx, 1 - rect.w));
  const y = clampNorm(Math.min(rect.y + dy, 1 - rect.h));
  return { x, y, w: rect.w, h: rect.h };
}

/**
 * Resize from a corner while locking aspect. Corner: tl|tr|bl|br.
 * dx/dy are normalized deltas in source space.
 */
export function resizeNormalizedCrop(input: {
  rect: NormalizedCropRect;
  corner: "tl" | "tr" | "bl" | "br";
  dx: number;
  dy: number;
  aspect: number;
}): NormalizedCropRect {
  const { rect, corner, aspect } = input;
  const right = rect.x + rect.w;
  const bottom = rect.y + rect.h;
  let x1 = rect.x;
  let y1 = rect.y;
  let x2 = right;
  let y2 = bottom;

  if (corner.includes("l")) x1 = clampNorm(rect.x + input.dx);
  else x2 = clampNorm(right + input.dx);
  if (corner.startsWith("t")) y1 = clampNorm(rect.y + input.dy);
  else y2 = clampNorm(bottom + input.dy);

  if (x2 < x1) [x1, x2] = [x2, x1];
  if (y2 < y1) [y1, y2] = [y2, y1];

  let w = Math.max(MIN_NORM_CROP, x2 - x1);
  let h = Math.max(MIN_NORM_CROP, y2 - y1);

  // Lock aspect from the dragged corner's opposite anchor.
  if (aspect > 0) {
    if (w / h > aspect) {
      h = w / aspect;
    } else {
      w = h * aspect;
    }
    if (corner.includes("l")) {
      x1 = x2 - w;
    } else {
      x2 = x1 + w;
    }
    if (corner.startsWith("t")) {
      y1 = y2 - h;
    } else {
      y2 = y1 + h;
    }
  }

  // Re-clamp into [0,1]
  if (x1 < 0) {
    x2 -= x1;
    x1 = 0;
  }
  if (y1 < 0) {
    y2 -= y1;
    y1 = 0;
  }
  if (x2 > 1) {
    x1 -= x2 - 1;
    x2 = 1;
  }
  if (y2 > 1) {
    y1 -= y2 - 1;
    y2 = 1;
  }
  w = Math.max(MIN_NORM_CROP, x2 - x1);
  h = Math.max(MIN_NORM_CROP, y2 - y1);
  if (aspect > 0) {
    if (w / h > aspect) h = w / aspect;
    else w = h * aspect;
    if (x1 + w > 1) {
      w = 1 - x1;
      h = w / aspect;
    }
    if (y1 + h > 1) {
      h = 1 - y1;
      w = h * aspect;
    }
  }
  return normalizeCropRect({ x: x1, y: y1, w, h }) ?? rect;
}

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

/** Map Vision recommendedKind (or free text) to a focus crop kind. */
export function mapVisionRecommendedKind(
  raw: string,
): "focus_hero_16x9" | "focus_portrait_4x5" | "focus_square_1x1" | null {
  const t = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (
    t === "focus_square_1x1" ||
    t === "square_1x1" ||
    t === "square" ||
    t === "1x1"
  ) {
    return "focus_square_1x1";
  }
  if (
    t === "focus_portrait_4x5" ||
    t === "portrait_4x5" ||
    t === "portrait" ||
    t === "4x5" ||
    t === "story_9x16"
  ) {
    return "focus_portrait_4x5";
  }
  if (
    t === "focus_hero_16x9" ||
    t === "hero_16x9" ||
    t === "hero" ||
    t === "16x9" ||
    t === "landscape"
  ) {
    return "focus_hero_16x9";
  }
  if (!t) return null;
  // Fall back to keyword parse for free-text cropAdvice from Vision
  return parseCropAdviceToKind(raw).kind;
}
