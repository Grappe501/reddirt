/**
 * Resolve local video masters for Evidence Workbench (Pass 6).
 * Allowed roots only — never read arbitrary disk paths.
 */

import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { localVideoMastersDir } from "@/lib/campaign-media/ffmpeg-tooling";

const VIDEO_EXT = new Set([".mp4", ".mov", ".webm", ".mkv", ".m4v"]);

export type LocalVideoMasterHit = {
  idHint: string;
  absPath: string;
  publicSrc: string | null;
  root: "public-masters" | "local-masters";
  bytes: number;
  filename: string;
};

function repoRoot(): string {
  return process.cwd();
}

function publicMastersDir(): string {
  return path.join(repoRoot(), "public", "media", "campaign-video-masters");
}

function isUnder(root: string, candidate: string): boolean {
  const r = path.resolve(root);
  const c = path.resolve(candidate);
  return c === r || c.startsWith(r + path.sep);
}

function listVideosInDir(
  dirAbs: string,
  root: LocalVideoMasterHit["root"],
): LocalVideoMasterHit[] {
  if (!existsSync(dirAbs)) return [];
  const out: LocalVideoMasterHit[] = [];
  let entries: string[] = [];
  try {
    entries = readdirSync(dirAbs);
  } catch {
    return [];
  }
  for (const name of entries) {
    const absPath = path.join(dirAbs, name);
    let st;
    try {
      st = statSync(absPath);
    } catch {
      continue;
    }
    if (!st.isFile()) continue;
    const ext = path.extname(name).toLowerCase();
    if (!VIDEO_EXT.has(ext)) continue;
    const base = path.basename(name, ext);
    const publicSrc =
      root === "public-masters" ? `/media/campaign-video-masters/${name}` : null;
    out.push({
      idHint: base,
      absPath,
      publicSrc,
      root,
      bytes: st.size,
      filename: name,
    });
  }
  return out;
}

export function listLocalVideoMasters(): LocalVideoMasterHit[] {
  return [
    ...listVideosInDir(publicMastersDir(), "public-masters"),
    ...listVideosInDir(localVideoMastersDir(), "local-masters"),
  ];
}

/** Match speechId / youtubeVideoId / filename stem (case-insensitive substring or exact). */
export function findLocalVideoMaster(input: {
  speechId?: string;
  youtubeVideoId?: string;
  filenameHint?: string;
}): LocalVideoMasterHit | null {
  const needles = [input.speechId, input.youtubeVideoId, input.filenameHint]
    .map((s) => String(s ?? "").trim().toLowerCase())
    .filter(Boolean);
  if (!needles.length) return null;
  const all = listLocalVideoMasters();
  const exact = all.find((h) => needles.includes(h.idHint.toLowerCase()));
  if (exact) return exact;
  return (
    all.find((h) => {
      const hay = h.idHint.toLowerCase();
      return needles.some((n) => hay.includes(n) || n.includes(hay));
    }) ?? null
  );
}

/**
 * Resolve an operator-supplied public src or absolute path to a readable file
 * only under public/ or .local/video-masters|temp.
 */
export function resolveAllowedVideoPath(input: {
  localPublicSrc?: string;
  absPath?: string;
}): { ok: true; absPath: string; publicSrc: string | null } | { ok: false; error: string } {
  const publicRoot = path.join(repoRoot(), "public");
  const localRoot = path.resolve(repoRoot(), "..", ".local");
  const allowedRoots = [
    publicRoot,
    path.join(localRoot, "video-masters"),
    path.join(localRoot, "temp"),
  ];

  if (input.absPath?.trim()) {
    const absPath = path.resolve(input.absPath.trim());
    if (!allowedRoots.some((r) => isUnder(r, absPath))) {
      return {
        ok: false,
        error: "Absolute path must be under public/ or .local/video-masters|temp.",
      };
    }
    if (!existsSync(absPath)) return { ok: false, error: "Video file not found." };
    const publicSrc = isUnder(publicRoot, absPath)
      ? `/${path.relative(publicRoot, absPath).split(path.sep).join("/")}`
      : null;
    return { ok: true, absPath, publicSrc };
  }

  const src = String(input.localPublicSrc ?? "").trim();
  if (!src.startsWith("/")) {
    return { ok: false, error: "localPublicSrc must start with / (public path)." };
  }
  let rel = src.replace(/^\//, "");
  try {
    rel = decodeURIComponent(rel);
  } catch {
    /* keep */
  }
  const absPath = path.join(publicRoot, rel);
  if (!isUnder(publicRoot, absPath)) {
    return { ok: false, error: "public path escapes public/." };
  }
  if (!existsSync(absPath)) return { ok: false, error: "Local video file not found under public/." };
  return { ok: true, absPath, publicSrc: src };
}
