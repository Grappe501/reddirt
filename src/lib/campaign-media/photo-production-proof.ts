/**
 * V2.4 — Post-Finish production proof.
 * Verifies publicSrcOverride is ship-only, binary exists, and optional HTTP smoke.
 * Prefer Unknown; never invents geography; never logs secrets.
 */
import "server-only";

import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { safePublicSrcOverride } from "@/lib/campaign-media/apply-evidence-overlay";
import { loadPhotoEvidenceStore } from "@/lib/campaign-media/evidence-store";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import { CAMPAIGN_SHIPPED_URL_PREFIX } from "@/lib/campaign-media/ship-promoted-derivatives";

export type ProductionProofCheck = {
  id: string;
  ok: boolean;
  detail: string;
};

export type PhotoProductionProof = {
  photoId: string;
  ok: boolean;
  message: string;
  publicSrcOverride: string | null;
  shipOnly: boolean;
  fileExists: boolean;
  bytes: number | null;
  /** What public readers would honor (null if override rejected). */
  publicReaderSrc: string | null;
  originalSrcExists: boolean;
  checks: ProductionProofCheck[];
  smoke?: { path: string; ok: boolean; status?: number; detail: string };
};

function abs(rel: string): string {
  return path.join(process.cwd(), rel);
}

function decodePublicSrcToAbs(src: string): string | null {
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

function resolveSmokeBaseUrl(explicit?: string | null): string | null {
  const raw = String(
    explicit ??
      process.env.PHOTO_EDITOR_SMOKE_BASE_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      "",
  ).trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.origin;
  } catch {
    return null;
  }
}

/**
 * Prove a finished still is Netlify-safe: ship-only override + file on disk (+ optional HTTP).
 */
export async function provePhotoProduction(input: {
  photoId: string;
  /** Optional origin for HEAD smoke, e.g. http://localhost:3000 or Netlify URL. */
  smokeBaseUrl?: string | null;
  /** When true, attempt HTTP smoke if a base URL is resolvable. */
  runHttpSmoke?: boolean;
}): Promise<PhotoProductionProof> {
  const photoId = String(input.photoId ?? "").trim();
  const checks: ProductionProofCheck[] = [];

  if (!photoId) {
    return {
      photoId: "",
      ok: false,
      message: "photoId required.",
      publicSrcOverride: null,
      shipOnly: false,
      fileExists: false,
      bytes: null,
      publicReaderSrc: null,
      originalSrcExists: false,
      checks: [{ id: "photoId", ok: false, detail: "Missing photoId." }],
    };
  }

  const live = listCampaignPhotosLive().find((p) => p.id === photoId);
  const originalAbs = live?.src ? decodePublicSrcToAbs(live.src) : null;
  const originalSrcExists = Boolean(originalAbs);
  checks.push({
    id: "original",
    ok: originalSrcExists,
    detail: originalSrcExists
      ? `Original on disk: ${live?.src}`
      : "Original campaign-photos binary missing or unresolved.",
  });

  const overlay = loadPhotoEvidenceStore().photos[photoId] ?? null;
  const override = String(overlay?.publicSrcOverride ?? "").trim() || null;
  const shipOnly = Boolean(
    override && override.startsWith(`${CAMPAIGN_SHIPPED_URL_PREFIX}/${photoId}/`),
  );
  const publicReaderSrc = safePublicSrcOverride(photoId, override ?? undefined);
  const overrideAbs = override ? decodePublicSrcToAbs(override) : null;
  const fileExists = Boolean(overrideAbs);
  let bytes: number | null = null;
  if (overrideAbs) {
    try {
      bytes = statSync(overrideAbs).size;
    } catch {
      bytes = null;
    }
  }

  checks.push({
    id: "override_present",
    ok: Boolean(override),
    detail: override
      ? `publicSrcOverride set: ${override}`
      : "No publicSrcOverride — Finish/Promote may not have run (or social pack only).",
  });
  checks.push({
    id: "ship_only",
    ok: !override || shipOnly,
    detail: !override
      ? "No override to validate."
      : shipOnly
        ? "Override is under campaign-shipped (public-safe)."
        : "Override is NOT ship-only — public readers will ignore gitignored derivatives.",
  });
  checks.push({
    id: "file_exists",
    ok: !override || fileExists,
    detail: !override
      ? "No override file to check."
      : fileExists
        ? `Shipped binary on disk${bytes != null ? ` · ${bytes} bytes` : ""}.`
        : "Override path missing on disk — production will 404 until Ship / deploy.",
  });
  checks.push({
    id: "public_reader",
    ok: !override || Boolean(publicReaderSrc),
    detail: !override
      ? "No override."
      : publicReaderSrc
        ? `Public readers honor: ${publicReaderSrc}`
        : "safePublicSrcOverride rejected this path — site stays on original src.",
  });

  let smoke: PhotoProductionProof["smoke"];
  const wantSmoke = input.runHttpSmoke !== false;
  const base = wantSmoke ? resolveSmokeBaseUrl(input.smokeBaseUrl) : null;
  if (wantSmoke && base && publicReaderSrc) {
    const url = `${base}${publicReaderSrc}`;
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "manual" });
      const ok = res.status >= 200 && res.status < 400;
      smoke = {
        path: publicReaderSrc,
        ok,
        status: res.status,
        detail: ok
          ? `HTTP ${res.status} · ${url}`
          : `HTTP ${res.status} for ${url} — deploy/ship may be incomplete.`,
      };
      checks.push({
        id: "http_smoke",
        ok,
        detail: smoke.detail,
      });
    } catch (err) {
      smoke = {
        path: publicReaderSrc,
        ok: false,
        detail: `HTTP smoke failed: ${err instanceof Error ? err.message : "fetch error"} (${url})`,
      };
      checks.push({ id: "http_smoke", ok: false, detail: smoke.detail });
    }
  } else if (wantSmoke && !base) {
    checks.push({
      id: "http_smoke",
      ok: true,
      detail:
        "HTTP smoke skipped — set PHOTO_EDITOR_SMOKE_BASE_URL or NEXT_PUBLIC_SITE_URL to probe live.",
    });
  }

  const hardOk =
    !override || (shipOnly && fileExists && Boolean(publicReaderSrc));

  return {
    photoId,
    ok: hardOk,
    message: !override
      ? "No public override — social pack or unfinished promote (nothing ship-unsafe)."
      : hardOk
        ? `Production proof OK · ${publicReaderSrc ?? override}`
        : `Production proof FAILED — ${checks
            .filter((c) => !c.ok && c.id !== "http_smoke")
            .map((c) => c.detail)
            .slice(0, 3)
            .join(" · ")}`,
    publicSrcOverride: override,
    shipOnly,
    fileExists,
    bytes,
    publicReaderSrc,
    originalSrcExists,
    checks,
    smoke,
  };
}

/**
 * Batch proof for finished stills (max 24).
 */
export async function provePhotosProduction(input: {
  photoIds: string[];
  smokeBaseUrl?: string | null;
  runHttpSmoke?: boolean;
}): Promise<{
  ok: boolean;
  message: string;
  proofs: PhotoProductionProof[];
  failedIds: string[];
}> {
  const ids = [...new Set((input.photoIds ?? []).map((id) => String(id).trim()).filter(Boolean))].slice(
    0,
    24,
  );
  const proofs: PhotoProductionProof[] = [];
  for (const photoId of ids) {
    proofs.push(
      await provePhotoProduction({
        photoId,
        smokeBaseUrl: input.smokeBaseUrl,
        runHttpSmoke: input.runHttpSmoke,
      }),
    );
  }
  const failedIds = proofs.filter((p) => !p.ok && p.publicSrcOverride).map((p) => p.photoId);
  const ok = failedIds.length === 0;
  return {
    ok,
    message: ok
      ? `Production proof · ${proofs.length} checked · all ship-safe (or no override).`
      : `Production proof · ${failedIds.length}/${proofs.length} failed ship-only/file checks.`,
    proofs,
    failedIds,
  };
}
