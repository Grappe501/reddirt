/**
 * Evidence Ship Checklist — local confirm ≠ production ship.
 * Lists dirty/uncommitted evidence paths + checklist gates. Never auto-commits.
 * Never rewrites campaign-photo-registry.ts (graduation stub only).
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { isAlbumEligible } from "@/lib/campaign-media/county-albums";
import {
  loadPhotoEvidenceStore,
  loadPhotoIngestDrafts,
  writeJsonAtomic,
} from "@/lib/campaign-media/evidence-store";
import { buildEvidencePublishQueue } from "@/lib/campaign-media/evidence-publish-queue";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import { COUNTY_ALBUM_INDEX_REL } from "@/lib/campaign-media/refresh-county-albums";

export const EVIDENCE_SHIP_REPORTS_REL = "data/campaign-media/evidence-ship-reports.json";
export const REGISTRY_GRADUATION_STUB_REL = "data/campaign-media/registry-graduation-stub.md";

export type ShipPathKind =
  | "overlay_json"
  | "album_index"
  | "photo_binary"
  | "derivative_gitignored"
  | "other";

export type ShipDirtyPath = {
  path: string;
  status: string;
  kind: ShipPathKind;
  bytes: number | null;
  note?: string;
};

export type ShipChecklistItem = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type RegistryGraduationCandidate = {
  id: string;
  src: string;
  county: string;
  city: string;
  binaryExists: boolean;
  albumEligible: boolean;
  hasOverlay: boolean;
  reason: string;
};

export type EvidenceShipReport = {
  id: string;
  generatedAt: string;
  branch: string | null;
  gitOk: boolean;
  gitNote: string;
  dirtyPaths: ShipDirtyPath[];
  totals: {
    dirtyCount: number;
    overlayJsonDirty: number;
    photoBinaryDirty: number;
    derivativeLocalOnly: number;
    dirtyBytes: number;
  };
  checklist: ShipChecklistItem[];
  checklistReady: boolean;
  commitMessageTemplate: string;
  graduationCandidates: RegistryGraduationCandidate[];
  warnings: string[];
  nextActions: string[];
};

export type EvidenceShipReportsStore = {
  version: 1;
  updatedAt: string;
  purpose: string;
  reports: EvidenceShipReport[];
};

const WATCH_PATHS = [
  "data/campaign-media",
  "public/media/campaign-photos",
  "public/media/campaign-derivatives",
] as const;

function abs(rel: string): string {
  return path.join(process.cwd(), rel);
}

function fileBytes(rel: string): number | null {
  try {
    return statSync(abs(rel)).size;
  } catch {
    return null;
  }
}

function classifyPath(rel: string): ShipPathKind {
  const n = rel.replace(/\\/g, "/");
  if (n.includes("county-album-index.json")) return "album_index";
  if (n.startsWith("data/campaign-media/") && n.endsWith(".json")) return "overlay_json";
  if (n.startsWith("public/media/campaign-photos/")) return "photo_binary";
  if (n.startsWith("public/media/campaign-derivatives/")) return "derivative_gitignored";
  return "other";
}

function resolveGitBin(): string {
  const candidates = [
    process.env.GIT_BIN,
    "git",
    path.join("C:", "Program Files", "Git", "cmd", "git.exe"),
    path.join("C:", "Program Files", "Git", "bin", "git.exe"),
    path.join("C:", "Program Files (x86)", "Git", "cmd", "git.exe"),
  ].filter((v): v is string => Boolean(v));

  for (const bin of candidates) {
    const probe = spawnSync(bin, ["--version"], {
      cwd: process.cwd(),
      encoding: "utf8",
      windowsHide: true,
    });
    if ((probe.status ?? 1) === 0) return bin;
  }
  return candidates[0] ?? "git";
}

let cachedGitBin: string | null = null;

function runGit(args: string[]): { ok: boolean; out: string; err: string } {
  if (!cachedGitBin) cachedGitBin = resolveGitBin();
  const r = spawnSync(cachedGitBin, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    windowsHide: true,
  });
  return {
    ok: (r.status ?? 1) === 0,
    // Keep leading spaces — porcelain XY codes are column-aligned.
    out: String(r.stdout ?? "").replace(/\s+$/u, ""),
    err: String(r.stderr ?? (r.error ? String(r.error) : "")).trim(),
  };
}

/** When git is unavailable, still surface overlay JSON files for operator review. */
function listOverlayJsonFallback(): ShipDirtyPath[] {
  const dir = abs("data/campaign-media");
  if (!existsSync(dir)) return [];
  let names: string[] = [];
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  const out: ShipDirtyPath[] = [];
  for (const name of names) {
    if (!name.endsWith(".json") && !name.endsWith(".md")) continue;
    const rel = `data/campaign-media/${name}`;
    out.push({
      path: rel,
      status: "??",
      kind: name.includes("county-album-index") ? "album_index" : "overlay_json",
      bytes: fileBytes(rel),
      note: "Git unavailable — listed from disk for review (not a true dirty detection).",
    });
  }
  return out;
}

function parsePorcelain(line: string): { status: string; path: string } | null {
  if (!line || line.length < 4) return null;
  const xy = line.slice(0, 2);
  const status = xy.trim() || xy;
  let filePath = line.slice(3).trim();
  if (filePath.includes(" -> ")) {
    filePath = filePath.split(" -> ").pop()!.trim();
  }
  if (filePath.startsWith('"') && filePath.endsWith('"')) {
    filePath = filePath.slice(1, -1).replace(/\\"/g, '"');
  }
  if (!filePath) return null;
  return { status, path: filePath.replace(/\\/g, "/") };
}

function listDerivativeLocalOnly(max = 40): ShipDirtyPath[] {
  const root = abs("public/media/campaign-derivatives");
  if (!existsSync(root)) return [];
  const out: ShipDirtyPath[] = [];
  const walk = (dir: string) => {
    if (out.length >= max) return;
    let entries: string[] = [];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of entries) {
      if (out.length >= max) return;
      if (name === ".gitkeep") continue;
      const full = path.join(dir, name);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        walk(full);
        continue;
      }
      const rel = path.relative(process.cwd(), full).split(path.sep).join("/");
      out.push({
        path: rel,
        status: "!!",
        kind: "derivative_gitignored",
        bytes: st.size,
        note: "Gitignored — will NOT ship via git commit/push.",
      });
    }
  };
  walk(root);
  return out;
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

export function buildGraduationCandidates(): RegistryGraduationCandidate[] {
  const registryIds = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.id));
  const drafts = loadPhotoIngestDrafts().photos;
  const store = loadPhotoEvidenceStore();
  const live = listCampaignPhotosLive(store);
  const liveById = new Map(live.map((p) => [p.id, p]));
  const candidates: RegistryGraduationCandidate[] = [];

  for (const d of drafts) {
    if (registryIds.has(d.id)) continue;
    const livePhoto = liveById.get(d.id) ?? d;
    const county = livePhoto.campaign.county || "Unknown";
    const unknown = !county || county === "Unknown";
    const hasOverlay = Boolean(store.photos[d.id]);
    const binaryExists = Boolean(decodePublicSrcToAbs(livePhoto.src));
    const albumEligible = isAlbumEligible(livePhoto);
    if (!hasOverlay && unknown) continue;
    const reasons: string[] = [];
    if (unknown) reasons.push("county Unknown");
    if (!hasOverlay) reasons.push("no overlay saved");
    if (!binaryExists) reasons.push("binary missing");
    if (!albumEligible && !unknown) reasons.push("not album-eligible yet");
    const ready = !unknown && hasOverlay && binaryExists;
    candidates.push({
      id: d.id,
      src: livePhoto.src,
      county,
      city: livePhoto.campaign.city || "Unknown",
      binaryExists,
      albumEligible,
      hasOverlay,
      reason: ready
        ? albumEligible
          ? "Ready for registry stub (geo + overlay + binary)."
          : "Geo+overlay+binary — Approve/FEATURE before treating as public proof."
        : `Blocked: ${reasons.join(", ")}`,
    });
  }

  return candidates
    .sort((a, b) => {
      const score = (c: RegistryGraduationCandidate) =>
        (c.county !== "Unknown" ? 4 : 0) +
        (c.hasOverlay ? 2 : 0) +
        (c.binaryExists ? 1 : 0) +
        (c.albumEligible ? 2 : 0);
      return score(b) - score(a);
    })
    .slice(0, 40);
}

function formatRegistryStubEntry(photo: CampaignPhotoRecord): string {
  const j = (v: unknown) => JSON.stringify(v);
  return [
    "  {",
    `    id: ${j(photo.id)},`,
    `    src: ${j(photo.src)},`,
    `    heroLevel: ${j(photo.heroLevel)},`,
    `    publicationStatus: ${j(photo.publicationStatus)},`,
    "    basic: {",
    `      originalFilename: ${j(photo.basic.originalFilename)},`,
    `      orientation: ${j(photo.basic.orientation ?? "Unknown")},`,
    `      fileType: ${j(photo.basic.fileType ?? "Unknown")},`,
    `      captureDateIso: ${j(photo.basic.captureDateIso ?? "Unknown")},`,
    `      cameraDevice: ${j(photo.basic.cameraDevice ?? "Unknown")},`,
    "    },",
    "    campaign: {",
    `      eventName: ${j(photo.campaign.eventName)},`,
    `      county: ${j(photo.campaign.county)},`,
    `      city: ${j(photo.campaign.city)},`,
    `      venue: ${j(photo.campaign.venue)},`,
    `      eventDate: ${j(photo.campaign.eventDate)},`,
    `      photographer: ${j(photo.campaign.photographer)},`,
    `      peopleVisible: ${j(photo.campaign.peopleVisible ?? [])},`,
    `      organizations: ${j(photo.campaign.organizations ?? [])},`,
    `      campaignTheme: ${j(photo.campaign.campaignTheme)},`,
    `      relatedIssue: ${j(photo.campaign.relatedIssue)},`,
    "      relatedSpeechVideoIds: [],",
    "      relatedBlogPaths: [],",
    "      relatedEventIds: [],",
    "      relatedPagePaths: [],",
    `      homepageCandidate: ${j(Boolean(photo.campaign.homepageCandidate))},`,
    `      featuredPhoto: ${j(Boolean(photo.campaign.featuredPhoto))},`,
    `      approvedForPublic: ${j(Boolean(photo.campaign.approvedForPublic))},`,
    "    },",
    "    accessibility: {",
    `      altText: ${j(photo.accessibility.altText)},`,
    `      caption: ${j(photo.accessibility.caption)},`,
    "    },",
    `    notes: ${j(photo.notes ?? "Graduated from ingest draft — review before public.")},`,
    "  },",
  ].join("\n");
}

export function writeRegistryGraduationStub(input?: {
  onlyReady?: boolean;
}): {
  ok: boolean;
  message: string;
  relativePath: string;
  candidateCount: number;
} {
  const onlyReady = input?.onlyReady !== false;
  const candidates = buildGraduationCandidates().filter((c) =>
    onlyReady ? c.county !== "Unknown" && c.hasOverlay && c.binaryExists : true,
  );
  const live = listCampaignPhotosLive();
  const byId = new Map(live.map((p) => [p.id, p]));
  const draftById = new Map(loadPhotoIngestDrafts().photos.map((p) => [p.id, p]));

  const blocks: string[] = [
    "# Registry graduation stub",
    "",
    "**Do not auto-apply.** Copy reviewed entries into `src/content/media/campaign-photo-registry.ts` after Steve confirms.",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Candidates: ${candidates.length}`,
    "",
    "```ts",
    "// Paste inside CAMPAIGN_PHOTO_REGISTRY array (after review)",
  ];

  for (const c of candidates) {
    const photo = byId.get(c.id) ?? draftById.get(c.id);
    if (!photo) continue;
    blocks.push(`// ${c.reason}`);
    blocks.push(formatRegistryStubEntry(photo));
    blocks.push("");
  }
  blocks.push("```", "");

  const target = abs(REGISTRY_GRADUATION_STUB_REL);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${blocks.join("\n")}\n`, "utf8");

  return {
    ok: true,
    message: `Wrote ${candidates.length} graduation stub entr(y/ies) → ${REGISTRY_GRADUATION_STUB_REL}`,
    relativePath: REGISTRY_GRADUATION_STUB_REL,
    candidateCount: candidates.length,
  };
}

function emptyShipStore(): EvidenceShipReportsStore {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose:
      "Evidence Ship reports — dirty path inventory + checklist. Never auto-commits; never rewrites registry.",
    reports: [],
  };
}

export function loadEvidenceShipReports(): EvidenceShipReportsStore {
  const p = abs(EVIDENCE_SHIP_REPORTS_REL);
  if (!existsSync(p)) return emptyShipStore();
  try {
    const raw = JSON.parse(readFileSync(p, "utf8")) as Partial<EvidenceShipReportsStore>;
    return {
      ...emptyShipStore(),
      ...raw,
      version: 1,
      reports: Array.isArray(raw.reports) ? raw.reports : [],
    };
  } catch {
    return emptyShipStore();
  }
}

function persistShipReport(report: EvidenceShipReport): void {
  const store = loadEvidenceShipReports();
  store.reports = [report, ...store.reports].slice(0, 40);
  writeJsonAtomic(EVIDENCE_SHIP_REPORTS_REL, {
    ...store,
    version: 1,
    updatedAt: new Date().toISOString(),
  });
}

export function getLatestEvidenceShipReport(): EvidenceShipReport | null {
  return loadEvidenceShipReports().reports[0] ?? null;
}

export function buildEvidenceShipReport(input?: {
  persist?: boolean;
  includeDerivativeScan?: boolean;
}): EvidenceShipReport {
  const queue = buildEvidencePublishQueue();
  const store = loadPhotoEvidenceStore();
  const overlaysSaved = Object.keys(store.photos).length;
  const albumAbs = abs(COUNTY_ALBUM_INDEX_REL);
  const albumExists = existsSync(albumAbs);
  let albumAgeHours: number | null = null;
  if (albumExists) {
    try {
      albumAgeHours = (Date.now() - statSync(albumAbs).mtimeMs) / 3600000;
    } catch {
      albumAgeHours = null;
    }
  }

  const branchRes = runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
  const statusRes = runGit(["status", "--porcelain", "-uall", "--", ...WATCH_PATHS]);
  const dirtyPaths: ShipDirtyPath[] = [];
  const warnings: string[] = [];

  if (!statusRes.ok && !statusRes.out) {
    warnings.push(statusRes.err || "git status failed — is this a git repo?");
    for (const d of listOverlayJsonFallback()) dirtyPaths.push(d);
  }

  for (const line of statusRes.out.split(/\r?\n/)) {
    const parsed = parsePorcelain(line);
    if (!parsed) continue;
    const kind = classifyPath(parsed.path);
    dirtyPaths.push({
      path: parsed.path,
      status: parsed.status,
      kind,
      bytes: fileBytes(parsed.path),
      note:
        kind === "derivative_gitignored"
          ? "Tracked unexpectedly — derivatives are usually gitignored."
          : undefined,
    });
  }

  if (input?.includeDerivativeScan !== false) {
    const localDerivs = listDerivativeLocalOnly(30);
    const seen = new Set(dirtyPaths.map((d) => d.path));
    for (const d of localDerivs) {
      if (seen.has(d.path)) continue;
      dirtyPaths.push(d);
    }
    if (localDerivs.length) {
      warnings.push(
        `${localDerivs.length}+ derivative file(s) are gitignored — overlay JSON ships via git; derivative binaries need a deploy path that includes this machine's public/media or a rebuild.`,
      );
    }
  }

  const dirtyBytes = dirtyPaths.reduce((sum, d) => sum + (d.bytes ?? 0), 0);
  const overlayJsonDirty = dirtyPaths.filter(
    (d) => d.kind === "overlay_json" || d.kind === "album_index",
  ).length;
  const photoBinaryDirty = dirtyPaths.filter((d) => d.kind === "photo_binary").length;
  const derivativeLocalOnly = dirtyPaths.filter((d) => d.kind === "derivative_gitignored").length;

  const drafts = loadPhotoIngestDrafts().photos;
  const registryIds = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.id));
  let draftsMissingBinary = 0;
  for (const d of drafts) {
    if (registryIds.has(d.id)) continue;
    if (!decodePublicSrcToAbs(d.src)) draftsMissingBinary += 1;
  }

  const graduationCandidates = buildGraduationCandidates();
  const readyGrad = graduationCandidates.filter(
    (c) => c.county !== "Unknown" && c.hasOverlay && c.binaryExists,
  );

  const checklist: ShipChecklistItem[] = [
    {
      id: "overlays",
      label: "Overlays saved locally",
      ok: overlaysSaved > 0 || queue.totals.approvedPublic > 0,
      detail:
        overlaysSaved > 0
          ? `${overlaysSaved} photo overlay key(s) in photo-evidence.json`
          : "No overlays yet — Save on Photos before shipping proof.",
    },
    {
      id: "albums",
      label: "County album index present",
      ok: albumExists,
      detail: albumExists
        ? `county-album-index.json present${
            albumAgeHours != null ? ` · ~${albumAgeHours.toFixed(1)}h since mtime` : ""
          }`
        : "Missing — run Batch Approve / refresh albums before expecting public albums.",
    },
    {
      id: "unknown_backlog",
      label: "Unknown backlog acknowledged",
      ok: true,
      detail: `${queue.totals.unknownCounty} Unknown-county still(s) — they must not inflate shipped proof.`,
    },
    {
      id: "needs_approval",
      label: "Needs-approval queue",
      ok: queue.totals.needsApproval === 0,
      detail:
        queue.totals.needsApproval === 0
          ? "No geo-confirmed stills waiting on Approve."
          : `${queue.totals.needsApproval} still(s) have geo but are not album-eligible — Approve or Hold before claiming shipped.`,
    },
    {
      id: "binaries",
      label: "Draft binaries on disk",
      ok: draftsMissingBinary === 0,
      detail:
        draftsMissingBinary === 0
          ? "Ingest draft src files resolve on disk."
          : `${draftsMissingBinary} draft(s) missing public/media binary.`,
    },
    {
      id: "git_overlays",
      label: "Overlay JSON commit state",
      ok: true,
      detail:
        overlayJsonDirty > 0
          ? `${overlayJsonDirty} dirty data/campaign-media path(s) — commit these to ship overlays to Netlify.`
          : "No dirty overlay JSON in watch paths (already committed or unchanged).",
    },
    {
      id: "derivatives_warning",
      label: "Derivative ship path understood",
      ok: true,
      detail:
        derivativeLocalOnly > 0
          ? `${derivativeLocalOnly} local derivative file(s) gitignored — not shipped by git alone.`
          : "No local derivative scan hits (or scan empty).",
    },
  ];

  const checklistReady = checklist
    .filter((c) => c.id === "overlays" || c.id === "albums" || c.id === "binaries")
    .every((c) => c.ok);

  const commitMessageTemplate = [
    "Ship Evidence overlays: update campaign-media JSON for confirmed photo proof.",
    "",
    `Unknown backlog: ${queue.totals.unknownCounty} · needs approval: ${queue.totals.needsApproval} · on albums: ${queue.totals.approvedPublic}`,
    overlayJsonDirty ? `Dirty overlay paths: ${overlayJsonDirty}` : "Overlay watch paths clean.",
  ].join("\n");

  const nextActions: string[] = [];
  if (overlayJsonDirty > 0) {
    nextActions.push("git add data/campaign-media/ (no secrets) → commit → push → Netlify deploy.");
  }
  if (queue.totals.needsApproval > 0) {
    nextActions.push("Clear needs-approval on Publish Queue before claiming production proof.");
  }
  if (readyGrad.length) {
    nextActions.push(
      `Generate registry graduation stub for ${readyGrad.length} draft(s) — paste into campaign-photo-registry.ts after review.`,
    );
  }
  if (photoBinaryDirty > 0) {
    nextActions.push(`Commit ${photoBinaryDirty} new/changed campaign-photos binary path(s).`);
  }
  if (derivativeLocalOnly > 0) {
    nextActions.push(
      "Remember: campaign-derivatives/** is gitignored — Pro Edit packs stay local unless you have another deploy path.",
    );
  }
  if (!nextActions.length) {
    nextActions.push("Ship watch paths look quiet — refresh after next Save/Approve.");
  }

  // Prefer git-tracked/untracked dirty paths; append derivative scan after (cap keeps overlays visible).
  const gitDirty = dirtyPaths.filter((d) => d.status !== "!!");
  const derivDirty = dirtyPaths.filter((d) => d.status === "!!");
  const cappedPaths = [...gitDirty.slice(0, 80), ...derivDirty.slice(0, 40)];

  const trackedDirty = gitDirty.length;
  const report: EvidenceShipReport = {
    id: `ship-${Date.now().toString(36)}`,
    generatedAt: new Date().toISOString(),
    branch: branchRes.ok ? branchRes.out || null : null,
    gitOk: statusRes.ok || Boolean(statusRes.out),
    gitNote: statusRes.ok
      ? trackedDirty
        ? "git status porcelain — dirty paths listed."
        : "git status clean for watch paths (excluding gitignored derivative scan)."
      : statusRes.err || "git status returned non-zero.",
    dirtyPaths: cappedPaths,
    totals: {
      dirtyCount: dirtyPaths.length,
      overlayJsonDirty,
      photoBinaryDirty,
      derivativeLocalOnly,
      dirtyBytes,
    },
    checklist,
    checklistReady,
    commitMessageTemplate,
    graduationCandidates: graduationCandidates.slice(0, 24),
    warnings,
    nextActions,
  };

  if (input?.persist !== false) {
    persistShipReport(report);
  }

  return report;
}
