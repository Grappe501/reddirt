/**
 * Disk inventory for campaign folder ingest forensics.
 * Mirrors skip rules from `scripts/ingest-campaign-folder.ts` + `supportedIngestExt` / e-learning skip.
 */
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { isBundledElearningPath } from "@/lib/ingest/campaign-folder-skip";

/** Keep in sync with `scripts/ingest-campaign-files-core.ts` `supportedIngestExt`. */
function supportedIngestExt(ext: string): boolean {
  const e = ext.toLowerCase();
  const doc = [".docx", ".pdf", ".html", ".htm", ".txt", ".md", ".csv", ".xlsx", ".xls", ".pptx"];
  const img = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".heic", ".heif"];
  const vid = [".mp4", ".webm", ".mov"];
  const aud = [".mp3", ".wav", ".m4a"];
  return doc.includes(e) || img.includes(e) || vid.includes(e) || aud.includes(e);
}

const SKIP_DIR = new Set(["node_modules", ".git", "__MACOSX", ".next"]);

export type FolderInventoryEntry = {
  relativePath: string;
  fullPath: string;
  fileName: string;
  extension: string;
  sizeBytes: number;
  modifiedMs: number;
  /** SHA-256 of file bytes; null if empty or hash skipped (see hashNote). */
  contentSha256: string | null;
  hashNote?: string;
  supportedExtension: boolean;
  skippedByIngestFileRules: boolean;
  skippedElearningBundlePath: boolean;
  /** True if ingest would call ingestCampaignFileBuffer for this file (folder mode, no zip expansion). */
  wouldProcessAsLooseFile: boolean;
};

function skipFileName(name: string): boolean {
  if (name === "Thumbs.db" || name === ".DS_Store") return true;
  if (name.toLowerCase().endsWith(".crdownload")) return true;
  return false;
}

async function sha256File(filePath: string, sizeBytes: number): Promise<{ hash: string | null; note?: string }> {
  const maxSyncRead = 120 * 1024 * 1024;
  if (sizeBytes === 0) {
    return { hash: createHash("sha256").update(Buffer.alloc(0)).digest("hex") };
  }
  if (sizeBytes > maxSyncRead) {
    return new Promise((resolve, reject) => {
      const hash = createHash("sha256");
      const st = createReadStream(filePath);
      st.on("data", (chunk: string | Buffer) => {
        hash.update(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
      });
      st.on("error", (e) => reject(e));
      st.on("end", () => resolve({ hash: hash.digest("hex") }));
    });
  }
  const { readFile } = await import("node:fs/promises");
  const buf = await readFile(filePath);
  return { hash: createHash("sha256").update(buf).digest("hex") };
}

export async function scanCampaignIngestionFolder(absRoot: string): Promise<FolderInventoryEntry[]> {
  const base = path.resolve(absRoot);
  const out: FolderInventoryEntry[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (SKIP_DIR.has(e.name)) continue;
        await walk(full);
      } else {
        if (skipFileName(e.name)) continue;
        const st = await stat(full);
        if (!st.isFile()) continue;
        const rel = path.relative(base, full).split(path.sep).join("/");
        const ext = path.extname(e.name).toLowerCase();
        const supportedExtension = supportedIngestExt(ext);
        const skippedElearningBundlePath = isBundledElearningPath(rel);
        const wouldProcessAsLooseFile =
          supportedExtension && !skippedElearningBundlePath && path.extname(e.name).toLowerCase() !== ".zip";

        let contentSha256: string | null = null;
        let hashNote: string | undefined;
        if (supportedExtension && st.size > 0) {
          try {
            const r = await sha256File(full, st.size);
            contentSha256 = r.hash;
            hashNote = r.note;
          } catch {
            contentSha256 = null;
            hashNote = "hash_failed";
          }
        } else if (st.size === 0 && supportedExtension) {
          const r = await sha256File(full, 0);
          contentSha256 = r.hash;
        }

        out.push({
          relativePath: rel,
          fullPath: full,
          fileName: e.name,
          extension: ext,
          sizeBytes: st.size,
          modifiedMs: st.mtimeMs,
          contentSha256,
          hashNote,
          supportedExtension,
          skippedByIngestFileRules: false,
          skippedElearningBundlePath,
          wouldProcessAsLooseFile,
        });
      }
    }
  }

  await walk(base);
  return out.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}
