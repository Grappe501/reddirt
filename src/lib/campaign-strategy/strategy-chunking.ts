import { existsSync } from "fs";
import { readFile } from "fs/promises";
import path from "node:path";
import GithubSlugger from "github-slugger";
import { buildCampaignSystemChunkEntries } from "./campaign-system-md-discovery";
import {
  CAMPAIGN_SYSTEM_MANUAL_DIR,
  STRATEGY_MANUAL_DIR,
  STRATEGY_MD_ENTRIES,
  type StrategyMdEntry,
} from "./md-manifest";

export type StrategyManualDomain = "strategic-plan" | "campaign-system";

export type StrategyChunkSourceMeta = Pick<StrategyMdEntry, "path" | "file" | "label" | "section"> & {
  manualDomain: StrategyManualDomain;
};

/** One retrievable unit for RAG / strategy partner agents (≈ H2/H3 sections). */
export type StrategyManualChunk = {
  id: string;
  pathKey: string;
  /** Repo-facing path: `docs/.../FILE.md` or `campaign-system-manual/...` */
  sourceFile: string;
  navLabel: string;
  laneSection: StrategyMdEntry["section"];
  manualDomain: StrategyManualDomain;
  ordinal: number;
  heading: string | null;
  headingLevel: 2 | 3 | null;
  /** Immediate H2 context when this chunk starts at H3. */
  parentHeadings: string[];
  /** Heading slug segment used in `id` (github-slugger, stable for deep links when aligned with rehype-slug). */
  headingSlug: string;
  markdown: string;
  plainText: string;
  characterCount: number;
};

const CHUNK_ID_SEP = "::";
/** Encoded path segment when `pathKey` is "" (overview / README), so IDs never lead with `::`. */
export const STRATEGY_CHUNK_ROOT_PATH_TOKEN = "__root__";

export function makeStrategyChunkId(pathKey: string, headingSlug: string, ordinal: number): string {
  const pk = pathKey === "" ? STRATEGY_CHUNK_ROOT_PATH_TOKEN : pathKey;
  return [pk, headingSlug, String(ordinal)].join(CHUNK_ID_SEP);
}

export function parseStrategyChunkId(
  id: string,
): { pathKey: string; headingSlug: string; ordinal: number } | null {
  const parts = id.split(CHUNK_ID_SEP);
  if (parts.length < 3) return null;
  const ordinal = Number(parts[parts.length - 1]);
  const headingSlug = parts[parts.length - 2]!;
  const encodedPath = parts.slice(0, -2).join(CHUNK_ID_SEP);
  if (!encodedPath || !headingSlug || !Number.isFinite(ordinal)) return null;
  const pathKey = encodedPath === STRATEGY_CHUNK_ROOT_PATH_TOKEN ? "" : encodedPath;
  return { pathKey, headingSlug, ordinal };
}

function stripMarkdownToPlain(md: string): string {
  let s = md;
  s = s.replace(/^#{1,6}\s+.+$/gm, " ");
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/\*([^*]+)\*/g, "$1");
  s = s.replace(/`([^`]+)`/g, "$1");
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  s = s.replace(/^[-*+]\s+/gm, "• ");
  s = s.replace(/^\d+\.\s+/gm, " ");
  s = s.replace(/\n{2,}/g, "\n");
  return s.replace(/\s+/g, " ").trim();
}

/** ATX headings at line start; skips fenced ``` blocks. Splits on ## and ### only. */
export function chunkStrategyMarkdown(markdown: string, meta: StrategyChunkSourceMeta): StrategyManualChunk[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const slugger = new GithubSlugger();
  const chunks: StrategyManualChunk[] = [];

  type Acc = {
    lines: string[];
    heading: string | null;
    level: 2 | 3 | null;
    slug: string;
    parentH2: string | null;
  };
  let acc: Acc = { lines: [], heading: null, level: null, slug: "preamble", parentH2: null };
  let fence: string | null = null;
  let ordinal = 0;
  let lastH2: string | null = null;

  const flush = () => {
    const body = acc.lines.join("\n").trim();
    if (!body) {
      acc.lines = [];
      return;
    }
    const id = makeStrategyChunkId(meta.path, acc.slug, ordinal);
    const plainText = stripMarkdownToPlain(body);
    const parentHeadings = acc.level === 3 && acc.parentH2 ? [acc.parentH2] : [];
    const sourceFilePosix =
      meta.manualDomain === "campaign-system"
        ? path.posix.join(CAMPAIGN_SYSTEM_MANUAL_DIR, meta.file.replace(/\\/g, "/"))
        : meta.file;
    chunks.push({
      id,
      pathKey: meta.path,
      sourceFile: sourceFilePosix,
      navLabel: meta.label,
      laneSection: meta.section,
      manualDomain: meta.manualDomain,
      ordinal,
      heading: acc.heading,
      headingLevel: acc.level,
      parentHeadings,
      headingSlug: acc.slug,
      markdown: body,
      plainText,
      characterCount: plainText.length,
    });
    ordinal += 1;
    acc.lines = [];
  };

  for (const line of lines) {
    const trimmedLeft = line.trimStart();

    if (fence) {
      if (trimmedLeft.startsWith(fence)) {
        fence = null;
      }
      acc.lines.push(line);
      continue;
    }

    if (trimmedLeft.startsWith("```")) {
      fence = "```";
      acc.lines.push(line);
      continue;
    }

    const hm = /^(#{2,3})\s+(.+)$/.exec(trimmedLeft);
    if (hm) {
      const level = hm[1]!.length as 2 | 3;
      const rawTitle = hm[2]!.trim();
      flush();
      const slug = slugger.slug(rawTitle);
      if (level === 2) {
        lastH2 = rawTitle;
        acc = { lines: [line], heading: rawTitle, level: 2, slug, parentH2: null };
      } else {
        acc = { lines: [line], heading: rawTitle, level: 3, slug, parentH2: lastH2 };
      }
      continue;
    }

    acc.lines.push(line);
  }

  flush();

  return chunks;
}

export async function loadAllStrategyManualChunks(): Promise<StrategyManualChunk[]> {
  const base = process.cwd();
  const all: StrategyManualChunk[] = [];
  for (const entry of STRATEGY_MD_ENTRIES) {
    const full = path.join(base, STRATEGY_MANUAL_DIR, entry.file);
    const markdown = await readFile(full, "utf8");
    all.push(...chunkStrategyMarkdown(markdown, { ...entry, manualDomain: "strategic-plan" }));
  }

  const csRoot = path.join(base, CAMPAIGN_SYSTEM_MANUAL_DIR);
  if (existsSync(csRoot)) {
    const csEntries = await buildCampaignSystemChunkEntries();
    for (const entry of csEntries) {
      const full = path.join(base, CAMPAIGN_SYSTEM_MANUAL_DIR, entry.file);
      const markdown = await readFile(full, "utf8");
      all.push(...chunkStrategyMarkdown(markdown, { ...entry, manualDomain: "campaign-system" }));
    }
  }

  return all;
}

export async function loadStrategyManualChunksForPath(pathKey: string): Promise<StrategyManualChunk[] | null> {
  const entry = STRATEGY_MD_ENTRIES.find((e) => e.path === pathKey);
  if (!entry) return null;
  const full = path.join(process.cwd(), STRATEGY_MANUAL_DIR, entry.file);
  const markdown = await readFile(full, "utf8");
  return chunkStrategyMarkdown(markdown, { ...entry, manualDomain: "strategic-plan" });
}

export function findChunkById(
  chunks: StrategyManualChunk[],
  id: string,
): StrategyManualChunk | undefined {
  return chunks.find((c) => c.id === id);
}

const chunkCache: { list: StrategyManualChunk[] | null } = { list: null };

/** In-memory cache for one process (suitable for agent index polling). */
export async function getCachedAllStrategyManualChunks(): Promise<StrategyManualChunk[]> {
  if (chunkCache.list) return chunkCache.list;
  chunkCache.list = await loadAllStrategyManualChunks();
  return chunkCache.list;
}

export type StrategyChunkIndexRow = Omit<StrategyManualChunk, "markdown" | "plainText"> & {
  plainTextPreview: string;
  /** Kelly SOS admin reader; empty when `manualDomain` is campaign-system (open `repoRelativePath` in-repo). */
  adminReaderUrl: string;
  repoRelativePath: string;
};

export function toIndexRow(c: StrategyManualChunk): StrategyChunkIndexRow {
  const repoRelativePath =
    c.manualDomain === "campaign-system" ? c.sourceFile : path.posix.join(STRATEGY_MANUAL_DIR, c.sourceFile);

  const adminPath =
    c.manualDomain === "campaign-system"
      ? ""
      : c.pathKey === ""
        ? "/admin/campaign-strategy"
        : `/admin/campaign-strategy/${c.pathKey}`;
  const hash = c.headingSlug && c.headingSlug !== "preamble" ? `#${c.headingSlug}` : "";
  return {
    id: c.id,
    pathKey: c.pathKey,
    sourceFile: c.sourceFile,
    navLabel: c.navLabel,
    laneSection: c.laneSection,
    manualDomain: c.manualDomain,
    ordinal: c.ordinal,
    heading: c.heading,
    headingLevel: c.headingLevel,
    parentHeadings: c.parentHeadings,
    headingSlug: c.headingSlug,
    characterCount: c.characterCount,
    plainTextPreview: c.plainText.slice(0, 280),
    adminReaderUrl: adminPath ? `${adminPath}${hash}` : "",
    repoRelativePath,
  };
}
