/**
 * Registry graduation clipboard — TS blocks for ready drafts only.
 * Never writes campaign-photo-registry.ts.
 */
import "server-only";

import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import { loadPhotoIngestDrafts } from "@/lib/campaign-media/evidence-store";
import {
  buildGraduationCandidates,
  formatRegistryStubEntry,
  type RegistryGraduationCandidate,
} from "@/lib/campaign-media/evidence-ship-report";

export type GraduationAssistRow = RegistryGraduationCandidate & {
  ready: boolean;
  caption: string;
  inRegistry: false;
};

export type GraduationAssistMatrix = {
  generatedAt: string;
  total: number;
  readyCount: number;
  rows: GraduationAssistRow[];
};

export function buildGraduationAssistMatrix(): GraduationAssistMatrix {
  const live = listCampaignPhotosLive();
  const byId = new Map(live.map((p) => [p.id, p]));
  const draftById = new Map(loadPhotoIngestDrafts().photos.map((p) => [p.id, p]));
  const candidates = buildGraduationCandidates();

  const rows: GraduationAssistRow[] = candidates.map((c) => {
    const photo = byId.get(c.id) ?? draftById.get(c.id);
    const ready = c.county !== "Unknown" && c.hasOverlay && c.binaryExists;
    return {
      ...c,
      ready,
      caption: String(photo?.accessibility?.caption ?? c.id).slice(0, 120),
      inRegistry: false,
    };
  });

  rows.sort((a, b) => Number(b.ready) - Number(a.ready) || a.id.localeCompare(b.id));

  return {
    generatedAt: new Date().toISOString(),
    total: rows.length,
    readyCount: rows.filter((r) => r.ready).length,
    rows,
  };
}

/** Clipboard-ready TS object blocks for selected (or all ready) candidates. */
export function formatReadyGraduationClipboardBlocks(input?: {
  ids?: string[];
  onlyReady?: boolean;
}): { ok: boolean; message: string; tsBlocks: string; count: number } {
  const matrix = buildGraduationAssistMatrix();
  const filterIds = input?.ids?.map((id) => String(id).trim()).filter(Boolean);
  const onlyReady = input?.onlyReady !== false;

  let pool = matrix.rows;
  if (filterIds?.length) pool = pool.filter((r) => filterIds.includes(r.id));
  else if (onlyReady) pool = pool.filter((r) => r.ready);

  const live = listCampaignPhotosLive();
  const byId = new Map(live.map((p) => [p.id, p]));
  const draftById = new Map(loadPhotoIngestDrafts().photos.map((p) => [p.id, p]));

  const blocks: string[] = [
    "// Paste into CAMPAIGN_PHOTO_REGISTRY after Steve review — Prefer Unknown stays Unknown.",
    "// Never auto-applied by Evidence Workbench.",
    "",
  ];

  let count = 0;
  for (const row of pool) {
    const photo = byId.get(row.id) ?? draftById.get(row.id);
    if (!photo) continue;
    blocks.push(`// ${row.reason}`);
    blocks.push(formatRegistryStubEntry(photo));
    blocks.push("");
    count += 1;
  }

  if (!count) {
    return {
      ok: false,
      message: "No ready graduation entries to copy.",
      tsBlocks: "",
      count: 0,
    };
  }

  return {
    ok: true,
    message: `Copied ${count} registry TS block(s) — paste manually into campaign-photo-registry.ts after review.`,
    tsBlocks: blocks.join("\n"),
    count,
  };
}
