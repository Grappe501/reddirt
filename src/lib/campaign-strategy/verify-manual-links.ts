import { existsSync, readFileSync, readdirSync } from "fs";
import path from "path";

const MARKDOWN_LINK_RE = /\[[^\]]*]\(([^)\s]+)\)/g;

function targetPathOnly(href: string): string {
  const q = href.indexOf("?");
  const h = href.indexOf("#");
  let end = href.length;
  if (q !== -1) end = Math.min(end, q);
  if (h !== -1) end = Math.min(end, h);
  return href.slice(0, end);
}

/**
 * Checks relative `*.md` links in manual Markdown (skips http(s), mailto).
 * Resolves paths relative to the source file; targets must stay under manualRoot.
 */
export function verifyManualInternalMdLinks(manualRootAbs: string): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const names = readdirSync(manualRootAbs).filter((f) => f.endsWith(".md"));
  for (const name of names) {
    const filePath = path.join(manualRootAbs, name);
    const content = readFileSync(filePath, "utf8");
    const dir = path.dirname(filePath);
    MARKDOWN_LINK_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = MARKDOWN_LINK_RE.exec(content)) !== null) {
      const raw = m[1]!.trim();
      const href = targetPathOnly(raw);
      if (!href.toLowerCase().endsWith(".md")) continue;
      if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) continue;

      const resolved = path.normalize(path.resolve(dir, href));
      const manualRootNorm = path.normalize(manualRootAbs);
      const relToManual = path.relative(manualRootNorm, resolved);
      if (relToManual.startsWith("..") || path.isAbsolute(relToManual)) {
        errors.push(`${name}: link escapes manual folder — ${href}`);
        continue;
      }
      if (!existsSync(resolved)) {
        errors.push(`${name}: broken .md link — ${href}`);
      }
    }
  }
  return { ok: errors.length === 0, errors };
}

/** Flags thin chapters or TODO markers (Step 4 hygiene). */
export function auditManualContentDepth(manualRootAbs: string): { warnings: string[] } {
  const warnings: string[] = [];
  const names = readdirSync(manualRootAbs).filter((f) => f.endsWith(".md"));
  for (const name of names) {
    if (name === "BUILD-PLAN-5-STEPS.md") continue;
    const fp = path.join(manualRootAbs, name);
    const content = readFileSync(fp, "utf8");
    if (content.length < 800) {
      warnings.push(`${name}: short file (${content.length} chars) — confirm not outline-only`);
    }
    if (/\bTODO:\s*/i.test(content) || /\bFIXME:\s*/i.test(content)) {
      warnings.push(`${name}: contains TODO/FIXME — resolve or move to tracked issues`);
    }
  }
  return { warnings };
}
