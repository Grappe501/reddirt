/**
 * Ship promoted derivatives into a git-trackable folder for Netlify.
 * Copies only live publicSrcOverride files from campaign-derivatives → campaign-shipped.
 * Originals and gitignored derivative workspace stay untouched. Confirm-gated.
 */
import "server-only";

import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import {
  loadPhotoEvidenceStore,
  savePhotoEvidenceStore,
} from "@/lib/campaign-media/evidence-store";
import { isAllowedPublicSrcOverride } from "@/lib/campaign-media/promote-photo-derivative";

export const CAMPAIGN_SHIPPED_PUBLIC_ROOT = "public/media/campaign-shipped";
export const CAMPAIGN_SHIPPED_URL_PREFIX = "/media/campaign-shipped";

export type ShipPromotedDerivativesResult = {
  ok: boolean;
  message: string;
  shipped: Array<{ photoId: string; from: string; to: string }>;
  skipped: Array<{ photoId: string; reason: string }>;
};

function abs(rel: string): string {
  return path.join(process.cwd(), rel);
}

function decodePublicToAbs(src: string): string | null {
  if (!src.startsWith("/")) return null;
  const rel = src.replace(/^\//, "");
  try {
    const decoded = decodeURIComponent(rel);
    const a = abs(path.join("public", decoded));
    if (existsSync(a)) return a;
  } catch {
    /* ignore */
  }
  const candidate = abs(path.join("public", rel));
  return existsSync(candidate) ? candidate : null;
}

function isDerivativeOverride(photoId: string, src: string): boolean {
  return src.startsWith(`/media/campaign-derivatives/${photoId}/`);
}

function isAlreadyShipped(photoId: string, src: string): boolean {
  return src.startsWith(`${CAMPAIGN_SHIPPED_URL_PREFIX}/${photoId}/`);
}

/**
 * Copy promoted derivative binaries into campaign-shipped/ and rewrite overlays.
 * Requires confirmShip:true.
 */
export function shipPromotedDerivatives(input: {
  confirmShip: boolean;
  photoIds?: string[];
  limit?: number;
}): ShipPromotedDerivativesResult {
  if (!input.confirmShip) {
    return {
      ok: false,
      message: "confirmShip:true required — refuse silent derivative ship.",
      shipped: [],
      skipped: [],
    };
  }

  const limit = Math.min(Math.max(Number(input.limit) || 40, 1), 80);
  const filter = input.photoIds?.map((id) => String(id).trim()).filter(Boolean);
  const store = loadPhotoEvidenceStore();
  const shipped: ShipPromotedDerivativesResult["shipped"] = [];
  const skipped: ShipPromotedDerivativesResult["skipped"] = [];

  const entries = Object.entries(store.photos ?? {});
  for (const [photoId, overlay] of entries) {
    if (shipped.length >= limit) break;
    if (filter?.length && !filter.includes(photoId)) continue;
    const from = String(overlay?.publicSrcOverride ?? "").trim();
    if (!from) continue;
    if (isAlreadyShipped(photoId, from)) {
      skipped.push({ photoId, reason: "Already pointing at campaign-shipped." });
      continue;
    }
    if (!isDerivativeOverride(photoId, from)) {
      skipped.push({
        photoId,
        reason: "publicSrcOverride is not under campaign-derivatives for this photo.",
      });
      continue;
    }
    if (!isAllowedPublicSrcOverride(photoId, from)) {
      skipped.push({ photoId, reason: "Override path not allowed." });
      continue;
    }

    const fromAbs = decodePublicToAbs(from);
    if (!fromAbs) {
      skipped.push({ photoId, reason: `Source missing on disk: ${from}` });
      continue;
    }

    const baseName = path.basename(fromAbs);
    const safeName = baseName.replace(/[^\w.\-()+ ]+/g, "_");
    const toRelPublic = `${CAMPAIGN_SHIPPED_PUBLIC_ROOT}/${photoId}`;
    const toAbsDir = abs(toRelPublic);
    mkdirSync(toAbsDir, { recursive: true });
    const toAbs = path.join(toAbsDir, safeName);
    const toUrl = `${CAMPAIGN_SHIPPED_URL_PREFIX}/${photoId}/${safeName}`.replace(/\\/g, "/");

    try {
      copyFileSync(fromAbs, toAbs);
    } catch (err) {
      skipped.push({
        photoId,
        reason: `Copy failed: ${err instanceof Error ? err.message : String(err)}`,
      });
      continue;
    }

    if (!isAllowedPublicSrcOverride(photoId, toUrl)) {
      skipped.push({ photoId, reason: `Shipped URL not allowlisted: ${toUrl}` });
      continue;
    }

    store.photos[photoId] = {
      ...overlay,
      publicSrcOverride: toUrl,
      promotedAt: new Date().toISOString(),
      whatThisProves: overlay.whatThisProves,
    };
    shipped.push({ photoId, from, to: toUrl });
  }

  if (shipped.length) {
    savePhotoEvidenceStore(store);
  }

  return {
    ok: true,
    message: `Shipped ${shipped.length} promoted binary(ies) → ${CAMPAIGN_SHIPPED_PUBLIC_ROOT} · skipped ${skipped.length}. Commit campaign-shipped + overlays to deploy.`,
    shipped,
    skipped,
  };
}

/** List overlays still pointing at gitignored derivatives (need ship). */
export function listPromotedDerivativesNeedingShip(limit = 40): Array<{
  photoId: string;
  publicSrc: string;
  fileExists: boolean;
}> {
  const store = loadPhotoEvidenceStore();
  const out: Array<{ photoId: string; publicSrc: string; fileExists: boolean }> = [];
  for (const [photoId, overlay] of Object.entries(store.photos ?? {})) {
    const src = String(overlay?.publicSrcOverride ?? "").trim();
    if (!src || !isDerivativeOverride(photoId, src)) continue;
    out.push({
      photoId,
      publicSrc: src,
      fileExists: Boolean(decodePublicToAbs(src)),
    });
    if (out.length >= limit) break;
  }
  return out;
}
