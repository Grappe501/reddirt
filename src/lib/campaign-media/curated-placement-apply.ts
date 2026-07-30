/**
 * Apply / undo curated homepage placement (confirmCurate gated at action layer).
 * Rewrites src/content/media/homepage-campaign-photos.ts with undo snapshot.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  getCuratedPlacementProposal,
  getCuratedUndoSnapshot,
  pushCuratedUndoSnapshot,
  upsertCuratedPlacementProposal,
} from "@/lib/campaign-media/curated-placement-store";
import { getCurrentCuratedPlacementSnapshot } from "@/lib/campaign-media/curated-placement-propose";
import {
  CURATED_PLACEMENT_STUB_REL,
  HOMEPAGE_CURATION_FILE_REL,
  type CuratedPlacementProposal,
} from "@/lib/campaign-media/curated-placement-types";

function abs(rel: string): string {
  return path.join(process.cwd(), rel);
}

function formatStringArray(ids: string[], indent = "  "): string {
  if (!ids.length) return `${indent}// (empty)\n`;
  return ids.map((id) => `${indent}"${id}",`).join("\n") + "\n";
}

function renderHomepageCurationFile(input: {
  homepageIds: string[];
  acrossIds: string[];
  meetKellyId: string | null;
  heroId: string | null;
  priorSource: string;
}): string {
  // Preserve everything after the curated constants by splicing the header block.
  const marker = "const HOMEPAGE_GALLERY_MAX";
  const idx = input.priorSource.indexOf(marker);
  const tail = idx >= 0 ? input.priorSource.slice(idx) : null;

  const header = `/**
 * File-backed homepage campaign photo curation (Slice 2).
 * Curated IDs stay first; Evidence Workbench homepage candidates append after Save.
 * Uses live disk overlays on the server (not stale webpack JSON).
 *
 * Last curated via Evidence Placement Propose — review diffs before deploy.
 */

import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import {
  listEvidenceAcrossArkansasPhotosFrom,
  listEvidenceHomepageCandidatesFrom,
} from "@/content/media/strategic-photo-placements";
import {
  getCampaignPhotoByIdLive,
  listCampaignPhotosLive,
} from "@/lib/campaign-media/list-campaign-photos-live";

/** Ordered curated set for Latest Campaign Photos (6–10 FEATURE stills). */
export const HOMEPAGE_CAMPAIGN_PHOTO_IDS = [
${formatStringArray(input.homepageIds)}] as const;

/**
 * Stills paired with the Kelly Across Arkansas momentum video.
 * Prefer confirmed geography; include labor trail still with Unknown geo only when labeled honestly.
 */
export const HOMEPAGE_ACROSS_ARKANSAS_PHOTO_IDS = [
${formatStringArray(input.acrossIds)}] as const;

export type HomepageCampaignPhotoId = (typeof HOMEPAGE_CAMPAIGN_PHOTO_IDS)[number];

/** Meet Kelly preview still. */
export const HOMEPAGE_MEET_KELLY_PHOTO_ID: HomepageCampaignPhotoId = "${
    input.meetKellyId && input.homepageIds.includes(input.meetKellyId)
      ? input.meetKellyId
      : input.homepageIds[0] ?? "mena-polk-meet-greet-20260411"
  }";

/** Hero still — null until a Gold known-county still is human-selected with allowHero. */
export const HOMEPAGE_HERO_PHOTO_ID: HomepageCampaignPhotoId | null = ${
    input.heroId && input.homepageIds.includes(input.heroId) ? `"${input.heroId}"` : "null"
  };

`;

  if (tail) return `${header}${tail}`;

  // Fallback: should not happen — refuse rather than wipe helpers
  throw new Error("homepage-campaign-photos.ts missing HOMEPAGE_GALLERY_MAX marker — refuse rewrite.");
}

export function writeCuratedPlacementStub(proposal: CuratedPlacementProposal): {
  ok: boolean;
  message: string;
  relativePath: string;
} {
  const lines: string[] = [
    "# Curated placement stub",
    "",
    "**Do not auto-apply.** Review, then Apply with confirmCurate on the Placement tab, or paste into `homepage-campaign-photos.ts`.",
    "",
    `Proposal: ${proposal.id}`,
    `Generated: ${proposal.updatedAt}`,
    `allowHero: ${proposal.allowHero}`,
    "",
  ];
  for (const d of proposal.diffs) {
    lines.push(`## ${d.surface}`);
    lines.push("");
    lines.push(d.rationale);
    lines.push("");
    lines.push(`- Added: ${d.added.join(", ") || "—"}`);
    lines.push(`- Removed: ${d.removed.join(", ") || "—"}`);
    lines.push(`- Reordered: ${d.reordered ? "yes" : "no"}`);
    lines.push("");
    lines.push("Current:");
    lines.push("```");
    lines.push(d.current.join("\n") || "(none)");
    lines.push("```");
    lines.push("");
    lines.push("Proposed:");
    lines.push("```");
    lines.push(d.proposed.join("\n") || "(none)");
    lines.push("```");
    lines.push("");
  }
  if (proposal.warnings.length) {
    lines.push("## Warnings");
    lines.push("");
    for (const w of proposal.warnings) lines.push(`- ${w}`);
    lines.push("");
  }

  const target = abs(CURATED_PLACEMENT_STUB_REL);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${lines.join("\n")}\n`, "utf8");
  return {
    ok: true,
    message: `Wrote placement stub → ${CURATED_PLACEMENT_STUB_REL}`,
    relativePath: CURATED_PLACEMENT_STUB_REL,
  };
}

export function applyCuratedPlacementProposal(input: {
  proposalId: string;
  confirmCurate: boolean;
}): {
  ok: boolean;
  message: string;
  undoSnapshotId?: string;
  warnings?: string[];
} {
  if (!input.confirmCurate) {
    return { ok: false, message: "confirmCurate:true required — refuse silent HOMEPAGE_* mutate." };
  }
  const proposal = getCuratedPlacementProposal(input.proposalId);
  if (!proposal) return { ok: false, message: `Proposal not found: ${input.proposalId}` };
  if (proposal.status === "applied") {
    return { ok: false, message: "Proposal already applied — propose a new diff or undo." };
  }

  const homepage = proposal.diffs.find((d) => d.surface === "homepageGallery")?.proposed ?? [];
  const across = proposal.diffs.find((d) => d.surface === "acrossArkansas")?.proposed ?? [];
  let meetKellyId = proposal.meetKellyId;
  let heroId = proposal.allowHero ? proposal.heroId : null;

  if (!homepage.length) return { ok: false, message: "Proposal has empty homepage gallery." };
  if (meetKellyId && !homepage.includes(meetKellyId)) {
    meetKellyId = homepage[0];
  }
  if (heroId && !homepage.includes(heroId)) {
    return { ok: false, message: "Hero id must be included in homepage gallery list." };
  }
  if (heroId && !proposal.allowHero) {
    heroId = null;
  }

  const fileAbs = abs(HOMEPAGE_CURATION_FILE_REL);
  if (!existsSync(fileAbs)) {
    return { ok: false, message: `${HOMEPAGE_CURATION_FILE_REL} missing.` };
  }
  const priorSource = readFileSync(fileAbs, "utf8");
  const current = getCurrentCuratedPlacementSnapshot();

  const snapId = `cundo-${Date.now().toString(36)}`;
  const backupRel = `data/campaign-media/homepage-curation-backups/${snapId}.ts.bak`;
  const backupAbs = abs(backupRel);
  mkdirSync(path.dirname(backupAbs), { recursive: true });
  writeFileSync(backupAbs, priorSource, "utf8");

  pushCuratedUndoSnapshot({
    id: snapId,
    createdAt: new Date().toISOString(),
    proposalId: proposal.id,
    homepageIds: current.homepageIds,
    acrossIds: current.acrossIds,
    meetKellyId: current.meetKellyId,
    heroId: current.heroId,
    fileBackupRel: backupRel,
  });

  try {
    const next = renderHomepageCurationFile({
      homepageIds: homepage,
      acrossIds: across,
      meetKellyId,
      heroId,
      priorSource,
    });
    writeFileSync(fileAbs, next.endsWith("\n") ? next : `${next}\n`, "utf8");
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Rewrite failed.",
    };
  }

  proposal.status = "applied";
  proposal.appliedAt = new Date().toISOString();
  proposal.undoSnapshotId = snapId;
  proposal.updatedAt = new Date().toISOString();
  upsertCuratedPlacementProposal(proposal);
  writeCuratedPlacementStub(proposal);

  return {
    ok: true,
    message: `Applied curated placement ${proposal.id} → ${HOMEPAGE_CURATION_FILE_REL} (undo ${snapId}).`,
    undoSnapshotId: snapId,
    warnings: proposal.warnings,
  };
}

export function undoCuratedPlacement(input: {
  undoSnapshotId: string;
  confirmCurate: boolean;
}): { ok: boolean; message: string } {
  if (!input.confirmCurate) {
    return { ok: false, message: "confirmCurate:true required — refuse silent undo." };
  }
  const snap = getCuratedUndoSnapshot(input.undoSnapshotId);
  if (!snap) return { ok: false, message: `Undo snapshot not found: ${input.undoSnapshotId}` };
  const backupAbs = abs(snap.fileBackupRel);
  if (!existsSync(backupAbs)) {
    return { ok: false, message: `Backup missing: ${snap.fileBackupRel}` };
  }
  const fileAbs = abs(HOMEPAGE_CURATION_FILE_REL);
  writeFileSync(fileAbs, readFileSync(backupAbs, "utf8"), "utf8");
  return {
    ok: true,
    message: `Restored ${HOMEPAGE_CURATION_FILE_REL} from ${snap.fileBackupRel}.`,
  };
}
