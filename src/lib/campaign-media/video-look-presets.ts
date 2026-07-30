/**
 * Video look presets — named ffmpeg vf chains (not a LUT suite).
 */

export const VIDEO_LOOK_PRESETS = ["neutral", "warm", "cool", "contrast"] as const;
export type VideoLookPreset = (typeof VIDEO_LOOK_PRESETS)[number];

export function videoLookVf(look: VideoLookPreset | string | undefined): string | null {
  switch (look) {
    case "warm":
      return "eq=contrast=1.05:saturation=1.12:brightness=0.02,colorbalance=rs=0.06:gs=0.02:bs=-0.04";
    case "cool":
      return "eq=contrast=1.05:saturation=1.05:brightness=0.0,colorbalance=rs=-0.04:gs=0.0:bs=0.06";
    case "contrast":
      return "eq=contrast=1.18:saturation=1.08:brightness=-0.02";
    case "neutral":
    default:
      return null;
  }
}

export const VIDEO_TRANSITION_KINDS = ["none", "crossfade"] as const;
export type VideoTransitionKind = (typeof VIDEO_TRANSITION_KINDS)[number];

export const VIDEO_CAPTION_MODES = ["none", "sidecar", "burn_in"] as const;
export type VideoCaptionMode = (typeof VIDEO_CAPTION_MODES)[number];

export const VIDEO_EXPORT_ASPECTS = ["source", "vertical_9x16", "square_1x1", "landscape_16x9"] as const;
export type VideoExportAspect = (typeof VIDEO_EXPORT_ASPECTS)[number];

export function aspectVf(aspect: VideoExportAspect): string | null {
  switch (aspect) {
    case "vertical_9x16":
      return "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1";
    case "square_1x1":
      return "scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080,setsar=1";
    case "landscape_16x9":
      return "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1";
    case "source":
    default:
      return null;
  }
}

export function joinVf(...parts: Array<string | null | undefined>): string | undefined {
  const clean = parts.map((p) => String(p ?? "").trim()).filter(Boolean);
  return clean.length ? clean.join(",") : undefined;
}
