import "server-only";

import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { CAMPAIGN_MEDIA_REGISTRY } from "@/content/media/campaign-media-registry";
import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { buildCountyAlbums } from "@/lib/campaign-media/county-albums";
import { loadEvidenceAiMemory } from "@/lib/campaign-media/evidence-ai-memory";
import { loadCalendarPresenceStore } from "@/lib/campaign-media/evidence-store";
import { applyPhotoEvidenceOverlay } from "@/lib/campaign-media/apply-evidence-overlay";
import { loadPhotoEvidenceStore } from "@/lib/campaign-media/evidence-store";
import { photoPublicSurfacesPreview } from "@/lib/campaign-media/county-albums-live";
import {
  createPhotoDerivative,
  inspectPhotoPixels,
  listPhotoDerivatives,
  planVideoExcerpt,
  probeVideoTooling,
  suggestCropPlan,
  type PhotoDerivativeKind,
} from "@/lib/campaign-media/media-derivatives";
import { resolveRegistryCountyFromLabel } from "@/lib/county/resolve-county-label";
import { loadWorkspaceRecord } from "@/lib/media/youtube-transcripts/workspace-store";

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

      default:
        return { ok: false, error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Tool failed." };
  }
}
