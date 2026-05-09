import GithubSlugger from "github-slugger";

export type StrategyOutlineItem = {
  level: number;
  text: string;
  /** Matches `rehype-slug` when headings are processed in document order. */
  id: string;
};

/** Fence-aware heading scan; mirrors GitHub-style slug sequence used by `rehype-slug`. */
export function extractStrategyOutline(markdown: string): StrategyOutlineItem[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const slugger = new GithubSlugger();
  const items: StrategyOutlineItem[] = [];
  let fence: string | null = null;

  for (const line of lines) {
    const tl = line.trimStart();
    if (fence) {
      if (tl.startsWith(fence)) fence = null;
      continue;
    }
    if (tl.startsWith("```")) {
      fence = "```";
      continue;
    }
    const m = /^(#{1,6})\s+(.+)$/.exec(tl);
    if (m) {
      const level = m[1]!.length;
      const text = m[2]!.trim();
      items.push({ level, text, id: slugger.slug(text) });
    }
  }
  return items;
}
