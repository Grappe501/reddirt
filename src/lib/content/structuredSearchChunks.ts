import type { DocChunk } from "./parse";
import { loadFullSiteSearchChunks } from "./fullSiteSearchChunks";
import { allExplainers } from "../../content/explainers/index";
import { allStories } from "../../content/stories/index";
import { allEditorial } from "../../content/editorial/index";
import { events } from "../../content/events/index";
import { regions } from "../../content/local/regions";
import type { DocumentBlock } from "../../content/shared/document";
import type { EditorialSection } from "../../content/editorial/types";

const MAX = 12_000;

function cap(text: string): string {
  const t = text.trim();
  if (t.length <= MAX) return t;
  return `${t.slice(0, MAX)}…`;
}

function blocksToText(blocks: DocumentBlock[]): string {
  const lines: string[] = [];
  for (const b of blocks) {
    if (b.type === "paragraph") lines.push(b.text);
    else if (b.type === "heading") lines.push(`# ${b.text}`);
    else if (b.type === "quote") {
      lines.push(b.attribution ? `“${b.text}” — ${b.attribution}` : `“${b.text}”`);
    }
  }
  return lines.join("\n\n");
}

function editorialSectionsToText(sections: EditorialSection[]): string {
  const lines: string[] = [];
  for (const s of sections) {
    if (s.type === "prose") {
      if (s.title) lines.push(`# ${s.title}`);
      lines.push(...s.paragraphs);
    } else if (s.type === "list") {
      if (s.title) lines.push(`# ${s.title}`);
      lines.push(...s.items.map((item) => `• ${item}`));
    } else if (s.type === "quote") {
      lines.push(s.attribution ? `“${s.quote}” — ${s.attribution}` : `“${s.quote}”`);
    } else if (s.type === "callout") {
      lines.push(`# ${s.title}`, s.body);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}

/** Flatten TS content modules into search chunks (paths use `route:` prefix like ingest seeds). */
export function loadStructuredSiteChunks(): DocChunk[] {
  const out: DocChunk[] = [];

  for (const e of allExplainers) {
    const lines: string[] = [e.summary, "", e.intro];
    for (const st of e.steps) {
      lines.push("", st.title, st.body);
    }
    for (const f of e.faq) {
      lines.push("", `Question: ${f.q}`, `Answer: ${f.a}`);
    }
    if (e.tags.length) lines.push("", `Topics: ${e.tags.join(", ")}`);
    const content = cap(lines.join("\n"));
    if (content.length >= 40) {
      out.push({ path: `route:/explainers/${e.slug}`, title: e.title, chunkIndex: 0, content });
    }
  }

  for (const s of allStories) {
    const lines: string[] = [
      s.title,
      s.summary,
      s.dek ? `Context: ${s.dek}` : "",
      s.categoryLabel ? `Voice: ${s.categoryLabel}` : "",
      blocksToText(s.body),
    ];
    if (s.quotePullouts?.length) {
      lines.push("");
      for (const q of s.quotePullouts) {
        lines.push(`Pull quote: “${q.quote}”${q.attribution ? ` (${q.attribution})` : ""}`);
      }
    }
    if (s.tags.length) lines.push("", `Tags: ${s.tags.join(", ")}`);
    const content = cap(lines.filter(Boolean).join("\n\n"));
    if (content.length >= 40) {
      out.push({ path: `route:/stories/${s.slug}`, title: s.title, chunkIndex: 0, content });
    }
  }

  for (const piece of allEditorial) {
    const lines: string[] = [piece.title, piece.summary, `Category: ${piece.category}`, editorialSectionsToText(piece.sections)];
    if (piece.tags.length) lines.push(`Tags: ${piece.tags.join(", ")}`);
    const content = cap(lines.filter(Boolean).join("\n\n"));
    if (content.length >= 40) {
      out.push({ path: `route:/editorial/${piece.slug}`, title: piece.title, chunkIndex: 0, content });
    }
  }

  for (const ev of events) {
    const lines: string[] = [
      ev.title,
      `Type: ${ev.type}`,
      `Region: ${ev.region}`,
      ev.countySlug ? `County: ${ev.countySlug.replace(/-/g, " ")}` : "",
      ev.summary,
      ev.description ? ev.description.slice(0, 4000) : "",
      ev.audienceTags?.length ? `Audience: ${ev.audienceTags.join(", ")}` : "",
    ];
    const content = cap(lines.filter(Boolean).join("\n\n"));
    if (content.length >= 40) {
      out.push({ path: `route:/events/${ev.slug}`, title: ev.title, chunkIndex: 0, content });
    }
  }

  for (const r of regions) {
    const lines: string[] = [
      `${r.name} (${r.region})`,
      r.summary,
      r.priorityIssues.length ? `Priority themes: ${r.priorityIssues.join("; ")}` : "",
      r.hearing.length ? `What we hear:\n${r.hearing.map((h) => `• ${h}`).join("\n")}` : "",
      r.stories?.length
        ? `Voices:\n${r.stories.map((s) => `• “${s.quote}”${s.attribution ? ` — ${s.attribution}` : ""}`).join("\n")}`
        : "",
    ];
    const content = cap(lines.filter(Boolean).join("\n\n"));
    if (content.length >= 40) {
      out.push({ path: `route:/local-organizing/${r.slug}`, title: `${r.name} — local organizing`, chunkIndex: 0, content });
    }
  }

  return [...out, ...loadFullSiteSearchChunks()];
}
