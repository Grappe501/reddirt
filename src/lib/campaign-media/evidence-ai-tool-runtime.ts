import "server-only";

import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { CAMPAIGN_MEDIA_REGISTRY } from "@/content/media/campaign-media-registry";
import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { buildCountyAlbums } from "@/lib/campaign-media/county-albums";
import { loadEvidenceAiMemory } from "@/lib/campaign-media/evidence-ai-memory";
import { loadCalendarPresenceStore, loadPhotoEvidenceStore, loadSpeechEvidenceStore } from "@/lib/campaign-media/evidence-store";
import { applyPhotoEvidenceOverlay } from "@/lib/campaign-media/apply-evidence-overlay";
import { photoPublicSurfacesPreview } from "@/lib/campaign-media/county-albums-live";
import {
  createPhotoDerivative,
  encodeVideoExcerptClip,
  encodeVideoExcerptPlan,
  extractLocalVideoPoster,
  inspectPhotoPixels,
  listPhotoDerivatives,
  planVideoExcerpt,
  probeLocalVideo,
  probeVideoTooling,
  suggestCropPlan,
  type PhotoDerivativeKind,
} from "@/lib/campaign-media/media-derivatives";
import { resolveRegistryCountyFromLabel } from "@/lib/county/resolve-county-label";
import { loadWorkspaceRecord } from "@/lib/media/youtube-transcripts/workspace-store";
import { analyzeTranscriptIntelligence } from "@/lib/campaign-media/transcript-intelligence";

function asString(v: unknown): string {
  return String(v ?? "").trim();
}

function asLimit(v: unknown, fallback: number, max = 12): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
}

function livePhotos(): CampaignPhotoRecord[] {
  const store = loadPhotoEvidenceStore();
  return CAMPAIGN_PHOTO_REGISTRY.map((p) => applyPhotoEvidenceOverlay(p, store.photos?.[p.id]));
}

const DERIVATIVE_KINDS = new Set<string>([
  "web_max",
  "thumb",
  "hero_16x9",
  "portrait_4x5",
  "square_1x1",
  "auto_orient",
  "focus_hero_16x9",
  "focus_portrait_4x5",
  "focus_square_1x1",
]);

/** Async-capable executor — brain awaits this. */
export async function executeEvidenceAiTool(
  name: string,
  argsJson: string,
): Promise<{ ok: true; result: unknown } | { ok: false; error: string }> {
  let args: Record<string, unknown> = {};
  try {
    args = argsJson ? (JSON.parse(argsJson) as Record<string, unknown>) : {};
  } catch {
    return { ok: false, error: "Invalid tool arguments JSON." };
  }

  try {
    switch (name) {
      case "lookup_arkansas_county": {
        const label = asString(args.label);
        const hit = resolveRegistryCountyFromLabel(label);
        if (!hit) {
          return {
            ok: true,
            result: {
              found: false,
              label,
              advice: "No registry match — leave county Unknown unless operator confirms another label.",
            },
          };
        }
        return {
          ok: true,
          result: {
            found: true,
            shortName: hit.displayName.replace(/\s+County$/i, ""),
            displayName: hit.displayName,
            slug: hit.slug,
            regionId: hit.regionId,
          },
        };
      }

      case "search_confirmed_memory": {
        const query = asString(args.query).toLowerCase();
        const county = asString(args.county).toLowerCase();
        const city = asString(args.city).toLowerCase();
        const limit = asLimit(args.limit, 6);
        const examples = loadEvidenceAiMemory().examples.filter((e) => {
          if (county && !e.county.toLowerCase().includes(county.replace(/\s+county$/, ""))) return false;
          if (city && !e.city.toLowerCase().includes(city)) return false;
          if (!query) return true;
          const hay = `${e.county} ${e.city} ${e.venue ?? ""} ${e.eventName ?? ""} ${e.whatThisProves ?? ""} ${e.captionOrTitle ?? ""}`.toLowerCase();
          return hay.includes(query);
        });
        return {
          ok: true,
          result: {
            count: examples.length,
            examples: examples.slice(0, limit).map((e) => ({
              assetKind: e.assetKind,
              assetId: e.assetId,
              county: e.county,
              city: e.city,
              venue: e.venue ?? null,
              eventName: e.eventName ?? null,
              whatThisProves: e.whatThisProves ?? null,
              captionOrTitle: e.captionOrTitle ?? null,
            })),
            note: "Soft priors only — do not copy geography onto a different asset without visual/textual match.",
          },
        };
      }

      case "search_calendar_presence": {
        const query = asString(args.query).toLowerCase();
        const county = asString(args.county).toLowerCase();
        const city = asString(args.city).toLowerCase();
        const dateFragment = asString(args.dateFragment);
        const status = asString(args.status) || "any";
        const limit = asLimit(args.limit, 8, 20);
        const rows = loadCalendarPresenceStore().rows.filter((r) => {
          if (status !== "any" && r.status !== status) return false;
          if (county && !(r.county || "").toLowerCase().includes(county.replace(/\s+county$/, ""))) return false;
          if (city && !(r.city || "").toLowerCase().includes(city)) return false;
          if (dateFragment && !r.date.includes(dateFragment)) return false;
          if (!query) return true;
          const hay = `${r.summary} ${r.location} ${r.city} ${r.county}`.toLowerCase();
          return hay.includes(query);
        });
        return {
          ok: true,
          result: {
            count: rows.length,
            rows: rows.slice(0, limit).map((r) => ({
              id: r.id,
              date: r.date,
              summary: r.summary,
              location: r.location || null,
              city: r.city || null,
              county: r.county || null,
              status: r.status,
              hasPhysicalLocation: r.hasPhysicalLocation,
            })),
            note: "Only Confirmed rows may support geography. Needs confirm / empty city-county are not proof.",
          },
        };
      }

      case "find_similar_campaign_photos": {
        const county = asString(args.county).toLowerCase();
        const city = asString(args.city).toLowerCase();
        const eventName = asString(args.eventName).toLowerCase();
        const query = asString(args.query).toLowerCase();
        const exclude = asString(args.excludePhotoId);
        const limit = asLimit(args.limit, 6);
        const hits = livePhotos()
          .filter((p) => p.id !== exclude)
          .map((p) => {
            let score = 0;
            const c = p.campaign.county.toLowerCase();
            const ci = p.campaign.city.toLowerCase();
            const ev = p.campaign.eventName.toLowerCase();
            const hay = `${p.id} ${p.basic.originalFilename} ${p.accessibility.caption} ${p.accessibility.altText}`.toLowerCase();
            if (county && c !== "unknown" && c.includes(county.replace(/\s+county$/, ""))) score += 5;
            if (city && ci !== "unknown" && ci.includes(city)) score += 4;
            if (eventName && ev !== "unknown" && ev.includes(eventName)) score += 3;
            if (query && hay.includes(query)) score += 2;
            return { photo: p, score };
          })
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(({ photo: p, score }) => ({
            score,
            id: p.id,
            county: p.campaign.county,
            city: p.campaign.city,
            eventName: p.campaign.eventName,
            caption: p.accessibility.caption,
            heroLevel: p.heroLevel,
            publicationStatus: p.publicationStatus,
          }));
        return { ok: true, result: { count: hits.length, photos: hits } };
      }

      case "get_photo_file_basics": {
        const photoId = asString(args.photoId);
        const srcArg = asString(args.src);
        const photo =
          (photoId ? livePhotos().find((p) => p.id === photoId) : null) ??
          (srcArg ? livePhotos().find((p) => p.src === srcArg) : null) ??
          null;
        const src = photo?.src ?? srcArg;
        if (!src?.startsWith("/")) {
          return { ok: true, result: { found: false, reason: "No local public src." } };
        }
        const absPath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
        if (!existsSync(absPath)) {
          return { ok: true, result: { found: false, src, reason: "File missing on disk." } };
        }
        const st = statSync(absPath);
        const pixels = await inspectPhotoPixels({ photoId: photo?.id, src });
        return {
          ok: true,
          result: {
            found: true,
            photoId: photo?.id ?? null,
            src,
            bytes: st.size,
            width: pixels.width ?? photo?.basic.width ?? null,
            height: pixels.height ?? photo?.basic.height ?? null,
            orientation: pixels.orientation ?? photo?.basic.orientation ?? null,
            format: pixels.format,
            aspectRatio: pixels.aspectRatio,
            originalFilename: photo?.basic.originalFilename ?? path.basename(absPath),
            captureDateIso: photo?.basic.captureDateIso ?? "Unknown",
          },
        };
      }

      case "inspect_photo_pixels": {
        const result = await inspectPhotoPixels({
          photoId: asString(args.photoId) || undefined,
          src: asString(args.src) || undefined,
        });
        return { ok: true, result };
      }

      case "suggest_crop_plan": {
        const photoId = asString(args.photoId);
        if (!photoId) return { ok: false, error: "photoId required." };
        const result = await suggestCropPlan(photoId);
        if (!result.ok) return { ok: false, error: result.error };
        return { ok: true, result: result.plan };
      }

      case "create_photo_derivative": {
        const photoId = asString(args.photoId);
        const kind = asString(args.kind);
        if (!photoId) return { ok: false, error: "photoId required." };
        if (!DERIVATIVE_KINDS.has(kind)) {
          return { ok: false, error: `Unsupported kind: ${kind}` };
        }
        const result = await createPhotoDerivative({
          photoId,
          kind: kind as Exclude<PhotoDerivativeKind, "inspect_only">,
          maxEdge: typeof args.maxEdge === "number" ? args.maxEdge : undefined,
          quality: typeof args.quality === "number" ? args.quality : undefined,
          note: asString(args.note) || undefined,
          focusX: typeof args.focusX === "number" ? args.focusX : undefined,
          focusY: typeof args.focusY === "number" ? args.focusY : undefined,
        });
        if (!result.ok) return { ok: false, error: result.error };
        return { ok: true, result: result.record };
      }

      case "list_photo_derivatives": {
        const photoId = asString(args.photoId);
        if (!photoId) return { ok: false, error: "photoId required." };
        return { ok: true, result: { photoId, derivatives: listPhotoDerivatives(photoId) } };
      }

      case "batch_apply_photo_evidence": {
        const photoIds = Array.isArray(args.photoIds)
          ? args.photoIds.map((id) => String(id).trim()).filter(Boolean)
          : [];
        const applyFields = Array.isArray(args.applyFields)
          ? args.applyFields.map((f) => String(f).trim()).filter(Boolean)
          : [];
        const patchRaw =
          args.patch && typeof args.patch === "object" && !Array.isArray(args.patch)
            ? (args.patch as Record<string, unknown>)
            : {};
        const { applyPhotoEvidenceBatch, buildBatchPatchFromLoose } = await import(
          "@/lib/campaign-media/batch-photo-evidence"
        );
        const result = applyPhotoEvidenceBatch({
          photoIds,
          applyFields,
          patch: buildBatchPatchFromLoose(patchRaw),
          consentConfirmed: Boolean(args.consentConfirmed),
          refreshAlbums: true,
          rememberMemory: true,
        });
        if (!result.ok) return { ok: false, error: result.message };
        return {
          ok: true,
          result: {
            applied: result.applied,
            skipped: result.skipped,
            appliedIds: result.appliedIds,
            errors: result.errors.slice(0, 12),
            message: result.message,
          },
        };
      }

      case "batch_publish_photo_flags": {
        const photoIds = Array.isArray(args.photoIds)
          ? args.photoIds.map((id) => String(id).trim()).filter(Boolean)
          : [];
        const action = asString(args.action);
        if (!photoIds.length || !action) {
          return { ok: false, error: "photoIds and action required." };
        }
        const { applyPhotoPublishBatch } = await import("@/lib/campaign-media/batch-photo-publish");
        const result = applyPhotoPublishBatch({
          photoIds,
          action,
          consentConfirmed: Boolean(args.consentConfirmed),
          allowUnknownCounty: Boolean(args.allowUnknownCounty),
          refreshAlbums: true,
        });
        if (!result.ok) return { ok: false, error: result.message };
        return {
          ok: true,
          result: {
            action: result.action,
            applied: result.applied,
            skipped: result.skipped,
            skippedConsent: result.skippedConsent,
            skippedUnknownCounty: result.skippedUnknownCounty,
            runId: result.runId,
            appliedIds: result.appliedIds,
            errors: result.errors.slice(0, 12),
            message: result.message,
          },
        };
      }

      case "undo_batch_publish": {
        const runId = asString(args.runId) || undefined;
        const { undoBatchPublishRun, undoLastBatchPublish } = await import(
          "@/lib/campaign-media/batch-photo-publish"
        );
        const result = runId
          ? undoBatchPublishRun(runId, { refreshAlbums: true })
          : undoLastBatchPublish({ refreshAlbums: true });
        if (!result.ok) return { ok: false, error: result.message };
        return { ok: true, result };
      }

      case "list_evidence_batch_ops": {
        const { listEvidenceBatchOperations } = await import("@/lib/campaign-media/evidence-batch-ops");
        const limit = asLimit(args.limit, 20, 40);
        return { ok: true, result: { operations: listEvidenceBatchOperations(limit) } };
      }

      case "get_photo_intake_status": {
        const { getPhotoIntakeStatus } = await import("@/lib/campaign-media/photo-ingest");
        return { ok: true, result: getPhotoIntakeStatus() };
      }

      case "intake_all_photos": {
        if (args.confirm !== true) {
          return { ok: false, error: "confirm:true required — operator must explicitly ask to intake." };
        }
        const { intakeAllNewCampaignPhotos, getPhotoIntakeStatus } = await import(
          "@/lib/campaign-media/photo-ingest"
        );
        const result = intakeAllNewCampaignPhotos();
        if (!result.ok) return { ok: false, error: result.message };
        return { ok: true, result: { ...result, status: getPhotoIntakeStatus() } };
      }

      case "cluster_photo_selection": {
        const photoIds = Array.isArray(args.photoIds)
          ? args.photoIds.map((id) => String(id).trim()).filter(Boolean)
          : [];
        if (!photoIds.length) return { ok: false, error: "photoIds required." };
        const { clusterPhotoSelection } = await import("@/lib/campaign-media/cluster-photo-selection");
        const store = loadPhotoEvidenceStore();
        const inputs = photoIds.slice(0, 80).map((id) => {
          const photo = livePhotos().find((p) => p.id === id);
          const overlay = store.photos[id] ?? null;
          return {
            id,
            src: photo?.src,
            caption: photo?.accessibility.caption,
            county: overlay?.county ?? photo?.campaign.county,
            city: overlay?.city ?? photo?.campaign.city,
            venue: overlay?.venue ?? photo?.campaign.venue,
            eventDate: overlay?.eventDate ?? photo?.campaign.eventDate,
            eventName: overlay?.eventName ?? photo?.campaign.eventName,
            filename: photo?.basic.originalFilename,
          };
        });
        return { ok: true, result: clusterPhotoSelection(inputs) };
      }

      case "batch_create_photo_derivatives": {
        const photoIds = Array.isArray(args.photoIds)
          ? args.photoIds.map((id) => String(id).trim()).filter(Boolean)
          : [];
        const kinds = Array.isArray(args.kinds)
          ? args.kinds.map((k) => String(k).trim()).filter(Boolean)
          : [];
        if (!photoIds.length || !kinds.length) {
          return { ok: false, error: "photoIds and kinds required." };
        }
        const { batchCreatePhotoDerivatives } = await import("@/lib/campaign-media/media-derivatives");
        const result = await batchCreatePhotoDerivatives({
          photoIds,
          kinds,
          note: "ai-tool-batch",
        });
        if (!result.ok) return { ok: false, error: result.message };
        return {
          ok: true,
          result: {
            batchRunId: result.batchRunId,
            createdCount: result.createdCount,
            errorCount: result.errorCount,
            totalOps: result.totalOps,
            errors: result.errors.slice(0, 12),
            message: result.message,
            samples: result.created.slice(0, 6).map((r) => ({
              photoId: r.sourcePhotoId,
              kind: r.kind,
              publicSrc: r.publicSrc,
            })),
          },
        };
      }

      case "promote_photo_derivative": {
        const photoId = asString(args.photoId);
        if (!photoId) return { ok: false, error: "photoId required." };
        const { promotePhotoDerivative } = await import("@/lib/campaign-media/promote-photo-derivative");
        const result = promotePhotoDerivative({
          photoId,
          derivativeId: asString(args.derivativeId) || undefined,
          publicSrc: asString(args.publicSrc) || undefined,
          setAsPublicSrc: args.setAsPublicSrc === undefined ? true : Boolean(args.setAsPublicSrc),
          homepageCandidate:
            args.homepageCandidate === undefined ? undefined : Boolean(args.homepageCandidate),
          featuredPhoto: args.featuredPhoto === undefined ? undefined : Boolean(args.featuredPhoto),
          heroLevel: asString(args.heroLevel) || undefined,
          approvedForPublic:
            args.approvedForPublic === undefined ? undefined : Boolean(args.approvedForPublic),
          consentConfirmed: Boolean(args.consentConfirmed),
        });
        if (!result.ok) return { ok: false, error: result.message };
        return {
          ok: true,
          result: {
            message: result.message,
            publicSrc: result.publicSrc,
            registrySrc: result.registrySrc,
            placementPreview: result.placementPreview,
          },
        };
      }

      case "create_focus_crop": {
        const photoId = asString(args.photoId);
        const kind = asString(args.kind);
        if (!photoId || !kind) return { ok: false, error: "photoId and kind required." };
        if (!kind.startsWith("focus_")) {
          return { ok: false, error: "kind must be focus_hero_16x9 | focus_portrait_4x5 | focus_square_1x1" };
        }
        const result = await createPhotoDerivative({
          photoId,
          kind: kind as Exclude<PhotoDerivativeKind, "inspect_only">,
          focusX: typeof args.focusX === "number" ? args.focusX : undefined,
          focusY: typeof args.focusY === "number" ? args.focusY : undefined,
        });
        if (!result.ok) return { ok: false, error: result.error };
        return { ok: true, result: result.record };
      }

      case "create_derivative_from_crop_advice": {
        const photoId = asString(args.photoId);
        const cropAdvice = asString(args.cropAdvice);
        if (!photoId || !cropAdvice) return { ok: false, error: "photoId and cropAdvice required." };
        const { createDerivativeFromCropAdvice } = await import("@/lib/campaign-media/media-derivatives");
        const result = await createDerivativeFromCropAdvice({
          photoId,
          cropAdvice,
          focusX: typeof args.focusX === "number" ? args.focusX : undefined,
          focusY: typeof args.focusY === "number" ? args.focusY : undefined,
        });
        if (!result.ok) return { ok: false, error: result.error };
        return {
          ok: true,
          result: {
            mappedKind: result.mappedKind,
            reason: result.reason,
            record: result.record,
          },
        };
      }

      case "get_county_album_summary": {
        const county = asString(args.county);
        const reg = resolveRegistryCountyFromLabel(county);
        if (!reg) {
          return { ok: true, result: { found: false, advice: "County not in registry — do not invent." } };
        }
        const album = buildCountyAlbums(livePhotos()).find((a) => a.countySlug === reg.slug);
        if (!album) {
          return {
            ok: true,
            result: {
              found: false,
              countySlug: reg.slug,
              displayName: reg.displayName,
              advice: "No public album chapters yet for this county.",
            },
          };
        }
        return {
          ok: true,
          result: {
            found: true,
            countySlug: album.countySlug,
            displayName: album.countyDisplayName,
            photoCount: album.photoCount,
            eventCount: album.eventCount,
            events: album.events.map((e) => ({
              eventSlug: e.eventSlug,
              eventName: e.eventName,
              city: e.city,
              photoCount: e.photos.length,
            })),
          },
        };
      }

      case "preview_placement_rules": {
        const draft: CampaignPhotoRecord = {
          id: "preview",
          src: "/media/placeholders/texture-porch-glow.svg",
          heroLevel: (asString(args.heroLevel) as CampaignPhotoRecord["heroLevel"]) || "FEATURE",
          publicationStatus:
            (asString(args.publicationStatus) as CampaignPhotoRecord["publicationStatus"]) || "DRAFT",
          basic: { originalFilename: "preview" },
          campaign: {
            eventName: "Unknown",
            county: asString(args.county) || "Unknown",
            city: asString(args.city) || "Unknown",
            venue: "Unknown",
            eventDate: "Unknown",
            photographer: "Unknown",
            peopleVisible: [],
            organizations: [],
            campaignTheme: "Unknown",
            relatedIssue: "Unknown",
            relatedSpeechVideoIds: [],
            relatedBlogPaths: [],
            relatedEventIds: [],
            relatedPagePaths: [],
            homepageCandidate: Boolean(args.homepageCandidate),
            featuredPhoto: Boolean(args.featuredPhoto),
            approvedForPublic:
              args.approvedForPublic === undefined ? undefined : Boolean(args.approvedForPublic),
          },
          accessibility: { altText: "preview", caption: "preview" },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return { ok: true, result: { surfaces: photoPublicSurfacesPreview(draft) } };
      }

      case "get_video_transcript_excerpt": {
        const youtubeVideoId = asString(args.youtubeVideoId);
        const maxChars = asLimit(args.maxChars, 2500, 6000);
        const ws = loadWorkspaceRecord(youtubeVideoId);
        if (!ws?.plainText?.trim()) {
          return {
            ok: true,
            result: {
              found: false,
              youtubeVideoId,
              advice: "No local transcript workspace text — do not invent spoken content or geography.",
            },
          };
        }
        const text = ws.plainText.trim();
        return {
          ok: true,
          result: {
            found: true,
            youtubeVideoId,
            status: ws.status,
            source: ws.source,
            isAutoGenerated: ws.isAutoGenerated,
            excerpt: text.slice(0, maxChars),
            truncated: text.length > maxChars,
            charCount: text.length,
          },
        };
      }

      case "search_campaign_speeches": {
        const query = asString(args.query).toLowerCase();
        const county = asString(args.county).toLowerCase();
        const limit = asLimit(args.limit, 8);
        const hits = CAMPAIGN_MEDIA_REGISTRY.filter((m) => {
          if (county) {
            const counties = (m.counties ?? []).map((c) => c.toLowerCase());
            if (!counties.some((c) => c.includes(county.replace(/\s+county$/, "")))) return false;
          }
          if (!query) return true;
          const hay = `${m.id} ${m.title} ${m.description} ${(m.topics ?? []).join(" ")} ${m.youtubeVideoId}`.toLowerCase();
          return hay.includes(query);
        })
          .slice(0, limit)
          .map((m) => ({
            id: m.id,
            title: m.title,
            youtubeVideoId: m.youtubeVideoId,
            counties: m.counties ?? [],
            topics: m.topics ?? [],
            publicationStatus: m.publicationStatus,
            transcriptStatus: m.transcript?.status ?? null,
          }));
        return { ok: true, result: { count: hits.length, speeches: hits } };
      }

      case "get_speech_registry_record": {
        const speechId = asString(args.speechId);
        const youtubeVideoId = asString(args.youtubeVideoId);
        const m =
          CAMPAIGN_MEDIA_REGISTRY.find((x) => x.id === speechId) ??
          CAMPAIGN_MEDIA_REGISTRY.find((x) => x.youtubeVideoId === youtubeVideoId) ??
          null;
        if (!m) return { ok: true, result: { found: false } };
        return {
          ok: true,
          result: {
            found: true,
            id: m.id,
            title: m.title,
            slug: m.slug,
            youtubeVideoId: m.youtubeVideoId,
            counties: m.counties ?? [],
            topics: m.topics ?? [],
            publicationStatus: m.publicationStatus,
            format: m.format,
            transcriptStatus: m.transcript?.status ?? null,
            summary: m.summary ?? null,
            description: m.description.slice(0, 800),
          },
        };
      }

      case "probe_video_tooling": {
        return { ok: true, result: probeVideoTooling() };
      }

      case "probe_local_video": {
        const result = probeLocalVideo({
          speechId: asString(args.speechId) || undefined,
          youtubeVideoId: asString(args.youtubeVideoId) || undefined,
          localPublicSrc: asString(args.localPublicSrc) || undefined,
          startSeconds: typeof args.startSeconds === "number" ? args.startSeconds : undefined,
          endSeconds: typeof args.endSeconds === "number" ? args.endSeconds : undefined,
        });
        if (!result.ok) return { ok: false, error: result.error ?? "probe failed" };
        return { ok: true, result };
      }

      case "extract_video_poster": {
        const outId = asString(args.outId);
        if (!outId) return { ok: false, error: "outId required." };
        const result = extractLocalVideoPoster({
          outId,
          speechId: asString(args.speechId) || undefined,
          youtubeVideoId: asString(args.youtubeVideoId) || undefined,
          localPublicSrc: asString(args.localPublicSrc) || undefined,
          atSeconds: typeof args.atSeconds === "number" ? args.atSeconds : undefined,
        });
        if (!result.ok) return { ok: false, error: result.error };
        return { ok: true, result: result.record };
      }

      case "encode_video_excerpt": {
        if (args.confirmEncode !== true) {
          return {
            ok: false,
            error: "confirmEncode:true required — operator must explicitly ask to encode.",
          };
        }
        const outId = asString(args.outId);
        if (!outId) return { ok: false, error: "outId required." };
        const aspect =
          args.aspect === "vertical_9x16" ? ("vertical_9x16" as const) : ("source" as const);
        const startSeconds = typeof args.startSeconds === "number" ? args.startSeconds : undefined;
        const endSeconds = typeof args.endSeconds === "number" ? args.endSeconds : undefined;
        if (typeof startSeconds === "number" && typeof endSeconds === "number") {
          const result = encodeVideoExcerptClip({
            outId,
            speechId: asString(args.speechId) || outId,
            youtubeVideoId: asString(args.youtubeVideoId) || undefined,
            planId: asString(args.planId) || undefined,
            clipIndex: typeof args.clipIndex === "number" ? args.clipIndex : 0,
            startSeconds,
            endSeconds,
            localPublicSrc: asString(args.localPublicSrc) || undefined,
            aspect,
          });
          if (!result.ok) return { ok: false, error: result.error };
          return { ok: true, result: result.record };
        }
        const batch = encodeVideoExcerptPlan({
          outId,
          speechId: asString(args.speechId) || outId,
          youtubeVideoId: asString(args.youtubeVideoId) || undefined,
          planId: asString(args.planId) || undefined,
          clipIndexes: typeof args.clipIndex === "number" ? [args.clipIndex] : undefined,
          localPublicSrc: asString(args.localPublicSrc) || undefined,
          aspect,
        });
        if (!batch.ok) return { ok: false, error: batch.message };
        return { ok: true, result: batch };
      }

      case "analyze_transcript_intelligence": {
        const youtubeVideoId = asString(args.youtubeVideoId);
        if (!youtubeVideoId) return { ok: false, error: "youtubeVideoId required." };
        const speechId = asString(args.speechId) || undefined;
        const overlay = speechId
          ? loadSpeechEvidenceStore().speeches[speechId] ?? null
          : null;
        const result = analyzeTranscriptIntelligence({
          youtubeVideoId,
          speechId,
          overlay,
        });
        if (!result.ok) return { ok: false, error: result.error };
        return { ok: true, result: result.proposal };
      }

      case "plan_video_excerpt": {
        const youtubeVideoId = asString(args.youtubeVideoId);
        if (!youtubeVideoId) return { ok: false, error: "youtubeVideoId required." };
        const result = planVideoExcerpt({
          youtubeVideoId,
          query: asString(args.query) || undefined,
          maxClips: typeof args.maxClips === "number" ? args.maxClips : undefined,
        });
        if (!result.ok) return { ok: false, error: result.error };
        return { ok: true, result: result.plan };
      }

      case "prep_video_package": {
        const speechId = asString(args.speechId);
        const youtubeVideoId = asString(args.youtubeVideoId);
        if (!speechId || !youtubeVideoId) {
          return { ok: false, error: "speechId and youtubeVideoId required." };
        }
        const { prepSpeechVideoPackage } = await import("@/lib/campaign-media/video-prep-package");
        const packet = prepSpeechVideoPackage({
          speechId,
          youtubeVideoId,
          query: asString(args.query) || undefined,
          maxClips: typeof args.maxClips === "number" ? args.maxClips : undefined,
          confirmEncode: args.confirmEncode === true,
          confirmPoster: args.confirmPoster === true,
          aspect: args.aspect === "vertical_9x16" ? "vertical_9x16" : "source",
        });
        if (!packet.ok) return { ok: false, error: packet.message };
        return { ok: true, result: packet };
      }

      case "list_video_derivatives": {
        const outId = asString(args.outId);
        if (!outId) return { ok: false, error: "outId required." };
        const { listVideoDerivativesForSpeech } = await import(
          "@/lib/campaign-media/video-prep-package"
        );
        return { ok: true, result: listVideoDerivativesForSpeech(outId) };
      }

      case "apply_transcript_intelligence": {
        if (args.confirm !== true) {
          return { ok: false, error: "confirm:true required — operator must explicitly ask to apply." };
        }
        const speechId = asString(args.speechId);
        const proposalId = asString(args.proposalId);
        if (!speechId || !proposalId) {
          return { ok: false, error: "speechId and proposalId required." };
        }
        const applyFields = Array.isArray(args.applyFields)
          ? args.applyFields.map((f) => String(f).trim()).filter(Boolean)
          : [];
        if (!applyFields.length) return { ok: false, error: "applyFields required." };
        const {
          loadTranscriptIntelStore,
          applyTranscriptIntelToOverlay,
        } = await import("@/lib/campaign-media/transcript-intelligence");
        const proposal =
          loadTranscriptIntelStore().proposals.find((p) => p.id === proposalId) ?? null;
        if (!proposal) return { ok: false, error: "Proposal not found — analyze transcript first." };
        const store = loadSpeechEvidenceStore();
        const prev = store.speeches[speechId] ?? {};
        store.speeches[speechId] = applyTranscriptIntelToOverlay({
          overlay: prev,
          proposal,
          applyFields: applyFields as import("@/lib/campaign-media/transcript-intelligence").TranscriptIntelApplyFields[],
          claimIndex: typeof args.claimIndex === "number" ? args.claimIndex : undefined,
        });
        const { saveSpeechEvidenceStore } = await import("@/lib/campaign-media/evidence-store");
        saveSpeechEvidenceStore(store);
        return {
          ok: true,
          result: { speechId, applied: applyFields, proposalId },
        };
      }

      case "get_website_surface_inventory": {
        const { buildWebsiteSurfaceInventory } = await import(
          "@/lib/campaign-media/website-surface-catalog"
        );
        return { ok: true, result: buildWebsiteSurfaceInventory(livePhotos()) };
      }

      case "score_photo_website_fit": {
        const photoId = asString(args.photoId);
        if (!photoId) return { ok: false, error: "photoId required." };
        const photo = livePhotos().find((p) => p.id === photoId);
        if (!photo) return { ok: false, error: `Unknown photo id: ${photoId}` };
        const { buildWebsiteSurfaceInventory } = await import(
          "@/lib/campaign-media/website-surface-catalog"
        );
        const { scorePhotoWebsiteFit } = await import("@/lib/campaign-media/website-fit-scorer");
        const proposed = {
          county: asString(args.county) || undefined,
          city: asString(args.city) || undefined,
          whatThisProves: asString(args.whatThisProves) || undefined,
          homepageCandidate:
            args.homepageCandidate === undefined ? undefined : Boolean(args.homepageCandidate),
          featuredPhoto: args.featuredPhoto === undefined ? undefined : Boolean(args.featuredPhoto),
          heroLevel: (asString(args.heroLevel) as import("@/lib/campaign-media/evidence-types").PhotoEvidenceOverlay["heroLevel"]) || undefined,
        };
        const inventory = buildWebsiteSurfaceInventory(livePhotos());
        return {
          ok: true,
          result: scorePhotoWebsiteFit({
            photo,
            proposedOverlay: proposed,
            inventory,
          }),
        };
      }

      case "turbo_ingest_photos": {
        if (args.confirm !== true) {
          return { ok: false, error: "confirm:true required — operator must explicitly ask for turbo ingest." };
        }
        const { runTurboIngest } = await import("@/lib/campaign-media/turbo-ingest");
        const photoIds = Array.isArray(args.photoIds)
          ? args.photoIds.map((id) => String(id).trim()).filter(Boolean)
          : undefined;
        const result = await runTurboIngest({
          intakeFirst: args.intakeFirst === true,
          useAi: args.useAi !== false,
          maxPhotos: typeof args.maxPhotos === "number" ? args.maxPhotos : undefined,
          photoIds,
        });
        if (!result.ok) return { ok: false, error: result.message };
        return { ok: true, result };
      }

      case "apply_turbo_proposal": {
        if (args.confirm !== true) {
          return { ok: false, error: "confirm:true required — operator must explicitly ask to apply." };
        }
        const photoId = asString(args.photoId);
        if (!photoId) return { ok: false, error: "photoId required." };
        const { applyTurboProposal } = await import("@/lib/campaign-media/turbo-ingest");
        const result = applyTurboProposal({
          photoId,
          applyIdentify: args.applyIdentify !== false,
          applyFitFlags: args.applyFitFlags === true,
          markApplied: true,
        });
        if (!result.ok) return { ok: false, error: result.message };
        return { ok: true, result };
      }

      case "propose_video_edit_project": {
        const speechId = asString(args.speechId);
        const youtubeVideoId = asString(args.youtubeVideoId);
        if (!speechId || !youtubeVideoId) {
          return { ok: false, error: "speechId and youtubeVideoId required." };
        }
        const { proposeVideoEditProject } = await import("@/lib/campaign-media/video-edit-director");
        const aspects = Array.isArray(args.exportAspects)
          ? args.exportAspects.map((a) => String(a))
          : undefined;
        const packet = proposeVideoEditProject({
          speechId,
          youtubeVideoId,
          planId: asString(args.planId) || undefined,
          maxClips: typeof args.maxClips === "number" ? args.maxClips : undefined,
          transition: args.transition === "crossfade" ? "crossfade" : "none",
          look:
            args.look === "warm" || args.look === "cool" || args.look === "contrast"
              ? args.look
              : "neutral",
          captionMode:
            args.captionMode === "burn_in" || args.captionMode === "none"
              ? args.captionMode
              : "sidecar",
          exportAspects: aspects as
            | Array<"source" | "vertical_9x16" | "square_1x1" | "landscape_16x9">
            | undefined,
          loudnorm: args.loudnorm !== false,
          persist: true,
        });
        if (!packet.ok) return { ok: false, error: packet.message };
        return { ok: true, result: packet };
      }

      case "render_video_edit_project": {
        if (args.confirmRender !== true) {
          return {
            ok: false,
            error: "confirmRender:true required — operator must explicitly ask to render.",
          };
        }
        const projectId = asString(args.projectId);
        if (!projectId) return { ok: false, error: "projectId required." };
        const { renderVideoEditProject } = await import("@/lib/campaign-media/video-pro-render");
        const result = renderVideoEditProject({ projectId });
        if (!result.ok) return { ok: false, error: result.message };
        return { ok: true, result };
      }

      case "list_video_assemblies": {
        const outId = asString(args.outId);
        if (!outId) return { ok: false, error: "outId required." };
        const { listVideoAssemblies, listVideoCaptions, listVideoEditProjects } = await import(
          "@/lib/campaign-media/video-edit-store"
        );
        return {
          ok: true,
          result: {
            assemblies: listVideoAssemblies(outId),
            captions: listVideoCaptions(outId),
            projects: listVideoEditProjects(outId),
          },
        };
      }

      default:
        return { ok: false, error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Tool failed." };
  }
}
