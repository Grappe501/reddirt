/**
 * Propose multi-clip event reel from calendar pack + confirmed stills.
 * Prefer Unknown: skip Unknown-county stills. Never encodes / never Approves.
 */
import "server-only";

import { proposeEventNightPack } from "@/lib/campaign-media/evidence-event-night-pack";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import { upsertEventReelProject } from "@/lib/campaign-media/event-reel-store";
import type {
  EventReelProject,
  EventReelProposeResult,
  EventReelStill,
} from "@/lib/campaign-media/event-reel-types";

function isUnknownCounty(county: string | undefined | null): boolean {
  const c = String(county ?? "").trim();
  return !c || c === "Unknown";
}

export function proposeEventReelFromCalendar(input: {
  calendarRowId: string;
  photoLimit?: number;
  stillDurationSec?: number;
  persist?: boolean;
}): EventReelProposeResult {
  const packResult = proposeEventNightPack({
    calendarRowId: input.calendarRowId,
    photoLimit: input.photoLimit ?? 10,
    speechLimit: 6,
  });
  if ("ok" in packResult && packResult.ok === false) {
    return { ok: false, message: packResult.error, project: null, warnings: [], nextActions: [] };
  }
  const pack = packResult as import("@/lib/campaign-media/evidence-event-night-pack").EventNightPack;

  const warnings = [...pack.warnings];
  const liveById = new Map(listCampaignPhotosLive().map((p) => [p.id, p]));
  const duration = Math.min(Math.max(input.stillDurationSec ?? 3, 1.5), 8);

  const stills: EventReelStill[] = [];
  for (const row of pack.photos) {
    if (isUnknownCounty(row.county)) {
      warnings.push(`Skipped ${row.id} — Unknown county (Prefer Unknown).`);
      continue;
    }
    const photo = liveById.get(row.id);
    if (!photo?.src) {
      warnings.push(`Skipped ${row.id} — no live src.`);
      continue;
    }
    stills.push({
      photoId: row.id,
      publicSrc: photo.src,
      durationSec: duration,
      county: row.county,
      city: row.city,
      score: row.score,
      title: row.eventName || row.id,
    });
  }

  if (!stills.length) {
    return {
      ok: false,
      message:
        "No confirmed-county stills in pack for a reel. Label/Approve geo first, or pick a stronger Confirmed calendar row.",
      project: null,
      warnings,
      nextActions: [
        "Open Photos → label Unknown counties from the pack.",
        "Approve geo-confirmed stills, then re-propose event reel.",
      ],
    };
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const project: EventReelProject = {
    id: `event-reel-${pack.calendarRowId.slice(0, 24)}-${stamp}`,
    calendarRowId: pack.calendarRowId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: `Event reel · ${pack.date} · ${pack.summary.slice(0, 48)}`,
    date: pack.date,
    summary: pack.summary,
    stills,
    speechIds: pack.speeches.map((s) => s.id).slice(0, 4),
    stillDurationSec: duration,
    exportAspects: ["landscape_16x9", "vertical_9x16"],
    notes:
      "Tier 3 event reel proposal from calendar pack. Stills only in this encode path; speech ids are references. Confirm render required.",
    status: "proposed",
  };

  if (input.persist !== false) {
    upsertEventReelProject(project);
  }

  return {
    ok: true,
    message: `Proposed event reel · ${stills.length} still(s) · 16:9 + 9:16 · Confirm render still required.`,
    project,
    warnings,
    nextActions: [
      "Review still order on Queue / Calendar Tonight ritual.",
      "Confirm render event reel (ffmpeg stills slideshow).",
      "Optional: open Speeches Pro Edit for quote cuts tied to pack speech ids.",
    ],
  };
}
