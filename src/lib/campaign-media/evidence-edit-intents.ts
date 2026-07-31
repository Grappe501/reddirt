/**
 * Phase 3 Creative Edit — intent lanes and Pro Edit presets.
 * Prefer Unknown. No auto social post — download pack only.
 */

import type { PhotoExportSlot, PhotoLookPreset } from "@/lib/campaign-media/photo-look-presets";
import type { VideoExportAspect } from "@/lib/campaign-media/video-look-presets";

export const EVIDENCE_EDIT_INTENTS = ["social", "header", "site"] as const;
export type EvidenceEditIntent = (typeof EVIDENCE_EDIT_INTENTS)[number];

export const EVIDENCE_EDIT_SITE_SURFACES = [
  "homepage",
  "journey",
  "album",
  "meetKelly",
  "other",
] as const;
export type EvidenceEditSiteSurface = (typeof EVIDENCE_EDIT_SITE_SURFACES)[number];

/** P1 Edit desk place surfaces — Homepage / Journey / Album / Social. */
export const EVIDENCE_FINISH_SURFACES = ["homepage", "journey", "album", "social"] as const;
export type EvidenceFinishSurface = (typeof EVIDENCE_FINISH_SURFACES)[number];

export function parseEvidenceEditIntent(raw?: string | null): EvidenceEditIntent | null {
  const v = String(raw ?? "").trim().toLowerCase();
  if (v === "social" || v === "header" || v === "site") return v;
  return null;
}

export function parseEvidenceEditSiteSurface(raw?: string | null): EvidenceEditSiteSurface | null {
  const v = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, "");
  if (v === "meetkelly") return "meetKelly";
  if (v === "other") return "other";
  if (v === "journey" || v === "acrossarkansas" || v === "fromtheroad") return "journey";
  if (v === "album" || v === "countyalbum" || v === "countyalbums") return "album";
  if (v === "homepage" || v === "home") return "homepage";
  return null;
}

export function parseEvidenceFinishSurface(raw?: string | null): EvidenceFinishSurface | null {
  const v = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, "");
  if (v === "social") return "social";
  if (v === "journey" || v === "acrossarkansas" || v === "fromtheroad") return "journey";
  if (v === "album" || v === "countyalbum" || v === "countyalbums") return "album";
  if (v === "homepage" || v === "home" || v === "gallery") return "homepage";
  return null;
}

export function finishSurfaceFromEdit(
  intent: EvidenceEditIntent | null,
  surface: EvidenceEditSiteSurface | null,
): EvidenceFinishSurface {
  if (intent === "social") return "social";
  if (surface === "journey") return "journey";
  if (surface === "album") return "album";
  return "homepage";
}

export type PhotoEditLanePreset = {
  label: string;
  hint: string;
  look: PhotoLookPreset;
  slots: PhotoExportSlot[];
  promoteHomepage: boolean;
  promoteFeatured: boolean;
  promoteHero: "" | "FEATURE" | "HERO";
  deliver: "download" | "promote_then_publish";
};

export function photoEditLanePreset(
  intent: EvidenceEditIntent | null,
  surface: EvidenceEditSiteSurface | null = null,
): PhotoEditLanePreset {
  if (intent === "social") {
    return {
      label: "Social / download",
      hint: "9:16 + 1:1 + web — Confirm render, then open pack links (no auto-post).",
      look: "punch",
      slots: ["story_9x16", "square_1x1", "web_max", "thumb"],
      promoteHomepage: false,
      promoteFeatured: false,
      promoteHero: "",
      deliver: "download",
    };
  }
  if (intent === "header") {
    return {
      label: "Super header / hero",
      hint: "Wide 16:9 hero pack — Promote, then Publish desk for placement.",
      look: "editorial",
      slots: ["hero_16x9", "grade_full", "web_max"],
      promoteHomepage: true,
      promoteFeatured: true,
      promoteHero: "HERO",
      deliver: "promote_then_publish",
    };
  }
  if (intent === "site") {
    if (surface === "meetKelly") {
      return {
        label: "Meet Kelly",
        hint: "Portrait-forward pack for Meet Kelly — Finish for web writes ship + curate proposal.",
        look: "warm",
        slots: ["portrait_4x5", "web_max", "grade_full"],
        promoteHomepage: true,
        promoteFeatured: true,
        promoteHero: "FEATURE",
        deliver: "promote_then_publish",
      };
    }
    if (surface === "journey") {
      return {
        label: "Journey / Across Arkansas",
        hint: "Known-county trail pack — Finish ships + proposes Across Arkansas curate.",
        look: "warm",
        slots: ["web_max", "hero_16x9", "square_1x1", "grade_full"],
        promoteHomepage: true,
        promoteFeatured: false,
        promoteHero: "FEATURE",
        deliver: "promote_then_publish",
      };
    }
    if (surface === "album") {
      return {
        label: "County album",
        hint: "Album pack — Finish ships + sets album-eligible flags (known county required).",
        look: "neutral",
        slots: ["web_max", "square_1x1", "thumb", "grade_full"],
        promoteHomepage: false,
        promoteFeatured: false,
        promoteHero: "FEATURE",
        deliver: "promote_then_publish",
      };
    }
    if (surface === "other") {
      return {
        label: "Other page",
        hint: "Web-max pack for non-homepage pages — Finish for web, then Publish.",
        look: "neutral",
        slots: ["web_max", "grade_full", "thumb"],
        promoteHomepage: false,
        promoteFeatured: false,
        promoteHero: "FEATURE",
        deliver: "promote_then_publish",
      };
    }
    return {
      label: "Homepage gallery",
      hint: "Homepage-ready pack — Finish ships + optional curated placement proposal.",
      look: "warm",
      slots: ["hero_16x9", "web_max", "square_1x1", "grade_full"],
      promoteHomepage: true,
      promoteFeatured: false,
      promoteHero: "FEATURE",
      deliver: "promote_then_publish",
    };
  }
  return {
    label: "Creative Edit",
    hint: "Pick Social, Super header, or Site to load slot presets.",
    look: "warm",
    slots: ["grade_full", "hero_16x9", "portrait_4x5", "square_1x1", "story_9x16", "web_max", "thumb"],
    promoteHomepage: true,
    promoteFeatured: false,
    promoteHero: "FEATURE",
    deliver: "promote_then_publish",
  };
}

export function videoEditLaneAspects(intent: EvidenceEditIntent | null): VideoExportAspect[] {
  if (intent === "social") return ["vertical_9x16", "square_1x1", "landscape_16x9"];
  if (intent === "header") return ["landscape_16x9", "source"];
  if (intent === "site") return ["landscape_16x9", "source", "square_1x1"];
  return ["source", "vertical_9x16", "square_1x1"];
}

export function evidenceEditHref(input: {
  id?: string;
  intent?: EvidenceEditIntent | null;
  surface?: EvidenceEditSiteSurface | null;
  finishSurface?: EvidenceFinishSurface | null;
  filter?: string;
}): string {
  const sp = new URLSearchParams();
  sp.set("tab", "edit");
  if (input.id) sp.set("id", input.id);
  const finish = input.finishSurface;
  if (finish === "social") {
    sp.set("intent", "social");
  } else if (finish === "homepage" || finish === "journey" || finish === "album") {
    sp.set("intent", "site");
    sp.set("surface", finish);
  } else if (input.intent) {
    sp.set("intent", input.intent);
    if (input.intent === "site" && input.surface) sp.set("surface", input.surface);
  }
  if (input.filter) sp.set("filter", input.filter);
  else sp.set("filter", "needsPromote");
  return `/admin/evidence-workbench?${sp.toString()}`;
}

/** Map Finish surface → curated proposal surface (null = no HOMEPAGE_* proposal). */
export function curateSurfaceForFinish(
  surface: EvidenceFinishSurface,
): "homepageGallery" | "acrossArkansas" | null {
  if (surface === "homepage") return "homepageGallery";
  if (surface === "journey") return "acrossArkansas";
  return null;
}
